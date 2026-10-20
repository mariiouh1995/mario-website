import type { SiteDocument } from './site-content.js';

type Copy = Record<string, [string, string]>;
const copy: Record<string, Copy> = {
  region: {
    title: ['Zuhause am Wilden Kaiser. Unterwegs in Tirol und Bayern.', 'At home near the Wilder Kaiser. Working across Tyrol and Bavaria.'],
    intro: ['Mein Ausgangspunkt ist Söll. Für Hochzeiten und Shootings könnt ihr mich in Tirol und im bayerischen Alpenraum anfragen. Ob eure Location für mich neu ist, sage ich offen. Licht, Wege und Zeitfenster planen wir gemeinsam.', 'My starting point is Söll. You can enquire about weddings and sessions in Tyrol and the Bavarian Alps. I will tell you openly if your venue is new to me. We plan light, travel times and your schedule together.'],
    area1_title: ['Wilder Kaiser & Kufstein', 'Wilder Kaiser & Kufstein'],
    area1_text: ['Söll, Ellmau, Going, Scheffau und Kufstein liegen in meiner direkten Umgebung. Wir besprechen, welche Orte und Wege zu eurem Tag passen.', 'Söll, Ellmau, Going, Scheffau and Kufstein are close to home. We discuss which places and travel routes suit your day.'],
    area2_title: ['Kitzbühel & Tirol', 'Kitzbühel & Tyrol'],
    area2_text: ['Von Kitzbühel bis Innsbruck: Ich begleite euch in ganz Tirol. Wichtig sind ein realistischer Ablauf und genügend Raum für eure Menschen und Momente.', 'From Kitzbühel to Innsbruck, I work throughout Tyrol. A realistic schedule and room for your people and moments matter most.'],
    area3_title: ['Chiemsee, Tegernsee & Schliersee', 'Chiemsee, Tegernsee & Schliersee'],
    area3_text: ['Auch auf bayerischer Seite könnt ihr mich anfragen. Anreise und möglichen Zusatzaufwand stimmen wir vor der Buchung transparent ab.', 'You can enquire about celebrations in Bavaria too. We discuss travel and any additional costs clearly before booking.'],
    cta: ['Erzählt mir von euren Plänen', 'Tell me about your plans'],
    wedding_link: ['Mehr zur Hochzeitsbegleitung', 'Explore wedding photography'],
    destination_link: ['Ihr heiratet außerhalb der Region?', 'Getting married beyond the region?'],
  },
  home: {
    hero_title: ['Hochzeitsfotograf und Videograf aus Söll am Wilden Kaiser', 'Wedding photographer and filmmaker from Söll, Tyrol'],
    hero_tagline: ['Echte Momente. Mit Charakter.', 'Real moments. With character.'],
    hero_intro: ['Servus, ich bin Mario. Ich begleite Hochzeiten in Tirol und Bayern. Mit einem Blick für die großen Augenblicke, die kleinen Gesten und alles dazwischen. Für Bilder, die nach euch aussehen.', 'Servus, I’m Mario. I photograph weddings in Tyrol and Bavaria, with an eye for the big moments, the small gestures and everything in between. For images that feel like you.'],
    hero_cta: ['Hochzeit anfragen', 'Enquire about your wedding'],
    hero_secondary: ['Hochzeitsreportagen entdecken', 'Explore wedding photography'],
    inspired_title: ['Geschichten statt einzelner schöner Fotos', 'Stories, not just individual photographs'],
    gallery_intro: ['Ein Hochzeitstag besteht aus mehr als den perfekt geplanten Momenten. Ich fotografiere auch das Davor, das Dazwischen und das ungeplante Danach. Hier bekommt ihr einen Eindruck meiner Bildsprache.', 'A wedding day is more than its carefully planned moments. I photograph the anticipation, the moments in between and the unexpected afterwards. Here is a glimpse of my work.'],
    philosophy_title: ['Unauffällig, wenn es darauf ankommt. Klar, wenn ihr Unterstützung braucht.', 'Unobtrusive when it matters. Helpful when you need direction.'],
    philosophy_text: ['Bei einer Trauung halte ich mich zurück. Beim Paarshooting gebe ich euch Orientierung, ohne euch in Posen zu drängen. Mir ist wichtig, dass ihr euren Tag erlebt und nicht für die Kamera funktioniert.', 'During the ceremony, I stay in the background. For your couple portraits, I offer gentle direction without forcing poses. I want you to experience your day, not perform for the camera.'],
    about_title: ['Servus, ich bin Mario.', 'Servus, I’m Mario.'],
    about_text: ['Ich komme ursprünglich aus Bayern und lebe heute in Söll am Wilden Kaiser. Seit vielen Jahren begleite ich Menschen und ihre Geschichten mit der Kamera. Ich mag ehrliche Situationen, gute Gespräche und Bilder, die nicht erst erklärt werden müssen.', 'Originally from Bavaria, I now live in Söll near the Wilder Kaiser. I have spent many years photographing people and their stories. I like honest moments, good conversations and images that speak for themselves.'],
    about_cta: ['Mehr über mich', 'More about me'],
    services_title: ['Fotografie, die zu eurem Anlass passt', 'Photography for your occasion'],
    wedding_title: ['Hochzeiten', 'Weddings'],
    wedding_desc: ['Vom Standesamt bis zur langen Reportage. Fotografie und auf Wunsch Film, abgestimmt auf eure Pläne.', 'From a civil ceremony to a full-day story. Photography and, if you wish, film, tailored to your plans.'],
    animals_title: ['Tierfotografie', 'Animal photography'],
    animals_desc: ['Natürliche Porträts von Hunden und anderen Tieren, draußen an einem passenden Ort. Mit Zeit, Geduld und Platz für ihren eigenen Charakter.', 'Natural portraits of dogs and other animals outdoors. With time, patience and room for their own personality.'],
    portrait_title: ['Paare, Familie & Porträts', 'Couples, families & portraits'],
    portrait_desc: ['Persönliche Shootings ohne steife Inszenierung. Für euch allein, zu zweit oder mit den Menschen, die dazugehören.', 'Personal sessions without stiff staging. Just you, the two of you, or the people who matter to you.'],
    view_more: ['Mehr entdecken', 'Discover more'],
    load_more: ['Weitere Bilder ansehen', 'View more photographs'],
    cta_title: ['Erzählt mir von euren Plänen.', 'Tell me about your plans.'],
    cta_text: ['Ihr habt ein Datum, eine Location oder erst eine Idee? Schickt mir die wichtigsten Eckdaten. Ich prüfe den Termin und wir besprechen, welche Begleitung zu euch passt.', 'Have a date, a venue or just an idea? Send me the essentials. I will check the date and we can discuss the right coverage for you.'],
    cta_button: ['Hochzeit anfragen', 'Enquire about your wedding'],
  },
  weddings: {
    hero_title: ['Hochzeitsfotografie am Wilden Kaiser, in Kitzbühel und Tirol', 'Wedding photography in Tyrol and the Wilder Kaiser'],
    hero_subtitle: ['Euer Tag. Eure Geschichte.', 'Your day. Your story.'],
    intro: ['Euer Hochzeitstag darf sich nach euch anfühlen. Ich begleite euch mit der Kamera, ohne aus jedem Augenblick eine Inszenierung zu machen. So entstehen Reportagen mit echten Begegnungen, ruhigen Details und der Stimmung eures Tages. Von Söll aus bin ich in Tirol und Bayern für euch unterwegs, auch am Chiemsee, Tegernsee, Schliersee und in Innsbruck.', 'Your wedding day should feel like you. I photograph it without turning every moment into a production: real encounters, quiet details and the atmosphere of your day. Based in Söll, I work across Tyrol and Bavaria, including Chiemsee, Tegernsee, Schliersee and Innsbruck.'],
    style_title: ['Mein fotografischer Stil', 'My photographic approach'],
    style_text: ['Ich fotografiere dokumentarisch und achte auf Licht, Bildaufbau und Details. Bei den wichtigen Momenten halte ich mich zurück. Für eure Paarbilder gebe ich euch kleine Impulse und genug Raum, damit ihr euch natürlich bewegen könnt. Die Bearbeitung bleibt zusammenhängend: natürliche Hauttöne, bewusstes Licht und ein leichter Editorial-Einfluss.', 'I work with a documentary approach and attention to light, composition and detail. I stay unobtrusive during important moments, then offer small prompts and space to move for your portraits. The editing stays consistent: natural skin tones, considered light and a subtle editorial influence.'],
    story_title: ['Was eine Hochzeitsreportage erzählt', 'What a wedding story captures'],
    story_text: ['Die Begegnungen vor der Trauung. Ein Blick während des Ja-Worts. Die Umarmung danach. Gespräche beim Empfang und die Stimmung am Abend. Wir besprechen vorab, was euch wichtig ist, und schaffen einen Ablauf, in dem eure Feier im Mittelpunkt bleibt.', 'The encounters before the ceremony. A glance during your vows. The embrace afterwards. Conversations at the reception and the evening atmosphere. We discuss your priorities beforehand and make space for the celebration itself.'],
    video_heading: ['Hochzeitsfilm: Bewegungen und Stimmen bewahren', 'Wedding films: keeping movement and voices'],
    video_text: ['Ein Film ergänzt die Fotoreportage um Stimmen, Bewegungen und Atmosphäre. Ob eine kurze filmische Zusammenfassung oder eine ausführlichere Begleitung sinnvoll ist, klären wir nach eurem Ablauf und euren Wünschen.', 'A film adds voices, movement and atmosphere to your photographs. We will discuss whether a short highlight film or more extensive coverage suits your day and your wishes.'],
    video_note: ['Wenn Foto und Film gleichzeitig entstehen sollen, besprechen wir vorab die personelle Umsetzung. Für eine umfassende parallele Begleitung kann eine zweite Person notwendig sein. Umfang, Ton und Lieferung halten wir im Angebot fest.', 'If you want photography and film at the same time, we discuss how to staff the production beforehand. Comprehensive simultaneous coverage may require a second person. Coverage, audio and delivery are agreed in your offer.'],
    packages_title: ['Die passende Begleitung für euren Tag', 'The right coverage for your day'],
    packages_intro: ['Eine kleine Trauung braucht eine andere Begleitung als eine Hochzeit vom Getting Ready bis zur Party. Diese drei Möglichkeiten geben euch Orientierung. Den genauen Umfang, Zusatzstunden, Film und Reisekosten stimmen wir im persönlichen Angebot ab.', 'A small ceremony needs different coverage from a wedding that runs from getting ready to the party. These three options are a starting point. Your personal offer defines the coverage, extra hours, film and travel costs.'],
    travel_note: ['Mein Ausgangspunkt ist Söll am Wilden Kaiser. Fahrtwege, mögliche Übernachtungen und weitere Reisekosten besprechen wir vor der Buchung und weisen sie im Angebot aus.', 'My starting point is Söll near the Wilder Kaiser. Travel, any overnight stays and other travel costs are discussed before booking and set out in your offer.'],
    packages_cta: ['Diese Begleitung anfragen', 'Enquire about this coverage'],
    film_cta: ['Foto & Film anfragen', 'Enquire about photography & film'],
    gallery_title: ['Einblicke in meine Hochzeitsfotografie', 'A glimpse of my wedding photography'],
    gallery_intro: ['Eine Auswahl aus meinen Arbeiten. Schaut euch um und findet heraus, ob meine Bildsprache zu euch passt.', 'A selection of my work. Take a look and see whether my visual style feels right for you.'],
    process_title: ['So entsteht eure Hochzeitsreportage', 'How your wedding story comes together'],
    process1_title: ['Anfrage', 'Enquiry'], process1_text: ['Ihr nennt mir Datum, Ort und eure bisherigen Pläne. Ich prüfe, ob der Termin möglich ist.', 'Tell me your date, location and plans so far. I check whether the date is available.'],
    process2_title: ['Kennenlernen', 'Getting to know each other'], process2_text: ['Wir sprechen über eure Feier, eure Erwartungen und meine Arbeitsweise.', 'We talk about your celebration, expectations and how I work.'],
    process3_title: ['Angebot & Planung', 'Offer & planning'], process3_text: ['Ihr bekommt ein persönliches Angebot. Leistungsumfang, Reservierung, Zahlungen und Liefertermin vereinbaren wir schriftlich.', 'You receive a personal offer. Coverage, reservation, payments and delivery are agreed in writing.'],
    process4_title: ['Euer Hochzeitstag', 'Your wedding day'], process4_text: ['Ich dokumentiere die Situationen, wie sie entstehen, und begleite euch bei den Paarbildern mit dezenten Anleitungen.', 'I document situations as they unfold and offer gentle guidance for your couple portraits.'],
    process5_title: ['Eure Galerie', 'Your gallery'], process5_text: ['Nach Auswahl und Bearbeitung erhaltet ihr eure Bilder in einer privaten Online-Galerie. Den Liefertermin stimmen wir vorher ab.', 'After selection and editing, you receive your photographs in a private online gallery. We agree the delivery date beforehand.'],
    timeline_title: ['Platz für das, was euch wichtig ist', 'Room for what matters to you'],
    timeline_intro: ['Ob Vorbereitungen, Trauung, Gratulationen, Paarbilder oder Feier: Wir planen mit realistischen Wegen und Pausen. Das passende Licht für Paarporträts hängt von Jahreszeit, Wetter und Location ab, nicht von einer festen Uhrzeit.', 'Preparations, ceremony, congratulations, portraits or the party: we allow for realistic travel times and breaks. The best light for portraits depends on the season, weather and location, not a fixed hour.'],
    destination_title: ['Ihr heiratet außerhalb von Tirol und Bayern?', 'Getting married beyond Tyrol and Bavaria?'],
    destination_text: ['Erzählt mir von eurem Ort und euren Plänen. Wir schauen gemeinsam, wie sich Begleitung und Reise sinnvoll verbinden lassen.', 'Tell me about the place and your plans. We can explore how to combine the coverage and travel sensibly.'],
    destination_cta: ['Mehr zur Destination Wedding', 'Explore destination weddings'],
    cta_title: ['Ein guter Anfang ist eine Nachricht.', 'A message is a good place to start.'],
    cta_text: ['Erzählt mir, wann und wo ihr heiratet und was euch wichtig ist. Ich prüfe die Verfügbarkeit und melde mich persönlich bei euch.', 'Tell me when and where you are getting married and what matters to you. I will check availability and get back to you personally.'],
    cta_button: ['Hochzeit anfragen', 'Enquire about your wedding'],
  },
  animals: {
    hero_title: ['Hundefotografie und Tierfotografie in Tirol', 'Dog and animal photography in Tyrol'],
    hero_subtitle: ['Persönlichkeit einfangen', 'Capturing personality'],
    intro: ['Draußen in Bewegung, entspannt im Grünen oder nah bei den Menschen, die dazugehören: Mich interessiert der Charakter eures Tieres. Ich plane Shootings mit Zeit und möglichst wenig Druck. Von Söll aus bin ich rund um den Wilden Kaiser, Kufstein und Kitzbühel unterwegs.', 'Outdoors in motion, relaxed in nature or close to their favourite people: I am interested in your animal’s character. We take our time and keep pressure low. Based in Söll, I work around the Wilder Kaiser, Kufstein and Kitzbühel.'],
    approach_title: ['So, wie euer Tier wirklich ist', 'Just as your animal really is'],
    approach_text: ['Nicht jeder Hund sitzt auf Kommando still, und das muss er auch nicht. Wir suchen eine sichere Umgebung. Bewegung, Pausen und kleine Ablenkungen gehören dazu. Ein Shooting an der Leine ist möglich; Sicherheit geht immer vor dem perfekten Bild.', 'Not every dog sits still on command, and they do not have to. We choose a safe setting. Movement, breaks and small distractions are part of the session. A lead is fine: safety always comes before a particular photograph.'],
    packages_title: ['Draußen ist Platz für euren Charakter', 'Space to be themselves, outdoors'],
    packages_intro: ['Wir stimmen Ort, Dauer, Bildauswahl und Preis vor dem Termin ab. Erzählt mir von eurem Tier und davon, welche Bilder ihr euch wünscht. Ob ruhiges Porträt oder Bewegung: Wir planen passend zu euch.', 'We agree the location, duration, image selection and price before the session. Tell me about your animal and the photographs you would like, whether quiet portraits or movement.'],
    travel_note: ['Anfahrt und einen geeigneten Shootingort besprechen wir gemeinsam. Ausgangspunkt ist Söll; mögliche Fahrtkosten stehen im persönlichen Angebot.', 'We discuss travel and a suitable location together. I start from Söll, with any travel costs listed in your personal offer.'],
    cta_title: ['Erzählt mir von eurem Vierbeiner.', 'Tell me about your companion.'],
    cta_text: ['Was macht euer Tier aus, wo fühlt es sich wohl und welche Bilder wünscht ihr euch? Schreibt mir, dann planen wir einen passenden Termin.', 'What is your animal like, where do they feel comfortable and what photographs would you love? Write to me and we can plan a suitable session.'],
    cta_button: ['Tierfotos anfragen', 'Enquire about animal photography'],
    gallery_title: ['Charakter vor der Kamera', 'Character in front of the camera'],
    gallery_intro: ['Hunde, Pferde und ihre Menschen: eine Auswahl meiner Tierfotografie.', 'Dogs, horses and their people: a selection of my animal photography.'],
  },
  portrait: {
    hero_title: ['Paarshootings und Porträtfotografie in Tirol', 'Couples and portrait photography in Tyrol'],
    hero_subtitle: ['Bilder, auf denen ihr euch wiedererkennt.', 'Photographs that feel like you.'],
    intro: ['Nicht jedes besondere Foto braucht einen besonderen Anlass. Ob zu zweit, allein oder als Familie: Wir schaffen Bilder, auf denen ihr euch wiedererkennt. Mit einer entspannten Atmosphäre, klaren Impulsen und genug Raum für echte Situationen.', 'A special photograph does not need a special occasion. As a couple, on your own or with your family, we create images that feel like you. A relaxed atmosphere, simple prompts and room for real moments.'],
    couple_title: ['Paare & Verlobung', 'Couples & engagement'],
    couple_text: ['Ein gemeinsamer Spaziergang, ein Ort mit Bedeutung oder einfach Zeit zu zweit. Ohne komplizierte Posen, aber mit guter Anleitung, wenn ihr sie braucht.', 'A walk together, a meaningful place or simply time for the two of you. No complicated poses, with helpful direction when you need it.'],
    family_title: ['Porträts', 'Portraits'],
    family_text: ['Bilder für euch selbst, eure Bewerbung oder euren persönlichen Auftritt. Stimmung, Kleidung und Location stimmen wir vorher ab.', 'Photographs for yourself, your application or your personal profile. We discuss the mood, clothing and location beforehand.'],
    private_title: ['Familie & Taufe', 'Family & baptism'],
    private_text: ['Kleine Gesten, lebendige Begegnungen und die Menschen, die dazugehören. Bei Taufen begleite ich den Ablauf zurückhaltend.', 'Small gestures, lively encounters and the people who belong together. At baptisms, I photograph unobtrusively.'],
    packages_title: ['Ablauf und Preis', 'The session and the price'],
    packages_intro: ['Erzählt mir, wen wir fotografieren, wo das Shooting stattfinden soll und wofür ihr die Bilder verwenden möchtet. Daraus erstelle ich ein passendes Angebot mit Shootingdauer, Bildumfang und Preis.', 'Tell me who we are photographing, where the session should take place and how you would like to use the images. I will prepare an offer with the duration, image selection and price.'],
    travel_note: ['Ort, Anfahrt und Nutzungsumfang stimmen wir vor der Buchung ab. Gewerbliche Foto- und Videoproduktionen findet ihr bei wyldworks.de.', 'We agree the location, travel and usage before booking. Commercial photo and video productions are available through wyldworks.de.'],
    cta_title: ['Euer Moment, eure Bilder.', 'Your moment, your photographs.'],
    cta_text: ['Ob Paar, Familie oder Porträt: Schreibt mir, was ihr euch vorstellt. Wir besprechen einen passenden Ort und den Umfang eures Shootings.', 'Couple, family or portrait: tell me what you have in mind. We will discuss a suitable location and the scope of your session.'],
    cta_button: ['Shooting anfragen', 'Enquire about a session'],
    gallery_title: ['Menschen und ihre Geschichten', 'People and their stories'],
    gallery_intro: ['Persönliche Augenblicke, gemeinsame Zeit und Bilder ohne steife Inszenierung.', 'Personal moments, time together and photographs without stiff staging.'],
  },
  about: {
    heading: ['Ich bin Mario. Fotograf und Videograf aus Söll.', 'I’m Mario. Photographer and filmmaker from Söll.'],
    text1: ['Ich komme ursprünglich aus Bayern und lebe heute in Tirol, in Söll am Wilden Kaiser. Mit der Kamera beschäftige ich mich seit meiner Jugend. Was mich bis heute daran fasziniert, sind die Menschen und die Augenblicke, die dazwischen entstehen.', 'Originally from Bavaria, I now live in Söll near the Wilder Kaiser in Tyrol. I have been interested in photography since my teens. What still fascinates me is people and the moments in between.'],
    philosophy_title: ['Wie ich fotografiere', 'How I photograph'],
    text2: ['Bei Hochzeiten halte ich mich in vielen Situationen bewusst zurück. Bei einem Paarshooting oder Porträt gebe ich Orientierung, wenn sie gebraucht wird. Mir ist wichtig, dass sich das Fotografieren wie ein normaler Teil eures Tages anfühlt, nicht wie ein zusätzlicher Programmpunkt.', 'At weddings, I often stay deliberately in the background. For a couple session or portrait, I offer direction when needed. Photography should feel like a natural part of your day, not another obligation.'],
    text3: ['Ich mag Bilder mit Haltung, natürlichem Licht und einer klaren Gestaltung. Gleichzeitig darf eine Reportage laut, ungeplant und lebendig sein. Genau diese Mischung ist für mich interessant.', 'I like photographs with character, natural light and considered composition. A story can also be loud, unplanned and full of life. That combination is what interests me.'],
    passion_title: ['Mehr als nur Hochzeiten', 'More than weddings'],
    passion_text1: ['Neben Hochzeiten fotografiere ich Tiere, Paare, Familien und Porträts. Was diese Shootings verbindet: Zeit für die Menschen und Tiere vor der Kamera und ein Blick für das, was sie ausmacht.', 'Alongside weddings, I photograph animals, couples, families and portraits. These sessions share the same approach: time for those in front of the camera and an eye for what makes them themselves.'],
    passion_text2: ['Für gewerbliche Foto- und Videoproduktionen gibt es meinen separaten Markenauftritt wyldworks.de.', 'For commercial photography and video production, visit my separate brand wyldworks.de.'],
    cta_title: ['Lernen wir uns kennen.', 'Let’s get to know each other.'],
    cta_text: ['Erzählt mir von euren Plänen und den Bildern, die euch wichtig sind. Ich melde mich persönlich bei euch.', 'Tell me about your plans and the photographs that matter to you. I will get back to you personally.'],
    cta_button: ['Kontakt aufnehmen', 'Get in touch'],
  },
  destination: {
    hero_title: ['Hochzeitsfotografie außerhalb von Tirol und Bayern', 'Wedding photography beyond Tyrol and Bavaria'],
    hero_subtitle: ['Euer besonderer Ort. Gemeinsam geplant.', 'Your meaningful place. Planned together.'],
    intro: ['Manchmal findet die Hochzeit dort statt, wo Familie und Freunde zusammenkommen. Oder an einem Ort, der für euch persönlich wichtig ist. Wenn ihr außerhalb meiner üblichen Einsatzregion heiratet, könnt ihr mich ebenfalls anfragen.', 'Sometimes a wedding takes place where family and friends come together, or somewhere with personal meaning. If you are getting married beyond my usual region, you can enquire too.'],
    planning_title: ['So kalkuliere ich eure Begleitung', 'How I plan your coverage'],
    planning_text: ['Die fotografische oder filmische Leistung bildet die Grundlage. Dazu kommen, soweit erforderlich und vorab vereinbart, Reise, Unterkunft und Zeitaufwand für die Anfahrt. Ihr erhaltet ein Angebot, in dem diese Positionen nachvollziehbar aufgeführt sind.', 'Photography or film coverage is the starting point. Travel, accommodation and travel time are added where needed and agreed in advance. Your offer sets out these items clearly.'],
    process_title: ['Gemeinsam planen', 'Planning together'],
    process_text: ['Nennt mir Datum, Ort, zeitlichen Ablauf und ob ihr Fotografie, Film oder beides benötigt. Ich prüfe, ob das Projekt organisatorisch sinnvoll möglich ist. Den genauen Umfang und die Umsetzung stimmen wir vor der Buchung ab.', 'Tell me the date, place, schedule and whether you need photography, film or both. I will check whether the project is practical. We agree the details and production before booking.'],
    cta_title: ['Wo spielt eure Geschichte?', 'Where does your story take place?'],
    cta_text: ['Schickt mir euren Ort und eure Idee. Dann schauen wir gemeinsam, was möglich ist.', 'Send me the place and your idea, and we can explore what is possible.'],
    cta_button: ['Destination Wedding anfragen', 'Enquire about a destination wedding'],
  },
  contact: {
    title: ['Erzählt mir von euren Plänen', 'Tell me about your plans'],
    intro: ['Ob Hochzeit, Tierfotografie oder persönliches Shooting: Schreibt mir die wichtigsten Eckdaten. Ich prüfe eure Anfrage und melde mich persönlich zurück.', 'Wedding, animal photography or a personal session: send me the essentials. I will review your enquiry and get back to you personally.'],
    direct_title: ['Lieber direkt schreiben?', 'Prefer to get in touch directly?'],
    topic_label: ['Was möchtet ihr anfragen?', 'What would you like to enquire about?'],
    name_label: ['Name', 'Name'], email_label: ['E-Mail', 'Email'], phone_label: ['Telefon (optional)', 'Phone (optional)'],
    date_label: ['Datum oder Zeitraum', 'Date or time frame'], date_help: ['Noch offen? Tragt einfach „noch offen“ oder euren Wunschzeitraum ein.', 'Not decided yet? Enter “not decided” or your preferred time frame.'],
    location_label: ['Ort / Location', 'Place / venue'], scope_label: ['Gewünschter Umfang (optional)', 'Preferred coverage (optional)'],
    package_label: ['Interesse an einer Begleitung (optional)', 'Interested in an option (optional)'],
    message_label: ['Was ist euch wichtig?', 'What matters to you?'],
    message_help: ['Bis zu 5.000 Zeichen. Datum und Location dürfen noch offen sein.', 'Up to 5,000 characters. Your date and venue do not need to be final.'],
    privacy_text: ['Ich habe die Datenschutzhinweise zur Bearbeitung meiner Anfrage gelesen.', 'I have read the privacy notice about processing my enquiry.'],
    privacy_link: ['Datenschutzerklärung', 'Privacy policy'],
    submit: ['Anfrage senden', 'Send enquiry'], sending: ['Wird übermittelt …', 'Sending …'],
    success_title: ['Danke für eure Nachricht.', 'Thank you for your message.'],
    success_text: ['Eure Anfrage ist bei mir eingegangen. Ich schaue mir eure Angaben an und melde mich unter der angegebenen E-Mail-Adresse zurück. Euer Termin ist damit noch nicht reserviert.', 'I have received your enquiry. I will review your details and reply to the email address provided. Your date has not been reserved yet.'],
    error_text: ['Die Anfrage konnte gerade nicht gespeichert werden. Eure Eingaben bleiben erhalten. Bitte versucht es erneut oder schreibt mir direkt.', 'Your enquiry could not be saved just now. Your entries are still here. Please try again or email me directly.'],
    meeting_label: ['Kennenlernen vorschlagen (optional)', 'Suggest an introductory meeting (optional)'],
    guide_label: ['Ich interessiere mich für den Wedding Guide.', 'I am interested in the wedding guide.'],
  },
};

