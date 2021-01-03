const fs = require('fs');

const PLANE_IMAGES = [
    fs.readFileSync('./res/plane-0.png'),
    fs.readFileSync('./res/plane-1.png'),
    fs.readFileSync('./res/plane-2.png'),
    fs.readFileSync('./res/plane-3.png')
];

class WorldMap {
    constructor(container) {
        this.container = container;

        this.mouseDown = false;

        // the top and left px of the planewrap element
        this.mapRelativeX = 0;
        this.mapRelativeY = 0;

        // timestamp of when we first clicked
        this.startTime = 0;

        // the mapRelative positions when we first click
        this.startMapY = -1;
        this.startMapX = -1;

        // the relative mouse positions (from the container element) when first
        // clicked
        this.startMouseX = -1;
        this.startMouseY = -1;

        this.container.style.backgroundColor = '#24407f';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.userSelect = 'none';
        this.container.style.cursor = 'move';

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

    scrollMap() {
        if (!this.mouseDown) {
            return;
        }

        this.planeWrap.style.transform = `translate(${this.mapRelativeX}px, ${this.mapRelativeY}px)`;

        window.requestAnimationFrame(this._scrollMap);
    }

    attachHandlers() {
        const mouseDown = (event) => {
            if (this.mouseDown) {
                return;
            }

            this.mouseDown = true;
            this.container.style.cursor = 'grab';

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
            console.log(Date.now() - this.startTime);
            this.mouseDown = false;
            this.container.style.cursor = 'move';
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

    async init() {
        await this.loadImages();
        this.planeWrap.appendChild(this.planeImages[0]);
        this.container.appendChild(this.planeWrap);
        this.attachHandlers();
    }
}

module.exports = WorldMap;
