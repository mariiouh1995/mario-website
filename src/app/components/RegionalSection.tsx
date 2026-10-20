import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useContactModal } from './ContactModal';

export function RegionalSection({ wedding = false }: { wedding?: boolean }) {
  const { lang } = useLanguage();
  const { openContact } = useContactModal();
  const de = lang === 'de';
  const areas = de ? [
    ['Kufstein & Wilder Kaiser', 'Von Söll aus bin ich rund um Kufstein, Ellmau, Going und Scheffau für euch unterwegs. Ob Hochzeit, Paarshooting oder Familienfotos: Erzählt mir, wo eure Geschichte spielt.'],
    ['Kitzbühel & Tirol', 'Ihr plant eure Feier in Kitzbühel oder ein Shooting mitten in den Bergen? Ich begleite euch in ganz Tirol, auch in Innsbruck und Umgebung. Wichtig sind mir eure Wünsche und die Momente dazwischen.'],
    ['Chiemsee, Tegernsee & Schliersee', 'Auch die bayerischen Seen liegen für mich ganz nah. Für eure Hochzeit oder ein entspanntes Shooting komme ich an den Chiemsee, Tegernsee und Schliersee sowie in die Umgebung.'],
  ] : [
    ['Kufstein & Wilder Kaiser', 'Based in Söll, I work around Kufstein, Ellmau, Going and Scheffau. Whether you are planning a wedding, a couple session or family photos, tell me where your story takes place.'],
    ['Kitzbühel & Tyrol', 'Planning a celebration in Kitzbühel or a session in the mountains? I join you throughout Tyrol, including Innsbruck. Your wishes and the moments in between are what matter to me.'],
    ['Chiemsee, Tegernsee & Schliersee', 'The Bavarian lakes are close to home too. I travel to Chiemsee, Tegernsee, Schliersee and the surrounding area for weddings and relaxed photo sessions.'],
  ];
  return <section className="border-y border-black/10 bg-white px-5 py-16 md:py-24">
    <div className="mx-auto max-w-6xl">
      <p className="mb-4 text-xs uppercase text-black/60">{de ? 'Zuhause in Söll. Für euch unterwegs.' : 'At home in Söll. Wherever your story takes me.'}</p>
      <h2 className="mb-6 max-w-3xl text-3xl font-light leading-tight md:text-4xl">{de ? (wedding ? 'Eure Hochzeit zwischen Bergen und Seen.' : 'Eure Momente. In Tirol und Bayern.') : (wedding ? 'Your wedding, between mountains and lakes.' : 'Your moments. In Tyrol and Bavaria.')}</h2>
      <p className="mb-10 max-w-2xl text-sm leading-7 text-black/70">{de ? 'Servus, ich bin Mario, Fotograf und Videograf aus Söll am Wilden Kaiser. Ich halte fest, was euch ausmacht: natürlich, persönlich und ohne steife Posen.' : 'Servus, I am Mario, a photographer and filmmaker from Söll near the Wilder Kaiser. I capture what makes you who you are: naturally, personally and without stiff poses.'}</p>
      <div className="grid gap-8 md:grid-cols-3">{areas.map(([title, text]) => <div key={title}><h3 className="mb-3 text-base font-medium">{title}</h3><p className="text-sm leading-7 text-black/70">{text}</p></div>)}</div>
      <div className="mt-10 flex flex-wrap gap-6">
        <button className="inline-flex min-h-11 items-center gap-2 border-b border-black pb-1 text-sm text-left" onClick={() => openContact(wedding ? 'wedding' : 'general')}>{de ? 'Erzählt mir von euren Plänen' : 'Tell me about your plans'}<ArrowRight size={16} className="shrink-0" /></button>
        <Link className="inline-flex min-h-11 items-center text-sm underline underline-offset-4" to={wedding ? '/destination-wedding' : '/hochzeiten'}>{de ? (wedding ? 'Ihr heiratet im Ausland?' : 'Mehr zur Hochzeitsbegleitung') : (wedding ? 'Getting married abroad?' : 'Explore wedding photography')}</Link>
      </div>
    </div>
  </section>;
}