const faqs: Record<string, [string, string, string, string][]> = {
  weddings: [
    ['Fotografierst du auch kleine standesamtliche Hochzeiten?', 'Ja. Für standesamtliche Trauungen und kleinere Feiern ist auch eine kurze Begleitung anfragbar. Wir planen Zeit für Trauung, Gratulationen, Gruppenbilder und Paarporträts ein.', 'Do you photograph small civil weddings?', 'Yes. Short coverage is available to enquire about for civil ceremonies and smaller celebrations. We plan time for the ceremony, congratulations, group photographs and couple portraits.'],
    ['Wie lange solltest du dabei sein?', 'Für eine Trauung und die Momente danach können wenige Stunden ausreichen. Für Vorbereitungen, Empfang und Feier lohnt sich eine längere Reportage. Wir richten uns nach eurem Ablauf.', 'How long should you stay?', 'A few hours may cover a ceremony and the moments afterwards. Preparations, a reception and a party call for longer coverage. We work around your schedule.'],
    ['Sind Hochzeitsfotos auch ohne Posing möglich?', 'Ja. Die meiste Zeit fotografiere ich Situationen, die von selbst entstehen. Beim Paarshooting unterstütze ich euch mit kleinen Impulsen, damit ihr euch vor der Kamera wohlfühlt.', 'Can we have wedding photos without posing?', 'Yes. Most of the time I photograph moments as they happen. For couple portraits, I offer small prompts to help you feel comfortable.'],
    ['Bietest du Foto und Film zusammen an?', 'Ja, eine kombinierte Begleitung ist anfragbar. Die Umsetzung und mögliche weitere Unterstützung hängen von eurem Ablauf und dem gewünschten Filmergebnis ab. Das klären wir im Angebot.', 'Do you offer photography and film together?', 'Yes, combined coverage is available to enquire about. Production and any additional support depend on your schedule and the film you want. We clarify this in your offer.'],
    ['Was passiert bei Regen?', 'Wir prüfen vorab Möglichkeiten an eurer Location und suchen bei Bedarf ein geeignetes Zeitfenster für kurze Paarporträts. Auch bei wechselhaftem Wetter können stimmungsvolle Bilder entstehen.', 'What happens if it rains?', 'We look at options at your venue beforehand and, if needed, find a suitable window for short portraits. Changeable weather can make atmospheric photographs too.'],
    ['Wo bist du unterwegs?', 'Ich lebe in Söll am Wilden Kaiser. Ihr könnt mich in Tirol, rund um Kufstein und Kitzbühel, in Innsbruck sowie am Chiemsee, Tegernsee und Schliersee anfragen. Reisekosten klären wir vor der Buchung.', 'Where do you work?', 'I live in Söll near the Wilder Kaiser. You can enquire for Tyrol, Kufstein, Kitzbühel, Innsbruck and the lakes Chiemsee, Tegernsee and Schliersee. We agree travel costs before booking.'],
    ['Wann bekommen wir unsere Bilder?', 'Den Termin für die vollständige Galerie vereinbaren wir im Angebot. Nach Auswahl und Bearbeitung stelle ich euch die Bilder in einer privaten Online-Galerie bereit.', 'When do we receive our photographs?', 'We agree the complete gallery delivery date in your offer. After selection and editing, I provide your photographs in a private online gallery.'],
    ['Was kostet die Begleitung und wie buchen wir?', 'Alle Preise erhaltet ihr auf Anfrage. Schickt mir Datum, Ort und euren geplanten Umfang. Ich prüfe den Termin und erstelle ein persönliches Angebot. Die verbindliche Reservierung regeln wir im Vertrag.', 'What does coverage cost and how do we book?', 'All prices are on request. Send me the date, location and planned coverage. I check the date and prepare a personal offer. Your contract sets out the binding reservation.'],
  ],
  animals: [
    ['Muss mein Hund ohne Leine laufen können?', 'Nein. Wir können auch mit Leine fotografieren. Die Sicherheit eures Hundes und anderer Menschen und Tiere ist wichtiger als ein bestimmtes Motiv.', 'Does my dog need to be off lead?', 'No. We can photograph with a lead. The safety of your dog, other people and animals is more important than a particular image.'],
    ['Was ist, wenn mein Hund aufgeregt oder unsicher ist?', 'Sagt mir vorab, worauf wir achten müssen. Wir wählen einen ruhigen Ort und planen Pausen. Bei ausgeprägtem Aggressions- oder Fluchtverhalten klären wir zuerst, ob und wie ein sicherer Termin möglich ist.', 'What if my dog is excited or nervous?', 'Tell me what to consider beforehand. We choose a quiet place and plan breaks. For pronounced aggression or flight behaviour, we first discuss whether and how a safe session is possible.'],
    ['Können wir gemeinsam mit unserem Tier aufs Foto?', 'Gerne. Wenn ihr selbst Teil der Erinnerung sein möchtet, planen wir entsprechende Bilder ein.', 'Can we be in the photographs with our animal?', 'Of course. If you would like to be part of the photographs, we make time for that.'],
    ['Was sollten wir mitbringen?', 'Eine passende Leine, Wasser und, falls sinnvoll, vertraute Belohnungen oder Spielzeug. Weitere Wünsche besprechen wir vorab.', 'What should we bring?', 'A suitable lead, water and, if helpful, familiar treats or toys. We discuss any other requirements beforehand.'],
    ['Was passiert bei ungeeignetem Wetter?', 'Wir besprechen eine Alternative. Sicherheit und Wohlbefinden des Tieres haben Vorrang.', 'What if the weather is unsuitable?', 'We discuss an alternative. Safety and the animal’s wellbeing come first.'],
  ],
  portrait: [
    ['Wir stehen selten vor der Kamera. Ist das ein Problem?', 'Nein. Ich gebe einfache Impulse, die Bewegung und natürliche Situationen ermöglichen. Ihr müsst keine Posen vorbereiten.', 'We rarely stand in front of a camera. Is that a problem?', 'Not at all. I give simple prompts that encourage movement and natural moments. You do not need to prepare poses.'],
    ['Wo findet das Shooting statt?', 'An einem gemeinsam abgestimmten Ort, an dem wir uns gut bewegen und möglichst ungestört fotografieren können.', 'Where does the session take place?', 'At a place we agree together, with room to move and as few distractions as possible.'],
    ['Können wir mehrere Outfits mitbringen?', 'Ja, sofern wir dafür genügend Zeit einplanen. Sagt mir euren Wunsch vorher.', 'Can we bring several outfits?', 'Yes, as long as we allow enough time. Let me know beforehand.'],
  ],
};
Object.assign(copy.contact, {
  'topic_wedding-photo': ['Hochzeit Foto', 'Wedding photography'], 'topic_wedding-film': ['Hochzeit Film', 'Wedding film'], 'topic_wedding-both': ['Hochzeit Foto + Film', 'Wedding photography + film'],
  topic_animal: ['Tierfotografie', 'Animal photography'], topic_portrait: ['Paare & Porträts', 'Couples & portraits'], topic_general: ['Sonstiges', 'Other'],
  scope_open: ['Noch offen', 'Not decided yet'], package_open: ['Noch offen / individuell', 'Not decided / individual'],
});
for (const [page, rows] of Object.entries(faqs)) {
  copy[page].faq_title = [page === 'weddings' ? 'Häufige Fragen zur Hochzeitsbegleitung' : page === 'animals' ? 'Häufige Fragen zum Tiershooting' : 'Häufige Fragen zum Shooting', page === 'weddings' ? 'Wedding questions' : page === 'animals' ? 'Animal session questions' : 'Session questions'];
  rows.forEach(([q, a, qe, ae], index) => {
    copy[page][`faq${index + 1}_question`] = [q, qe];
    copy[page][`faq${index + 1}_answer`] = [a, ae];
  });
}
export const relaunchFields = Object.fromEntries(Object.entries(copy).map(([page, fields]) => [page, Object.fromEntries(Object.entries(fields).flatMap(([key, [de, en]]) => [[key + '_de', de], [key + '_en', en]]))]));
for (const page of ['home', 'weddings']) relaunchFields[page].hero_mobile_image = 'https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/5048_IG.jpg?updatedAt=1773007053682';

