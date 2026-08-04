import { BrowserRouter, HashRouter } from 'react-router-dom';

const UseHash = import.meta.env.VITE_USE_HASHROUTER === 'true';

if (!UseHash && window.location.hash.startsWith('#/')) {
  const legacyUrl = new URL(window.location.hash.slice(1), window.location.origin);
  const currentSearch = new URLSearchParams(window.location.search);

  currentSearch.forEach((value, key) => {
    if (!legacyUrl.searchParams.has(key)) {
      legacyUrl.searchParams.append(key, value);
    }
  });

  window.history.replaceState(
    null,
    '',
    `${legacyUrl.pathname}${legacyUrl.search}${legacyUrl.hash}`,
  );
}

export const AppRouter = ({ children }: { children: React.ReactNode }) =>
  UseHash ? <HashRouter>{children}</HashRouter> : <BrowserRouter>{children}</BrowserRouter>;
