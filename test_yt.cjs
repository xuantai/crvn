async function testYT() {
  const url = 'https://www.youtube.com/playlist?list=PLYhxSEggsw6pQynJA2XvQQ4tUG2z7zBNS';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  const html = await res.text();

  const idx = html.indexOf('var ytInitialData =');
  if (idx !== -1) {
    const jsonStr = html.substring(idx + 'var ytInitialData ='.length, html.indexOf(';</script>', idx));
    const data = JSON.parse(jsonStr);

    const items = [];
    const ids = new Set();

    function scan(node) {
      if (!node || typeof node !== 'object') return;
      if (node.lockupViewModel) {
        const l = node.lockupViewModel;
        const videoId = l.contentId;
        const title = l.metadata?.lockupMetadataViewModel?.title?.content || 'Video YouTube';
        if (videoId && !ids.has(videoId)) {
          ids.add(videoId);
          items.push({
            title,
            videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
          });
        }
      }
      if (Array.isArray(node)) {
        for (const el of node) scan(el);
      } else {
        for (const k of Object.keys(node)) {
          scan(node[k]);
        }
      }
    }

    scan(data);
    console.log('Extracted YouTube Playlist Items count:', items.length);
    console.log(items.slice(0, 10));
  }
}

testYT();