export function withRelaunchDefaults(document: SiteDocument): SiteDocument {
  const stories = [...document.stories];
  for (const [page, fields] of Object.entries(relaunchFields)) {
    const index = stories.findIndex(story => story.full_slug === 'pages/' + page);
    if (index < 0) stories.push({ name: page, slug: page, full_slug: 'pages/' + page, uuid: 'page-' + page, content: { component: 'page_' + page, ...fields } });
    else stories[index] = { ...stories[index], content: { ...fields, ...stories[index].content } };
  }
  return { ...document, stories };
}

// One-time editorial migration. Only the public CMS document is changed, never CRM records.
export function applyRelaunch(document: SiteDocument): SiteDocument {
  const next = structuredClone(withRelaunchDefaults(document));
  if (next.stories.find(story => story.full_slug === 'pages/home')?.content.relaunch_version === 1) return next;
  for (const story of next.stories) {
    const page = story.full_slug.replace(/^pages\//, '');
    if (relaunchFields[page]) Object.assign(story.content, relaunchFields[page]);
    const c = story.content;
    if (c.component === 'package') {
      if (c.category === 'wedding-photo') c.public_visible = false;
      if (c.category === 'wedding-video') {
        c.features = 'Filmlänge und Begleitung nach Vereinbarung\nTon, Musikrechte und personelle Umsetzung im Angebot\nLiefertermin und Reisekosten nach Vereinbarung';
        c.features_en = 'Film length and coverage by agreement\nAudio, music rights and staffing set out in your offer\nDelivery and travel costs by agreement';
      }
      if (c.category === 'animals') {
        c.public_visible = !/studio/i.test(c.name || story.name);
        if (c.public_visible) {
          c.features = 'Outdoor-Shooting an einem geeigneten Ort\nDauer und Bildumfang nach Vereinbarung\nProfessionell bearbeitete Bilder\nMögliche Anfahrt ab Söll im Angebot';
          c.features_en = 'Outdoor session at a suitable location\nDuration and image selection by agreement\nProfessionally edited photographs\nAny travel from Söll set out in your offer';
        }
      }
    }
    if (c.component === 'review') c.topic = ['reviews/elena', 'reviews/annabel'].includes(story.full_slug) ? 'wedding' : ['reviews/patrick', 'reviews/ute', 'reviews/sophie'].includes(story.full_slug) ? 'animal' : 'portrait';
    if (c.component === 'faq_item' && !c.relaunch_page) {
      c.public_visible = false;
      c.relaunch_page = /tier|animal|hund/i.test(c.category_key || '') ? 'animals' : /portrait|porträt|paar|couple/i.test(c.category_key || '') ? 'portrait' : 'weddings';
    }
  }
  for (const [page, rows] of Object.entries(faqs)) rows.forEach(([question_de, answer_de, question_en, answer_en], index) => {
    const slug = `relaunch-${page}-${index + 1}`;
    next.stories.push({ name: question_de, slug, full_slug: 'faqs/' + slug, uuid: slug, content: { component: 'faq_item', category_key: page === 'weddings' ? 'hochzeit' : page, relaunch_page: page, public_visible: true, sort_order: index + 1, question_de, answer_de, question_en, answer_en } });
  });
  const models = [
    ['packages/essential-wedding-photo', 'Standesamt', 'Für eure Trauung und die Begegnungen danach.', 'For your ceremony and the moments afterwards.', 'Kurze fotografische Begleitung nach eurem Ablauf', 'Short photography coverage to suit your schedule'],
    ['packages/signature-wedding-photo', 'Hochzeitsreportage', 'Für die zentralen Kapitel eures Hochzeitstages.', 'For the central chapters of your wedding day.', '8 Stunden fotografische Begleitung', '8 hours of photography coverage'],
    ['packages/complete-wedding-photo', 'Ganzer Hochzeitstag', 'Wenn die Geschichte beim Getting Ready beginnt und bis zur Feier reicht.', 'When the story begins at getting ready and continues into the celebration.', '12 Stunden fotografische Begleitung', '12 hours of photography coverage'],
  ];
  models.forEach(([slug, name, subtitle, subtitleEn, duration, durationEn], index) => {
    let story = next.stories.find(story => story.full_slug === slug);
    if (!story) { story = { name, slug: slug.split('/')[1], full_slug: slug, uuid: 'relaunch-package-' + index, content: {} }; next.stories.push(story); }
    Object.assign(story.content, { component: 'package', category: 'wedding-photo', name, price: 'Auf Anfrage', subtitle, subtitle_en: subtitleEn, public_visible: true, highlight: index === 1, sort_order: index + 1,
      name_en: ['Civil ceremony', 'Wedding story', 'Full wedding day'][index],
      features: [duration, 'Persönliche Abstimmung und Ablaufplanung', 'Professionell bearbeitete Bilder; Umfang im Angebot', 'Private Online-Galerie mit Download', 'Private Nutzungsrechte', 'Zusatzstunden nach Vereinbarung'].join('\n'),
      features_en: [durationEn, 'Personal consultation and schedule planning', 'Professionally edited photographs; selection agreed in your offer', 'Private online gallery with download', 'Private usage rights', 'Extra hours by agreement'].join('\n'),
    });
  });
  next.stories.find(story => story.full_slug === 'pages/home')!.content.relaunch_version = 1;
  return next;
}
