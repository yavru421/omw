export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Intercept Cloudflare Calls API requests
    if (url.pathname.startsWith("/api/calls/")) {
      if (!env.CALLS_APP_ID || !env.CALLS_API_TOKEN) {
        return new Response("Cloudflare Calls credentials not configured in environment.", { status: 500 });
      }

      // Map /api/calls/* to https://rtc.live.cloudflare.com/v1/apps/{appId}/*
      const endpoint = request.url.replace(url.origin + "/api/calls/", "");
      const callsUrl = `https://rtc.live.cloudflare.com/v1/apps/${env.CALLS_APP_ID}/${endpoint}`;
      
      const newRequest = new Request(callsUrl, {
        method: request.method,
        headers: {
          "Authorization": `Bearer ${env.CALLS_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: request.method === "POST" || request.method === "PUT" ? request.body : null
      });
      
      return await fetch(newRequest);
    }
    
    // Serve Blazor WASM static assets for all other requests
    return env.ASSETS.fetch(request);
  }
};
