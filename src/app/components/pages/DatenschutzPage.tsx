import { useLanguage } from '../LanguageContext';
import { SEO } from '../SEO';
import { openConsentSettings } from '../consent';

const sections = [
  {
    title: ['Verantwortlicher und Kontakt', 'Controller and contact'],
    de: ['Mario Schubert Fotografie, Hauning 30a, 6306 Söll, Österreich. E-Mail: servus@marioschub.com. Telefon: +43 67763681543. Für Anliegen zu deinen personenbezogenen Daten erreichst du mich unter dieser E-Mail-Adresse.'],
    en: ['Mario Schubert Fotografie, Hauning 30a, 6306 Söll, Austria. Email: servus@marioschub.com. Phone: +43 67763681543. Please use this email address for questions about your personal data.'],
  },
  {
    title: ['Welche Daten ich wofür verarbeite', 'What data I process and why'],
    de: ['Beim Aufruf der Website fallen technische Verbindungsdaten an, insbesondere IP-Adresse, Zeitpunkt, aufgerufene Adresse und Browserinformationen. Sie werden zur Auslieferung, Sicherheit und Fehleranalyse verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO: mein berechtigtes Interesse am sicheren Betrieb der Website.',
      'Wenn du mich kontaktierst oder ein Angebot anfragst, verarbeite ich deine Angaben, zum Beispiel Namen, E-Mail-Adressen, Telefonnummern, Termin, Orte, gewünschte Leistungen und deine Nachricht. Im Kundenportal kommen gegebenenfalls Anschrift, Hochzeitsablauf, Vertragsdokumente, Inspirationslinks und Zahlungsinformationen hinzu. Grundlage sind Art. 6 Abs. 1 lit. b DSGVO für vorvertragliche Maßnahmen und Vertragsabwicklung sowie Art. 6 Abs. 1 lit. c DSGVO für gesetzliche Pflichten. Angaben zu weiteren Personen solltest du nur mit entsprechender Berechtigung übermitteln.'],
    en: ['Visiting this website generates technical connection data, including IP address, access time, requested address and browser information. This is used to deliver and secure the website and investigate errors. The legal basis is Article 6(1)(f) GDPR, my legitimate interest in operating a secure website.',
      'For enquiries, offers and customer services I process the details you provide, such as names, email addresses, phone numbers, dates, locations, requested services and messages. The customer portal may also contain addresses, wedding schedules, contracts, inspiration links and payment records. The bases are Article 6(1)(b) GDPR for pre-contractual measures and contracts and Article 6(1)(c) GDPR for legal obligations. Only submit other people’s details when authorised to do so.'],
  },
  {
    title: ['Hosting, Medien und Kundendatenbank', 'Hosting, media and customer database'],
    de: ['Die Website und ihre Schnittstellen werden bei Vercel Inc. betrieben. Bilder, Videos und andere Website-Medien können über Vercel Blob und ImageKit ausgeliefert werden; einzelne vorhandene Medien können von Unsplash stammen. Beim Abruf erhält der jeweilige Anbieter notwendige Verbindungsdaten. Schriftdateien werden über die Website selbst ausgeliefert. Diese technisch erforderliche Bereitstellung erfolgt auf Basis von Art. 6 Abs. 1 lit. f DSGVO.',
      'Inhalte der Website sowie Anfragen und Kundendaten werden in einer PostgreSQL-Datenbank bei Neon gespeichert. Die Datenbank wird serverseitig angesprochen. Besucher erhalten keinen direkten Datenbankzugang. Die Verarbeitung erfolgt zur Bearbeitung von Anfragen und Verträgen auf Basis von Art. 6 Abs. 1 lit. b DSGVO und zum sicheren Betrieb auf Basis von Art. 6 Abs. 1 lit. f DSGVO.',
      'Weitere Informationen: vercel.com/legal/privacy-policy, imagekit.io/privacy-policy, unsplash.com/privacy und neon.com/privacy-policy.'],
    en: ['The website and its APIs are hosted by Vercel Inc. Website images and videos may be delivered through Vercel Blob and ImageKit; some existing images may originate from Unsplash. Providers receive the connection data needed to deliver files. Fonts are served by this website. This necessary delivery is based on Article 6(1)(f) GDPR.',
      'Website content, enquiries and customer records are stored in a PostgreSQL database at Neon, accessed only by the server. Visitors do not receive database access. Processing is based on Article 6(1)(b) GDPR for enquiries and contracts and Article 6(1)(f) GDPR for secure operation.',
      'Further information: vercel.com/legal/privacy-policy, imagekit.io/privacy-policy, unsplash.com/privacy and neon.com/privacy-policy.'],
  },
  {
    title: ['Cookies, lokaler Speicher und Einwilligung', 'Cookies, local storage and consent'],
    de: ['Ohne deine Einwilligung werden keine Google-Analytics-Tags und keine eingebetteten YouTube-Videos geladen. Für diese optionalen Dienste kannst du getrennt zustimmen oder sie vollständig ablehnen. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. a DSGVO und § 165 Abs. 3 TKG 2021.',
      'Deine Auswahl wird unter ms-cookie-consent im lokalen Speicher deines Browsers für bis zu 180 Tage gespeichert. Danach oder bei einer Änderung der Einwilligungsversion wird erneut gefragt. Notwendige Speicherzugriffe dienen unter anderem deiner Auswahl und der Anmeldung in geschützten Bereichen. Das Kundenportal verwendet den Sitzungsspeicher für das von dir eingegebene Portalpasswort; die Admin-Anmeldung verwendet ebenfalls Browser-Speicher. Technisch notwendige Zugriffe stützen sich auf § 165 Abs. 3 TKG 2021 und, je nach Zweck, Art. 6 Abs. 1 lit. b oder f DSGVO.',
      'Über „Cookie-Einstellungen“ kannst du deine Einwilligung jederzeit mit Wirkung für die Zukunft ändern oder widerrufen. Bei Widerruf der Analyse-Einwilligung wird die Analyse deaktiviert und es werden erreichbare Analytics-Cookies dieser Website gelöscht. Die Rechtmäßigkeit bereits erfolgter Verarbeitungen bleibt unberührt.'],
    en: ['Google Analytics tags and embedded YouTube videos do not load without your permission. You can consent separately or reject all optional services. The bases are Article 6(1)(a) GDPR and section 165(3) of the Austrian Telecommunications Act 2021.',
      'Your choices are stored as ms-cookie-consent in browser local storage for up to 180 days. Consent is requested again after expiry or a consent-version change. Necessary storage supports your choices and protected areas. The customer portal uses session storage for the portal password you enter; the admin login also uses browser storage. Necessary access is based on section 165(3) TKG 2021 and Article 6(1)(b) or (f) GDPR, depending on its purpose.',
      'You can change or withdraw your consent at any time using “Cookie settings”. Withdrawing analytics consent disables analytics and deletes accessible first-party Analytics cookies. Withdrawal does not affect the lawfulness of earlier processing.'],
  },
  {
    title: ['Google Analytics', 'Google Analytics'],
    de: ['Ich nutze Google Analytics 4 für freiwillige Reichweitenanalyse, Anbieter für Nutzer im EWR ist Google Ireland Limited. Der Dienst wird nur nach deiner ausdrücklichen Analyse-Einwilligung aktiviert. Vorher wird auch das Google-Skript nicht geladen. Werbeeinwilligungen werden daraus nicht abgeleitet; Google Signals und Werbepersonalisierung sind in der Website-Konfiguration deaktiviert.',
      'Nach Zustimmung können besuchte öffentliche Seiten, technische Geräte- und Browsermerkmale, Ereignisse und pseudonyme Kennungen verarbeitet werden. Google verarbeitet dabei auch Verbindungsdaten einschließlich der IP-Adresse. Die Standard-Laufzeit der von dieser Website konfigurierten Analytics-Cookies beträgt bis zu 180 Tage. Geschützte Admin-, Kundenportal- und Angebotsseiten werden von der eigenen Seitenaufrufmessung ausgeschlossen; URL-Abfrageparameter und Portal-Tokens werden nicht als Seitenadresse an Analytics übergeben.',
      'Eine Verarbeitung in den USA ist möglich. Informationen zur Verarbeitung, internationalen Übermittlung und zu Google: policies.google.com/privacy und support.google.com/analytics/answer/6004245. Du kannst deine Einwilligung jederzeit über die Cookie-Einstellungen widerrufen.'],
    en: ['I use Google Analytics 4 for optional audience analysis. Google Ireland Limited is the provider for EEA users. It activates only when you expressly consent to analytics. Until then, even the Google script is blocked. Google Signals and advertising personalization are disabled in this website’s configuration.',
      'After consent, data may include public pages viewed, device and browser information, events and pseudonymous identifiers. Google also processes connection data, including IP addresses. Analytics cookies configured by this website last up to 180 days. Admin, portal and offer pages are excluded from our page-view tracking; URL query parameters and portal tokens are not passed as page addresses.',
      'Processing in the USA is possible. See policies.google.com/privacy and support.google.com/analytics/answer/6004245 for Google’s processing and transfer information. You can withdraw your consent in Cookie settings.'],
  },
  {
    title: ['Externe Videos, Links und Kontakt über WhatsApp', 'External videos, links and WhatsApp'],
    de: ['YouTube-Videos werden erst nach Einwilligung in externe Videos eingebettet. Verwendet wird die Domain youtube-nocookie.com. Auch dabei werden beim Laden Daten an Google übermittelt; der erweiterte Datenschutzmodus ersetzt keine Einwilligung. Anbieter ist Google Ireland Limited; eine Verarbeitung in den USA ist möglich. Informationen: policies.google.com/privacy.',
      'WhatsApp, Instagram, Google Maps und Google-Bewertungen sind als Links eingebunden. Durch das bloße Anzeigen dieser Links wird keine Verbindung zu diesen Anbietern aufgebaut. Wenn du einen Link öffnest, gelten die Datenschutzbedingungen des jeweiligen Anbieters. Für Kontakt über WhatsApp verarbeitet WhatsApp Ireland Limited beziehungsweise Meta die dabei anfallenden Daten. Du kannst mich alternativ per E-Mail oder Telefon erreichen.'],
    en: ['YouTube videos are embedded only after consent to external videos, using youtube-nocookie.com. Loading still transfers data to Google; privacy-enhanced mode does not replace consent. The provider is Google Ireland Limited and processing in the USA is possible. See policies.google.com/privacy.',
      'WhatsApp, Instagram, Google Maps and Google reviews are provided as links. Merely displaying them does not connect to these providers. Opening a link is subject to that provider’s privacy terms. WhatsApp contact involves processing by WhatsApp Ireland Limited and Meta. You can also contact me by email or phone.'],
  },
  {
    title: ['Angebote, Kundenportal, Dokumente und E-Mail', 'Offers, customer portal, documents and email'],
    de: ['Anfragen werden in meiner Kundenverwaltung gespeichert und über den eingerichteten E-Mail-Dienst bearbeitet. Persönliche Angebote können über einen individuellen Link angesehen, heruntergeladen und beantwortet werden. Kundenportale verwenden einen individuellen Link und ein Passwort. Bitte behandle diese Zugangsdaten vertraulich.',
      'Hochgeladene Verträge und von mir bereitgestellte Dokumente können in Google Drive gespeichert werden. Anbieter ist Google Ireland Limited. Je nach Freigabe ist ein Dokument über seinen individuellen Dokumentlink erreichbar; bitte gib diesen nur berechtigt weiter. Der Zugriff der Website auf mein Drive erfolgt serverseitig. Kunden werden nicht aufgefordert, ihr eigenes Google-Konto mit der Website zu verbinden. Grundlage ist Art. 6 Abs. 1 lit. b DSGVO. Informationen: policies.google.com/privacy.',
      'Zahlungsinformationen im Portal dienen der Übersicht über vereinbarte und gebuchte Beträge. Diese Website speichert dabei keine Kreditkarten- oder Onlinebanking-Zugangsdaten.'],
    en: ['Enquiries are stored in my customer management system and handled through the configured email service. Personal offers use individual links for viewing, downloading and responding. Customer portals use an individual link and password. Please keep these credentials confidential.',
      'Uploaded contracts and documents I provide may be stored in Google Drive, provided by Google Ireland Limited. Depending on sharing settings, a document can be accessed through its individual document link; only share it with authorised people. Drive access by the website is server-side. Customers do not need to connect their own Google account. The basis is Article 6(1)(b) GDPR. See policies.google.com/privacy.',
      'Payment information in the portal provides an overview of agreed and recorded amounts. This website does not store credit-card or online-banking credentials.'],
  },
  {
    title: ['Empfänger, Drittlandtransfers und Speicherdauer', 'Recipients, international transfers and retention'],
    de: ['Daten erhalten nur Personen und Dienstleister, die sie für die beschriebenen Zwecke benötigen, oder Stellen, gegenüber denen eine gesetzliche Offenlegungspflicht besteht. Bei internationalen Anbietern ist eine Verarbeitung außerhalb des EWR möglich. Dafür sind geeignete Übermittlungsgrundlagen nach Art. 44 ff. DSGVO erforderlich, etwa ein anwendbarer Angemessenheitsbeschluss oder Standardvertragsklauseln mit ergänzenden Maßnahmen. Auskünfte zu den für deinen Vorgang eingesetzten Dienstleistern und Schutzmaßnahmen erhältst du auf Anfrage.',
      'Ich speichere Daten so lange, wie sie für den jeweiligen Zweck, gesetzliche Aufbewahrungspflichten oder die Geltendmachung beziehungsweise Abwehr von Rechtsansprüchen benötigt werden. Danach werden sie gelöscht oder anonymisiert. Die Laufzeit der Cookie-Auswahl und Analytics-Cookies ist oben gesondert beschrieben.'],
    en: ['Data is disclosed only to people and service providers who need it for the stated purposes or where disclosure is legally required. International providers may process data outside the EEA. Transfers require an appropriate basis under Articles 44 et seq. GDPR, such as an applicable adequacy decision or standard contractual clauses with supplementary measures. Contact me for information about the providers and safeguards relevant to your case.',
      'Data is retained for as long as necessary for its purpose, legal retention requirements or legal claims. It is then deleted or anonymised. Retention of consent choices and Analytics cookies is described separately above.'],
  },
  {
    title: ['Deine Rechte und Beschwerden', 'Your rights and complaints'],
    de: ['Du hast nach Maßgabe der DSGVO Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Soweit die Verarbeitung auf Einwilligung beruht, kannst du diese jederzeit mit Wirkung für die Zukunft widerrufen. Es findet keine automatisierte Entscheidung mit rechtlicher oder ähnlich erheblicher Wirkung einschließlich Profiling statt.',
      'Du kannst dich bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere der österreichischen Datenschutzbehörde: dsb.gv.at. Bei Fragen oder zur Ausübung deiner Rechte schreibe bitte an servus@marioschub.com.'],
    en: ['Subject to the GDPR, you have rights of access, rectification, erasure, restriction, portability and objection. You may withdraw consent at any time for the future. No automated decision-making, including profiling, with legal or similarly significant effects takes place.',
      'You can complain to a data protection authority, in particular the Austrian Data Protection Authority at dsb.gv.at. For questions or rights requests, contact servus@marioschub.com.'],
  },
];
export function DatenschutzPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  return <>
    <SEO title={de ? 'Datenschutzerklärung | Mario Schubert Photography' : 'Privacy Policy | Mario Schubert Photography'} description={de ? 'Informationen zu Datenschutz, Cookies, Kundenportal und freiwilliger Webanalyse.' : 'Information about privacy, cookies, the customer portal and optional analytics.'} canonical="/datenschutz" lang={lang} />
    <section className="bg-[#f8f7f5] px-5 pb-14 pt-28"><div className="mx-auto max-w-3xl"><h1 className="break-words text-3xl font-medium">{de ? 'Datenschutzerklärung' : 'Privacy policy'}</h1><p className="mt-4 text-sm text-black/55">{de ? 'Stand: 20. Oktober 2026' : 'Updated: 20 October 2026'}</p><button onClick={openConsentSettings} className="mt-5 rounded-md border border-black/20 bg-white px-4 py-3 text-sm">{de ? 'Cookie-Einstellungen ändern' : 'Change cookie settings'}</button></div></section>
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-14">{sections.map(section => <section key={section.title[0]}><h2 className="mb-4 text-xl font-medium">{section.title[de ? 0 : 1]}</h2><div className="space-y-3 text-sm leading-relaxed text-black/65">{section[de ? 'de' : 'en'].map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></section>)}</div>
  </>;
}
