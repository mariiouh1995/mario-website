import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageProvider } from "./components/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import { ContactModalProvider } from "./components/ContactModal";
import { initStoryblok } from "./components/storyblok/storyblok-init";

// Initialize Storyblok CMS (runs once at module load)
// Set VITE_STORYBLOK_TOKEN in your .env or Vercel environment variables
initStoryblok();

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