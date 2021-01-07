const { getBox } = require('./box-element');

const BOX_STYLES = {
    width: '50%',
    height: '50%',
    top: '25%',
    left: '25%',
    display: 'block'
};

class OverviewElements {
    constructor({ container }) {
        this.container = container;

        const box = getBox();
        Object.assign(box.style, BOX_STYLES);

        this.elements = { box };
    }

    init() {
        this.container.appendChild(this.elements.box);
    }
}

module.exports = OverviewElements;
