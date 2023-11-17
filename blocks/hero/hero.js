import { createTag, createHtmlVideo } from '../../scripts/utils.js';

export default async function decorate(block) {
  const innerContentContainer = createTag('div', { class: 'inner-content-container' });
  const { children } = block;

  // rotating header
  const innerSpanCollector = [];

  const headerData = children[0].querySelector('div > h1');
  const transformedHeaderData = headerData.innerText.split(',');

  const rotator = {
    headerContainer: createTag('div', { class: 'rotator header-container' }),
    rotatorWrapper: createTag('div', { class: 'rotator-wrapper' }),
    headingArea: createTag('h1', { class: 'heading-area' }),
    innerSpanWrapper: createTag('span', { class: 'inner-span-wrapper' }),
  };

  transformedHeaderData.forEach((word) => {
    const spanContent = createTag('span', { class: 'span-content' });

    spanContent.innerText = word;

    innerSpanCollector.push(spanContent);
  });

  // add a duplicate first item to reduce the jarring effect of going back
  innerSpanCollector.push(innerSpanCollector[0].cloneNode(true));

  for (let i = 0; i < innerSpanCollector.length; i++) {
    rotator.innerSpanWrapper.append(innerSpanCollector[i]);
  }

  rotator.headingArea.appendChild(rotator.innerSpanWrapper);
  rotator.rotatorWrapper.appendChild(rotator.headingArea);
  rotator.headerContainer.appendChild(rotator.rotatorWrapper);

  headerData.replaceWith(rotator.headerContainer);

  // hero content, below header
  const heroInner = {
    text: children[0].querySelector('div > p'),
    buttonLink: children[0].querySelector('div > p.button-container'),
  };

  if (Object.values(heroInner).every((element) => element === null)) return;

  if(block.classList.contains('hero-video')){
    const videoEl = createHtmlVideo(
      'assets/footer-animation-mobile.webm', 
      'assets/footer-poster-mobile.webp', 
      'assets/footer-animation-desktop.webm',
      'assets/footer-poster-desktop.webp');

    rotator.headerContainer.parentElement.prepend(videoEl);
  }

  innerContentContainer.appendChild(heroInner.text);
  innerContentContainer.insertAdjacentElement('beforeend', heroInner.buttonLink);

  heroInner.text.classList.add('hero-statement');
  heroInner.buttonLink.querySelector('a').classList.remove('primary');
  heroInner.buttonLink.querySelector('a').classList.add('label-effect', 'secondary');

  const buttonLabel = heroInner.buttonLink.querySelector('a').innerText;
  const buttonHTML = `
    <span class='label-up'>${buttonLabel}</span>
    <span class='label-up'>${buttonLabel}</span>
  `;

  heroInner.buttonLink.querySelector('a').innerText = '';
  heroInner.buttonLink.querySelector('a').innerHTML += buttonHTML;

  block.appendChild(innerContentContainer);
}
