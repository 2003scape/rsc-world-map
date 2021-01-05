const fs = require('fs');

const STONE_IMAGE = fs.readFileSync('./res/stone-background.png');

const BUTTON_STYLES = {
    opacity: 0.6,
    boxSizing: 'border-box',
    outline: '2px solid #000',
    border: '3px outset #373737',
    fontSize: '12px',
    textAlign: 'center',
    height: '36px',
    cursor: 'pointer',
    color: '#fff',
    position: 'absolute',
    margin: 0,
    padding: 0,
    backgroundImage: `url(data:image/png;base64,${STONE_IMAGE.toString(
        'base64'
    )})`
};

function getButton(text, title) {
    const buttonEl = document.createElement('button');

    buttonEl.innerText = text;

    if (title) {
        buttonEl.title = title;
    }

    Object.assign(buttonEl.style, BUTTON_STYLES);

    buttonEl.addEventListener(
        'mouseover',
        () => {
            buttonEl.style.opacity = 1;
        },
        false
    );

    buttonEl.addEventListener(
        'mouseleave',
        () => {
            buttonEl.style.opacity = 0.6;
        },
        false
    );

    return buttonEl;
}

module.exports = { getButton };
