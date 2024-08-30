let navPromise = null;

async function loadNav(url) {
  const response = await fetch(url);
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

export async function loadCommerceStyles() {
  const { styles } = await navPromise;
  document.head.append(...styles);
  return new Promise((resolve) => {
    const mainCss = document.head.querySelector('link[rel=stylesheet][href*="/css/styles-m."]');
    mainCss.onload = resolve;
  });
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
