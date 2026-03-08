import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageProvider } from "./components/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import { ContactModalProvider } from "./components/ContactModal";

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ContactModalProvider>
          <RouterProvider router={router} />
        </ContactModalProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}