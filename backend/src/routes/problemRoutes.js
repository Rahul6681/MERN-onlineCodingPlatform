const express = require('express');
const router = express.Router();
const { getProblems, getProblemBySlug, createProblem, addTestCases } = require('../controllers/problemController');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);
router.post('/', protect, roleGuard('trainer', 'admin'), createProblem);
router.post('/:id/testcases', protect, roleGuard('trainer', 'admin'), addTestCases);

module.exports = router;
