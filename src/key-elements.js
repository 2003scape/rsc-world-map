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

const POINT_IMAGE_STYLES = {
    display: 'inline-flex',
    flexShrink: 0,
    marginLeft: '2px'
};

class KeyElements {
    constructor({ container, planeWrap, pointElements }) {
        this.container = container;
        this.planeWrap = planeWrap;

        this.open = false;
        this.toggled = {};

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

        const pointLabel = document.createElement('label');
        pointLabel.htmlFor = 'toggle-all';

        this.toggleAll = document.createElement('input');

        this.toggleAll.addEventListener('click', () => {
            for (const type of Object.keys(pointElements.elements)) {
                const toggled = !!this.toggleAll.checked;
                this.toggled[type] = toggled;
                document.getElementById(`toggle-${type}`).checked = toggled;
            }

            this.refresh();
        }, false);

        this.toggleAll.style.cursor = 'pointer';
        this.toggleAll.id = 'toggle-all';
        this.toggleAll.type = 'checkbox';
        this.toggleAll.checked = true;

        pointLabel.appendChild(this.toggleAll);
        pointLabel.appendChild(document.createTextNode('\xa0Select All'));

        liEl.appendChild(pointLabel);
        keyList.appendChild(liEl);

        for (const type of Object.keys(pointElements.elements)) {
            this.toggled[type] = true;

            const id = `toggle-${type}`;

            const liEl = document.createElement('li');
            Object.assign(liEl.style, KEY_ITEM_STYLES);

            const pointLabel = document.createElement('label');

            pointLabel.style.cursor = 'pointer';
            pointLabel.htmlFor = id;

            const checkboxEl = document.createElement('input');

            checkboxEl.addEventListener('click', () => {
                this.toggled[type] = !this.toggled[type];
                this.refresh();
            }, false);

            checkboxEl.style.cursor = 'pointer';
            checkboxEl.type = 'checkbox';
            checkboxEl.id = id;
            checkboxEl.checked = this.toggled[type];

            pointLabel.appendChild(checkboxEl);

            const pointImage = pointElements.getPoint(type);
            Object.assign(pointImage.style, POINT_IMAGE_STYLES);

            pointLabel.htmlFor = id;

            pointLabel.appendChild(pointImage);

            pointLabel.appendChild(
                document.createTextNode(
                    ` ${PointElements.formatPointTitle(type)}`
                )
            );

            liEl.appendChild(pointLabel);
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

                const { box, button } = this.elements;

                box.style.display = this.open ? 'block' : 'none';
                button.style.opacity = this.open ? 1 : 0.6;
                button.style.fontWeight = this.open ? 'bold' : 'inherit';

                this.container.style.cursor = this.open ? 'inherit' : 'grab';
            },
            false
        );
    }

    refresh() {
        let allToggled = true;

        for (const toggled of Object.values(this.toggled)) {
            if (!toggled) {
                allToggled = false;
                break;
            }
        }

        for (const child of this.planeWrap.children) {
            const type = child.dataset.pointType;

            if (type) {
                child.style.display = this.toggled[type] ? 'flex' : 'none';
            }
        }

        this.toggleAll.checked = allToggled;
    }

    init() {
        this.attachHandlers();

        this.container.appendChild(this.elements.button);
        this.container.appendChild(this.elements.box);
    }
}

module.exports = KeyElements;
