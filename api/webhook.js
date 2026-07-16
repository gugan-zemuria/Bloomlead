export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // `message` is optional — the home page always sends it empty.
    const { email, page_source, customer_type, module_type, message } = req.body || {};

    if (!email || !page_source || !customer_type || !module_type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const WEBHOOK_URL = 'https://staging-api.llmcontrols.ai/api/v1/webhook/54c2cebf-ad30-4684-a0d5-4f8c37d36e36';
    const API_KEY = process.env.LLMCONTROLS_WEBHOOK_API_KEY;
    if (!API_KEY) {
        console.error('LLMCONTROLS_WEBHOOK_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ email, page_source, customer_type, module_type, message: message || '' })
        });

        return res.status(response.status).json({ ok: response.ok });
    } catch (error) {
        console.error('Webhook proxy error:', error);
        return res.status(502).json({ error: 'Webhook request failed' });
    }
}
