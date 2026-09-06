// api/exchange/balance.js - Effort Balance Estimator for Proposals
export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { offer_hours, receive_hours, offer_skill_name, receive_skill_name } = req.body || {};

    const offer = Number(offer_hours) || 2;
    const receive = Number(receive_hours) || 2;

    const diff = Math.abs(offer - receive);
    const isBalanced = diff <= 1;

    let suggestion = null;
    if (!isBalanced) {
      if (offer > receive) {
        suggestion = `Consider splitting ${offer_skill_name || 'offered skill'} into 2 shorter sessions or requesting an additional review session for ${receive_skill_name || 'received skill'}.`;
      } else {
        suggestion = `Consider adding a project code review or asset deliverable for ${offer_skill_name || 'offered skill'} to balance the trade.`;
      }
    }

    return res.json({
      balanced: isBalanced,
      offer_hours: offer,
      receive_hours: receive,
      difference: diff,
      status_label: isBalanced ? 'Fair Exchange (Balanced Effort)' : 'Unbalanced Effort',
      ai_suggestion: suggestion
    });
  } catch (err) {
    console.error('Exchange Balance API error:', err);
    return res.status(500).json({ error: 'Failed to calculate effort balance' });
  }
}
