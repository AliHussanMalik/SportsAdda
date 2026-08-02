const { test, describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Import auth module items
const createAuthRouter = require('../modules/AuthModule');
const { authenticateToken, authorizeRoles } = createAuthRouter;

const JWT_SECRET = process.env.JWT_SECRET || '';

describe('1. Authentication & JWT Unit Tests', () => {
  it('should sign and verify valid JWT access tokens', () => {
    const mockUser = {
      user_id: 'test-uuid-1234',
      email: 'player@sportsadda.com',
      role: 'PLAYER',
      display_name: 'Cristiano Ronaldo'
    };

    const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '1h' });
    assert.ok(token, 'Token should be a non-empty string');

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.user_id, mockUser.user_id);
    assert.strictEqual(decoded.email, mockUser.email);
    assert.strictEqual(decoded.role, mockUser.role);
    assert.strictEqual(decoded.display_name, mockUser.display_name);
  });

  it('should reject invalid or tampered JWT tokens', () => {
    const fakeToken = 'invalid.jwt.token.string';
    assert.throws(() => {
      jwt.verify(fakeToken, JWT_SECRET);
    }, (err) => {
      return err instanceof Error;
    });
  });
});

describe('2. Zod Input Validation Unit Tests', () => {
  const RegisterSchema = z.object({
    display_name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'SCORER', 'PLAYER']).optional().default('PLAYER'),
    primary_sport: z.string().optional().default('FUTSAL'),
    preferred_role: z.string().optional(),
    jersey_number: z.number().int().optional()
  });

  it('should validate valid user registration payload', () => {
    const validData = {
      display_name: 'Alex Morgan',
      email: 'alex@sportsadda.com',
      password: 'securepassword123',
      primary_sport: 'FUTSAL',
      jersey_number: 13
    };

    const parsed = RegisterSchema.parse(validData);
    assert.strictEqual(parsed.display_name, 'Alex Morgan');
    assert.strictEqual(parsed.email, 'alex@sportsadda.com');
    assert.strictEqual(parsed.role, 'PLAYER');
  });

  it('should throw validation error on invalid email or short password', () => {
    const invalidData = {
      display_name: 'A',
      email: 'not-an-email',
      password: '123'
    };

    assert.throws(() => {
      RegisterSchema.parse(invalidData);
    }, z.ZodError);
  });
});

describe('3. Role-Based Access Control (RBAC) Middleware Unit Tests', () => {
  it('should allow authorized roles to proceed', () => {
    const middleware = authorizeRoles('ADMIN', 'SCORER');
    const req = { user: { role: 'ADMIN' } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.strictEqual(nextCalled, true, 'next() should be called for authorized role ADMIN');
  });

  it('should reject unauthorized roles with HTTP 403 Forbidden', () => {
    const middleware = authorizeRoles('ADMIN', 'SCORER');
    const req = { user: { role: 'PLAYER' } };
    let statusCode = null;
    let jsonPayload = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        jsonPayload = payload;
        return this;
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.strictEqual(nextCalled, false, 'next() should NOT be called for unauthorized role PLAYER');
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonPayload.success, false);
    assert.ok(jsonPayload.error.includes("Role 'PLAYER' does not have required permissions"));
  });

  it('should reject unauthenticated requests without req.user', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = {};
    let statusCode = null;
    let jsonPayload = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        jsonPayload = payload;
        return this;
      }
    };
    const next = () => {};

    middleware(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonPayload.success, false);
  });
});

describe('4. User Profile Module Unit & Logic Tests', () => {
  it('should construct router with module routes', () => {
    const mockPool = {};
    const router = createAuthRouter(mockPool);
    assert.ok(router, 'Auth router should be initialized');
    assert.strictEqual(typeof router, 'function', 'Express router is a callable middleware function');
  });
});
