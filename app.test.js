const request = require('supertest');
const app = require('./app');

describe('GET /top-authors', () => {
  test('should respond with an array of authors', async () => {
    const response = await request(app).get('/top-authors');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });

  test('should return 404 when no authors found', async () => {
    const response = await request(app).get('/top-authors?author_name=Nonexistent Author');
    expect(response.statusCode).toBe(404);
  });

  test('should handle invalid author name format', async () => {
    const response = await request(app).get('/top-authors?author_name=12345');
    expect(response.statusCode).toBe(400);
  });
});

