// api/account/logout.js - Clear Session & Sign Out
export const access = 'public';

export default async function (req, res) {
  res.setHeader('Set-Cookie', `skillswap_session=; Path=/; SameSite=Lax; Max-Age=0`);
  return res.json({ success: true, message: 'Signed out successfully.' });
}