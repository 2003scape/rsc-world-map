const PointElements = require('./point-elements');
const fs = require('fs');

const STONE_IMAGE = fs.readFileSync('./res/stone-background.png');

const KEY_BUTTON_STYLES = {
    opacity: 0.6,
    boxSizing: 'border-box',
    outline: '2px solid #000',
    border: '3px outset #373737',
    fontSize: '12px',
    width: '43px',
    height: '36px',
    cursor: 'pointer',
    color: '#fff',
    position: 'absolute',
    top: '16px',
    right: '16px',
    margin: 0,
    padding: 0,
    backgroundImage: `url(data:image/png;base64,${STONE_IMAGE.toString(
        'base64'
    )})`
};

const KEY_BOX_STYLES = {
    backgroundColor: '#000',
    border: '2px solid #fff',
    boxSizing: 'border-box',
    outline: '2px solid #000',
    width: '50%',
    height: '80%',
    position: 'absolute',
    top: '10%',
    left: '25%',
    display: 'none',
    overflowY: 'scroll',
    padding: '4px',
    fontSize: '13px'
};

const KEY_LIST_STYLES = { padding: 0, margin: 0 };

const KEY_ITEM_STYLES = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px'
};

const KEY_LABEL_STYLES = {
    cursor: 'pointer',
    width: '100%'
};

const POINT_IMAGE_STYLES = {
    display: 'inline-flex',
    flexShrink: 0,
    marginLeft: '2px'
};

class KeyElements {
    constructor({ container, pointElements }) {
        this.container = container;
        this.open = false;

        const button = document.createElement('button');
        Object.assign(button.style, KEY_BUTTON_STYLES);

        button.innerText = 'Key';
        button.title = 'Toggle points of interest.';

        const box = document.createElement('div');
        Object.assign(box.style, KEY_BOX_STYLES);

        const keyList = document.createElement('ul');
        Object.assign(keyList.style, KEY_LIST_STYLES);

        const liEl = document.createElement('li');
        Object.assign(liEl.style, KEY_ITEM_STYLES);

        const checkboxEl = document.createElement('input');
        checkboxEl.style.cursor = 'pointer';
        checkboxEl.id = 'toggle-all';
        checkboxEl.type = 'checkbox';
        liEl.appendChild(checkboxEl);

        const pointLabel = document.createElement('label');
        Object.assign(pointLabel, KEY_LABEL_STYLES);

        pointLabel.htmlFor = 'toggle-all';
        pointLabel.innerText = '\xa0Select All';

        liEl.appendChild(pointLabel);
        keyList.appendChild(liEl);

        for (const type of Object.keys(pointElements.elements)) {
            const id = `toggle-${type}`;

            const liEl = document.createElement('li');
            Object.assign(liEl.style, KEY_ITEM_STYLES);

            const checkboxEl = document.createElement('input');
            checkboxEl.style.cursor = 'pointer';
            checkboxEl.id = id;
            checkboxEl.type = 'checkbox';
            liEl.appendChild(checkboxEl);

            const wrapEl = document.createElement('div');

            const pointImage = pointElements.getPoint(type);
            Object.assign(pointImage.style, POINT_IMAGE_STYLES);

            const pointLabel = document.createElement('label');
            Object.assign(pointLabel.style, KEY_LABEL_STYLES);

            pointLabel.htmlFor = id;
            pointLabel.innerText = ` ${PointElements.formatPointTitle(type)}`;

            wrapEl.appendChild(pointImage);
            wrapEl.appendChild(pointLabel);
            liEl.appendChild(wrapEl);

            keyList.appendChild(liEl);
        }

        box.appendChild(keyList);

        this.elements = { box, button };
    }

    attachHandlers() {
        this.elements.button.addEventListener(
            'mouseover',
            () => {
                this.elements.button.style.opacity = 1;
            },
            false
        );

        this.elements.button.addEventListener(
            'mouseleave',
            () => {
                if (!this.open) {
                    this.elements.button.style.opacity = 0.6;
                }
            },
            false
        );

        this.elements.button.addEventListener(
            'click',
            () => {
                this.open = !this.open;
                this.elements.box.style.display = this.open ? 'block' : 'none';

                this.elements.button.style.opacity = this.open ? 1 : 0.6;
                this.elements.button.style.fontWeight = this.open
                    ? 'bold'
                    : 'inherit';

                this.container.style.cursor = this.open ? 'inherit' : 'grab';
            },
            false
        );
    }

    init() {
        this.attachHandlers();

        this.container.appendChild(this.elements.button);
        this.container.appendChild(this.elements.box);
    }
}

module.exports = KeyElements;
