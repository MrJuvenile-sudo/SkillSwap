// api/resources/upload.js - Upload & Submit Resource for Moderation
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      type, title, subject, university, course, semester,
      unit_topic, description, file_url, visibility,
      key_points, permission_confirmed
    } = req.body || {};

    if (!title || !subject || !type) {
      return res.status(400).json({ error: 'Title, subject, and type are required.' });
    }
    if (!permission_confirmed) {
      return res.status(400).json({ error: 'You must confirm you have permission to share this material.' });
    }

    const VALID_TYPES = ['NOTES', 'ASSIGNMENT', 'KEY_POINTS', 'PYQ', 'LAB', 'QUESTION_BANK', 'EXAM_PREP', 'PROJECT', 'PRESENTATION'];
    const VALID_VISIBILITY = ['EVERYONE', 'UNIVERSITY', 'COURSE', 'DEPARTMENT', 'CONNECTIONS'];

    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid resource type.' });
    const vis = VALID_VISIBILITY.includes(visibility) ? visibility : 'EVERYONE';

    const { rows } = await db.query(
      `INSERT INTO resources (contributor_id, type, title, subject, university, course, semester, unit_topic, description, file_url, visibility, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
       RETURNING *`,
      [user.id, type, title.trim(), subject.trim(),
       university || null, course || null, semester || null,
       unit_topic || null, description || null, file_url || null, vis]
    );

    const resource = rows[0];

    // If KEY_POINTS type, insert structured entries
    if (type === 'KEY_POINTS' && Array.isArray(key_points) && key_points.length > 0) {
      for (let i = 0; i < key_points.length; i++) {
        const kp = key_points[i];
        if (kp.title && kp.content) {
          await db.query(
            `INSERT INTO key_point_entries (resource_id, type, title, content, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [resource.id, kp.type || 'CONCEPT', kp.title.trim(), kp.content.trim(), i]
          );
        }
      }
    }

    // Update contributor stats
    await db.query(
      `UPDATE profiles SET resources_shared = resources_shared + 1 WHERE user_id = $1`,
      [user.id]
    ).catch(() => {});

    // Notify contributor
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'SYSTEM', 'Resource Submitted', 'Your resource has been submitted for review. We will notify you once it is approved.')`,
      [user.id]
    ).catch(() => {});

    return res.json({ success: true, resource });
  } catch (err) {
    console.error('Resource upload error:', err);
    return res.status(500).json({ error: 'Failed to upload resource' });
  }
}
