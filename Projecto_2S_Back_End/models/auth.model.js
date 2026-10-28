const { get, run, hashPassword } = require('../database');
const crypto = require('crypto');

const findUserByEmail = (email) => get('SELECT * FROM users WHERE email=?', [String(email || '').trim()]);
const findUserById = (id) => get('SELECT * FROM users WHERE id=?', [id]);
const passwordMatches = (password, salt, expected) =>
  crypto.scryptSync(String(password || ''), salt, 64).toString('hex') === expected;

async function createUser({ name, email, password, phone = '', status = 'pending', role = 'user' }) {
  const passwordData = hashPassword(String(password));
  return run(
    'INSERT INTO users(name,email,password_hash,password_salt,phone,status,role) VALUES (?,?,?,?,?,?,?)',
    [name, email, passwordData.hash, passwordData.salt, phone, status, role]
  );
}

module.exports = { findUserByEmail, findUserById, passwordMatches, createUser };