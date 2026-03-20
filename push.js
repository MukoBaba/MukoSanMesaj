export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const { toUserId, title, body } = req.body;

    if (!toUserId || !title) {
      return res.status(400).json({ error: 'toUserId and title required' });
    }

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      return res.status(500).json({ error: 'OneSignal config missing' });
    }

    // Send push via OneSignal REST API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: [toUserId],
        headings: { en: title },
        contents: { en: body || 'Yeni mesaj' },
        chrome_web_icon: 'https://mukosanmesaj.vercel.app/muko-logo.png',
        url: 'https://mukosanmesaj.vercel.app'
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
