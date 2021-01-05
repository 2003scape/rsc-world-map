const PointElements = require('./point-elements');
const fs = require('fs');

const STONE_IMAGE = fs.readFileSync('./res/stone-background.png');

const BUTTON_STYLES = {
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

const BOX_STYLES = {
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

const LIST_STYLES = { padding: 0, margin: 0 };

const LABEL_STYLES = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    cursor: 'pointer'
};

const POINT_IMAGE_STYLES = {
    display: 'inline-flex',
    flexShrink: 0,
    marginLeft: '2px',
    marginRight: '4px'
};

const HEADER_STYLES = {
    margin: '2px 0 2px 0',
    fontSize: '14px',
    textAlign: 'center'
};

class KeyElements {
    constructor(worldMap) {
        this.container = worldMap.container;
        this.planeWrap = worldMap.planeWrap;
        this.labelWrap = worldMap.labelWrap;
        this.objectCanvas = worldMap.objectCanvas;

        this.open = false;

        this.showLabels = true;
        this.showObjects = true;

        // { type: Boolean } e.g. { altar: true, ... }
        this.toggledPoints = {};

        // the "Key" button in the top right corner, used to toggle the
        // following box
        const button = document.createElement('button');
        Object.assign(button.style, BUTTON_STYLES);

        button.innerText = 'Key';
        button.title = 'Toggle points of interest.';

        // bordered black box wrapping the options and toggles
        const box = document.createElement('div');
        Object.assign(box.style, BOX_STYLES);

        // toggle the text labels
        box.appendChild(this.getHeader('Labels'));

        const labelsLabel = this.getLabel('toggle-labels');
        this.toggleLabels = document.createElement('input');

        this.toggleLabels.addEventListener(
            'click',
            () => {
                this.showLabels = !this.showLabels;

                this.labelWrap.style.display = this.showLabels
                    ? 'block'
                    : 'none';
            },
            false
        );

        this.toggleLabels.style.cursor = 'pointer';
        this.toggleLabels.id = 'toggle-labels';
        this.toggleLabels.type = 'checkbox';
        this.toggleLabels.checked = true;

        labelsLabel.appendChild(this.toggleLabels);
        labelsLabel.appendChild(document.createTextNode('\xa0Text'));

        box.appendChild(labelsLabel);

        const objectsLabel = this.getLabel('toggle-objects');
        this.toggleObjects = document.createElement('input');

        this.toggleObjects.addEventListener(
            'click',
            () => {
                this.showObjects = !this.showObjects;

                this.objectCanvas.style.display = this.showObjects
                    ? 'block'
                    : 'none';
            },
            false
        );

        this.toggleObjects.style.cursor = 'pointer';
        this.toggleObjects.id = 'toggle-objects';
        this.toggleObjects.type = 'checkbox';
        this.toggleObjects.checked = true;

        objectsLabel.appendChild(this.toggleObjects);
        objectsLabel.appendChild(document.createTextNode('\xa0Objects'));

        box.appendChild(objectsLabel);

        box.appendChild(this.getHeader('Points'));

        const keyList = document.createElement('ul');
        Object.assign(keyList.style, LIST_STYLES);

        const listEl = document.createElement('li');
        const pointLabel = this.getLabel('toggle-all');
        this.toggleAll = document.createElement('input');

        this.toggleAll.addEventListener(
            'click',
            () => {
                for (const type of Object.keys(
                    worldMap.pointElements.elements
                )) {
                    const toggled = !!this.toggleAll.checked;

                    this.toggledPoints[type] = toggled;
                    document.getElementById(`toggle-${type}`).checked = toggled;
                }

                this.refresh();
            },
            false
        );

        this.toggleAll.style.cursor = 'pointer';
        this.toggleAll.id = 'toggle-all';
        this.toggleAll.type = 'checkbox';
        this.toggleAll.checked = true;

        pointLabel.appendChild(this.toggleAll);
        pointLabel.appendChild(document.createTextNode('\xa0Select All'));

        listEl.appendChild(pointLabel);
        keyList.appendChild(listEl);

        for (const type of Object.keys(worldMap.pointElements.elements)) {
            this.toggledPoints[type] = true;

            const id = `toggle-${type}`;
            const listEl = document.createElement('li');
            const pointLabel = this.getLabel(id);
            const checkboxEl = document.createElement('input');

            checkboxEl.addEventListener(
                'click',
                () => {
                    this.toggledPoints[type] = !this.toggledPoints[type];
                    this.refresh();
                },
                false
            );

            checkboxEl.style.cursor = 'pointer';

            checkboxEl.type = 'checkbox';
            checkboxEl.id = id;
            checkboxEl.checked = this.toggledPoints[type];

            pointLabel.appendChild(checkboxEl);

            const pointImage = worldMap.pointElements.getPoint(type);
            Object.assign(pointImage.style, POINT_IMAGE_STYLES);

            pointLabel.htmlFor = id;

            pointLabel.appendChild(pointImage);

            pointLabel.appendChild(
                document.createTextNode(
                    ` ${PointElements.formatPointTitle(type)}`
                )
            );

            listEl.appendChild(pointLabel);
            keyList.appendChild(listEl);
        }

        box.appendChild(keyList);

        this.elements = { box, button };
    }

    getHeader(text) {
        const headerEl = document.createElement('h2');

        Object.assign(headerEl.style, HEADER_STYLES);
        headerEl.innerText = text;

        return headerEl;
    }

    getLabel(htmlFor) {
        const labelEl = document.createElement('label');

        Object.assign(labelEl.style, LABEL_STYLES);
        labelEl.htmlFor = htmlFor;

        return labelEl;
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
                const { box, button } = this.elements;

                this.open = !this.open;

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

        for (const toggled of Object.values(this.toggledPoints)) {
            if (!toggled) {
                allToggled = false;
                break;
            }
        }

        for (const child of this.planeWrap.children) {
            const type = child.dataset.pointType;

            if (type) {
                child.style.display = this.toggledPoints[type]
                    ? 'flex'
                    : 'none';
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
