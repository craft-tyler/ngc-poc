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

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

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