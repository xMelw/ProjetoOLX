const { get, all, run } = require('../database');
const { createUser } = require('./auth.model');

const findNameById = (id) => get('SELECT name AS nome FROM users WHERE id=?', [id]);
const findProfileById = (id) => get('SELECT u.*,l.district FROM users u LEFT JOIN locations l ON l.id=u.location_id WHERE u.id=?', [id]);

async function updateProfile(id, data, image) {
  const existing = await get('SELECT * FROM users WHERE id=?', [id]);
  if (!existing) return false;
  let locationId = existing.location_id;
  if (data.distrito) {
    locationId = Number(data.distrito) || (await get('SELECT id FROM locations WHERE district=?', [data.distrito]))?.id || null;
  }
  await run(
    'UPDATE users SET name=?,email=?,phone=?,location_id=?,image=? WHERE id=?',
    [data.nome || existing.name, data.email || existing.email, data.telemovel || existing.phone, locationId, image || existing.image, id]
  );
  return true;
}

async function listUsers(status) {
  const where = status === 'all' ? '' : 'WHERE u.status=?';
  return all(
    `SELECT u.id,u.id AS user_id,u.name,u.name AS nome,u.email,u.phone AS telemovel,u.status,u.status AS estado,u.role,u.created_at FROM users u ${where} ORDER BY u.created_at DESC`,
    status === 'all' ? [] : [status]
  );
}

const findAdminDetails = (id) => get('SELECT id,name,email,phone AS telemovel,status,role FROM users WHERE id=?', [id]);
const updateStatus = (id, status) => run('UPDATE users SET status=? WHERE id=?', [status, id]);
const emailExists = (email) => get('SELECT id FROM users WHERE email=?', [email]);

async function createAdminUser({ name, email, password, status }) {
  return createUser({ name, email, password, status, role: 'user' });
}

module.exports = { findNameById, findProfileById, updateProfile, listUsers, findAdminDetails, updateStatus, emailExists, createAdminUser };