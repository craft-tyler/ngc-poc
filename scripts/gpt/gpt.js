const gpt = ({ detail }) => {
    const sk = detail.data;
    // your custom code from button.action goes here

    console.log('winner winner chicken dinner');
};

const sk = document.querySelector('helix-sidekick');
if (sk) {
    // sidekick already loaded
    sk.addEventListener('custom:gpt', gpt);
} else {
    // wait for sidekick to be loaded
    document.addEventListener('sidekick-ready', () => {
        document.querySelector('helix-sidekick')
            .addEventListener('custom:gpt', gpt);
    }, { once: true });
}

return sk;