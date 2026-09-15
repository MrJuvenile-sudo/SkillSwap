// scripts/update_admin_password.mjs
import { db } from '../server.js';

// Hash generated earlier for password 'Admin123!'
const ADMIN_HASH = '9ed21b73760fc93ca4d91c87da25ce21:a69b8a46367a7868795138f1b280c9d50d5b37e56e3830a1fe1e415ed9c40de5';

(async () => {
  try {
    const result = await db.query(`UPDATE app_users SET password_hash = $1 WHERE username = 'admin'`, [ADMIN_HASH]);
    console.log('Admin password hash update result:', result);
  } catch (err) {
    console.error('Failed to update admin password hash:', err);
  }
})();
