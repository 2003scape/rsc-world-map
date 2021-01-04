const fs = require('fs');
const defaultLabels = require('../res/labels');

const PLANE_IMAGES = [
    fs.readFileSync('./res/plane-0.png'),
    fs.readFileSync('./res/plane-1.png'),
    fs.readFileSync('./res/plane-2.png'),
    fs.readFileSync('./res/plane-3.png')
];

const IMAGE_WIDTH = 2448;
const IMAGE_HEIGHT = 2736;

const MIN_REGION_X = 48;
const MIN_REGION_Y = 37;

const SECTOR_WIDTH = 48;
const SECTOR_HEIGHT = 48;

const TILE_SIZE = 3;

class WorldMap {
    constructor({ container, labels }) {
        this.container = container;
        this.labels = labels || defaultLabels;

        this.mouseDown = false;

        // the top and left px of the planewrap element
        this.mapRelativeX = -1932;
        this.mapRelativeY = -1816;

        // timestamp of when we first clicked
        this.startTime = 0;

        // the mapRelative positions when we first click
        this.startMapY = -1;
        this.startMapX = -1;

        // the relative mouse positions (from the container element) when first
        // clicked
        this.startMouseX = -1;
        this.startMouseY = -1;

        // is the map moving?
        this.mapMoving = false;

        // when the map transition ends
        this.mapAnimateUntil = 0;

        this.container.style.backgroundColor = '#24407f';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.userSelect = 'none';
        this.container.style.cursor = 'grab';

        this.planeWrap = document.createElement('div');
        this.planeWrap.style.position = 'absolute';

        this._scrollMap = this.scrollMap.bind(this);
    }

    loadImages() {
        return new Promise((resolve, reject) => {
            let loaded = 0;

            this.planeImages = PLANE_IMAGES.map((image) => {
                const imageEl = new Image();
                imageEl.onerror = reject;

                imageEl.onload = () => {
                    loaded += 1;

                    if (loaded === PLANE_IMAGES.length) {
                        resolve();
                    }
                };

                imageEl.src = `data:image/png;base64,${image.toString(
                    'base64'
                )}`;

                imageEl.style.pointerEvents = 'none';
                imageEl.style.userSelect = 'none';

                return imageEl;
            });
        });
    }

    getMousePosition(event) {
        event = event.touches ? event.touches[0] : event;
        const rect = this.container.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    getScrollDistance() {
        return Math.sqrt(
            Math.pow(this.startMapX - this.mapRelativeX, 2) +
                Math.pow(this.startMapY - this.mapRelativeY, 2)
        );
    }

    getScrollDelta(distance) {
        const deltaX = (this.startMapX - this.mapRelativeX) / distance;
        const deltaY = (this.startMapY - this.mapRelativeY) / distance;

        return { deltaX, deltaY };
    }

    scrollMap() {
        if (this.mapRelativeX > 0) {
            this.mapRelativeX = 0;
        } else if (this.mapRelativeX < -IMAGE_WIDTH) {
            this.mapRelativeX = -IMAGE_WIDTH;
        }

        if (this.mapRelativeY > 0) {
            this.mapRelativeY = 0;
        } else if (this.mapRelativeY < -IMAGE_HEIGHT) {
            this.mapRelativeY = -IMAGE_HEIGHT;
        }

        const x = `${Math.floor(this.mapRelativeX)}px`;
        const y = `${Math.floor(this.mapRelativeY)}px`;

        this.planeWrap.style.transform = `translate(${x}, ${y})`;

        if (this.mapAnimateUntil < Date.now()) {
            this.planeWrap.style.transition = '';
        }

        if (!this.mouseDown) {
            return;
        }

        window.requestAnimationFrame(this._scrollMap);
    }

    attachHandlers() {
        const mouseDown = (event) => {
            if (this.mouseDown) {
                return;
            }

            if (this.mapAnimateUntil) {
                this.mapAnimateUntil = 0;
                this.planeWrap.style.transition = '';
            }

            this.mapMoving = true;
            this.mouseDown = true;
            this.container.style.cursor = 'grabbing';

            this.startTime = Date.now();
            this.startMapX = this.mapRelativeX;
            this.startMapY = this.mapRelativeY;

            const { x, y } = this.getMousePosition(event);

            this.startMouseX = x;
            this.startMouseY = y;

            this.scrollMap();
        };

        this.container.addEventListener('mousedown', mouseDown, false);
        this.container.addEventListener('touchstart', mouseDown, false);

        const mouseUp = () => {
            const time = Date.now() - this.startTime;
            const distance = this.getScrollDistance();

            if (distance) {
                const { deltaX, deltaY } = this.getScrollDelta(distance);
                //console.log(time, distance, deltaX, deltaY);

                if (time < 400 && distance > 75) {
                    const delay = 300 + time * 2;

                    this.planeWrap.style.transition = `transform 0.${delay}s cubic-bezier(0.61, 1, 0.88, 1)`;
                    this.mapAnimateUntil = Date.now() + delay;
                    this.mapRelativeX -= deltaX * distance;
                    this.mapRelativeY -= deltaY * distance;
                }
            }

            this.mouseDown = false;
            this.container.style.cursor = 'grab';
        };

        window.addEventListener('mouseup', mouseUp, false);
        window.addEventListener('touchend', mouseUp, false);

        const mouseMove = (event) => {
            if (!this.mouseDown) {
                return;
            }

            const { x, y } = this.getMousePosition(event);

            this.mapRelativeX = this.startMapX - (this.startMouseX - x);
            this.mapRelativeY = this.startMapY - (this.startMouseY - y);
        };

        window.addEventListener('mousemove', mouseMove, false);
        window.addEventListener('touchmove', mouseMove, false);
    }

    addLabels() {
        for (const label of this.labels) {
            let [x, y] = [label.x, label.y];

            x -= MIN_REGION_X * SECTOR_WIDTH * TILE_SIZE;
            y -= MIN_REGION_Y * SECTOR_HEIGHT * TILE_SIZE;

            const labelEl = document.createElement('span');

            labelEl.style.position = 'absolute';
            labelEl.style.userSelect = 'none';
            labelEl.style.color = label.colour || '#fff';
            labelEl.style.textShadow = '1px 1px #000';
            labelEl.style.fontFamily = 'arial, sans-serif';
            labelEl.style.textAlign = label.align || 'left';
            labelEl.style.fontSize = `${label.size + 2}px`;
            labelEl.style.fontWeight = label.bold ? 'bold' : 'normal';
            labelEl.style.top = `${y}px`;
            labelEl.style.left = `${x}px`;
            labelEl.innerText = label.text;

            this.planeWrap.appendChild(labelEl);
        }
    }

    async init() {
        await this.loadImages();

        this.planeWrap.appendChild(this.planeImages[0]);
        this.addLabels();

        this.container.appendChild(this.planeWrap);

        this.attachHandlers();
        this.scrollMap();
    }
}

module.exports = WorldMap;
