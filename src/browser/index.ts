import UnifyIntentClient from 'client';

export const initBrowser = function () {
  const scriptTag = document.getElementById('unifytag');
  const writeKey =
    scriptTag?.getAttribute('data-write-key') ??
    scriptTag?.getAttribute('data-api-key');

  if (!writeKey) return;

  const unify = new UnifyIntentClient(writeKey, {
    autoPage: true,
    autoIdentify: true,
  });
};

initBrowser();
