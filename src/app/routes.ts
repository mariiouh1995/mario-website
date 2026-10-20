import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/pages/HomePage";
import { WeddingsPage } from "./components/pages/WeddingsPage";
import { DestinationWeddingPage } from "./components/pages/DestinationWeddingPage";
import { AnimalsPage } from "./components/pages/AnimalsPage";
import { PortraitPage } from "./components/pages/PortraitPage";
import { AboutPage } from "./components/pages/AboutPage";
import { ImpressumPage } from "./components/pages/ImpressumPage";
import { DatenschutzPage } from "./components/pages/DatenschutzPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "hochzeiten", Component: WeddingsPage },
      { path: "destination-wedding", Component: DestinationWeddingPage },
      { path: "tierfotografie", Component: AnimalsPage },
      { path: "portrait", Component: PortraitPage },
      { path: "ueber-mich", Component: AboutPage },
      { path: "impressum", Component: ImpressumPage },
      { path: "datenschutz", Component: DatenschutzPage },
      { path: "admin", lazy: async () => ({ Component: (await import('./components/pages/AdminPage')).AdminPage }) },
      { path: "kundenportal/:token", lazy: async () => ({ Component: (await import('./components/pages/CustomerPortalPage')).CustomerPortalPage }) },
      { path: "angebot/:token", lazy: async () => ({ Component: (await import('./components/pages/OfferPage')).OfferPage }) },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
