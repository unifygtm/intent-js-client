import UnifyIntentClient from './unify-intent-client';

export const unifyInit = function () {
  const scriptTag = document.getElementById('unifytag');
  const writeKey =
    scriptTag?.getAttribute('data-write-key') ??
    scriptTag?.getAttribute('data-api-key');

  if (!writeKey) return;

  const unify = new UnifyIntentClient(writeKey, { autoIdentify: true });
  unify.page();
};

unifyInit();
