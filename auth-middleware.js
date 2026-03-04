/**
 * JSON Server Authentication Middleware
 * Handles POST /auth/login  → issues JWT + refresh token
 * Handles POST /auth/refresh → rotates access token
 * Guards all other routes with Bearer token validation
 */
const jwt = require('jsonwebtoken');
const SECRET = 'angular-jwt-secret-key-2024';

const ACCOUNTS = [
  { username: 'admin',       password: 'admin123',    id: 1, role: 'admin'   },
  { username: 'john.doe',    password: 'password123', id: 2, role: 'user'    },
  { username: 'jane.smith',  password: 'manager123',  id: 3, role: 'manager' },
  { username: 'bob.wilson',  password: 'pass1234',    id: 4, role: 'user'    },
  { username: 'alice.jones', password: 'pass1234',    id: 5, role: 'user'    },
  { username: 'charlie.b',   password: 'pass1234',    id: 6, role: 'manager' },
];

module.exports = (req, res, next) => {
  // ── Login ──────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { username, password } = req.body || {};
    const account = ACCOUNTS.find(a => a.username === username && a.password === password);
    if (!account) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const accessToken = jwt.sign(
      { sub: account.id, username: account.username, role: account.role },
      SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign({ sub: account.id }, SECRET, { expiresIn: '7d' });
    return res.json({ accessToken, refreshToken, user: { id: account.id, username: account.username, role: account.role } });
  }

  // ── Refresh token ──────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.path === '/auth/refresh') {
    try {
      const { refreshToken } = req.body || {};
      const payload = jwt.verify(refreshToken, SECRET);
      const account = ACCOUNTS.find(a => a.id === payload.sub);
      if (!account) return res.status(401).json({ error: 'User not found' });
      const accessToken = jwt.sign(
        { sub: account.id, username: account.username, role: account.role },
        SECRET,
        { expiresIn: '1h' }
      );
      return res.json({ accessToken });
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  // ── Guard all other routes ─────────────────────────────────────────────────
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};
