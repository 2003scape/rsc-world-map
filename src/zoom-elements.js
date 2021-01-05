const { getButton } = require('./button-element');

class ZoomElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = this.worldMap.container;

        const zoomIn = getButton('+', 'Zoom in.');
        const zoomOut = getButton('-', 'Zoom out.');

        zoomIn.addEventListener('click', () => {
            worldMap.zoom(1);
        }, false);

        zoomOut.addEventListener('click', () => {
            worldMap.zoom(0);
        }, false);

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
