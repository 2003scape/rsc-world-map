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

function getMousePosition(container, event) {
    event = event.touches ? event.touches[0] : event;
    const rect = container.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

class ZoomElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = this.worldMap.container;

        // current zoom level (-1, 0, +2)
        this.level = 0;
        this.scale = 1;

        this.mouseDown = false;

        const zoomIn = getButton('+', 'Zoom in.');
        Object.assign(zoomIn.style, ZOOM_IN_STYLES);

        const zoomOut = getButton('-', 'Zoom out.');
        Object.assign(zoomOut.style, ZOOM_OUT_STYLES);

        const lockMapDrag = () => {
            this.mouseDown = true;
            this.worldMap.lockDrag();
        };

        const unlockMapDrag = () => {
            if (this.mouseDown) {
                this.mouseDown = false;
                this.worldMap.unlockDrag();
            }
        };

        zoomIn.addEventListener('mousedown', lockMapDrag, false);
        zoomOut.addEventListener('mousedown', lockMapDrag, false);
        window.addEventListener('mouseup', unlockMapDrag, false);

        const handleZoomIn = (x, y) => {
            if (this.level >= 2) {
                return;
            }

            const toLevel = this.level + 1;
            const { next } = this.worldMap.searchElements.elements;

            this.lockButtons();
            lockMapDrag();
            disableButton(next);

            this.animateZoom(toLevel, true, x, y).then(() => {
                this.zoom(toLevel, x, y);
                this.unlockButtons();
                enableButton(next);
                unlockMapDrag();
            });
        };

        zoomIn.addEventListener('click', handleZoomIn, false);

        const handleZoomOut = (x, y) => {
            if (this.level <= -1) {
                return;
            }

            const toLevel = this.level - 1;
            const { next } = this.worldMap.searchElements.elements;

            this.lockButtons();
            lockMapDrag();
            disableButton(next);

            this.animateZoom(toLevel, false, x, y).then(() => {
                this.zoom(toLevel, x, y);
                this.unlockButtons();
                enableButton(next);
                unlockMapDrag();
            });
        };

        zoomOut.addEventListener('click', handleZoomOut, false);

        this.container.addEventListener(
            'wheel',
            (event) => {
                event.preventDefault();

                if (this.locked) {
                    return;
                }

                const { x, y } = getMousePosition(this.container, event);

                if (event.deltaY > 0) {
                    handleZoomOut(x, y);
                } else {
                    handleZoomIn(x, y);
                }
            },
            false
        );

        this.elements = { zoomIn, zoomOut };
    }

    animateZoom(zoomLevel, isZoomIn = true, offsetX, offsetY) {
        if (typeof offsetX !== 'number') {
            offsetX = this.worldMap.container.clientWidth / 2;
        }

        if (typeof offsetY !== 'number') {
            offsetY = this.worldMap.container.clientHeight / 2;
        }

        const scale = ZOOM_SCALES[zoomLevel] / this.scale;

        return new Promise((resolve) => {
            const { planeWrap } = this.worldMap;

            offsetX = -this.worldMap.draggable.mapRelativeX + offsetX;
            offsetY = -this.worldMap.draggable.mapRelativeY + offsetY;

            if (this.worldMap.transitions) {
                const oldOrigin = planeWrap.style.transformOrigin;
                planeWrap.style.transformOrigin = `${offsetX}px ${offsetY}px`;

                planeWrap.style.transition = `transform 0.3s ease-${
                    isZoomIn ? 'in' : 'out'
                }`;

                setTimeout(() => {
                    planeWrap.transformOrigin = oldOrigin;
                    planeWrap.style.transition = '';
                    planeWrap.style.transform = oldTransform;
                    resolve();
                }, 300);
            }

            const oldTransform = planeWrap.style.transform;
            planeWrap.style.transform = `${oldTransform} scale(${scale})`;
        });
    }

    zoom(zoomLevel, offsetX, offsetY) {
        if (typeof offsetX !== 'number') {
            offsetX = this.worldMap.container.clientWidth / 2;
        }

        if (typeof offsetY !== 'number') {
            offsetY = this.worldMap.container.clientHeight / 2;
        }

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
            draggable.mapRelativeX -= (offsetX * 2) / translateScale;
            draggable.mapRelativeY -= (offsetY * 2) / translateScale;
        } else if (zoomLevel < this.level) {
            draggable.mapRelativeX += (offsetX * translateScale);
            draggable.mapRelativeY += (offsetY * translateScale);
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

    lockButtons() {
        this.locked = true;

        disableButton(this.elements.zoomIn);
        disableButton(this.elements.zoomOut);
    }

    unlockButtons() {
        this.locked = false;

        if (this.level < 2) {
            enableButton(this.elements.zoomIn);
        }

        if (this.level > -1) {
            enableButton(this.elements.zoomOut);
        }
    }

    init() {
        this.container.appendChild(this.elements.zoomIn);
        this.container.appendChild(this.elements.zoomOut);
    }
}

module.exports = ZoomElements;
