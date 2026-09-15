import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('skillswap.db');

const users = db.prepare("SELECT id, name, username, email FROM app_users WHERE status != 'SUSPENDED' LIMIT 10").all();
console.log('Total users available:', users.length);

if (users.length >= 2) {
  const admin = users.find(u => u.username === 'admin') || users[0];
  const peers = users.filter(u => u.id !== admin.id);

  for (let i = 0; i < Math.min(peers.length, 3); i++) {
    const peer = peers[i];
    const stmt = db.prepare('SELECT id FROM connections WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)');
    const existing = stmt.get(admin.id, peer.id, peer.id, admin.id);
    let connId = existing ? existing.id : null;

    if (!connId) {
      const insConn = db.prepare("INSERT INTO connections (user1_id, user2_id, status) VALUES (?, ?, 'ACTIVE') RETURNING id");
      const res = insConn.get(admin.id, peer.id);
      connId = res.id;
    }

    const msgsStmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE connection_id = ?');
    const msgCount = msgsStmt.get(connId).count;

    if (msgCount === 0) {
      const insMsg = db.prepare("INSERT INTO messages (connection_id, sender_id, message, is_read, created_at) VALUES (?, ?, ?, ?, datetime('now', ?))");
      if (i === 0) {
        insMsg.run(connId, peer.id, 'Hi there! I saw your profile and would love to exchange skills on React architecture for UI/UX design!', 1, '-2 hours');
        insMsg.run(connId, admin.id, 'Hello! That sounds fantastic. I have extensive experience with full-stack React and state management. When would you like to schedule our first session?', 1, '-1 hour');
        insMsg.run(connId, peer.id, 'How about tomorrow at 4 PM UTC? We can run through the component lifecycle first!', 0, '-15 minutes');
      } else if (i === 1) {
        insMsg.run(connId, peer.id, 'Hey! Are you open to collaborating on the Python Data Science problem challenge?', 1, '-1 day');
        insMsg.run(connId, admin.id, 'Absolutely! Let me review the problem details and share my initial approach.', 1, '-6 hours');
        insMsg.run(connId, peer.id, 'Awesome, I posted a link to our study notes in the Learning Hub as well!', 0, '-30 minutes');
      } else {
        insMsg.run(connId, peer.id, 'Hey, thanks for accepting my skill swap proposal!', 1, '-3 days');
        insMsg.run(connId, admin.id, 'Glad to connect! Looking forward to learning from you.', 1, '-2 days');
      }
    }
  }
  console.log('Seeded chat successfully.');
}
