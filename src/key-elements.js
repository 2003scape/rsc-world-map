const PointElements = require('./point-elements');
const { getButton } = require('./button-element');

const BOX_STYLES = {
    backgroundColor: '#000',
    border: '2px solid #fff',
    boxSizing: 'border-box',
    boxShadow: '4px 4px 8px #222',
    outline: '2px solid #000',
    width: '50%',
    height: '80%',
    position: 'absolute',
    top: '10%',
    left: '25%',
    display: 'none',
    overflowY: 'scroll',
    padding: '4px',
    fontSize: '13px',
    zIndex: 1
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
        this.worldMap = worldMap;
        this.container = this.worldMap.container;
        this.planeWrap = this.worldMap.planeWrap;
        this.objectCanvas = this.worldMap.objectCanvas;

        this.open = false;

        this.showLabels = true;
        this.showObjects = true;

        // { type: Boolean } e.g. { altar: true, ... }
        this.toggledPoints = {};

        // the "Key" button in the top right corner, used to toggle the
        // following box
        const button = getButton('Key', 'Toggle key points of interest.');
        button.style.width = '43px';
        button.style.top = '16px';
        button.style.right = '16px';

        // bordered black box wrapping the options and toggles
        const box = document.createElement('div');
        Object.assign(box.style, BOX_STYLES);
        box.tabIndex = 0;

        // toggle the text labels
        box.appendChild(this.getHeader('Display'));

        const labelsLabel = this.getLabel('toggle-labels');
        const toggleLabels = document.createElement('input');

        toggleLabels.addEventListener(
            'click',
            () => {
                this.showLabels = !this.showLabels;
                this.refreshLabels();
            },
            false
        );

        toggleLabels.style.cursor = 'pointer';
        toggleLabels.id = 'toggle-labels';
        toggleLabels.type = 'checkbox';
        toggleLabels.checked = true;

        labelsLabel.appendChild(toggleLabels);
        labelsLabel.appendChild(document.createTextNode('\xa0Text'));

        box.appendChild(labelsLabel);

        const objectsLabel = this.getLabel('toggle-objects');
        const toggleObjects = document.createElement('input');

        toggleObjects.addEventListener(
            'click',
            () => {
                this.showObjects = !this.showObjects;

                this.objectCanvas.style.display = this.showObjects
                    ? 'block'
                    : 'none';
            },
            false
        );

        toggleObjects.style.cursor = 'pointer';
        toggleObjects.id = 'toggle-objects';
        toggleObjects.type = 'checkbox';
        toggleObjects.checked = true;

        objectsLabel.appendChild(toggleObjects);
        objectsLabel.appendChild(document.createTextNode('\xa0Objects'));

        box.appendChild(objectsLabel);
        box.appendChild(this.getHeader('Points'));

        const keyList = document.createElement('ul');
        Object.assign(keyList.style, LIST_STYLES);

        const listEl = document.createElement('li');
        const pointLabel = this.getLabel('toggle-all');
        const toggleAll = document.createElement('input');

        toggleAll.addEventListener(
            'click',
            () => {
                for (const type of Object.keys(
                    this.worldMap.pointElements.elements
                )) {
                    const toggled = !!toggleAll.checked;

                    this.toggledPoints[type] = toggled;
                    document.getElementById(`toggle-${type}`).checked = toggled;
                }

                this.refreshPoints();
            },
            false
        );

        toggleAll.style.cursor = 'pointer';
        toggleAll.id = 'toggle-all';
        toggleAll.type = 'checkbox';
        toggleAll.checked = true;

        pointLabel.appendChild(toggleAll);
        pointLabel.appendChild(document.createTextNode('\xa0Select All'));

        listEl.appendChild(pointLabel);
        keyList.appendChild(listEl);

        for (const type of Object.keys(this.worldMap.pointElements.elements)) {
            this.toggledPoints[type] = true;

            const id = `toggle-${type}`;
            const listEl = document.createElement('li');
            const pointLabel = this.getLabel(id);
            const checkboxEl = document.createElement('input');

            checkboxEl.addEventListener(
                'click',
                () => {
                    this.toggledPoints[type] = !this.toggledPoints[type];
                    this.refreshPoints();
                },
                false
            );

            checkboxEl.style.cursor = 'pointer';

            checkboxEl.type = 'checkbox';
            checkboxEl.id = id;
            checkboxEl.checked = this.toggledPoints[type];

            pointLabel.appendChild(checkboxEl);

            const pointImage = this.worldMap.pointElements.getPoint(type);
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

        this.elements = { box, button, toggleAll };
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
            'click',
            () => {
                const { box, button } = this.elements;

                this.open = !this.open;
                this.worldMap.lockMap = this.open;

                box.style.display = this.open ? 'block' : 'none';
                button.style.opacity = this.open ? 1 : 0.6;
                button.style.fontWeight = this.open ? 'bold' : 'inherit';
                this.container.style.cursor = this.open ? 'inherit' : 'grab';
            },
            false
        );
    }

    refreshPoints() {
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

        this.elements.toggleAll.checked = allToggled;
    }

    refreshLabels() {
        for (const child of this.planeWrap.children) {
            if (child.tagName === 'SPAN') {
                child.style.display = this.showLabels ? 'block' : 'none';
            }
        }
    }

    init() {
        this.attachHandlers();

        this.container.appendChild(this.elements.button);
        this.container.appendChild(this.elements.box);
    }
}

module.exports = KeyElements;
