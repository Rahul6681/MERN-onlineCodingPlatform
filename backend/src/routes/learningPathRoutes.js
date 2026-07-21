const express = require('express');
const router = express.Router();
const { getLearningPaths, getLearningPathById } = require('../controllers/learningPathController');

router.get('/', getLearningPaths);
router.get('/:id', getLearningPathById);

module.exports = router;
