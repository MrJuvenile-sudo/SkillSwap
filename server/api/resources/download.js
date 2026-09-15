// api/resources/download.js - Track Resource Downloads
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resource_id } = req.body || {};
  if (!resource_id) return res.status(400).json({ error: 'resource_id required' });

  try {
    const { rows } = await db.query(
      `SELECT * FROM resources WHERE id = $1 AND status = 'APPROVED'`,
      [Number(resource_id)]
    );
    if (!rows.length) return res.status(404).json({ error: 'Resource not found' });

    // Increment download count
    await db.query(
      `UPDATE resources SET downloads = downloads + 1 WHERE id = $1`,
      [Number(resource_id)]
    );

    // Record download history
    await db.query(
      `INSERT INTO resource_downloads (user_id, resource_id) VALUES ($1, $2)`,
      [user.id, Number(resource_id)]
    );

    // Update contributor stats
    await db.query(
      `UPDATE profiles SET resources_downloads = resources_downloads + 1
       WHERE user_id = (SELECT contributor_id FROM resources WHERE id = $1)`,
      [Number(resource_id)]
    ).catch(() => {});

    return res.json({ success: true, file_url: rows[0].file_url });
  } catch (err) {
    console.error('Download tracking error:', err);
    return res.status(500).json({ error: 'Failed to track download' });
  }
}
