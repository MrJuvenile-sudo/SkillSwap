// api/events-token.js - Grants realtime event subscription channels
import { events } from 'hatchable';
import { getCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  try {
    const user = await getCurrentUser(req);
    const channels = ['global', 'community'];
    
    if (user && user.id) {
      channels.push(`user:${user.id}`);
      channels.push(`requests:${user.id}`);
      channels.push(`notifications:${user.id}`);
    }

    const grant = await events.grant(channels, { ttl: 300 });
    res.json(grant);
  } catch (err) {
    console.error('Error granting events token:', err);
    res.status(500).json({ error: 'Failed to generate realtime token' });
  }
}