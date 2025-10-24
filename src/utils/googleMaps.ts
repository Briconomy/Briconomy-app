type GoogleMapsWindow = typeof window & { google?: { maps?: unknown } };

let loaderPromise: Promise<unknown> | null = null;

function getWindow(): GoogleMapsWindow {
  return window as GoogleMapsWindow;
}

function getExistingScript(): HTMLScriptElement | null {
  return document.querySelector('script[data-google-maps-loader="true"]');
}

function ensureScript(apiKey: string, libraries: string[]): HTMLScriptElement {
  const existing = getExistingScript();
  if (existing) {
    return existing;
  }
  const script = document.createElement('script');
  const params = new URLSearchParams();
  params.set('key', apiKey);
  if (libraries.length > 0) {
    params.set('libraries', libraries.join(','));
  }
  params.set('loading', 'async');
  script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  script.async = true;
  script.defer = true;
  script.dataset.googleMapsLoader = 'true';
  document.head.appendChild(script);
  return script;
}

export function loadGoogleMapsApi(apiKey: string, libraries: string[] = ['places']): Promise<unknown> {
  const scopedWindow = getWindow();
  const existingMaps = scopedWindow.google?.maps;
  if (existingMaps) {
    return Promise.resolve(existingMaps);
  }
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is missing'));
  }
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const script = ensureScript(apiKey, libraries);
      const handleLoad = () => {
        const maps = scopedWindow.google?.maps;
        if (maps) {
          resolve(maps);
        } else {
          loaderPromise = null;
          reject(new Error('Google Maps API did not initialize'));
        }
      };
      const handleError = () => {
        loaderPromise = null;
        reject(new Error('Google Maps script failed to load'));
      };
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
    });
  }
  return loaderPromise;
}
