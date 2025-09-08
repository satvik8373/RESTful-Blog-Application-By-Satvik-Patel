'use strict';

const Comment = require('../models/Comment');
const { createCommentSchema, updateCommentSchema } = require('../validators/comment');

async function createComment(req, res) {
	const { error, value } = createCommentSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const comment = await Comment.create({ ...value, authorId: req.user.userId });
	return res.status(201).json(comment);
}

async function listComments(req, res) {
	const { post_id: postId } = req.query;
	const filter = postId ? { postId } : {};
	const comments = await Comment.find(filter).sort({ createdAt: -1 });
	return res.json(comments);
}

async function getComment(req, res) {
	const comment = await Comment.findById(req.params.id);
	if (!comment) return res.status(404).json({ message: 'Comment not found' });
	return res.json(comment);
}

async function updateComment(req, res) {
	const { error, value } = updateCommentSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const comment = await Comment.findById(req.params.id);
	if (!comment) return res.status(404).json({ message: 'Comment not found' });
	if (comment.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	Object.assign(comment, value);
	await comment.save();
	return res.json(comment);
}

async function deleteComment(req, res) {
	const comment = await Comment.findById(req.params.id);
	if (!comment) return res.status(404).json({ message: 'Comment not found' });
	if (comment.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	await comment.deleteOne();
	return res.status(204).send();
}

module.exports = { createComment, listComments, getComment, updateComment, deleteComment };


