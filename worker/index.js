/**
 * Cloudflare Worker entry point.
 * Static files are served from the assets binding; /api/webhook is the
 * Cloudflare equivalent of the Vercel function in api/webhook.js.
 */
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/webhook') {
            return handleWebhook(request, env);
        }
        if (url.pathname.startsWith('/api/')) {
            return Response.json({ error: 'Not found' }, { status: 404 });
        }

        return env.ASSETS.fetch(request);
    }
};

async function handleWebhook(request, env) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    // `message` is optional — the home page always sends it empty.
    const { email, page_source, customer_type, module_type, message } = body || {};

    if (!email || !page_source || !customer_type || !module_type) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const WEBHOOK_URL = env.LLMCONTROLS_WEBHOOK_URL;
    const API_KEY = env.LLMCONTROLS_WEBHOOK_API_KEY;
    if (!WEBHOOK_URL || !API_KEY) {
        console.error('Missing env config — URL set:', !!WEBHOOK_URL, 'key set:', !!API_KEY);
        return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ email, page_source, customer_type, module_type, message: message || '' }),
            // Fail fast instead of hanging if the upstream is unreachable.
            signal: AbortSignal.timeout(10000)
        });

        return Response.json({ ok: response.ok }, { status: response.status });
    } catch (error) {
        console.error('Webhook proxy error:', error);
        return Response.json({ error: 'Webhook request failed' }, { status: 502 });
    }
}
