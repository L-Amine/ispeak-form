export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  const { nom, prenom, competition, langue } = req.body || {};

  if (!nom || !prenom || !competition || !langue) {
    return res.status(400).json({ ok: false, error: 'Champs manquants' });
  }

  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL) {
    return res.status(500).json({ ok: false, error: 'GOOGLE_SCRIPT_URL non configuré' });
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: String(nom).trim(),
        prenom: String(prenom).trim(),
        competition: String(competition).trim(),
        langue: String(langue).trim(),
        date: new Date().toISOString()
      })
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { ok: response.ok };
    }

    if (!response.ok || result.ok === false) {
      return res.status(502).json({ ok: false, error: 'Erreur Google Sheets' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Erreur serveur' });
  }
}