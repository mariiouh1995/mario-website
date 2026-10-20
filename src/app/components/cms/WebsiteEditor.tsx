import { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { Check, ExternalLink, Eye, Globe, ImagePlus, Images, Monitor, MousePointer2, Plus, RefreshCw, Save, Search, Smartphone, Trash2, Undo2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { collectMedia, type SiteDocument, type SiteEdit, type SiteMedia, type SiteStory } from '../../../content/site-content';
import { publicPages } from './WebsiteSurface';
import { GalleryManager } from './GalleryManager';
import { changeGalleryImage } from '../../../content/gallery';
import { ImageFramingControls } from './ImageFramingControls';
import { setImageFraming } from '../../../content/image-framing';
import './website-editor.css';

type Selection = { tag: string; fields: SiteEdit[]; framing?: boolean };
type Api = (action: string, options?: RequestInit) => Promise<any>;
const pageNames = ['Startseite', 'Hochzeiten', 'Tierfotografie', 'Portrait', 'Über mich', 'Destination Wedding', 'Impressum', 'Datenschutz'];
const groups: Record<string, string> = { pages: 'Seitentexte', packages: 'Pakete', addons: 'Zusatzleistungen', faqs: 'FAQ', reviews: 'Bewertungen' };
const fieldNames: Record<string, string> = { src: 'Bild / Video', poster: 'Vorschaubild', href: 'Linkziel', alt: 'Bildbeschreibung', title: 'Titel', placeholder: 'Platzhalter', 'aria-label': 'Beschriftung' };

function ContentFields({ value, onChange, path = '' }: { value: any; onChange: (value: any) => void; path?: string }) {
  if (typeof value === 'boolean') return <label className="cms-check"><input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} />{path}</label>;
  if (typeof value === 'number') return <label className="cms-field">{path}<input type="number" value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
  if (typeof value === 'string') return <label className="cms-field">{path}<textarea rows={value.length > 140 || value.includes('\n') ? 5 : 2} value={value} onChange={event => onChange(event.target.value)} /></label>;
  if (Array.isArray(value)) return <div className="cms-fields">{value.map((item, index) => <div key={index}><ContentFields value={item} path={`${path} ${index + 1}`} onChange={next => onChange(value.map((old, i) => i === index ? next : old))} /><button className="cms-link" onClick={() => onChange(value.filter((_, i) => i !== index))}>Eintrag entfernen</button></div>)}<button className="cms-button" onClick={() => onChange([...value, value.length ? structuredClone(value[0]) : ''])}><Plus size={15} /> Eintrag</button></div>;
  if (value && typeof value === 'object') return <div className="cms-fields">{Object.entries(value).filter(([key]) => !key.startsWith('_') && !['component', 'id', 'fieldtype', 'is_external_url'].includes(key)).map(([key, item]) => <ContentFields key={key} value={item} path={key.replace(/_/g, ' ')} onChange={next => onChange({ ...value, [key]: next })} />)}</div>;
  return null;
}

export function WebsiteEditor({ password }: { password: string }) {
  const api: Api = useCallback(async (action, options = {}) => {
    const response = await fetch(`/api/website?action=${action.replace(/^website-/, '')}`, { ...options, headers: { 'Content-Type': 'application/json', 'x-admin-password': password } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Website-Aktion fehlgeschlagen');
    return data;
  }, [password]);
  const [doc, setDoc] = useState<SiteDocument | null>(null);
  const [revision, setRevision] = useState(0);
  const [publishedAt, setPublishedAt] = useState('');
  const [page, setPage] = useState('/');
  const [lang, setLang] = useState('de');
  const [mobile, setMobile] = useState(false);
  const [editing, setEditing] = useState(true);
  const [tab, setTab] = useState<'selection' | 'content' | 'media' | 'gallery'>('selection');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [group, setGroup] = useState('pages');
  const [search, setSearch] = useState('');
  const [storyId, setStoryId] = useState('');
  const [mediaTarget, setMediaTarget] = useState<SiteEdit | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const docRef = useRef(doc);
  docRef.current = doc;
  const send = (data: Record<string, unknown>) => frame.current?.contentWindow?.postMessage({ channel: 'mario-website', ...data }, location.origin);

  const load = async () => {
    setBusy(true); setError('');
    try { const data = await api('website-admin'); setDoc(data.draft); setRevision(data.revision); setPublishedAt(data.publishedAt || ''); setDirty(false); }
    catch (error: any) { setError(error.message || 'Website konnte nicht geladen werden.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); }, [api]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || event.data?.channel !== 'mario-website') return;
      if (event.data.type === 'selection') { setSelection(event.data); setTab('selection'); }
      if (event.data.type === 'navigate' && publicPages.includes(event.data.path)) { setPage(event.data.path); setSelection(null); }
      if (event.data.type === 'ready') {
        if (docRef.current) send({ type: 'document', document: docRef.current });
        send({ type: 'mode', editing });
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [editing]);
  useEffect(() => { if (doc) send({ type: 'document', document: doc }); }, [doc]);
  useEffect(() => { send({ type: 'mode', editing }); }, [editing]);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);

  const update = (next: SiteDocument) => { docRef.current = next; setDoc(next); setDirty(true); };
  const setEdit = (field: SiteEdit, value: string) => {
    if (!doc) return;
    if (field.sourceStory && field.sourceField) {
      const selected = doc.stories.find(story => story.full_slug === field.sourceStory);
      const stories = selected?.content.component === 'gallery_image' && field.sourceField === 'image_url' ? changeGalleryImage(doc.stories, selected, { image_url: value }) : doc.stories.map(story => {
        if (story.full_slug !== field.sourceStory) return story;
        const original = story.content[field.sourceField!];
        const next = original && typeof original === 'object' && 'filename' in original ? { ...original, filename: value } : value;
        return { ...story, content: { ...story.content, [field.sourceField!]: next } };
      });
      update({ ...doc, stories });
      setSelection(old => old ? { ...old, fields: old.fields.map(item => item.id === field.id ? { ...item, value } : item) } : null);
      return;
    }
    const edits = doc.edits.filter(edit => edit.id !== field.id);
    if (value !== field.original) edits.push({ ...field, value });
    update({ ...doc, edits });
    setSelection(old => old ? { ...old, fields: old.fields.map(item => item.id === field.id ? { ...item, value } : item) } : null);
  };
  const save = async (publish: boolean) => {
    if (!doc || busy) return;
    setBusy(true); setError('');
    try {
      const data = await api(publish ? 'website-publish' : 'website-save', { method: 'POST', body: JSON.stringify({ document: doc, revision }) });
      setDoc(data.draft); setRevision(data.revision); setPublishedAt(data.publishedAt || ''); setDirty(false);
      toast.success(publish ? 'Website veröffentlicht' : 'Entwurf gespeichert');
    } catch (error: any) { setError(error.message); toast.error(error.message); }
    finally { setBusy(false); }
  };
  const discard = async () => {
    if (!window.confirm('Den Entwurf verwerfen und den veröffentlichten Stand laden?')) return;
    setBusy(true);
    try { const data = await api('website-discard', { method: 'POST', body: JSON.stringify({ revision }) }); setDoc(data.draft); setRevision(data.revision); setSelection(null); setDirty(false); }
    catch (error: any) { setError(error.message); }
    finally { setBusy(false); }
  };
  const uploadFile = async (file: File) => {
    if (!doc) return null;
    setProgress(0);
    try {
      const blob = await upload(`website/${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, file, { access: 'public', handleUploadUrl: '/api/website?action=upload', clientPayload: JSON.stringify({ password }), multipart: file.size > 5 * 1024 * 1024, onUploadProgress: event => setProgress(Math.round(event.percentage)) });
      const medium: SiteMedia = { url: blob.url, name: file.name, type: file.type.startsWith('video/') ? 'video' : 'image' };
      const current = docRef.current!;
      update({ ...current, media: [...current.media, medium] });
      toast.success('Medium hochgeladen');
      return medium;
    } catch (error: any) { toast.error(error.message || 'Upload fehlgeschlagen'); return null; }
    finally { setProgress(null); }
  };
  const chooseMedia = (medium: SiteMedia) => {
    if (!mediaTarget) return;
    setEdit(mediaTarget, medium.url); setMediaTarget(null); setTab('selection');
  };
  const selectedStory = doc?.stories.find(story => story.full_slug === storyId);
  const selectedImage = selection?.framing ? selection.fields.find(field => field.attribute === 'src')?.value : undefined;
  const stories = doc?.stories.filter(story => story.full_slug.startsWith(`${group}/`) && `${story.name} ${JSON.stringify(story.content)}`.toLowerCase().includes(search.toLowerCase())) || [];
  const media = [...new Map([...(doc?.media || []), ...collectMedia(doc?.stories || [])].map(item => [item.url, item])).values()].filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  const createStory = () => {
    if (!doc || group === 'pages') return;
    const id = crypto.randomUUID();
    const contents: Record<string, any> = {
      packages: { component: 'package', name: 'Neues Paket', price: 'Auf Anfrage', subtitle: '', subtitle_en: '', features: '', features_en: '', highlight: false, category: 'wedding-photo', sort_order: stories.length + 1 },
      addons: { component: 'addon', text_de: 'Neue Zusatzleistung', text_en: '', sort_order: stories.length + 1 },
      gallery: { component: 'gallery_image', page: 'hochzeit', category: 'paarshooting', image_url: '', alt_de: '', alt_en: '', sort_order: stories.length + 1 },
      faqs: { component: 'faq_item', category_key: 'allgemein', category_label_de: 'Allgemein', category_label_en: 'General', question_de: 'Neue Frage', question_en: '', answer_de: '', answer_en: '', sort_order: stories.length + 1 },
      reviews: { component: 'review', author: '', rating: 5, text: '', text_en: '', sort_order: stories.length + 1 },
    };
    const story: SiteStory = { uuid: id, slug: id, full_slug: `${group}/${id}`, name: 'Neuer Eintrag', content: contents[group] };
    update({ ...doc, stories: [...doc.stories, story] }); setStoryId(story.full_slug);
  };
  if (!doc) return <div className="cms-loading">{error || 'Website wird geladen …'}{error && <button className="cms-button" onClick={load}><RefreshCw size={16} /> Erneut laden</button>}</div>;

  return <div className="cms-editor">
    <div className="cms-toolbar">
      <div className="cms-title"><Globe size={21} /><div><h2>Website</h2><span>{dirty ? 'Ungespeicherte Änderungen' : 'Entwurf gespeichert'}{publishedAt ? ` · Online seit ${new Date(publishedAt).toLocaleDateString('de-DE')}` : ''}</span></div></div>
      <div className="cms-actions"><button className="cms-icon" title="Entwurf verwerfen" onClick={discard} disabled={busy}><Undo2 size={17} /></button><button className="cms-button" onClick={() => save(false)} disabled={busy}><Save size={16} /> Speichern</button><button className="cms-button cms-primary" onClick={() => save(true)} disabled={busy}><Check size={16} /> Veröffentlichen</button></div>
    </div>
    {error && <p className="cms-error" role="alert">{error}</p>}
    <div className="cms-previewbar">
      <select aria-label="Seite" value={page} onChange={event => { setPage(event.target.value); setSelection(null); }}>{publicPages.map((path, index) => <option key={path} value={path}>{pageNames[index]}</option>)}</select>
      <select aria-label="Sprache" value={lang} onChange={event => { setLang(event.target.value); setSelection(null); }}><option value="de">Deutsch</option><option value="en">English</option></select>
      <div className="cms-segment"><button title="Desktop" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={17} /></button><button title="Mobil" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={17} /></button></div>
      <div className="cms-segment"><button title="Inhalte auswählen" aria-pressed={editing} onClick={() => setEditing(true)}><MousePointer2 size={17} /></button><button title="Seite bedienen" aria-pressed={!editing} onClick={() => setEditing(false)}><Eye size={17} /></button></div>
      <a className="cms-icon" href={page} target="_blank" rel="noreferrer" title="Live-Seite öffnen"><ExternalLink size={17} /></a>
      <button className="cms-button" aria-pressed={tab === 'gallery'} onClick={() => { setTab(tab === 'gallery' ? 'selection' : 'gallery'); setMediaTarget(null); setSearch(''); }}><Images size={17} />{tab === 'gallery' ? 'Seitenvorschau' : 'Galerien'}</button>
    </div>
    {tab === 'gallery' ? <GalleryManager stories={doc.stories} media={media} initialPage={page === '/tierfotografie' ? 'tiere' : page === '/portrait' ? 'portrait' : 'hochzeit'} change={apply => { const current = docRef.current!; update({ ...current, stories: apply(current.stories) }); }} uploadFile={uploadFile} progress={progress} /> : <div className="cms-workspace">
      <div className={`cms-canvas ${mobile ? 'cms-mobile' : ''}`}><iframe key={`${page}:${lang}`} ref={frame} title="Website-Vorschau" src={`${page}?cms-preview=1&lang=${lang}`} /></div>
      <aside className="cms-inspector">
        <div className="cms-tabs">{(['selection', 'content', 'media'] as const).map((name, index) => <button key={name} aria-pressed={tab === name} onClick={() => { setTab(name); setSearch(''); }}>{['Auswahl', 'Inhalte', 'Medien'][index]}</button>)}</div>
        {tab === 'selection' && selectedImage && <div className="cms-pane"><ImageFramingControls url={selectedImage} media={doc.media} mobile={mobile} onMobile={setMobile} onChange={value => update({ ...doc, media: setImageFraming(doc.media, selectedImage, value) })} /></div>}
        {tab === 'selection' && <div className="cms-pane">{selection ? <><h3>{selection.tag === 'img' ? 'Bild' : selection.tag === 'video' ? 'Video' : 'Ausgewählter Inhalt'}</h3>{selection.fields.map(field => <div key={field.id} className="cms-field"><label>{field.attribute ? fieldNames[field.attribute] : 'Text'}</label><textarea aria-label={field.attribute ? fieldNames[field.attribute] : 'Text'} value={doc.edits.find(edit => edit.id === field.id)?.value ?? field.value} rows={field.kind === 'text' ? 4 : 2} onChange={event => setEdit(field, event.target.value)} />{['src', 'poster'].includes(field.attribute || '') && <button className="cms-button" onClick={() => { setMediaTarget(field); setTab('media'); }}><ImagePlus size={16} /> Medium auswählen</button>}<button title="Original wiederherstellen" className="cms-link" onClick={() => setEdit(field, field.original)}><Undo2 size={13} /> Zurücksetzen</button></div>)}</> : <div className="cms-empty"><MousePointer2 size={30} /><p>Inhalt auswählen</p><span>Klicke in der Vorschau auf einen Text, ein Bild oder ein Video.</span></div>}</div>}
        {tab === 'content' && <div className="cms-pane"><div className="cms-row"><select aria-label="Inhaltsbereich" value={group} onChange={event => { setGroup(event.target.value); setStoryId(''); setSearch(''); }}>{Object.entries(groups).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select>{group !== 'pages' && <button className="cms-icon" title="Eintrag hinzufügen" onClick={createStory}><Plus size={17} /></button>}</div><label className="cms-search"><Search size={15} /><input placeholder="Suchen" value={search} onChange={event => setSearch(event.target.value)} /></label><select aria-label="Inhaltseintrag" value={storyId} onChange={event => setStoryId(event.target.value)}><option value="">Eintrag auswählen ({stories.length})</option>{stories.map(story => <option key={story.full_slug} value={story.full_slug}>{story.name}</option>)}</select>{selectedStory && <><label className="cms-field">Name<input value={selectedStory.name} onChange={event => update({ ...doc, stories: doc.stories.map(story => story.full_slug === storyId ? { ...story, name: event.target.value } : story) })} /></label><ContentFields value={selectedStory.content} onChange={content => update({ ...doc, stories: doc.stories.map(story => story.full_slug === storyId ? { ...story, content } : story) })} /><button className="cms-button cms-danger" onClick={() => { if (window.confirm('Diesen Inhaltseintrag entfernen?')) { update({ ...doc, stories: doc.stories.filter(story => story.full_slug !== storyId) }); setStoryId(''); } }}><Trash2 size={15} /> Eintrag entfernen</button></>}</div>}
        {tab === 'media' && <div className="cms-pane">{mediaTarget && <div className="cms-row"><span>Medium für {fieldNames[mediaTarget.attribute || 'src']} wählen</span><button className="cms-icon" title="Auswahl abbrechen" onClick={() => setMediaTarget(null)}><X size={16} /></button></div>}<label className="cms-button cms-upload"><Upload size={16} /> {progress === null ? 'Bild / Video hochladen' : `Upload ${progress} %`}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime" disabled={progress !== null} onChange={event => { const file = event.target.files?.[0]; if (file) uploadFile(file); event.target.value = ''; }} /></label><label className="cms-search"><Search size={15} /><input placeholder="Medien suchen" value={search} onChange={event => setSearch(event.target.value)} /></label><div className="cms-media-grid">{media.slice(0, 100).map(item => <button key={item.url} title={item.name} className="cms-medium" onClick={() => mediaTarget ? chooseMedia(item) : (navigator.clipboard.writeText(item.url).then(() => toast.success('Medienadresse kopiert')))}>{item.type === 'image' ? <img src={item.url} alt={item.alt || item.name} loading="lazy" /> : <video src={item.url} preload="none" muted />}<span>{item.name}</span></button>)}</div>{media.length > 100 && <p className="cms-muted">{media.length} Medien. Suche eingrenzen, um weitere zu finden.</p>}</div>}
      </aside>
    </div>}
  </div>;
}
