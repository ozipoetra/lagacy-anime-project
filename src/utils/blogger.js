export async function parseBlogger(url, incomingRequest) {
  try {
    const getHeader = (name) => {
      try { return incomingRequest.headers.get(name); } catch (e) { return null; }
    };

    const ip = getHeader('x-forwarded-for') || getHeader('cf-connecting-ip') || '8.8.8.8';
    const ua = getHeader('user-agent') || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

    const headers = new Headers({
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.blogger.com/',
    });

    const response = await fetch(url, { headers });
    const html = await response.text();

    if (html.includes('captcha') || html.includes('/sorry/index')) {
      return { error: "Blocked" };
    }

    // Try old VIDEO_CONFIG format first
    const oldConfig = extractOldConfig(html);
    if (oldConfig) {
      return oldConfig;
    }

    // Try new WIZ format
    const wizConfig = extractWizConfig(html, url, ua);
    if (wizConfig) {
      return wizConfig;
    }

    // Try extracting from data-p attribute
    const dataPConfig = extractFromDataP(html, url);
    if (dataPConfig) {
      return dataPConfig;
    }

    return { error: "VideoConfigNotFound" };
  } catch (err) {
    console.error("Blogger Parser Error:", err.message);
    return { error: err.message };
  }
}

function extractOldConfig(html) {
  const parts = html.split('var VIDEO_CONFIG = ');
  if (!parts[1]) return null;

  const match = parts[1].split('}]}')[0] + '}]}';
  
  try {
    const config = JSON.parse(match);
    const streams = (config.streams || [])
      .map(s => ({
        url: s.play_url,
        quality: s.format_id === 22 ? '720p' : '360p'
      }))
      .sort((a, b) => (a.quality === '720p' ? -1 : 1));

    return {
      thumbnail: config.thumbnail,
      streams: streams,
      error: null
    };
  } catch {
    return null;
  }
}

function extractWizConfig(html, originalUrl, ua) {
  // Extract FdrFJe (session ID) from WIZ_global_data
  const sidMatch = html.match(/"FdrFJe":"([^"]+)"/);
  const apiKeyMatch = html.match(/"GTqRCb":"([^"]+)"/);
  
  if (!sidMatch || !apiKeyMatch) return null;

  const sessionId = sidMatch[1];
  const apiKey = apiKeyMatch[1];
  
  // Extract token from URL
  const tokenMatch = originalUrl.match(/token=([^&]+)/);
  if (!tokenMatch) return null;
  
  const token = tokenMatch[1];

  // Return a promise-like object that indicates we need to use iframe fallback
  // Since direct extraction is no longer possible with the new Google system
  return null;
}

function extractFromDataP(html, originalUrl) {
  // Try to extract video info from data-p attribute
  const dataPMatch = html.match(/data-p="([^"]+)"/);
  if (!dataPMatch) return null;

  // The data-p contains the token but video URLs are loaded via JS
  // This method won't work for direct extraction
  return null;
}

// Alternative: Try to get video info via JSONP or other methods
export async function getBloggerVideoInfo(token) {
  // This would require client-side JS execution which we don't have
  // The best approach now is to use iframe embed or alternative streaming sources
  return null;
}
