'use strict';

const Post = require('../models/Post');
const { createPostSchema, updatePostSchema } = require('../validators/post');

async function createPost(req, res) {
	const { error, value } = createPostSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const post = await Post.create({ ...value, authorId: req.user.userId });
	return res.status(201).json(post);
}

async function listPosts(req, res) {
	const posts = await Post.find().sort({ createdAt: -1 });
	return res.json(posts);
}

async function getPost(req, res) {
	const post = await Post.findById(req.params.id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	return res.json(post);
}

async function updatePost(req, res) {
	const { error, value } = updatePostSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const post = await Post.findById(req.params.id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	if (post.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	Object.assign(post, value);
	await post.save();
	return res.json(post);
}

async function deletePost(req, res) {
	const post = await Post.findById(req.params.id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	if (post.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	await post.deleteOne();
	return res.status(204).send();
}

module.exports = { createPost, listPosts, getPost, updatePost, deletePost };


