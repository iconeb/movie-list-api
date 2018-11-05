'use strict';

const request = require('request-promise');

const SAGEMAKER_URI = process.env.SAGEMAKER_URI;

// TODO handle rate limit

exports.find = async (query) => {
  try {
	var options = {
      method: 'POST',
      uri: SAGEMAKER_URI,
      body: { movies: query },
      json: true // Automatically stringifies the body to JSON
    };

	const movies = await request(options);
    //console.log(movies);

    return movies.map(a => a.id);
  } catch (error) {
    throw error;
  }
};