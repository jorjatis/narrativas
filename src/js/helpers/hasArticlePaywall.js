const PAYWALL_SELECTOR = 'ev-engagement[group-name="paywall-abc"][redirect="false"]';
const ARTICLE_SCOPE = ".v-d-w";

export function hasArticlePaywall() {
  const article = document.querySelector(ARTICLE_SCOPE);
  return Boolean(article?.querySelector(PAYWALL_SELECTOR));
}

export function onArticlePaywallChange(callback) {
  if (hasArticlePaywall()) {
    callback(true);
    return () => {};
  }

  const scope = document.querySelector(ARTICLE_SCOPE) ?? document.body;
  const observer = new MutationObserver(() => {
    if (hasArticlePaywall()) {
      callback(true);
      observer.disconnect();
    }
  });

  observer.observe(scope, { childList: true, subtree: true });

  return () => observer.disconnect();
}
