'use strict';

const express = require('express');
const joi = require('joi');

const requireAuthentication = require('../middlewares/require-authentication');
const validator = require('../middlewares/validator');
const theMovieDb = require('../libs/the-movie-db');
const Movie = require('../models/movie');
const MovieList = require('../models/movie-list');

const router = express.Router();

router.post('/movie-lists',
  requireAuthentication,
  validator({
    body: {
      title: joi.string().trim().optional(),
      movies: joi.array().items(joi.number()).required().min(1).options({ stripUnknown: false })
    }
  }),
  async (req, res, next) => {
    try {
      const movies = [];

      for (const movieId of req.validator.body.movies) {

        let movie = await Movie.findOne({ tmdb_id: movieId });

        if (!movie) {
          movie = await theMovieDb.findMovieById(movieId);

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
        user: req.user.id,
        movies: movies
      });

      if (typeof req.validator.body.title !== 'undefined') {
        movieList.title = req.validator.body.title;
      }
      await movieList.save();
      res.json(movieList.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

router.get('/movie-lists',
  async (req, res, next) => {
    try {
      const movieLists = await MovieList.find();
      res.json(movieLists);
    } catch (error) {
      next(error);
    }
  }
);


router.get('/movie-lists/me',
  requireAuthentication,
  async (req, res, next) => {
    try {
      const movieLists = await MovieList.find({ user: req.user.id }).populate('movies');
      res.json(movieLists);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/movie-lists/:id',
  async (req, res, next) => {
    try {
      const movieList = await MovieList
        .findById(req.params.id)
        .populate('movies');
      res.json(movieList);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/movie-lists/:id',
  requireAuthentication,
  validator({
    params: {
      id: joi.string().regex(/^[0-9A-F]{24}$/i).required()
    }
  }),
  async (req, res, next) => {
    try {
      await User.findByIdAndRemove(req.validator.params.id);
      res.json();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
