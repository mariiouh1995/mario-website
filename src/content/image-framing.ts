import { resolveSiteAsset } from './media.js';
import type { SiteMedia } from './site-content.js';

export type ImagePosition = { x: number; y: number };
export type ImageFraming = { desktop: ImagePosition; mobile: ImagePosition };
const centered: ImageFraming = { desktop: { x: 50, y: 50 }, mobile: { x: 50, y: 50 } };
const defaults: Record<string, ImageFraming> = {
  'b6fdfc47d710e4ea-20251019_R52_1038_-WebRes-.jpg': { desktop: { x: 50, y: 25 }, mobile: { x: 50, y: 35 } },
  '1db4b5e168c40eeb-8D2A8472.jpg': { desktop: { x: 50, y: 0 }, mobile: { x: 50, y: 0 } },
  '210f3372cd50e187-20251004_8D2A0221_-WebRes-.jpg': { desktop: { x: 50, y: 18 }, mobile: { x: 50, y: 18 } },
};

export function getImageFraming(url: string, media: SiteMedia[] = []): ImageFraming {
  const source = resolveSiteAsset(url);
  const override = media.find(item => resolveSiteAsset(item.url) === source && item.framing)?.framing;
  if (override) return override;
  const filename = source.split('?')[0].split('/').pop() || '';
  return defaults[filename] || centered;
}

export const positionCss = (position: ImagePosition) => `${position.x}% ${position.y}%`;
export function validImageFraming(value: unknown): value is ImageFraming {
  const framing = value as ImageFraming;
  return Boolean(framing && ['desktop', 'mobile'].every(key => {
    const position = framing[key as keyof ImageFraming];
    return position && ['x', 'y'].every(axis => { const number = position[axis as keyof ImagePosition]; return typeof number === 'number' && Number.isFinite(number) && number >= 0 && number <= 100; });
  }));
}

export function setImageFraming(media: SiteMedia[], source: string, framing?: ImageFraming): SiteMedia[] {
  const url = resolveSiteAsset(source);
  const found = media.some(item => resolveSiteAsset(item.url) === url);
  if (!found) return framing ? [...media, { url, name: url.split('/').pop() || 'Bild', type: 'image', framing }] : media;
  return media.map(item => {
    if (resolveSiteAsset(item.url) !== url) return item;
    const { framing: _previous, ...rest } = item;
    return framing ? { ...rest, framing } : rest;
  });
}
