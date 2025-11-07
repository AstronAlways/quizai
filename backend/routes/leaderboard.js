// routes/leaderboard.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getLeaderboard } from '../services/quizStorage.js';

const router = express.Router();

// All leaderboard routes require authentication
router.use(authenticateToken);

/**
 * GET /api/leaderboard/:quizId
 * Returns top scores for a specific quiz
 */
router.get('/:quizId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    // Validate quiz ID
    if (!quizId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'quizId is required',
      });
    }

    // Fetch leaderboard from service
    const { data: leaderboard, error } = await getLeaderboard(quizId, limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(400).json({
        error: 'Failed to fetch leaderboard',
        message: error,
      });
    }

    // Identify the requesting user's rank (if included)
    const userRank = leaderboard.findIndex(entry => entry.userId === userId);
    const userEntry =
      userRank >= 0
        ? { rank: userRank + 1, ...leaderboard[userRank] }
        : null;

    return res.json({
      success: true,
      quizId,
      leaderboard,
      user: userEntry,
    });
  } catch (err) {
    console.error('Leaderboard route error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load leaderboard',
    });
  }
});

export default router;
