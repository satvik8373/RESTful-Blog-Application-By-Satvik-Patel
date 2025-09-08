'use strict';

const Joi = require('joi');

const createPostSchema = Joi.object({
	title: Joi.string().min(1).max(200).required(),
	content: Joi.string().min(1).required()
});

const updatePostSchema = Joi.object({
	title: Joi.string().min(1).max(200),
	content: Joi.string().min(1)
}).min(1);

module.exports = { createPostSchema, updatePostSchema };


