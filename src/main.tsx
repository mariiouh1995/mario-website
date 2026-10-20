import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import { loadSiteDocument } from './content/site-client';

const ready = /^\/(admin|kundenportal|angebot)(\/|$)/.test(location.pathname) ? Promise.resolve() : loadSiteDocument();
ready.then(() => createRoot(document.getElementById('root')!).render(<App />));
