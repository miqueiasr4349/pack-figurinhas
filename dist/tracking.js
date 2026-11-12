(() => {
  const pixelId = '298800339720907';
  const consentKey = 'pack-figurinhas-marketing';
  const params = new URLSearchParams(window.location.search);
  const campaignKeys = [
    'src', 'sck', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
    'utm_content', 's1', 's2', 's3',
  ];
  const links = [...document.querySelectorAll('[data-checkout]')].map(link => ({
    link,
    destination: new URL(link.href),
  }));
  let pixelStarted = false;
  let consent;

  try {
    consent = localStorage.getItem(consentKey);
  } catch {
    // The checkout works when browser storage is unavailable.
  }

  function updateCheckoutLinks() {
    const keys = consent === 'allow' ? [...campaignKeys, 'fbclid'] : campaignKeys;
    for (const { link, destination } of links) {
      const url = new URL(destination);
      for (const key of keys) {
        const value = params.get(key);
        if (value) url.searchParams.set(key, value);
      }
      link.href = url.href;
    }
  }

  function startPixel() {
    if (pixelStarted || consent !== 'allow') return;
    pixelStarted = true;
    if (!window.fbq) {
      const fbq = function () {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      window.fbq = window._fbq = fbq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.append(script);
    }
    window.fbq('init', pixelId);
    window.fbq('trackSingle', pixelId, 'PageView');
    window.fbq('trackSingle', pixelId, 'ViewContent', {
      content_name: 'Pack Figurinhas Infinitos no Chat',
    });
  }

  const notice = document.querySelector('#marketing-consent');
  function saveConsent(value) {
    consent = value;
    try {
      localStorage.setItem(consentKey, value);
    } catch {
      // Keep the choice for the current page.
    }
    notice.hidden = true;
    if (pixelStarted) window.fbq('consent', value === 'allow' ? 'grant' : 'revoke');
    updateCheckoutLinks();
    startPixel();
  }

  document.querySelector('#marketing-allow').addEventListener('click', () => saveConsent('allow'));
  document.querySelector('#marketing-deny').addEventListener('click', () => saveConsent('deny'));
  document.querySelector('#marketing-settings').addEventListener('click', () => {
    notice.hidden = false;
    document.querySelector('#marketing-deny').focus();
  });

  updateCheckoutLinks();
  startPixel();
  notice.hidden = consent === 'allow' || consent === 'deny';
})();
