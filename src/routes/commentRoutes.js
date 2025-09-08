'use strict';

const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createComment, listComments, getComment, updateComment, deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.get('/', asyncHandler(listComments));
router.get('/:id', asyncHandler(getComment));
router.post('/', authenticate, asyncHandler(createComment));
router.put('/:id', authenticate, asyncHandler(updateComment));
router.delete('/:id', authenticate, asyncHandler(deleteComment));

module.exports = router;


