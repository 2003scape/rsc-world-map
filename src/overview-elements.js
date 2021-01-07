const { getBox } = require('./box-element');
const { getButton } = require('./button-element');

const BUTTON_STYLES = {
    width: '78px',
    top: '16px',
    left: '16px'
};

const BOX_STYLES = {
    width: '50%',
    height: '50%',
    top: '25%',
    left: '25%'
};

class OverviewElements {
    constructor({ container }) {
        this.container = container;

        const button = getButton('Overview', 'Show the minimap overview.');
        Object.assign(button.style, BUTTON_STYLES);

        const box = getBox();
        Object.assign(box.style, BOX_STYLES);

        this.elements = { button, box };
    }

    init() {
        this.container.appendChild(this.elements.button);
        this.container.appendChild(this.elements.box);
    }
}

module.exports = OverviewElements;
