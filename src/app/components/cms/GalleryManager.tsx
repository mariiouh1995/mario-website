import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ImagePlus, Images, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { addGalleryImages, changeGalleryImage, galleryPages, galleryRows, galleryUrl, moveGalleryImage, weddingCategories } from '../../../content/gallery';
import type { SiteMedia, SiteStory } from '../../../content/site-content';

type Props = { stories: SiteStory[]; media: SiteMedia[]; initialPage: string; change: (apply: (stories: SiteStory[]) => SiteStory[]) => void; uploadFile: (file: File) => Promise<SiteMedia | null>; progress: number | null };

export function GalleryManager({ stories, media, initialPage, change, uploadFile, progress }: Props) {
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(36);
  const [picker, setPicker] = useState<'add' | SiteStory | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaLimit, setMediaLimit] = useState(48);
  const [selected, setSelected] = useState<string[]>([]);
  const [edit, setEdit] = useState<SiteStory | null>(null);
  const [remove, setRemove] = useState<SiteStory | null>(null);
  const rows = useMemo(() => galleryRows(stories, page), [stories, page]);
  const filtered = rows.filter(row => (!category || row.content.category === category) && `${row.name} ${row.content.alt_de} ${row.content.alt_en}`.toLowerCase().includes(search.toLowerCase()));
  const images = media.filter(item => item.type === 'image' && `${item.name} ${item.alt || ''}`.toLowerCase().includes(mediaSearch.toLowerCase()) && !rows.some(row => galleryUrl(row) === item.url && (picker === 'add' || (picker && typeof picker !== 'string' && galleryUrl(picker) !== item.url))));
  const openPicker = (target: 'add' | SiteStory) => { setPicker(target); setSelected([]); setMediaSearch(''); setMediaLimit(48); };
  const applyMedia = (items: SiteMedia[]) => {
    if (!picker) return;
    if (picker === 'add') change(current => addGalleryImages(current, page, category, items));
    else change(current => changeGalleryImage(current, picker, { image_url: items[0].url }));
    setPicker(null); setSelected([]);
    toast.success(picker === 'add' ? 'Bilder zum Entwurf hinzugefügt' : 'Bild im Entwurf ausgetauscht');
  };
  return <section className="cms-gallery" aria-label="Galerien verwalten">
    <div className="cms-gallery-heading"><div><h2><Images size={21} /> Galerien</h2><p className="cms-muted">{rows.length} Bilder · Änderungen im Website-Entwurf</p></div><button className="cms-button cms-primary" onClick={() => openPicker('add')}><Plus size={17} /> Bilder hinzufügen</button></div>
    <div className="cms-gallery-filters">
      <label className="cms-field">Galerie<select aria-label="Galerie" value={page} onChange={event => { setPage(event.target.value); setCategory(''); setSearch(''); setLimit(36); }}>{Object.entries(galleryPages).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      {page === 'hochzeit' && <label className="cms-field">Kategorie<select value={category} onChange={event => { setCategory(event.target.value); setLimit(36); }}><option value="">Alle Kategorien</option>{Object.entries(weddingCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>}
      <label className="cms-search"><Search size={16} /><input aria-label="Galeriebilder suchen" placeholder="Bilder suchen" value={search} onChange={event => { setSearch(event.target.value); setLimit(36); }} /></label>
    </div>
    <div className="cms-gallery-grid">{filtered.slice(0, limit).map((row, index) => <article key={row.full_slug} className="cms-gallery-item" data-gallery-image={row.full_slug}>
      <button className="cms-gallery-image" title="Bild bearbeiten" onClick={() => setEdit(structuredClone(row))}><img src={galleryUrl(row)} alt={row.content.alt_de || row.name} loading="lazy" /></button>
      <div className="cms-gallery-caption"><span className="cms-gallery-position">{index + 1}</span><p title={row.content.alt_de || row.name}>{row.content.alt_de || row.name}</p></div>
      <div className="cms-gallery-tools">
        <button className="cms-icon" title="Nach vorne verschieben" disabled={index === 0} onClick={() => change(current => moveGalleryImage(current, page, filtered.map(item => item.full_slug), row.full_slug, -1))}><ArrowUp size={16} /></button>
        <button className="cms-icon" title="Nach hinten verschieben" disabled={index === filtered.length - 1} onClick={() => change(current => moveGalleryImage(current, page, filtered.map(item => item.full_slug), row.full_slug, 1))}><ArrowDown size={16} /></button>
        <button className="cms-icon" title="Bild austauschen" onClick={() => openPicker(row)}><ImagePlus size={16} /></button>
        <button className="cms-icon" title="Bild bearbeiten" onClick={() => setEdit(structuredClone(row))}><Pencil size={16} /></button>
        <button className="cms-icon cms-danger" title="Aus Galerie entfernen" onClick={() => setRemove(row)}><Trash2 size={16} /></button>
      </div>
    </article>)}</div>
    {!filtered.length && <p className="cms-gallery-empty">{search || category ? 'Keine passenden Bilder.' : 'Diese Galerie enthält noch keine Bilder.'}</p>}
    {filtered.length > limit && <button className="cms-button" onClick={() => setLimit(limit + 36)}><Plus size={16} /> Weitere Bilder ({filtered.length - limit})</button>}
    <Dialog open={Boolean(edit)} onOpenChange={open => !open && setEdit(null)}><DialogContent aria-describedby={undefined}><DialogTitle>Galeriebild bearbeiten</DialogTitle>{edit && <form className="cms-fields" onSubmit={event => { event.preventDefault(); change(current => changeGalleryImage(current, edit, { alt_de: edit.content.alt_de, alt_en: edit.content.alt_en, category: edit.content.category })); setEdit(null); }}>
      <label className="cms-field">Bildbeschreibung Deutsch<input value={edit.content.alt_de || ''} onChange={event => setEdit({ ...edit, content: { ...edit.content, alt_de: event.target.value } })} /></label>
      <label className="cms-field">Bildbeschreibung Englisch<input value={edit.content.alt_en || ''} onChange={event => setEdit({ ...edit, content: { ...edit.content, alt_en: event.target.value } })} /></label>
      {page === 'hochzeit' && <label className="cms-field">Kategorie<select value={edit.content.category || ''} onChange={event => setEdit({ ...edit, content: { ...edit.content, category: event.target.value } })}><option value="">Ohne Kategorie</option>{Object.entries(weddingCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>}
      <button className="cms-button cms-primary" type="submit"><Check size={16} /> Übernehmen</button>
    </form>}</DialogContent></Dialog>
    <Dialog open={Boolean(remove)} onOpenChange={open => !open && setRemove(null)}><DialogContent aria-describedby={undefined}><DialogTitle>Bild aus der Galerie entfernen?</DialogTitle><p>Das Bild bleibt in der Mediathek verfügbar. Die Live-Seite ändert sich erst beim Veröffentlichen.</p><button className="cms-button cms-danger" onClick={() => { if (remove) change(current => changeGalleryImage(current, remove, null)); setRemove(null); }}><Trash2 size={16} /> Aus Galerie entfernen</button></DialogContent></Dialog>
    <Dialog open={Boolean(picker)} onOpenChange={open => !open && setPicker(null)}><DialogContent className="cms-media-dialog" aria-describedby={undefined}><DialogTitle>{picker === 'add' ? 'Bilder hinzufügen' : 'Bild austauschen'}</DialogTitle>
      <div className="cms-gallery-pickerbar"><label className="cms-button cms-upload"><Upload size={16} />{progress === null ? 'Bild hochladen' : `Upload ${progress} %`}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={progress !== null} onChange={async event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) { const medium = await uploadFile(file); if (medium) applyMedia([medium]); } }} /></label><label className="cms-search"><Search size={16} /><input aria-label="Mediathek durchsuchen" placeholder="Mediathek durchsuchen" value={mediaSearch} onChange={event => { setMediaSearch(event.target.value); setMediaLimit(48); }} /></label></div>
      <div className="cms-gallery-picker-grid">{images.slice(0, mediaLimit).map(item => <button key={item.url} type="button" className="cms-medium" aria-pressed={selected.includes(item.url)} title={item.name} onClick={() => setSelected(current => picker === 'add' ? (current.includes(item.url) ? current.filter(url => url !== item.url) : [...current, item.url]) : [item.url])}><img src={item.url} alt={item.alt || item.name} loading="lazy" /><span>{item.name}</span>{selected.includes(item.url) && <Check size={20} className="cms-medium-check" />}</button>)}</div>
      {!images.length && <p className="cms-muted">Keine passenden Bilder.</p>}
      <div className="cms-gallery-pickerbar">{images.length > mediaLimit && <button className="cms-button" onClick={() => setMediaLimit(mediaLimit + 48)}>Weitere Bilder</button>}<button className="cms-button cms-primary" disabled={!selected.length} onClick={() => applyMedia(media.filter(item => selected.includes(item.url)))}><Check size={16} /> {picker === 'add' ? `${selected.length} Bilder hinzufügen` : 'Bild übernehmen'}</button></div>
    </DialogContent></Dialog>
  </section>;
}
