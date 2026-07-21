const request = require('supertest');
const { app } = require('../server');

describe('Auth Endpoints & Security Guards', () => {
  it('should return 401 for unauthorized access to protected route', async () => {
    const res = await request(app)
      .get('/api/profile/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login request with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});
