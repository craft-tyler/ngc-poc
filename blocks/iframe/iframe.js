import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
    const blockConfig = readBlockConfig(block);

    const iframe = document.createElement('iframe');
    
    // Set the src, height, and width attributes from the object
    iframe.src = blockConfig.src;
    iframe.height = blockConfig.height;
    iframe.width = blockConfig.width;
    
    // You can add additional attributes or styles as needed
    iframe.style.border = "none"; // Example: remove border
    
    // Assign the iframe to the block variable
    block.innerHTML = "";
    block.appendChild(iframe);
}