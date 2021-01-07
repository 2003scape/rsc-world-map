const KeyElements = require('./key-elements');
const OverviewElements = require('./overview-elements');
const PointElements = require('./point-elements');
const SearchElements = require('./search-elements');
const ZoomElements = require('./zoom-elements');
const defaultLabels = require('../res/labels');
const defaultObjects = require('../res/objects');
const defaultPoints = require('../res/points');
const fs = require('fs');
const { getObjectImage } = require('./object-image');

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
const SECTOR_SIZE = 48;
const TILE_SIZE = 3;

const LABEL_OFFSET_X = MIN_REGION_X * SECTOR_SIZE * TILE_SIZE;
const LABEL_OFFSET_Y = MIN_REGION_Y * SECTOR_SIZE * TILE_SIZE;

const CONTAINER_STYLES = {
    backgroundColor: '#24407f',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'grab',
    fontFamily: 'arial, sans-serif'
};

const LABEL_STYLES = {
    position: 'absolute',
    userSelect: 'none',
    textShadow: '1px 1px #000',
    display: 'block',
    whiteSpace: 'nowrap',
    transformOrigin: '0 0'
};

const OBJECT_CANVAS_STYLES = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    top: 0,
    left: 0,
    imageRendering: '-moz-crisp-edges'
};

const PLANE_IMAGE_STYLES = {
    transformOrigin: '0 0',
    imageRendering: '-moz-crisp-edges',
    pointerEvents: 'none',
    userSelect: 'none'
};

// how often (in ms) to record the last coordinate when we move the mouse
const DRAG_SAMPLE_THRESHOLD = 100;

class WorldMap {
    constructor({ container, labels, points, objects }) {
        this.container = container;
        this.labels = labels || defaultLabels;
        this.points = points || defaultPoints;
        this.objects = objects || defaultObjects;

        this.mouseDown = false;

        // the top and left px of the planewrap element
        this.mapRelativeX = -1908;
        this.mapRelativeY = -1822;

        // the mapRelative positions when we first click
        this.startMapY = -1;
        this.startMapX = -1;

        // the relative mouse positions (from the container element) when first
        // clicked
        this.startMouseX = -1;
        this.startMouseY = -1;

        // the position of the map at a sampled rate for the drag effect
        this.dragMapX = -1;
        this.dragMapY = -1;

        // taken every X ms to determine how far to fling the map
        this.lastSample = 0;

        // prevent the user from dragging the map
        this.lockMap = false;

        this.container.tabIndex = 0;

        Object.assign(this.container.style, CONTAINER_STYLES);

        this.planeWrap = document.createElement('div');
        this.planeWrap.style.position = 'absolute';

        this._scrollMap = this.scrollMap.bind(this);
    }

