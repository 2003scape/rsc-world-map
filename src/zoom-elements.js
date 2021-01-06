const { getButton, enableButton, disableButton } = require('./button-element');

const ZOOM_IN_STYLES = { width: '32px', bottom: '16px', right: '58px' };
const ZOOM_OUT_STYLES = { width: '32px', bottom: '16px', right: '16px' };

class ZoomElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = this.worldMap.container;

        const zoomIn = getButton('+', 'Zoom in.');
        Object.assign(zoomIn.style, ZOOM_IN_STYLES);

        const zoomOut = getButton('-', 'Zoom out.');
        Object.assign(zoomOut.style, ZOOM_OUT_STYLES);

        zoomIn.addEventListener(
            'click',
            () => {
                if (this.worldMap.zoomLevel >= 1) {
                    return;
                }

                this.worldMap.zoom(this.worldMap.zoomLevel + 1);
                enableButton(zoomOut);

                if (this.worldMap.zoomLevel >= 1) {
                    disableButton(zoomIn);
                }
            },
            false
        );

        zoomOut.addEventListener(
            'click',
            () => {
                if (this.worldMap.zoomLevel <= -1) {
                    return;
                }

                this.worldMap.zoom(this.worldMap.zoomLevel - 1);
                enableButton(zoomIn);

                if (this.worldMap.zoomLevel <= -1) {
                    disableButton(zoomOut);
                }
            },
            false
        );

        this.elements = { zoomIn, zoomOut };
    }

    init() {
        this.container.appendChild(this.elements.zoomIn);
        this.container.appendChild(this.elements.zoomOut);
    }
}

module.exports = ZoomElements;
