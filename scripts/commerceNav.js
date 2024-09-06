let navPromise = null;

async function loadNav(url) {
  const response = await fetch(url, { credentials: 'same-origin' });
  const htmlString = await response.text();
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(htmlString, 'text/html');

  return {
    styles: [...newDoc.querySelectorAll('link[rel="stylesheet"], style')],
    scripts: [...newDoc.querySelectorAll('script')],
    header: [...newDoc.querySelectorAll('#cookie-status, .page-header, .nav-sections')],
    footer: [...newDoc.querySelectorAll('.page-footer, small.copyright')],
  };
}

export function initCommerceNavigation(url) {
  if (!navPromise) {
    navPromise = loadNav(url);
  }
}

export async function loadCommerceEagerStyles(pattern) {
  const { styles } = await navPromise;
  document.querySelector('header')?.classList?.add('page-header');
  document.querySelector('footer')?.classList?.add('page-footer');
  const eagerStyles = styles.filter((style) => (!style.href || style.href.match(pattern)))
    .filter((style) => (!style.media || window.matchMedia(style.media).matches));
  document.head.append(...eagerStyles);
  const promises = eagerStyles.filter((style) => style.href)
    .map((style) => new Promise((resolve, reject) => {
      style.onload = resolve;
      style.onerror = reject;
    }));
  return Promise.allSettled(promises);
}

export async function loadCommerceStyles() {
  const { styles } = await navPromise;
  document.head.append(...styles);
}

function loadScript(scriptTag) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.textContent = scriptTag.textContent;
    for (const attribute of scriptTag.attributes) {
      script.setAttribute(attribute.name, attribute.value);
    }
    if (script.src) {
      script.async = true;
      script.onload = resolve;
      script.onerror = resolve;
    } else {
      resolve();
    }
    document.head.appendChild(script);
  });
}

export async function loadCommerceScripts() {
  const { scripts } = await navPromise;
  for (const script of scripts) {
    await loadScript(script);
  }
}

export async function loadCommerceHeader() {
  const { header } = await navPromise;
  document.querySelector('header')?.replaceWith(...header);
}

export async function loadCommerceFooter() {
  const { footer } = await navPromise;
  document.querySelector('footer')?.replaceWith(...footer);
}
