export function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    const host = url.hostname.replace(/^www\./, '');
    if (!['youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) return '';
    const id = host === 'youtu.be' ? url.pathname.split('/')[1] : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0' : '';
  } catch { return ''; }
}
