// +/- buttons to zoom in and out

const { getButton, enableButton, disableButton } = require('./button-element');

const ZOOM_IN_STYLES = { width: '32px', bottom: '16px', right: '58px' };
const ZOOM_OUT_STYLES = { width: '32px', bottom: '16px', right: '16px' };

const ZOOM_SCALES = {
    '-1': 0.5,
    0: 1,
    1: 2,
    2: 4
};

class ZoomElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = this.worldMap.container;

        // current zoom level (-2, 0, +2)
        this.level = 0;
        this.scale = 1;

        this.mouseDown = false;

        const zoomIn = getButton('+', 'Zoom in.');
        Object.assign(zoomIn.style, ZOOM_IN_STYLES);

        const zoomOut = getButton('-', 'Zoom out.');
        Object.assign(zoomOut.style, ZOOM_OUT_STYLES);

        const lockMapDrag = () => {
            this.mouseDown = true;
            this.worldMap.draggable.lock = true;
        };

        const unlockMapDrag = () => {
            if (this.mouseDown) {
                this.mouseDown = false;
                this.worldMap.draggable.lock = false;
            }
        };

        zoomIn.addEventListener('mousedown', lockMapDrag, false);
        zoomOut.addEventListener('mousedown', lockMapDrag, false);

        window.addEventListener('mouseup', unlockMapDrag, false);

        zoomIn.addEventListener(
            'click',
            () => {
                if (this.level >= 2) {
                    return;
                }

                const { next } = this.worldMap.searchElements.elements;

                lockMapDrag();
                disableButton(next);
                disableButton(zoomOut);
                disableButton(zoomIn);

                const toLevel = this.level + 1;

                this.animateZoom(toLevel, true).then(() => {
                    this.zoom(toLevel);

                    unlockMapDrag();
                    enableButton(next);
                    enableButton(zoomOut);

                    if (this.level < 2) {
                        enableButton(zoomIn);
                    }
                });
            },
            false
        );

        zoomOut.addEventListener(
            'click',
            () => {
                if (this.level <= -1) {
                    return;
                }

                const { next } = this.worldMap.searchElements.elements;

                lockMapDrag();
                disableButton(next);
                disableButton(zoomOut);
                disableButton(zoomIn);

                const toLevel = this.level - 1;

                this.animateZoom(toLevel, false).then(() => {
                    this.zoom(toLevel);

                    unlockMapDrag();
                    enableButton(next);
                    enableButton(zoomIn);

                    if (this.level > -1) {
                        enableButton(zoomOut);
                    }
                });
            },
            false
        );

        this.elements = { zoomIn, zoomOut };
    }

    animateZoom(zoomLevel, isZoomIn = true) {
        const scale = ZOOM_SCALES[zoomLevel] / this.scale;

        return new Promise((resolve) => {
            const { planeWrap } = this.worldMap;

            const offsetX =
                -this.worldMap.draggable.mapRelativeX +
                this.container.clientWidth / 2;

            const offsetY =
                -this.worldMap.draggable.mapRelativeY +
                this.container.clientHeight / 2;

            const oldOrigin = planeWrap.style.transformOrigin;
            planeWrap.style.transformOrigin = `${offsetX}px ${offsetY}px`;

            planeWrap.style.transition = `transform 0.3s ease-${
                isZoomIn ? 'in' : 'out'
            }`;

            const oldTransform = planeWrap.style.transform;
            planeWrap.style.transform = `${oldTransform} scale(${scale})`;

            console.log(`${oldTransform} scale(${scale})`);

            setTimeout(() => {
                planeWrap.transformOrigin = oldOrigin;
                planeWrap.style.transition = '';
                planeWrap.style.transform = oldTransform;
                resolve();
            }, 300);
        });
    }

    zoom(zoomLevel) {
        const scale = ZOOM_SCALES[zoomLevel];
        const transform = `scale(${scale})`;

        this.worldMap.planeWrap.style.transition = '';

        // scale the entire map image, but not the points or text labels:
        this.worldMap.planeImage.style.transform = transform;
        this.worldMap.entityCanvas.elements.canvas.style.transform = transform;

        const {
            width,
            height
        } = this.worldMap.planeImage.getBoundingClientRect();

        Object.assign(this.worldMap.planeWrap.style, {
            width: `${width}px`,
            height: `${height}px`
        });

        // move text labels and points to match up with the new zoomed-in image:
        const translateScale = scale / this.scale;
        const draggable = this.worldMap.draggable;

        draggable.mapRelativeX *= translateScale;
        draggable.mapRelativeY *= translateScale;

        if (zoomLevel > this.level) {
            draggable.mapRelativeX -=
                this.worldMap.container.clientWidth / translateScale;

            draggable.mapRelativeY -=
                this.worldMap.container.clientHeight / translateScale;
        } else if (zoomLevel < this.level) {
            draggable.mapRelativeX +=
                (this.worldMap.container.clientWidth * translateScale) / 2;

            draggable.mapRelativeY +=
                (this.worldMap.container.clientHeight * translateScale) / 2;
        }

        for (const child of this.worldMap.planeWrap.children) {
            if (child.tagName === 'IMG' || child.tagName === 'CANVAS') {
                continue;
            }

            const x = Number(child.dataset.x);
            const y = Number(child.dataset.y);

            child.style.left = `${x * scale}px`;
            child.style.top = `${y * scale}px`;
            child.style.margin = '';
            child.style.transform = '';

            if (child.tagName === 'SPAN') {
                child.style.width = 'auto';
                child.style.textShadow = '1px 1px #000';
            }

            if (zoomLevel === -1) {
                child.style.transform = transform;
                child.style.textShadow = '';
            } else if (zoomLevel === 1 || zoomLevel === 2) {
                let offsetX = 0;
                let offsetY = 0;

                if (child.tagName === 'SPAN') {
                    const { width, height } = child.getBoundingClientRect();

                    if (child.style.textAlign === 'center') {
                        offsetX = zoomLevel === 1 ? width / 2 : width * 1.5;
                    }

                    offsetY = zoomLevel === 1 ? height / 2 : height * 1.5;
                } else if (child.tagName === 'DIV') {
                    offsetX += zoomLevel === 1 ? 7.5 : 22.5;
                    offsetY += zoomLevel === 1 ? 7.5 : 22.5;
                }

                child.style.margin = `${offsetY}px 0 0 ${offsetX}px`;
            }
        }

        this.level = zoomLevel;
        this.scale = scale;

        this.worldMap.scrollMap();
        this.worldMap.overviewElements.refreshSelection();
    }

    init() {
        this.container.appendChild(this.elements.zoomIn);
        this.container.appendChild(this.elements.zoomOut);
    }
}

module.exports = ZoomElements;
