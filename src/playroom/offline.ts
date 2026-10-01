import { registerSW } from 'virtual:pwa-register';
export const updateApp = registerSW({
  onOfflineReady() {
    window.dispatchEvent(new Event('keylab-offline-ready'));
  },
  onNeedRefresh() {
    window.dispatchEvent(new Event('keylab-update-ready'));
  },
});