    loadImages() {
        return new Promise((resolve, reject) => {
            const total = PLANE_IMAGES.length;
            let loaded = 0;

            this.planeImages = PLANE_IMAGES.map((image) => {
                const imageEl = new Image();
                imageEl.onerror = reject;

                imageEl.onload = () => {
                    loaded += 1;

                    if (loaded === total) {
                        resolve();
                    }
                };

                imageEl.src = `data:image/png;base64,${image.toString(
                    'base64'
                )}`;

                Object.assign(imageEl.style, PLANE_IMAGE_STYLES);

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

    getDragDistance() {
        return Math.sqrt(
            Math.pow(this.dragMapX - this.mapRelativeX, 2) +
                Math.pow(this.dragMapY - this.mapRelativeY, 2)
        );
    }

    // get the last direction we dragged to fling the map in
    getScrollDirection(distance) {
        const deltaX = (this.startMapX - this.mapRelativeX) / distance;
        const deltaY = (this.startMapY - this.mapRelativeY) / distance;

        return { deltaX, deltaY };
    }

    // the animation loop that moves the map to a position relative from where
    // the drag began based on current mouse position
    scrollMap() {
        const maxX = -(
            IMAGE_WIDTH * this.zoomElements.scale -
            this.container.clientWidth
        );

        if (this.mapRelativeX > 0) {
            this.mapRelativeX = 0;
        } else if (this.mapRelativeX < maxX) {
            this.mapRelativeX = maxX;
        }

        const maxY = -(
            IMAGE_HEIGHT * this.zoomElements.scale -
            this.container.clientHeight
        );

        if (this.mapRelativeY > 0) {
            this.mapRelativeY = 0;
        } else if (this.mapRelativeY < maxY) {
            this.mapRelativeY = maxY;
        }

        const x = `${Math.floor(this.mapRelativeX)}px`;
        const y = `${Math.floor(this.mapRelativeY)}px`;

        this.planeWrap.style.transform = `translate(${x}, ${y})`;

        if (Date.now() - this.lastSample >= DRAG_SAMPLE_THRESHOLD) {
            this.dragMapX = this.mapRelativeX;
            this.dragMapY = this.mapRelativeY;
            this.lastSample = Date.now();
        }

        if (!this.mouseDown) {
            return;
        }

        window.requestAnimationFrame(this._scrollMap);
    }

    attachHandlers() {
        const mouseDown = (event) => {
            if (this.lockMap || this.mouseDown || event.button === 2) {
                return;
            }

            if (this.transitionTimeout) {
                this.planeWrap.style.transition = '';
                clearTimeout(this.transitionTimeout);
            }

            this.container.style.cursor = 'grabbing';

            this.mouseDown = true;
            this.startMapX = this.mapRelativeX;
            this.startMapY = this.mapRelativeY;
            this.lastSample = Date.now();

            const { x, y } = this.getMousePosition(event);

            this.startMouseX = x;
            this.startMouseY = y;

            this.scrollMap();
        };

        this.container.addEventListener('mousedown', mouseDown, false);
        this.container.addEventListener('touchstart', mouseDown, false);

        const mouseUp = () => {
            if (!this.mouseDown || this.lockMap) {
                return;
            }

            if (this.sampleInterval) {
                clearInterval(this.sampleInterval);
            }

            const distance = this.getDragDistance();

            if (distance) {
                const { deltaX, deltaY } = this.getScrollDirection(distance);
                const delay = Math.floor(200 + distance * 1.25);

                // https://easings.net/#easeOutSine
                this.planeWrap.style.transition =
                    `transform 0.${delay}s ` + 'cubic-bezier(0.61, 1, 0.88, 1)';

                this.transitionTimeout = setTimeout(() => {
                    this.planeWrap.style.transition = '';
                }, delay);

                this.mapRelativeX -= deltaX * (distance / 2);
                this.mapRelativeY -= deltaY * (distance / 2);
            }

            this.mouseDown = false;

            this.container.style.cursor = 'grab';
        };

        window.addEventListener('mouseup', mouseUp, false);
        window.addEventListener('touchend', mouseUp, false);

        const mouseMove = (event) => {
            if (!this.mouseDown || this.lockMap) {
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

            x -= LABEL_OFFSET_X;
            y -= LABEL_OFFSET_Y;

            const labelEl = document.createElement('span');

            labelEl.dataset.x = x;
            labelEl.dataset.y = y;

            labelEl.innerText = label.text;

            const styles = {
                color: label.colour || '#fff',
                textAlign: label.align || 'left',
                fontSize: `${label.size + 2}px`,
                fontWeight: label.bold ? 'bold' : 'normal',
                top: `${y}px`,
                left: `${x}px`
            };

            Object.assign(labelEl.style, Object.assign(styles, LABEL_STYLES));

            this.planeWrap.appendChild(labelEl);
        }
    }

    addPoints() {
        for (let { type, x, y } of this.points) {
            x -= LABEL_OFFSET_X;
            y -= LABEL_OFFSET_Y;

            this.planeWrap.appendChild(this.pointElements.getPoint(type, x, y));
        }
    }

    addObjects() {
        this.objectCanvas = document.createElement('canvas');
        this.objectCanvas.style.transformOrigin = '0 0';
        Object.assign(this.objectCanvas.style, OBJECT_CANVAS_STYLES);

        this.objectCanvas.width = IMAGE_WIDTH;
        this.objectCanvas.height = IMAGE_HEIGHT;

        const ctx = this.objectCanvas.getContext('2d');

        for (let { id, x, y } of this.objects) {
            x *= TILE_SIZE;
            x = IMAGE_WIDTH - x - 2;
            y *= TILE_SIZE;
            y -= 1;

            const image = getObjectImage(id, x, y);

            ctx.drawImage(image, x, y);
        }

        this.planeWrap.appendChild(this.objectCanvas);
    }

    async init() {
        await this.loadImages();

        this.pointElements = new PointElements();
        await this.pointElements.init();

        this.planeImage = this.planeImages[0];

        this.planeWrap.innerHTML = '';
        this.planeWrap.appendChild(this.planeImage);

        this.addObjects();
        this.addPoints();
        this.addLabels();

        this.container.appendChild(this.planeWrap);

        this.keyElements = new KeyElements(this);
        this.keyElements.init();

        this.zoomElements = new ZoomElements(this);
        this.zoomElements.init();

        this.searchElements = new SearchElements(this);
        this.searchElements.init();

        this.overviewElements = new OverviewElements(this);
        this.overviewElements.init();

        this.attachHandlers();
        this.scrollMap();
    }
}

module.exports = WorldMap;
