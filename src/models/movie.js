'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  tmdb_id: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  overview: { type: String, required: true },
  poster: new Schema({
    small: { type: String, required: true },
    medium: { type: String, required: true },
    large: { type: String, required: true }
  }, { _id: false }),
  backdrop: new Schema({
    small: { type: String, required: true },
    medium: { type: String, required: true },
    large: { type: String, required: true }
  }, { _id: false }),
  trailers: [],
  genres: [String],
  release_date: { type: Number },
  created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  updated_at: { type: Number }
});

movieSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

movieSchema.methods.movielens_id = function () {
  return this.tmdb_id ? "Meow name is " + this.tmdb_id : "I don't have a name";
}

module.exports = mongoose.model('Movie', movieSchema);
