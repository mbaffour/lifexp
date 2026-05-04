export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch((error: unknown) => {
      console.info('LifeXP service worker registration skipped.', error);
    });
  });
}
