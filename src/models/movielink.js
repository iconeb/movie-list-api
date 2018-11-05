'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movielinkSchema = new Schema({
  tmdbId: { type: Number, required: true },
  movieId: { type: Number, required: true },
  imdbId: { type: Number, required: true }
});

movielinkSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Movielink', movielinkSchema);
