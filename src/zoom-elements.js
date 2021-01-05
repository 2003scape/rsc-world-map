const { getButton } = require('./button-element');

class ZoomElements {
    constructor({ container }) {
        this.container = container;

        const zoomIn = getButton('+', 'Zoom in.');
        const zoomOut = getButton('-', 'Zoom out.');

        zoomIn.style.width = '32px';
        zoomIn.style.bottom = '16px';
        zoomIn.style.right = '58px';

        zoomOut.style.width = '32px';
        zoomOut.style.bottom = '16px';
        zoomOut.style.right = '16px';

        this.elements = { zoomIn, zoomOut };
    }

    init() {
        this.container.appendChild(this.elements.zoomIn);
        this.container.appendChild(this.elements.zoomOut);
    }
}

module.exports = ZoomElements;
