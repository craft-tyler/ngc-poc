/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

export default {
  transformDOM: ({ document }) => {
    const main = document.querySelector('main');
    // remove header and footer from main
    WebImporter.DOMUtils.remove(main, ['header', 'footer', '.disclaimer']);

    return main;
  }
};
