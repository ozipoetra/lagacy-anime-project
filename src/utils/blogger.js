export async function parseBlogger(url, incomingRequest) {
  try {
    const timestamp = Date.now();
    const getHeader = (name) => {
      try { return incomingRequest.headers.get(name); } catch (e) { return null; }
    };
    
    const ip = getHeader('x-forwarded-for') || getHeader('cf-connecting-ip') || '8.8.8.8';
    const ua = getHeader('user-agent') || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

    const headers = new Headers({
      'User-Agent': ua,
      'dnt': '1',
      'priority': 'i',
      'range': 'bytes=0-',
      'Referer': 'https://youtube.googleapis.com/',
      //'Origin': query.split("/")[2],
      'sec-ch-ua': '\'Not_A Brand\';v=\'8\', \'Chromium\';v=\'132\'',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '\'Android\'',
      'sec-fetch-dest': 'video',
      'sec-fetch-mode': 'no-cors',
      'sec-fetch-site': 'cross-site',
      'x-client-data': 'CJW2yQEIorbJAQipncoBCJL/ygEIlaHLAQid/swBCPSYzQEIhaDNAQiNn84BCI6ozgEInqzOAQ==',
      'REMOTE_ADDR': ip,
      'HTTP_X_FORWARDED_FOR': ip
    });

    const response = await fetch(url, { headers });
    const html = await response.text();

    if (html.includes('captcha') || html.includes('/sorry/index')) {
      return { error: "Blocked" };
    }

    // Split logic with optional chaining for safety
    const parts = html.split('var VIDEO_CONFIG = ');
    if (!parts[1]) return { error: "NotFound" };

    const match = parts[1].split('}]}')[0] + '}]}';

    if (match) {
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
    }

    return { error: "NotFound" };
  } catch (err) {
    console.error("Blogger Parser Error:", err.message);
    return { error: err.message };
  }
}