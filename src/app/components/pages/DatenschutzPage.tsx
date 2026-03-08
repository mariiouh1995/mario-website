import { useLanguage } from "../LanguageContext";
import { SEO } from "../SEO";
import { SectionReveal } from "../SectionReveal";
import { motion } from "motion/react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SectionReveal>
      <div className="mb-12">
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          {title}
        </h2>
        <div
          className="text-black/60 text-[0.88rem] space-y-3"
          style={{ lineHeight: 1.8, fontWeight: 300 }}
        >
          {children}
        </div>
      </div>
    </SectionReveal>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3
        className="mb-2"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.2rem",
          fontWeight: 600,
        }}
      >
        {title}
      </h3>
      <div
        className="text-black/60 text-[0.88rem] space-y-2"
        style={{ lineHeight: 1.8, fontWeight: 300 }}
      >
        {children}
      </div>
    </div>
  );
}

export function DatenschutzPage() {
  const { lang } = useLanguage();

  return (
    <>
      <SEO
        title={lang === "de" ? "Datenschutzerklärung | Mario Schubert Photography" : "Privacy Policy | Mario Schubert Photography"}
        description={lang === "de"
          ? "Datenschutzerklaerung von Mario Schubert Fotografie. Informationen zur Verarbeitung personenbezogener Daten gemaess DSGVO."
          : "Privacy policy of Mario Schubert Photography. Information on processing personal data according to GDPR."}
        canonical="/datenschutz"
        lang={lang}
        keywords="Datenschutz Mario Schubert, DSGVO, Privacy Policy, Fotograf Innsbruck Datenschutz"
      />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-[#f8f7f5]">
        <div className="max-w-3xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
              style={{ fontWeight: 400 }}
            >
              {lang === "de" ? "RECHTLICHES" : "LEGAL"}
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
              }}
            >
              {lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
            </h1>
            <p className="text-black/40 text-[0.85rem] mt-4" style={{ fontWeight: 300 }}>
              Stand: 12. April 2023
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Section title={lang === "de" ? "Verantwortlicher" : "Controller"}>
            <p>
              Mario Schubert Fotografie<br />
              Bäckerbühelgasse 14, 6020 Innsbruck, Austria<br />
              Tel: <a href="tel:+4915155338029" className="text-black/70 no-underline hover:text-black transition-colors">+49 151 55338029</a><br />
              Mail: <a href="mailto:servus@marioschub.com" className="text-black/70 no-underline hover:text-black transition-colors">servus@marioschub.com</a>
            </p>
          </Section>

          <Section title={lang === "de" ? "Übersicht der Verarbeitungen" : "Overview of Processing"}>
            <p>
              {lang === "de"
                ? "Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung zusammen und verweist auf die betroffenen Personen."
                : "The following overview summarizes the types of data processed and the purposes of their processing."}
            </p>

            <SubSection title={lang === "de" ? "Arten der verarbeiteten Daten" : "Types of Data Processed"}>
              <ul className="list-disc pl-5 space-y-1">
                <li>{lang === "de" ? "Kontaktdaten" : "Contact data"}</li>
                <li>{lang === "de" ? "Inhaltsdaten" : "Content data"}</li>
                <li>{lang === "de" ? "Nutzungsdaten" : "Usage data"}</li>
                <li>{lang === "de" ? "Meta-, Kommunikations- und Verfahrensdaten" : "Meta, communication and procedural data"}</li>
              </ul>
            </SubSection>

            <SubSection title={lang === "de" ? "Kategorien betroffener Personen" : "Categories of Data Subjects"}>
              <ul className="list-disc pl-5 space-y-1">
                <li>{lang === "de" ? "Kommunikationspartner" : "Communication partners"}</li>
                <li>{lang === "de" ? "Nutzer" : "Users"}</li>
              </ul>
            </SubSection>

            <SubSection title={lang === "de" ? "Zwecke der Verarbeitung" : "Purposes of Processing"}>
              <ul className="list-disc pl-5 space-y-1">
                <li>{lang === "de" ? "Kontaktanfragen und Kommunikation" : "Contact requests and communication"}</li>
                <li>{lang === "de" ? "Sicherheitsmaßnahmen" : "Security measures"}</li>
                <li>{lang === "de" ? "Verwaltung und Beantwortung von Anfragen" : "Management and answering of requests"}</li>
                <li>Feedback</li>
                <li>Marketing</li>
                <li>{lang === "de" ? "Bereitstellung unseres Onlineangebotes und Nutzerfreundlichkeit" : "Provision of our online services and usability"}</li>
                <li>{lang === "de" ? "Informationstechnische Infrastruktur" : "Information technology infrastructure"}</li>
              </ul>
            </SubSection>
          </Section>

          <Section title={lang === "de" ? "Maßgebliche Rechtsgrundlagen" : "Legal Basis"}>
            <p>
              {lang === "de"
                ? "Im Folgenden erhalten Sie eine Übersicht der Rechtsgrundlagen der DSGVO, auf deren Basis wir personenbezogene Daten verarbeiten. Bitte nehmen Sie zur Kenntnis, dass neben den Regelungen der DSGVO nationale Datenschutzvorgaben in Ihrem bzw. unserem Wohn- oder Sitzland gelten können."
                : "The following provides an overview of the legal bases of the GDPR on the basis of which we process personal data."}
            </p>
            <p>
              <strong>
                {lang === "de" ? "Einwilligung (Art. 6 Abs. 1 S. 1 lit. a) DSGVO)" : "Consent (Art. 6(1)(a) GDPR)"}
              </strong>{" "}
              – {lang === "de"
                ? "Die betroffene Person hat ihre Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen spezifischen Zweck oder mehrere bestimmte Zwecke gegeben."
                : "The data subject has given consent to the processing of their personal data for one or more specific purposes."}
            </p>
            <p>
              <strong>
                {lang === "de" ? "Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)" : "Legitimate Interests (Art. 6(1)(f) GDPR)"}
              </strong>{" "}
              – {lang === "de"
                ? "Die Verarbeitung ist zur Wahrung der berechtigten Interessen des Verantwortlichen oder eines Dritten erforderlich, sofern nicht die Interessen oder Grundrechte und Grundfreiheiten der betroffenen Person, die den Schutz personenbezogener Daten erfordern, überwiegen."
                : "Processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Sicherheitsmaßnahmen" : "Security Measures"}>
            <p>
              {lang === "de"
                ? "Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeiten und des Ausmaßes der Bedrohung der Rechte und Freiheiten natürlicher Personen geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten."
                : "We take appropriate technical and organizational measures in accordance with legal requirements, taking into account the state of the art, implementation costs, and the nature, scope, circumstances and purposes of processing."}
            </p>
            <p>
              {lang === "de"
                ? "Zu den Maßnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den Daten als auch des sie betreffenden Zugriffs, der Eingabe, der Weitergabe, der Sicherung der Verfügbarkeit und ihrer Trennung."
                : "Measures include ensuring the confidentiality, integrity and availability of data through control of physical and electronic access to data."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Löschung von Daten" : "Deletion of Data"}>
            <p>
              {lang === "de"
                ? "Die von uns verarbeiteten Daten werden nach Maßgabe der gesetzlichen Vorgaben gelöscht, sobald deren zur Verarbeitung erlaubten Einwilligungen widerrufen werden oder sonstige Erlaubnisse entfallen. Sofern die Daten nicht gelöscht werden, weil sie für andere und gesetzlich zulässige Zwecke erforderlich sind, wird deren Verarbeitung auf diese Zwecke beschränkt."
                : "The data processed by us is deleted in accordance with the legal requirements as soon as the consents permitted for processing are revoked or other permissions cease to apply."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Einsatz von Cookies" : "Use of Cookies"}>
            <p>
              {lang === "de"
                ? "Cookies sind kleine Textdateien, bzw. sonstige Speichervermerke, die Informationen auf Endgeräten speichern und Informationen aus den Endgeräten auslesen. Cookies können ferner zu unterschiedlichen Zwecken eingesetzt werden, z.B. zu Zwecken der Funktionsfähigkeit, Sicherheit und Komfort von Onlineangeboten sowie der Erstellung von Analysen der Besucherströme."
                : "Cookies are small text files or other storage notes that store information on end devices and read information from the end devices. Cookies can be used for various purposes, such as functionality, security and comfort of online services."}
            </p>
            <p>
              <strong>{lang === "de" ? "Hinweise zur Einwilligung:" : "Notes on consent:"}</strong>{" "}
              {lang === "de"
                ? "Wir setzen Cookies im Einklang mit den gesetzlichen Vorschriften ein. Daher holen wir von den Nutzern eine vorhergehende Einwilligung ein, außer wenn diese gesetzlich nicht gefordert ist. Eine Einwilligung ist insbesondere nicht notwendig, wenn das Speichern und das Auslesen der Informationen unbedingt erforderlich sind, um dem den Nutzern einen von ihnen ausdrücklich gewünschten Telemediendienst zur Verfügung zu stellen."
                : "We use cookies in accordance with legal regulations. We therefore obtain prior consent from users unless this is not required by law."}
            </p>
            <p>
              <strong>{lang === "de" ? "Speicherdauer:" : "Storage duration:"}</strong>{" "}
              {lang === "de"
                ? "Temporäre Cookies (Session-Cookies) werden spätestens gelöscht, nachdem ein Nutzer ein Online-Angebot verlassen und sein Endgerät geschlossen hat. Permanente Cookies bleiben auch nach dem Schließen des Endgerätes gespeichert. Die Speicherdauer kann bis zu zwei Jahre betragen."
                : "Temporary cookies (session cookies) are deleted at the latest after a user leaves the online service and closes their device. Permanent cookies remain stored even after the device is closed. The storage duration can be up to two years."}
            </p>
            <p>
              <strong>{lang === "de" ? "Widerruf und Widerspruch (Opt-Out):" : "Revocation and Objection (Opt-Out):"}</strong>{" "}
              {lang === "de"
                ? "Nutzer können die von ihnen abgegebenen Einwilligungen jederzeit widerrufen und zudem einen Widerspruch gegen die Verarbeitung entsprechend den gesetzlichen Vorgaben im Art. 21 DSGVO einlegen."
                : "Users can revoke their consent at any time and also object to processing in accordance with Art. 21 GDPR."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Bereitstellung des Onlineangebotes und Webhosting" : "Online Services and Web Hosting"}>
            <p>
              {lang === "de"
                ? "Wir verarbeiten die Daten der Nutzer, um ihnen unsere Online-Dienste zur Verfügung stellen zu können. Zu diesem Zweck verarbeiten wir die IP-Adresse des Nutzers, die notwendig ist, um die Inhalte und Funktionen unserer Online-Dienste an den Browser oder das Endgerät der Nutzer zu übermitteln."
                : "We process user data to provide our online services. For this purpose, we process the user's IP address, which is necessary to deliver content and functions of our online services."}
            </p>
            <SubSection title={lang === "de" ? "Erhebung von Zugriffsdaten und Logfiles" : "Collection of Access Data and Log Files"}>
              <p>
                {lang === "de"
                  ? "Der Zugriff auf unser Onlineangebot wird in Form von so genannten \"Server-Logfiles\" protokolliert. Die Serverlogfiles können die Adresse und Name der abgerufenen Webseiten und Dateien, Datum und Uhrzeit des Abrufs, übertragene Datenmengen, Meldung über erfolgreichen Abruf, Browsertyp nebst Version, das Betriebssystem des Nutzers, Referrer URL und im Regelfall IP-Adressen und der anfragende Provider umfassen. Logfile-Informationen werden für die Dauer von maximal 30 Tagen gespeichert und danach gelöscht oder anonymisiert."
                  : "Access to our online service is logged in the form of so-called \"server log files\". Log file information is stored for a maximum of 30 days and then deleted or anonymized."}
              </p>
            </SubSection>
          </Section>

          <Section title={lang === "de" ? "Kontakt- und Anfragenverwaltung" : "Contact and Inquiry Management"}>
            <p>
              {lang === "de"
                ? "Bei der Kontaktaufnahme mit uns (z.B. per Post, Kontaktformular, E-Mail, Telefon oder via soziale Medien) sowie im Rahmen bestehender Nutzer- und Geschäftsbeziehungen werden die Angaben der anfragenden Personen verarbeitet soweit dies zur Beantwortung der Kontaktanfragen und etwaiger angefragter Maßnahmen erforderlich ist."
                : "When contacting us (e.g. by mail, contact form, email, telephone or via social media), the information of the inquiring persons is processed insofar as this is necessary to answer contact inquiries."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Präsenzen in sozialen Netzwerken (Social Media)" : "Social Media Presences"}>
            <p>
              {lang === "de"
                ? "Wir unterhalten Onlinepräsenzen innerhalb sozialer Netzwerke und verarbeiten in diesem Rahmen Daten der Nutzer, um mit den dort aktiven Nutzern zu kommunizieren oder um Informationen über uns anzubieten."
                : "We maintain online presences within social networks and process user data in this context to communicate with active users or to offer information about us."}
            </p>
            <p>
              <strong>Instagram:</strong>{" "}
              {lang === "de"
                ? "Soziales Netzwerk; Dienstanbieter: Meta Platforms Irland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland."
                : "Social network; Service provider: Meta Platforms Ireland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Ireland."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Plugins und eingebettete Funktionen sowie Inhalte" : "Plugins and Embedded Functions and Content"}>
            <p>
              {lang === "de"
                ? "Wir binden in unser Onlineangebot Funktions- und Inhaltselemente ein, die von den Servern ihrer jeweiligen Anbieter bezogen werden. Dabei kann es sich zum Beispiel um Grafiken, Videos oder Schriften handeln."
                : "We integrate functional and content elements in our online service that are obtained from the servers of their respective providers."}
            </p>
            <SubSection title="Google Fonts">
              <p>
                {lang === "de"
                  ? "Bezug von Schriften (und Symbolen) zum Zwecke einer technisch sicheren, wartungsfreien und effizienten Nutzung von Schriften und Symbolen. Dem Anbieter der Schriftarten wird die IP-Adresse des Nutzers mitgeteilt, damit die Schriftarten im Browser des Nutzers zur Verfügung gestellt werden können. Dienstanbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland."
                  : "Procurement of fonts (and symbols) for the purpose of technically secure, maintenance-free and efficient use. The font provider receives the user's IP address so that the fonts can be made available in the user's browser. Service provider: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland."}
              </p>
            </SubSection>
          </Section>

          <Section title={lang === "de" ? "Änderung und Aktualisierung der Datenschutzerklärung" : "Changes and Updates to the Privacy Policy"}>
            <p>
              {lang === "de"
                ? "Wir bitten Sie, sich regelmäßig über den Inhalt unserer Datenschutzerklärung zu informieren. Wir passen die Datenschutzerklärung an, sobald die Änderungen der von uns durchgeführten Datenverarbeitungen dies erforderlich machen."
                : "We ask you to regularly inform yourself about the content of our privacy policy. We adapt the privacy policy as soon as changes in data processing make this necessary."}
            </p>
          </Section>

          <Section title={lang === "de" ? "Rechte der betroffenen Personen" : "Rights of Data Subjects"}>
            <p>
              {lang === "de"
                ? "Ihnen stehen als Betroffene nach der DSGVO verschiedene Rechte zu, die sich insbesondere aus Art. 15 bis 21 DSGVO ergeben:"
                : "As a data subject, you have various rights under the GDPR, in particular from Art. 15 to 21 GDPR:"}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>{lang === "de" ? "Widerspruchsrecht:" : "Right to object:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung der Sie betreffenden personenbezogenen Daten Widerspruch einzulegen."
                  : "You have the right to object at any time to the processing of your personal data for reasons arising from your particular situation."}
              </li>
              <li>
                <strong>{lang === "de" ? "Widerrufsrecht bei Einwilligungen:" : "Right to withdraw consent:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht, erteilte Einwilligungen jederzeit zu widerrufen."
                  : "You have the right to withdraw consent at any time."}
              </li>
              <li>
                <strong>{lang === "de" ? "Auskunftsrecht:" : "Right of access:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob betreffende Daten verarbeitet werden und auf Auskunft über diese Daten."
                  : "You have the right to request confirmation as to whether data is being processed and to access that data."}
              </li>
              <li>
                <strong>{lang === "de" ? "Recht auf Berichtigung:" : "Right to rectification:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht, die Vervollständigung oder Berichtigung der Sie betreffenden Daten zu verlangen."
                  : "You have the right to request the completion or correction of your data."}
              </li>
              <li>
                <strong>{lang === "de" ? "Recht auf Löschung:" : "Right to erasure:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht, zu verlangen, dass Sie betreffende Daten unverzüglich gelöscht werden."
                  : "You have the right to request that your data be deleted immediately."}
              </li>
              <li>
                <strong>{lang === "de" ? "Recht auf Datenübertragbarkeit:" : "Right to data portability:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht, Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten."
                  : "You have the right to receive data in a structured, commonly used and machine-readable format."}
              </li>
              <li>
                <strong>{lang === "de" ? "Beschwerde bei Aufsichtsbehörde:" : "Right to lodge a complaint:"}</strong>{" "}
                {lang === "de"
                  ? "Sie haben das Recht auf Beschwerde bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthaltsorts."
                  : "You have the right to lodge a complaint with a supervisory authority, in particular in the Member State of your habitual residence."}
              </li>
            </ul>
          </Section>
        </div>
      </section>
    </>
  );
}