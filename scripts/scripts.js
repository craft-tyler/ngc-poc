import {
  buildBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  loadBlocks,
  loadCSS,
  loadFooter,
  loadHeader,
  sampleRUM,
  waitForLCP,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Returns the current timestamp used for scheduling content.
 */
export function getTimestamp() {
  if ((window.location.hostname === 'localhost' || window.location.hostname.endsWith('.hlx.page')) && window.sessionStorage.getItem('preview-date')) {
    return Date.parse(window.sessionStorage.getItem('preview-date'));
  }
  return Date.now();
}

/**
 * Determines whether scheduled content with a given date string should be displayed.
 */
export function shouldBeDisplayed(date) {
  const now = getTimestamp();

  const split = date.split('-');
  if (split.length === 2) {
    const from = Date.parse(split[0].trim());
    const to = Date.parse(split[1].trim());
    return now >= from && now <= to;
  }
  if (date !== '') {
    const from = Date.parse(date.trim());
    return now >= from;
  }
  return false;
}

/**
 * Remove scheduled blocks that should not be displayed.
 */
function scheduleBlocks(main) {
  const blocks = main.querySelectorAll('div.section > div > div');
  blocks.forEach((block) => {
    let date;
    const rows = block.querySelectorAll(':scope > div');
    rows.forEach((row) => {
      const cols = [...row.children];
      if (cols.length > 1) {
        if (cols[0].textContent.toLowerCase() === 'date') {
          date = cols[1].textContent;
          row.remove();
        }
      }
    });
    if (date && !shouldBeDisplayed(date)) {
      block.remove();
    }
  });
}

/**
 * Remove scheduled sections that should not be displayed.
 */
function scheduleSections(main) {
  const sections = main.querySelectorAll('div.section');
  sections.forEach((section) => {
    const { date } = section.dataset;
    if (date && !shouldBeDisplayed(date)) {
      section.remove();
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  scheduleSections(main);
  scheduleBlocks(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.replaceWith(link);
  } else {
    document.head.append(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // loadHeader(doc.querySelector('header'));
  // loadFooter(doc.querySelector('footer'));

  try {
    const response = await fetch('https://prod-sandbox.m2cloud.blueacorn.net/empty-page');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, "text/html");

    // Append stylesheets to the head
    const headElements = newDoc.querySelectorAll('link[rel="stylesheet"]');
    document.head.append(...headElements);

    // Collect scripts and separate external scripts from inline scripts
    const scriptElements = Array.from(newDoc.querySelectorAll('script'));
    const externalScripts = scriptElements.filter(script => script.src);
    const inlineScripts = scriptElements.filter(script => !script.src);

    // Function to create and append script elements
    const appendScript = (script, callback) => {
      const newScript = document.createElement('script');
      newScript.type = script.type;

      if (script.src) {
        newScript.src = script.src;
        newScript.async = script.async;
        newScript.onload = callback;
      } else {
        newScript.innerHTML = script.innerHTML;
      }

      document.body.appendChild(newScript);
    };

    // Append inline scripts first
    inlineScripts.forEach(script => appendScript(script));

    // Append external scripts with the proper loading order
    let loadNextScript = () => {
      if (externalScripts.length > 0) {
        const nextScript = externalScripts.shift();
        appendScript(nextScript, loadNextScript);
      }
    };

    // Start loading external scripts
    loadNextScript();

    // Replace header and footer
    const newHeader = newDoc.querySelector('header');
    const newFooter = newDoc.querySelector('footer');
    const currentHeader = document.querySelector('header');
    const currentFooter = document.querySelector('footer');

    if (newHeader && currentHeader) {
      currentHeader.replaceWith(newHeader);
    }

    if (newFooter && currentFooter) {
      currentFooter.replaceWith(newFooter);
    }

    console.log('Header and footer updated successfully.');
  } catch (error) {
    console.error('Error fetching and updating header/footer:', error);
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.png`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));

  import('./scheduling/scheduling.js');
}

const linksInit = () => {
  const sk = detail.data;

  console.log(sk);
}

const sk = document.querySelector('helix-sidekick');
if (sk) {
  // sidekick already loaded
  sk.addEventListener('custom:links', linksInit);
} else {
  // wait for sidekick to be loaded
  document.addEventListener('sidekick-ready', () => {
    document.querySelector('helix-sidekick')
      .addEventListener('custom:links', linksInit);
  }, { once: true });
}

const isLighthouse = /lighthouse/i.test(navigator.userAgent);

// Conditionally execute JavaScript based on whether Lighthouse is detected
if (isLighthouse) {
  document.body.style.backgroundColor = "red"
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();