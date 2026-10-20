import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLanguage } from '../LanguageContext';
import { getSiteDocument, setSiteDocument, subscribeSite } from '../../../content/site-client';
import type { SiteDocument, SiteEdit } from '../../../content/site-content';
import { resolveSiteAsset } from '../../../content/media';
import { publicPaths } from '../../../content/seo';

export const publicPages = publicPaths;
const selectorFor = (element: Element): string => {
  if (element.id === 'root') return '#root';
  if (!element.parentElement) return '';
  const siblings = [...element.parentElement.children].filter(child => child.tagName === element.tagName);
  return `${selectorFor(element.parentElement)} > ${element.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(element) + 1})`;
};

export function WebsiteSurface() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  useEffect(() => {
    if (!publicPages.includes(pathname)) return;
    const preview = window.parent !== window && new URLSearchParams(location.search).has('cms-preview');
    let editing = preview;
    let scheduled = 0;
    let outline: HTMLElement | undefined;
    const originals = new WeakMap<Node, string>();
    const originalAttributes = new WeakMap<Element, Map<string, string>>();
    const root = document.getElementById('root')!;
    const originalAttr = (element: Element, attribute: string) => {
      let attributes = originalAttributes.get(element);
      if (!attributes) { attributes = new Map(); originalAttributes.set(element, attributes); }
      if (!attributes.has(attribute)) attributes.set(attribute, element.getAttribute(attribute) || '');
      return attributes.get(attribute)!;
    };
    const post = (data: Record<string, unknown>) => { if (preview) window.parent.postMessage({ channel: 'mario-website', ...data }, location.origin); };
    const observer = new MutationObserver(() => {
      if (!scheduled) scheduled = requestAnimationFrame(apply);
    });
    const observe = () => observer.observe(root, { subtree: true, characterData: true, childList: true, attributes: true, attributeFilter: ['src', 'href', 'alt', 'poster', 'title', 'placeholder', 'aria-label'] });
    function apply() {
      scheduled = 0;
      observer.disconnect();
      for (const element of root.querySelectorAll('img, video, source')) {
        for (const attribute of ['src', 'poster']) {
          const url = element.getAttribute(attribute);
          if (url && resolveSiteAsset(url) !== url) element.setAttribute(attribute, resolveSiteAsset(url));
        }
      }
      for (const element of root.querySelectorAll<HTMLElement>('[data-cms-video-src] iframe')) element.style.pointerEvents = preview && editing ? 'none' : '';
      for (const edit of getSiteDocument().edits.filter(edit => (edit.page === pathname || edit.page === '*') && edit.lang === lang)) {
        let element: Element | null;
        try { element = document.querySelector(edit.selector); } catch { continue; }
        if (!element || !root.contains(element)) continue;
        if (edit.kind === 'text') {
          const node = element.childNodes[edit.index ?? 0];
          if (node?.nodeType !== Node.TEXT_NODE) continue;
          if (!originals.has(node)) originals.set(node, node.nodeValue === edit.value ? edit.original : node.nodeValue || '');
          if (originals.get(node) === edit.original && node.nodeValue !== edit.value) node.nodeValue = edit.value;
        } else if (edit.attribute) {
          const original = originalAttr(element, edit.attribute);
          if (original === edit.original && element.getAttribute(edit.attribute) !== edit.value) {
            element.setAttribute(edit.attribute, edit.value);
            if (element instanceof HTMLVideoElement && ['src', 'poster'].includes(edit.attribute)) element.load();
          }
        }
      }
      observe();
    }
    const describe = (target: Element) => {
      const embeddedVideo = target.closest('[data-cms-video-src]');
      let element = embeddedVideo || target.closest('img, video, iframe') || target.closest('a, button, label, p, h1, h2, h3, h4, h5, h6, li, span, strong, em, input, textarea') || target;
      if (!element.textContent?.trim() && !['IMG', 'VIDEO', 'IFRAME'].includes(element.tagName)) element = element.closest('section')?.querySelector('video,img') || element;
      if (element.closest('svg, script, style, [data-cms-ignore]')) return;
      const selector = selectorFor(element);
      const scope = element.closest('nav, footer') ? '*' : pathname;
      const fields: SiteEdit[] = [];
      const field = (kind: SiteEdit['kind'], original: string, value: string, extra: Partial<SiteEdit> = {}) => ({ id: `${scope}:${lang}:${selector}:${kind}:${extra.attribute ?? extra.index ?? ''}`, page: scope, lang, selector, kind, original, value, ...extra });
      element.childNodes.forEach((node, index) => {
        if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue?.trim()) return;
        if (!originals.has(node)) originals.set(node, node.nodeValue);
        fields.push(field('text', originals.get(node)!, node.nodeValue, { index }));
      });
      if (embeddedVideo) {
        const src = embeddedVideo.getAttribute('data-cms-video-src') || '';
        fields.push(field('attribute', src, src, { attribute: 'src' }));
      }
      const attrs = ['title', 'placeholder', 'aria-label'];
      if (element.tagName === 'IMG') attrs.push('alt');
      if (['IMG', 'VIDEO', 'IFRAME'].includes(element.tagName)) attrs.unshift('src');
      if (element.tagName === 'VIDEO') attrs.push('poster');
      if (element.tagName === 'A') attrs.push('href');
      for (const attribute of attrs) {
        if (!element.hasAttribute(attribute) && !['alt', 'poster'].includes(attribute)) continue;
        fields.push(field('attribute', originalAttr(element, attribute), element.getAttribute(attribute) || '', { attribute }));
      }
      const pageKey = ({ '/': 'home', '/hochzeiten': 'weddings', '/tierfotografie': 'animals', '/portrait': 'portrait', '/ueber-mich': 'about' } as Record<string, string>)[pathname];
      for (const edit of fields) {
        if (scope === '*') continue;
        if (element.hasAttribute('data-cms-gallery-image')) {
          const galleryPage = ({ '/hochzeiten': 'hochzeit', '/tierfotografie': 'tiere', '/portrait': 'portrait' } as Record<string, string>)[pathname];
          const image = element.getAttribute('data-cms-gallery-image');
          const story = getSiteDocument().stories.find(story => story.content.component === 'gallery_image' && (!galleryPage || story.content.page === galleryPage) && resolveSiteAsset(story.content.image_url?.filename || story.content.image_url || '') === image);
          if (story && ['src', 'alt'].includes(edit.attribute || '')) { edit.sourceStory = story.full_slug; edit.sourceField = edit.attribute === 'src' ? 'image_url' : `alt_${lang}`; continue; }
        }
        const candidates = getSiteDocument().stories.filter(story => story.full_slug === `pages/${pageKey}` || ['faq_item', 'review', 'package', 'gallery_image'].includes(story.content.component));
        for (const story of candidates) {
          const source = Object.entries(story.content).find(([key, value]) => {
            if (key.startsWith('_') || key === 'component') return false;
            const text = typeof value === 'string' ? value : value?.filename;
            if (!text) return false;
            return edit.kind === 'text' ? text.trim() === edit.original.trim() && (!/_(de|en)$/.test(key) || key.endsWith(`_${lang}`)) : ['src', 'poster'].includes(edit.attribute || '') && resolveSiteAsset(text) === edit.original;
          });
          if (source) { edit.sourceStory = story.full_slug; edit.sourceField = source[0]; break; }
        }
      }
      if (!fields.length) return;
      post({ type: 'selection', tag: element.tagName.toLowerCase(), fields });
    };
    const click = (event: MouseEvent) => {
      if (!preview) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('[data-cms-ignore]')) return;
      if (editing) { event.preventDefault(); event.stopImmediatePropagation(); describe(target); }
      else {
        const link = target.closest('a');
        if (link) {
          const url = new URL(link.href, location.origin);
          if (url.origin !== location.origin || !publicPages.includes(url.pathname)) { event.preventDefault(); event.stopImmediatePropagation(); }
          else if (!url.searchParams.has('cms-preview')) {
            event.preventDefault(); event.stopImmediatePropagation();
            post({ type: 'navigate', path: url.pathname });
          }
        }
      }
    };
    const hover = (event: MouseEvent) => {
      if (!editing) return;
      if (outline) outline.style.removeProperty('outline');
      outline = event.target instanceof HTMLElement ? event.target : undefined;
      if (outline) outline.style.outline = '2px solid #167c6c';
    };
    const submit = (event: Event) => { if (preview) { event.preventDefault(); event.stopImmediatePropagation(); } };
    const receive = (event: MessageEvent) => {
      if (!preview || event.origin !== location.origin || event.source !== window.parent || event.data?.channel !== 'mario-website') return;
      if (event.data.type === 'mode') { editing = Boolean(event.data.editing); if (!editing && outline) outline.style.removeProperty('outline'); apply(); }
      if (event.data.type !== 'document') return;
      const doc = event.data.document as SiteDocument;
      if (!doc || !Array.isArray(doc.stories) || !Array.isArray(doc.edits)) return;
      // Restore removed edits before switching the preview to a different draft.
      for (const edit of getSiteDocument().edits) {
        if ((edit.page !== pathname && edit.page !== '*') || edit.lang !== lang || doc.edits.some(next => next.id === edit.id)) continue;
        try {
          const element = document.querySelector(edit.selector);
          if (edit.kind === 'text') { const node = element?.childNodes[edit.index ?? 0]; if (node?.nodeType === Node.TEXT_NODE) node.nodeValue = edit.original; }
          else if (element && edit.attribute) element.setAttribute(edit.attribute, edit.original);
        } catch { /* An element may have been removed from a dynamic list. */ }
      }
      setSiteDocument(doc);
      apply();
    };
    const unsubscribe = subscribeSite(apply);
    apply();
    window.addEventListener('message', receive);
    if (preview) {
      document.addEventListener('click', click, true);
      document.addEventListener('mouseover', hover);
      document.addEventListener('submit', submit, true);
      post({ type: 'ready', path: pathname });
    }
    return () => {
      unsubscribe(); observer.disconnect(); cancelAnimationFrame(scheduled);
      window.removeEventListener('message', receive);
      document.removeEventListener('click', click, true);
      document.removeEventListener('mouseover', hover);
      document.removeEventListener('submit', submit, true);
      if (outline) outline.style.removeProperty('outline');
    };
  }, [pathname, lang]);
  return null;
}
