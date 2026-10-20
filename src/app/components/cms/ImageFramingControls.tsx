import { Monitor, Smartphone, Undo2 } from 'lucide-react';
import { getImageFraming, type ImageFraming } from '../../../content/image-framing';
import type { SiteMedia } from '../../../content/site-content';

const positions = ['Oben links', 'Oben Mitte', 'Oben rechts', 'Mitte links', 'Zentriert', 'Mitte rechts', 'Unten links', 'Unten Mitte', 'Unten rechts'];
type Props = { url: string; media: SiteMedia[]; mobile: boolean; onMobile: (mobile: boolean) => void; onChange: (value?: ImageFraming) => void };

export function ImageFramingControls({ url, media, mobile, onMobile, onChange }: Props) {
  const value = getImageFraming(url, media);
  const device = mobile ? 'mobile' : 'desktop';
  const position = value[device];
  return <fieldset className="cms-framing">
    <legend>Bildausschnitt</legend>
    <div className="cms-framing-toolbar"><div className="cms-segment"><button type="button" title="Bildposition Desktop" aria-pressed={!mobile} onClick={() => onMobile(false)}><Monitor size={16} />Desktop</button><button type="button" title="Bildposition Mobil" aria-pressed={mobile} onClick={() => onMobile(true)}><Smartphone size={16} />Mobil</button></div><button type="button" className="cms-icon" title="Automatische Bildposition wiederherstellen" onClick={() => onChange(undefined)}><Undo2 size={16} /></button></div>
    <div className="cms-position-grid" role="group" aria-label={`Bildposition ${mobile ? 'Mobil' : 'Desktop'}`}>{positions.map((name, index) => {
      const x = (index % 3) * 50, y = Math.floor(index / 3) * 50;
      return <button key={name} type="button" title={name} aria-label={`${mobile ? 'Mobil' : 'Desktop'}: ${name}`} aria-pressed={position.x === x && position.y === y} onClick={() => onChange({ ...value, [device]: { x, y } })}><span aria-hidden="true" /></button>;
    })}</div>
  </fieldset>;
}
