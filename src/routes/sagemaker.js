'use strict';

const express = require('express');
const joi = require('joi');

const sagemakerquery = require('../libs/sagemaker-query');
const requireAuthentication = require('../middlewares/require-authentication');
const validator = require('../middlewares/validator');
const theMovieDb = require('../libs/the-movie-db');
const Movielink = require('../models/movielink');
const Movie = require('../models/movie');
const MovieList = require('../models/movie-list');

const router = express.Router();

router.get('/sagemaker/movies',
  //requireAuthentication,
  //validator({
  //  query: {
  //    query: joi.string().trim().min(1).required()
  //  }
  //}),
  async (req, res, next) => {
    try {
      const movies = [];
      
      //const prediction = await sagemakerquery.find([47, 356, 589]);
      const prediction = ['47', '356', '589'];
            
      let tmdblinks = await Movielink.find({'movieId': { $in: prediction.map(function(x) { return parseInt(x, 10)}) }}, "tmdbId");

      for (const tmdblink of tmdblinks.map(a => a.tmdbId)) {
    	  
          let movie = await Movie.findOne({ tmdb_id: tmdblink });

          if (!movie) {
            movie = await theMovieDb.findMovieById(tmdblink);

            const trailers = movie.videos.results
              .filter(video =>
                video.site === 'YouTube' && video.type === 'Trailer'
              )
              .map(trailer => ({ key: trailer.key, name: trailer.name }));

            movie = new Movie({
              tmdb_id: movie.id,
              title: movie.title,
              overview: movie.overview,
              poster: movie.poster,
              backdrop: movie.backdrop,
              trailers,
              genres: movie.genres.map(genre => genre.name),
              release_date: Math.floor(new Date(movie.release_date) / 1000)
            });

            await movie.save();
          }

          movies.push(movie.id);
      }
      
      const movieList = new MovieList({
          //user: req.user.id,
          movies: movies
        });

      res.json(movieList.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
