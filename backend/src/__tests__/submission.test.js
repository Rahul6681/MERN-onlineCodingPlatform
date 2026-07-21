const { executeInFallbackVM } = require('../services/judge0Service');
const { calculateEloRating } = require('../services/leaderboardService');

describe('Code Execution & Ranking Math Logic', () => {
  it('should evaluate JavaScript code correctly in fallback VM', async () => {
    const code = `function solution(input) { return input.toUpperCase(); }`;
    const res = await executeInFallbackVM(code, 'javascript', 'hello', 'HELLO');

    expect(res.status).toEqual('Accepted');
    expect(res.passed).toBe(true);
    expect(res.actualOutput).toEqual('HELLO');
  });

  it('should calculate ELO rating changes accurately post-contest', () => {
    const newRating = calculateEloRating(1600, 1, 50); // Rank 1 out of 50
    expect(newRating).toBeGreaterThan(1600);
  });
});
