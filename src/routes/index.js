'use strict';

const express = require('express');

const dbConnected = require('../middlewares/db-connected');
const authRouter = require('./auth');
const logoutRouter = require('./logout');
const usersRouter = require('./users');
const tmdbRouter = require('./tmdb');
const sagemakerRouter = require('./sagemaker');
const predictionListsRouter = require('./prediction-lists');
const movieListsRouter = require('./movie-lists');

const router = express.Router();

router.use(dbConnected);
router.use(authRouter);
router.use(logoutRouter);
router.use(usersRouter);
router.use(tmdbRouter);
router.use(sagemakerRouter);
router.use(predictionListsRouter);
router.use(movieListsRouter);

module.exports = router;
