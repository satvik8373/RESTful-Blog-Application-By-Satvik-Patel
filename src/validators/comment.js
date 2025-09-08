'use strict';

const Joi = require('joi');

const createCommentSchema = Joi.object({
	postId: Joi.string().length(24).hex().required(),
	content: Joi.string().min(1).required()
});

const updateCommentSchema = Joi.object({
	content: Joi.string().min(1).required()
});

module.exports = { createCommentSchema, updateCommentSchema };


