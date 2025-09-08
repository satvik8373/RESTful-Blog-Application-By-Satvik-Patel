'use strict';

const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createPost, listPosts, getPost, updatePost, deletePost } = require('../controllers/postController');

const router = express.Router();

router.get('/', asyncHandler(listPosts));
router.get('/:id', asyncHandler(getPost));
router.post('/', authenticate, asyncHandler(createPost));
router.put('/:id', authenticate, asyncHandler(updatePost));
router.delete('/:id', authenticate, asyncHandler(deletePost));

module.exports = router;


