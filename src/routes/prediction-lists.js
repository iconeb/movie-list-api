'use strict';

const express = require('express');
const joi = require('joi');

const sagemakerquery = require('../libs/sagemaker-query');
const requireAuthentication = require('../middlewares/require-authentication');
const validator = require('../middlewares/validator');
const theMovieDb = require('../libs/the-movie-db');
const Movie = require('../models/movie');
const MovieList = require('../models/movie-list');
const Movielink = require('../models/movielink');

const router = express.Router();

router.get('/prediction-lists/:id',
  async (req, res, next) => {
    try {
      const movies = [];
      
      const movieList = await MovieList
        .findById(req.params.id)
        .populate('movies');
      
      const original_links = movieList.movies.map(a => a.tmdb_id);
      
      const prediction = await sagemakerquery.find([47, 356, 589]);
      //const prediction = ['47', '356', '589'];
            
      const prediction_links = await Movielink.find({'movieId': { $in: prediction.map(function(x) { return parseInt(x, 10)}) }}, "tmdbId");

      for (const prediction_link of prediction_links.map(a => a.tmdbId)) {
    	  
          let movie = await Movie.findOne({ tmdb_id: prediction_link });

          if (!movie) {
            movie = await theMovieDb.findMovieById(prediction_link);

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

      const predictionList = new MovieList({
          user: movieList.user,
          movies: movies,
          title: "Prediction for " + movieList.title
        });

      const prediction_out = await MovieList.populate(predictionList, 'movies');
      res.json(prediction_out.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
