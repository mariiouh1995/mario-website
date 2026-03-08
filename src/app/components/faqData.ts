// Central FAQ data with DE/EN translations, organized by category
// Source: Mario Schubert FAQ spreadsheet

export interface FAQItem {
  q: { de: string; en: string };
  a: { de: string; en: string };
}

export interface FAQCategory {
  key: string;
  label: { de: string; en: string };
  items: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    key: "allgemein",
    label: { de: "Allgemein", en: "General" },
    items: [
      {
        q: { de: "Wie würdest du deinen Stil beschreiben?", en: "How would you describe your style?" },
        a: {
          de: "Mein Stil ist dokumentarisch, natürlich und unauffällig. Ich fange echte Momente ein, statt steife Posen zu inszenieren. In der Bearbeitung bekommen die Bilder einen zeitlosen, cineastischen Look mit einem Hauch Editorial.",
          en: "My style is documentary, natural and unobtrusive. I capture real moments instead of staging stiff poses. In post-processing, the images get a timeless, cinematic look with a touch of editorial.",
        },
      },
      {
        q: { de: "Bietest du sowohl Fotografie als auch Video an?", en: "Do you offer both photography and video?" },
        a: {
          de: "Ja, du kannst mich für reine Fotografie, reine Videografie oder eine Kombination aus beidem buchen. Der Vorteil: ein Ansprechpartner, ein einheitlicher Stil und perfekt aufeinander abgestimmte Aufnahmen.",
          en: "Yes, you can book me for photography only, videography only, or a combination of both. The advantage: one point of contact, a consistent style and perfectly coordinated shots.",
        },
      },
      {
        q: { de: "In welchen Regionen bist du tätig?", en: "What regions do you cover?" },
        a: {
          de: "Mein Schwerpunkt liegt in Tirol, Südtirol und Bayern, also rund um Innsbruck, Achensee, Zillertal, Dolomiten, Chiemsee, Tegernsee und München. Für besondere Anlässe reise ich aber auch gerne europaweit und weltweit an.",
          en: "My focus is on Tyrol, South Tyrol and Bavaria, around Innsbruck, Lake Achensee, Zillertal, Dolomites, Lake Chiemsee, Tegernsee and Munich. For special occasions, I'm happy to travel across Europe and worldwide.",
        },
      },
      {
        q: { de: "Welche Art von Shootings bietest du an?", en: "What types of shoots do you offer?" },
        a: {
          de: "Neben Hochzeiten fotografiere und filme ich auch Paarshootings, After-Wedding-Shootings, Elopements, Business-Reportagen, Imagefilme und persönliche Projekte. Sprich mich einfach mit deiner Idee an.",
          en: "Besides weddings, I also photograph and film couple shoots, after-wedding shoots, elopements, business reportages, image films and personal projects. Just reach out with your idea.",
        },
      },
      {
        q: { de: "Was macht deine Arbeit besonders?", en: "What makes your work special?" },
        a: {
          de: "Ich mische mich unter die Leute und bleibe unauffällig, sodass natürliche Emotionen entstehen können. Deine Bilder und Filme werden authentisch, zeitlos und mit viel Liebe zum Detail bearbeitet.",
          en: "I blend in with the crowd and stay unobtrusive, allowing natural emotions to unfold. Your photos and films are edited authentically, timelessly and with great attention to detail.",
        },
      },
      {
        q: { de: "Arbeitest du alleine oder im Team?", en: "Do you work alone or with a team?" },
        a: {
          de: "In der Regel arbeite ich alleine, was den Tag sehr persönlich und entspannt macht. Für größere Events oder mehrtägige Projekte kann ich auf Wunsch auch eine zweite Person oder spezialisierte Kolleginnen und Kollegen hinzuziehen.",
          en: "Usually I work alone, which makes the day very personal and relaxed. For larger events or multi-day projects, I can bring in a second person or specialized colleagues upon request.",
        },
      },
    ],
  },
  {
    key: "buchung",
    label: { de: "Buchung & Kennenlernen", en: "Booking & Getting to Know" },
    items: [
      {
        q: { de: "Wie läuft die Buchung bei dir ab?", en: "How does the booking process work?" },
        a: {
          de: "Du schickst mir eine Anfrage mit Datum, Location und grober Vorstellung. Danach telefonieren oder zoomen wir unverbindlich. Wenn die Chemie passt, erhältst du ein Angebot und einen Vertrag. Mit Unterschrift und Anzahlung ist der Termin verbindlich reserviert.",
          en: "You send me an inquiry with your date, location and rough idea. Then we have a no-obligation call or video chat. If the chemistry is right, you'll receive a quote and contract. With your signature and deposit, the date is firmly reserved.",
        },
      },
      {
        q: { de: "Gibt es ein Kennenlerngespräch?", en: "Is there a get-to-know meeting?" },
        a: {
          de: "Ja, unbedingt. Wir treffen uns per Video-Call oder bei einem Kaffee in der Nähe von Innsbruck. Dort lernst du mich kennen, kannst alle Fragen stellen und wir schauen, ob wir menschlich zusammenpassen.",
          en: "Yes, absolutely. We meet via video call or over coffee near Innsbruck. There you get to know me, can ask all your questions and we see if we're a good personal fit.",
        },
      },
      {
        q: { de: "Wie früh sollte ich dich anfragen?", en: "How far in advance should I inquire?" },
        a: {
          de: "Je früher, desto besser. Vor allem für beliebte Sommer- und Herbst-Termine buchen viele Paare 9 bis 18 Monate im Voraus. Aber auch kurzfristige Anfragen lohnen sich immer, wenn dein Datum noch frei ist.",
          en: "The earlier, the better. Especially for popular summer and autumn dates, many couples book 9 to 18 months in advance. But last-minute inquiries are always worthwhile if your date is still available.",
        },
      },
      {
        q: { de: "Reservierst du mein Datum, während ich noch überlege?", en: "Do you hold my date while I'm still deciding?" },
        a: {
          de: "Nach unserem Erstgespräch kann ich dein Datum für ein paar Tage unverbindlich vormerken. Erst mit Vertrag und Anzahlung ist der Termin fix gebucht. Bei Parallelanfragen informiere ich dich transparent.",
          en: "After our initial conversation, I can tentatively hold your date for a few days. Only with a contract and deposit is the date firmly booked. If there are parallel inquiries, I'll let you know transparently.",
        },
      },
      {
        q: { de: "Was passiert, wenn du an meinem Termin krank wirst?", en: "What happens if you get sick on my date?" },
        a: {
          de: "Ich habe ein Netzwerk an professionellen Kolleginnen und Kollegen in Tirol, Bayern und darüber hinaus. Sollte ich wider Erwarten ernsthaft ausfallen, organisiere ich gleichwertigen Ersatz. Die bereits vereinbarten Konditionen bleiben für dich dabei bestehen.",
          en: "I have a network of professional colleagues in Tyrol, Bavaria and beyond. Should I unexpectedly be unable to attend, I'll organize an equivalent replacement. The agreed-upon conditions remain the same for you.",
        },
      },
      {
        q: { de: "Machst du mehrere Termine an einem Tag?", en: "Do you do multiple bookings in one day?" },
        a: {
          de: "Nein. Pro Tag begleite ich nur ein Event oder Shooting. So kannst du sicher sein, dass meine komplette Aufmerksamkeit dir und deinem Projekt gehört.",
          en: "No. I only cover one event or shoot per day. This way you can be sure that my complete attention belongs to you and your project.",
        },
      },
    ],
  },
  {
    key: "pakete",
    label: { de: "Pakete & Preise", en: "Packages & Pricing" },
    items: [
      {
        q: { de: "Welche Pakete bietest du an?", en: "What packages do you offer?" },
        a: {
          de: "Ich biete verschiedene Pakete je nach Dauer, Umfang und Kombination aus Foto und Video an. Von kurzen Standesamts-Begleitungen über ganztägige Reportagen bis hin zu individuellen Projekten. Eine Übersicht findest du auf der Website oder im persönlichen Angebot.",
          en: "I offer various packages depending on duration, scope and combination of photo and video. From short civil ceremony coverage to full-day reportages to individual projects. You'll find an overview on the website or in a personal quote.",
        },
      },
      {
        q: { de: "Kann man deine Pakete individuell anpassen?", en: "Can your packages be customized?" },
        a: {
          de: "Ja. Die Pakete sind eine gute Orientierung, können aber flexibel an deine Pläne angepasst werden. Zum Beispiel längere Begleitung, zusätzliche Locations oder spezielle Extras.",
          en: "Yes. The packages are a good starting point but can be flexibly adapted to your plans. For example, longer coverage, additional locations or special extras.",
        },
      },
      {
        q: { de: "In welcher Preisspanne liegen deine Leistungen?", en: "What is your price range?" },
        a: {
          de: "Meine Reportagen und Shootings liegen je nach Dauer, Umfang und ob Foto, Video oder beides im Bereich von etwa 2.500 bis 3.500 Euro und darüber. Eine detaillierte Übersicht der Pakete bekommst du im persönlichen Angebot.",
          en: "My reportages and shoots range from about 2,500 to 3,500 euros and above, depending on duration, scope and whether it's photo, video or both. You'll get a detailed package overview in a personal quote.",
        },
      },
      {
        q: { de: "Wie funktioniert die Bezahlung?", en: "How does payment work?" },
        a: {
          de: "Mit Vertragsabschluss wird eine Anzahlung fällig, um deinen Termin verbindlich zu reservieren. Der Restbetrag wird in der Regel nach dem Shooting oder Event per Rechnung fällig und kann per Überweisung bezahlt werden.",
          en: "A deposit is due upon signing the contract to firmly reserve your date. The remaining balance is usually due after the shoot or event via invoice and can be paid by bank transfer.",
        },
      },
      {
        q: { de: "Gibt es eine Anzahlung und wie hoch ist sie?", en: "Is there a deposit and how much is it?" },
        a: {
          de: "Ja, zur Fixierung deines Datums berechne ich eine Anzahlung, die üblicherweise zwischen 30 und 40 Prozent des Gesamtbetrags liegt. Die genaue Höhe steht transparent im Angebot und im Vertrag.",
          en: "Yes, to secure your date I charge a deposit that is usually between 30 and 40 percent of the total amount. The exact amount is transparently stated in the quote and contract.",
        },
      },
      {
        q: { de: "Sind im Preis alle Bilder und die Bearbeitung enthalten?", en: "Are all photos and editing included in the price?" },
        a: {
          de: "In meinen Paketen sind die fotografische oder filmische Begleitung, die sorgfältige Auswahl, professionelle Bearbeitung und die Bereitstellung der finalen Dateien in einer Onlinegalerie enthalten. Eventuelle Zusatzprodukte wie Alben, Prints oder zusätzliche Leistungen buchst du bei Bedarf separat.",
          en: "My packages include the photographic or film coverage, careful selection, professional editing and delivery of final files in an online gallery. Optional extras like albums, prints or additional services can be booked separately.",
        },
      },
      {
        q: { de: "Fallen zusätzliche Kosten für Anfahrt oder Übernachtung an?", en: "Are there additional costs for travel or accommodation?" },
        a: {
          de: "Im Umkreis von etwa 100 Kilometern um Innsbruck ist die Anfahrt meist inklusive. Darüber hinaus berechne ich transparente Kilometersätze oder Reise- und Übernachtungskosten. Diese werden vor der Buchung klar mit dir abgestimmt.",
          en: "Within about 100 kilometers of Innsbruck, travel is usually included. Beyond that, I charge transparent mileage rates or travel and accommodation costs. These are clearly agreed with you before booking.",
        },
      },
      {
        q: { de: "Bietest du Ratenzahlung an?", en: "Do you offer installment payments?" },
        a: {
          de: "In Absprache sind auch Teilzahlungen möglich, zum Beispiel in zwei bis drei Raten bis zur finalen Lieferung. Sprich mich einfach darauf an, dann finden wir eine faire Lösung.",
          en: "Installment payments are possible by arrangement, for example in two to three installments until final delivery. Just ask me about it and we'll find a fair solution.",
        },
      },
    ],
  },
  {
    key: "vorbereitung",
    label: { de: "Vorbereitung & Ablauf", en: "Preparation & Process" },
    items: [
      {
        q: { de: "Wie läuft ein Shooting mit dir konkret ab?", en: "How does a shoot with you actually work?" },
        a: {
          de: "Wir besprechen vorab den Ablauf, die Location und deine Wünsche. Am Tag selbst halte ich mich im Hintergrund und fange die wichtigsten Momente und viele kleine Details ein. Du bekommst einfache, natürliche Anweisungen, damit du dich nie steif oder unsicher fühlst.",
          en: "We discuss the schedule, location and your wishes in advance. On the day itself, I stay in the background and capture the most important moments and many small details. You get simple, natural directions so you never feel stiff or unsure.",
        },
      },
      {
        q: { de: "Hilfst du bei der Auswahl der Location?", en: "Do you help with choosing the location?" },
        a: {
          de: "Ja, gerne. Ich kenne viele Spots in Tirol, Bayern und den Bergen und kann dir je nach Licht, Jahreszeit und Zeitplan passende Orte vorschlagen. Wichtig ist mir, dass du dich dort wohlfühlst und wir genug Ruhe haben.",
          en: "Yes, gladly. I know many spots in Tyrol, Bavaria and the mountains and can suggest suitable locations depending on light, season and schedule. What's important to me is that you feel comfortable there and we have enough peace.",
        },
      },
      {
        q: { de: "Wie lange sollte ich für ein Shooting einplanen?", en: "How much time should I plan for a shoot?" },
        a: {
          de: "Für ein entspanntes Paarshooting oder Portraitshooting plane ich in der Regel 30 bis 45 Minuten ein. Wenn du mehrere Locations möchtest oder wir in die Berge fahren, kann etwas mehr Zeit sinnvoll sein.",
          en: "For a relaxed couple or portrait shoot, I usually plan 30 to 45 minutes. If you want multiple locations or we're heading to the mountains, a bit more time may be useful.",
        },
      },
      {
        q: { de: "Was soll ich zum Shooting mitbringen?", en: "What should I bring to the shoot?" },
        a: {
          de: "Eigentlich nur dich selbst und gute Laune. Wenn du möchtest, kannst du kleine persönliche Dinge einbauen wie Briefe, Erinnerungsstücke oder besondere Accessoires. Wichtiger sind bequeme Schuhe für Wege zwischen Locations.",
          en: "Really just yourself and a good mood. If you want, you can incorporate small personal items like letters, memorabilia or special accessories. More important are comfortable shoes for walks between locations.",
        },
      },
      {
        q: { de: "Gibst du Anweisungen beim Fotografieren?", en: "Do you give directions during the shoot?" },
        a: {
          de: "Ich lasse dir viel Raum, so zu sein, wie du bist, und gebe nur leichte Hilfestellungen für Licht, Haltung oder Bewegung. Du bekommst einfache, natürliche Anweisungen, damit du dich nie steif oder unsicher fühlst.",
          en: "I give you plenty of space to be yourself and only provide light guidance for lighting, posture or movement. You get simple, natural directions so you never feel stiff or unsure.",
        },
      },
      {
        q: { de: "Was ist, wenn ich vor der Kamera unsicher bin?", en: "What if I'm nervous in front of the camera?" },
        a: {
          de: "Das geht fast allen so. Nach wenigen Minuten vergisst du die Kamera meistens. Durch meine ruhige Art, kleine Aufgaben und Bewegung wird das Shooting eher wie ein Spaziergang als eine steife Fotosession.",
          en: "Almost everyone feels that way. After a few minutes, you usually forget about the camera. Through my calm nature, small tasks and movement, the shoot feels more like a walk than a stiff photo session.",
        },
      },
      {
        q: { de: "Was passiert bei schlechtem Wetter?", en: "What happens in bad weather?" },
        a: {
          de: "Regen ist kein Problem, gute Bilder entstehen bei jedem Wetter. Wir suchen überdachte Orte, nutzen vorhandenes Licht oder ziehen das Shooting flexibel etwas vor oder nach. Ich habe immer Ideen für Plan B und C im Kopf.",
          en: "Rain is no problem, great photos can be taken in any weather. We look for sheltered spots, use available light or flexibly reschedule the shoot slightly. I always have ideas for Plan B and C in mind.",
        },
      },
    ],
  },
  {
    key: "bearbeitung",
    label: { de: "Bildbearbeitung & Stil", en: "Editing & Style" },
    items: [
      {
        q: { de: "Wie bearbeitest du die Fotos?", en: "How do you edit the photos?" },
        a: {
          de: "Alle ausgewählten Bilder werden von mir sorgfältig farb- und lichtoptimiert und in meinem charakteristischen Look bearbeitet. Hauttöne bleiben natürlich, Kontraste und Farben sind zeitlos und nicht zu extrem.",
          en: "All selected images are carefully color and light optimized by me and edited in my characteristic look. Skin tones remain natural, contrasts and colors are timeless and not too extreme.",
        },
      },
      {
        q: { de: "Retuschierst du auch Haut oder Details?", en: "Do you also retouch skin or details?" },
        a: {
          de: "Störende Kleinigkeiten wie kleine Hautunreinheiten, Pickel oder Ablenkungen im Hintergrund retuschiere ich dezent. Größere Beauty-Retuschen übernehme ich auf Wunsch und nach Absprache.",
          en: "Minor distractions like small blemishes, pimples or background distractions are subtly retouched. Larger beauty retouching is done upon request and by arrangement.",
        },
      },
      {
        q: { de: "Bekomme ich auch unbearbeitete RAW-Dateien?", en: "Can I also get unedited RAW files?" },
        a: {
          de: "Nein. Die Auswahl und Bearbeitung gehören zu meinem kreativen Prozess und sind ein wichtiger Teil meines Stils. Du erhältst hochauflösende, fertig bearbeitete Dateien, die du privat frei nutzen kannst.",
          en: "No. The selection and editing are part of my creative process and an important part of my style. You receive high-resolution, fully edited files that you can use freely for personal purposes.",
        },
      },
      {
        q: { de: "Kann ich den Bearbeitungsstil mitbestimmen?", en: "Can I influence the editing style?" },
        a: {
          de: "Du buchst mich wegen meines Stils, den du in meinen Portfolios siehst. Kleinere Wünsche wie etwas hellere oder etwas kontrastreichere Bearbeitung können wir im Rahmen meines Looks gerne berücksichtigen.",
          en: "You book me because of my style that you see in my portfolios. Minor preferences like slightly brighter or more contrasty editing can be accommodated within my look.",
        },
      },
      {
        q: { de: "Wie viele Bilder bekomme ich ungefähr?", en: "Approximately how many photos will I receive?" },
        a: {
          de: "Die Anzahl hängt von Dauer und Ablauf ab. Rechne grob mit 50 bis 80 fertigen Bildern pro gebuchter Stunde. Wichtiger als die reine Zahl ist mir eine runde Story ohne Wiederholungen.",
          en: "The number depends on duration and schedule. Roughly expect 50 to 80 finished images per booked hour. More important to me than the sheer number is a complete story without repetitions.",
        },
      },
    ],
  },
  {
    key: "lieferung",
    label: { de: "Lieferung & Dateien", en: "Delivery & Files" },
    items: [
      {
        q: { de: "Wie lange dauert es, bis ich die Fotos bekomme?", en: "How long until I receive the photos?" },
        a: {
          de: "Je nach Saison beträgt die Bearbeitungszeit in der Regel 4 bis 8 Wochen. Eine kleine Preview mit ausgewählten Highlight-Bildern bekommst du oft schon innerhalb weniger Tage nach dem Shooting.",
          en: "Depending on the season, editing time is usually 4 to 8 weeks. A small preview with selected highlight images is often available within a few days after the shoot.",
        },
      },
      {
        q: { de: "Wie erhalte ich die Bilder und Videos?", en: "How do I receive the photos and videos?" },
        a: {
          de: "Du bekommst eine passwortgeschützte Onlinegalerie, in der du deine Bilder in voller Auflösung herunterladen und mit Familie und Freunden teilen kannst. Videos erhältst du als Download-Link in hoher Qualität und auf Wunsch zusätzlich auf USB-Stick.",
          en: "You receive a password-protected online gallery where you can download your images in full resolution and share them with family and friends. Videos are delivered as a high-quality download link and optionally on a USB stick.",
        },
      },
      {
        q: { de: "Darf ich die Fotos frei privat nutzen und teilen?", en: "Can I freely use and share the photos privately?" },
        a: {
          de: "Ja, für private Zwecke darfst du deine Bilder frei nutzen: ausdrucken, Fotobücher erstellen und auf Social Media teilen. Bei Veröffentlichungen mit Dienstleister-Tags freue ich mich über eine Nennung meines Namens oder einen Link.",
          en: "Yes, for private purposes you can freely use your images: print them, create photo books and share on social media. For publications with vendor tags, I appreciate a mention of my name or a link.",
        },
      },
      {
        q: { de: "Verwendest du meine Bilder für deine Website oder Social Media?", en: "Do you use my photos for your website or social media?" },
        a: {
          de: "Ich zeige ausgewählte Projekte gerne auf meiner Website, in Portfolios und auf Social Media. Wenn du das nicht möchtest, sprechen wir das vorab ab und halten es im Vertrag fest.",
          en: "I like to showcase selected projects on my website, in portfolios and on social media. If you prefer otherwise, we discuss it in advance and note it in the contract.",
        },
      },
      {
        q: { de: "Gibt es auch Alben oder Prints bei dir?", en: "Do you also offer albums or prints?" },
        a: {
          de: "Ja, auf Wunsch gestalte ich hochwertige Fine-Art-Alben und Prints, die perfekt zu deinem Stil passen. Du kannst diese direkt bei der Buchung oder auch nach dem Shooting noch bestellen.",
          en: "Yes, upon request I design high-quality fine art albums and prints that perfectly match your style. You can order these when booking or even after the shoot.",
        },
      },
    ],
  },
  {
    key: "video",
    label: { de: "Video & Film", en: "Video & Film" },
    items: [
      {
        q: { de: "Welche Arten von Videos bietest du an?", en: "What types of videos do you offer?" },
        a: {
          de: "Ich produziere emotionale Highlight-Filme, die deine Geschichte in wenigen Minuten erzählen, sowie auf Wunsch längere, dokumentarischere Filme mit Reden und Originalton. Im Gespräch klären wir, welche Variante besser zu dir passt.",
          en: "I produce emotional highlight films that tell your story in just a few minutes, as well as longer, more documentary-style films with speeches and original audio upon request. We'll discuss which option suits you best.",
        },
      },
      {
        q: { de: "Wie lang ist ein typischer Film?", en: "How long is a typical film?" },
        a: {
          de: "Ein Highlight-Film ist meist 5 bis 8 Minuten lang und fasst deinen Tag emotional zusammen. Längere Filme mit mehr Originalton, Reden und Zeremonie können 15 bis 30 Minuten oder mehr dauern, je nach gebuchtem Umfang.",
          en: "A highlight film is usually 5 to 8 minutes long and emotionally summarizes your day. Longer films with more original audio, speeches and ceremony can be 15 to 30 minutes or more, depending on the booked scope.",
        },
      },
      {
        q: { de: "Nimmst du auch Originalton wie Gelübde und Reden auf?", en: "Do you also record original audio like vows and speeches?" },
        a: {
          de: "Ja, wichtiger Originalton wie Gelübde, Ansprachen oder Musik wird mit externen Mikrofonen aufgenommen und in den Film integriert. So hörst du später nicht nur die Bilder, sondern auch die Stimmen und Emotionen.",
          en: "Yes, important original audio like vows, speeches or music is recorded with external microphones and integrated into the film. This way you'll later not only see the images but also hear the voices and emotions.",
        },
      },
      {
        q: { de: "Sind Drohnenaufnahmen möglich?", en: "Are drone shots possible?" },
        a: {
          de: "Wenn Location, Wetter und rechtliche Rahmenbedingungen es zulassen, setze ich gerne Drohnenaufnahmen ein. Vor Ort prüfe ich, ob Flüge erlaubt und sicher sind und halte mich strikt an die gesetzlichen Vorgaben.",
          en: "When location, weather and legal conditions allow, I'm happy to use drone footage. On site, I check whether flights are permitted and safe, and strictly adhere to legal regulations.",
        },
      },
      {
        q: { de: "Kann ich Musikwünsche für den Film äußern?", en: "Can I suggest music for the film?" },
        a: {
          de: "Ja, du kannst mir gerne deinen Musikgeschmack und Lieblingssongs nennen. Aus lizenzrechtlichen Gründen verwende ich jedoch in der Regel lizensierte Musik, die zum Stil deines Films passt.",
          en: "Yes, feel free to share your music taste and favorite songs. For licensing reasons, I typically use licensed music that matches the style of your film.",
        },
      },
    ],
  },
  {
    key: "storno",
    label: { de: "Storno & Vertrag", en: "Cancellation & Contract" },
    items: [
      {
        q: { de: "Gibt es einen Vertrag?", en: "Is there a contract?" },
        a: {
          de: "Ja, wir schließen immer einen schriftlichen Vertrag ab. Darin sind Leistungen, Zeiten, Preise, Zahlungsplan, Nutzungsrechte und Stornobedingungen klar geregelt, damit beide Seiten Planungssicherheit haben.",
          en: "Yes, we always sign a written contract. It clearly outlines services, times, prices, payment plan, usage rights and cancellation terms, giving both sides planning security.",
        },
      },
      {
        q: { de: "Was passiert, wenn ich meinen Termin verschieben muss?", en: "What happens if I need to reschedule?" },
        a: {
          de: "Wenn dein neuer Termin noch frei ist, verschieben wir deine Buchung unkompliziert. Bereits geleistete Anzahlungen werden in der Regel auf den neuen Termin übertragen. Details dazu stehen in den Verschiebungsbedingungen im Vertrag.",
          en: "If your new date is still available, we'll reschedule your booking without hassle. Deposits already paid are typically transferred to the new date. Details are in the rescheduling terms in the contract.",
        },
      },
      {
        q: { de: "Wie sind deine Stornobedingungen?", en: "What are your cancellation terms?" },
        a: {
          de: "Die genauen Stornobedingungen hängen vom Zeitpunkt der Absage ab und sind im Vertrag transparent festgehalten. Grundsätzlich gilt: Je kurzfristiger eine Stornierung, desto höher ist der Anteil der vereinbarten Gage, der fällig wird.",
          en: "The exact cancellation terms depend on the timing of the cancellation and are transparently documented in the contract. Generally: the shorter notice given, the higher the portion of the agreed fee that is due.",
        },
      },
      {
        q: { de: "Was ist, wenn sich mein Ablauf stark ändert?", en: "What if my schedule changes significantly?" },
        a: {
          de: "Kleinere Änderungen sind kein Problem. Wenn sich Dauer oder Umfang deutlich verändern, passen wir das Paket und das Honorar fair an. Wichtig ist, dass du mich rechtzeitig informierst, damit ich mich organisatorisch darauf einstellen kann.",
          en: "Minor changes are no problem. If the duration or scope changes significantly, we'll fairly adjust the package and fee. What matters is that you inform me in time so I can organize accordingly.",
        },
      },
      {
        q: { de: "Bist du versichert?", en: "Are you insured?" },
        a: {
          de: "Ich arbeite mit einer Berufshaftpflichtversicherung. Für Schäden an deiner Location oder an Gästen ist in der Regel die Veranstalter- oder Haftpflichtversicherung zuständig. Bei Fragen dazu helfe ich dir gerne weiter.",
          en: "I carry professional liability insurance. For damage to your venue or guests, the event organizer's or liability insurance is typically responsible. I'm happy to help with any questions about this.",
        },
      },
    ],
  },
  {
    key: "hochzeit",
    label: { de: "Hochzeit", en: "Wedding" },
    items: [
      {
        q: { de: "Wie lange bist du am Hochzeitstag vor Ort?", en: "How long are you on site on the wedding day?" },
        a: {
          de: "Das hängt von deinem gebuchten Paket ab. In der Regel begleite ich Hochzeiten zwischen 6 und 10 Stunden. Für mehrtägige Feiern oder Destination Weddings sind auch längere Begleitungen möglich.",
          en: "That depends on your booked package. I typically cover weddings for 6 to 10 hours. For multi-day celebrations or destination weddings, longer coverage is also possible.",
        },
      },
      {
        q: { de: "Kannst du uns bei der Planung des Zeitplans helfen?", en: "Can you help us plan the timeline?" },
        a: {
          de: "Ja, sehr gerne. Ich habe viele Hochzeiten begleitet und weiß, wie viel Zeit realistisch für Trauung, Gratulation, Gruppenfotos und Paarshooting einzuplanen ist. Wir gehen deinen Ablauf im Vorgespräch gemeinsam durch.",
          en: "Yes, very gladly. I've covered many weddings and know how much time to realistically plan for the ceremony, congratulations, group photos and couple shoot. We'll go through your schedule together in advance.",
        },
      },
      {
        q: { de: "Begleitest du auch sehr kleine Hochzeiten oder Elopements?", en: "Do you also cover small weddings or elopements?" },
        a: {
          de: "Ja, ich liebe intime Trauungen genauso wie große Feiern. Für Elopements in den Bergen oder standesamtliche Trauungen im kleinen Kreis habe ich eigene, kompaktere Pakete.",
          en: "Yes, I love intimate ceremonies just as much as large celebrations. For mountain elopements or small civil ceremonies, I have dedicated, more compact packages.",
        },
      },
      {
        q: { de: "Reist du auch für Destination Weddings an?", en: "Do you also travel for destination weddings?" },
        a: {
          de: "Ja, ich begleite euch nicht nur in Tirol und Bayern, sondern auch europaweit und weltweit. Ob Berge, See, Stadt oder Ausland, wir klären Anreise, Übernachtung und eventuelle Reisetage einfach im Vorfeld.",
          en: "Yes, I'll accompany you not only in Tyrol and Bavaria, but also across Europe and worldwide. Whether mountains, lake, city or abroad, we simply clarify travel, accommodation and any travel days in advance.",
        },
      },
      {
        q: { de: "Was ist das Spieglein?", en: "What is the Spieglein (photo mirror)?" },
        a: {
          de: "Das Spieglein ist ein moderner Fotospiegel für eure Hochzeit. Stilvoll, interaktiv und ein echtes Highlight für eure Gäste. Kein Plastik-Kasten, sondern ein Spiegel, der aussieht, als gehöre er zur Deko. Wenn du bei mir eine Fotobegleitung buchst, bekommst du das Spieglein zum Vorzugspreis.",
          en: "The Spieglein is a modern photo mirror for your wedding. Stylish, interactive and a real highlight for your guests. Not a plastic box, but a mirror that looks like it belongs to the decor. When you book photo coverage with me, you get the Spieglein at a preferential rate.",
        },
      },
    ],
  },
  {
    key: "technik",
    label: { de: "Technik & Ausrüstung", en: "Equipment & Technology" },
    items: [
      {
        q: { de: "Mit welcher Ausrüstung arbeitest du?", en: "What equipment do you use?" },
        a: {
          de: "Ich arbeite mit professioneller Vollformat-Kamera-Ausrüstung, hochwertigen Festbrennweiten und lichtstarken Objektiven. Für Videos nutze ich 4K-Kameras, externe Mikrofone und Stabilisatoren. Backup-Equipment ist immer dabei.",
          en: "I work with professional full-frame camera equipment, high-quality prime lenses and fast aperture lenses. For videos, I use 4K cameras, external microphones and stabilizers. Backup equipment is always with me.",
        },
      },
      {
        q: { de: "Hast du Backup-Equipment dabei?", en: "Do you bring backup equipment?" },
        a: {
          de: "Ja, immer. Ich habe eine zweite Kamera, zusätzliche Objektive, Akkus, Speicherkarten und Beleuchtung dabei. So bin ich für jede Situation vorbereitet und du musst dir keine Sorgen machen.",
          en: "Yes, always. I carry a second camera, additional lenses, batteries, memory cards and lighting. This way I'm prepared for any situation and you don't have to worry.",
        },
      },
      {
        q: { de: "Wie sicherst du meine Daten?", en: "How do you back up my data?" },
        a: {
          de: "Alle Aufnahmen werden sofort auf mehreren Speicherkarten gleichzeitig gespeichert. Nach dem Shooting werden sie auf externe Festplatten und in der Cloud gesichert. Deine Daten sind jederzeit geschützt.",
          en: "All recordings are immediately saved on multiple memory cards simultaneously. After the shoot, they are backed up to external hard drives and the cloud. Your data is protected at all times.",
        },
      },
    ],
  },
];

// Helper to get FAQs for specific categories
export function getFAQsByCategories(categoryKeys: string[]): FAQCategory[] {
  return faqCategories.filter((cat) => categoryKeys.includes(cat.key));
}

// Page-specific FAQ mappings
export const PAGE_FAQ_CATEGORIES = {
  weddings: ["hochzeit", "video", "pakete"],
  animals: ["vorbereitung", "bearbeitung", "lieferung"],
  portrait: ["vorbereitung", "bearbeitung", "lieferung"],
  about: ["allgemein", "buchung", "technik", "storno"],
} as const;
