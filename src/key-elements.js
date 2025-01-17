const PointElements = require('./point-elements');
const { getBox } = require('./box-element');
const { getButton } = require('./button-element');

const BUTTON_STYLES = {
    width: '43px',
    top: '16px',
    right: '16px'
};

const BOX_STYLES = {
    width: '180px',
    height: '80%',
    top: '10%',
    left: 'calc(50% - 90px)',
    overflowY: 'scroll',
    zIndex: 2
};

const LIST_STYLES = { padding: 0, margin: 0 };

const LABEL_STYLES = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    cursor: 'pointer',
    textAlign: 'left'
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
        this.entityCanvas = this.worldMap.entityCanvas.elements.canvas;

        this.open = false;

        this.showLabels = true;
        this.showObjects = true;

        this.isMouseDown = false;

        // { type: Boolean } e.g. { altar: true, ... }
        this.toggledPoints = {};

        const lockMapDrag = () => {
            this.isMouseDown = true;
            this.worldMap.lockDrag();
        };

        const unlockMapDrag = () => {
            if (!this.open && this.isMouseDown) {
                this.isMouseDown = false;
                this.worldMap.unlockDrag();
            }
        };

        // the "Key" button in the top right corner, used to toggle the
        // following box
        const button = getButton('Key', 'Toggle key points of interest.');
        Object.assign(button.style, BUTTON_STYLES);

        button.addEventListener('mousedown', lockMapDrag, false);

        button.addEventListener(
            'click',
            () => {
                this.open = !this.open;

                if (this.open) {
                    this.worldMap.lockDrag();
                } else {
                    this.worldMap.unlockDrag();
                }

                box.style.display = this.open ? 'block' : 'none';
                button.style.opacity = this.open ? 1 : 0.6;
                button.style.fontWeight = this.open ? 'bold' : 'inherit';
            },
            false
        );

        // bordered black box wrapping the options and toggles
        const box = getBox();
        Object.assign(box.style, BOX_STYLES);

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

                this.entityCanvas.style.display = this.showObjects
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

                    if (toggled) {
                        this.worldMap.pointElements.clearHighlighted();
                    }

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
                    const isToggled = !this.toggledPoints[type];
                    this.toggledPoints[type] = isToggled;
                    this.refreshPoints();

                    if (isToggled) {
                        this.worldMap.pointElements.highlight(type);
                    }
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

        window.addEventListener('mouseup', unlockMapDrag, false);

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

    refreshPoints() {
        let allToggled = true;

        for (const toggled of Object.values(this.toggledPoints)) {
            if (!toggled) {
                allToggled = false;
                break;
            }
        }

        for (const child of this.planeWrap.querySelectorAll('div')) {
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
        for (const child of this.planeWrap.querySelectorAll('span')) {
            child.style.display = this.showLabels ? 'block' : 'none';
        }
    }

    init() {
        this.container.appendChild(this.elements.button);
        this.container.appendChild(this.elements.box);
    }
}

module.exports = KeyElements;
