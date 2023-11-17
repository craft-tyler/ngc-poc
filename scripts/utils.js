export function createTag(tag, attributes, html) {
    const el = document.createElement(tag);
    if (html) {
        if (html instanceof HTMLElement
            || html instanceof SVGElement
            || html instanceof DocumentFragment) {
            el.append(html);
        } else if (Array.isArray(html)) {
            el.append(...html);
        } else {
            el.insertAdjacentHTML('beforeend', html);
        }
    }
    if (attributes) {
        Object.entries(attributes).forEach(([key, val]) => {
            el.setAttribute(key, val);
        });
    }
    return el;
}

export function createHtmlVideo(videoUrl, posterUrl, videoUrl2, posterUrl2) {
    const video = document.createElement('video');
    const baseUrl = window.location.origin;
    video.classList.add('lazy-video');
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', true);
    video.setAttribute('loop', true);

    // TODO: Add video fallback formats
    // TODO: Add video pause for accessibility
    if (window.innerWidth >= 768 && videoUrl2) {
        const source2 = document.createElement('source');
        source2.setAttribute('data-src', baseUrl + '/' + videoUrl2);
        source2.setAttribute('type', 'video/webm');
        if (posterUrl2) {
            video.setAttribute('poster', baseUrl + '/' + posterUrl2);
        }
        video.append(source2);
    } else {
        const source = document.createElement('source');
        source.setAttribute('data-src', baseUrl + '/' + videoUrl);
        source.setAttribute('type', 'video/webm');
        if (posterUrl) {
            video.setAttribute('poster', baseUrl + '/' + posterUrl);
        }
        video.append(source);
    }

    return video;
}