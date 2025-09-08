'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
	{
		postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
		content: { type: String, required: true },
		authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);


