const PointElements = require('./point-elements');
const KeyElements = require('./key-elements');
const ZoomElements = require('./zoom-elements');
const defaultLabels = require('../res/labels');
const defaultObjects = require('../res/objects');
const defaultPoints = require('../res/points');
const fs = require('fs');

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
    whiteSpace: 'nowrap'
};

const OBJECT_CANVAS_STYLES = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    top: 0,
    left: 0,
    imageRendering: '-moz-crisp-edges'
};

// the orange + symbol colour used to indicate game objects
const OBJECT_COLOUR = 'rgb(175, 95, 0)';

// only regular/evergreen trees outside of the wild are this colour
const TREE_COLOUR = 'rgb(0, 160, 0)';

// objects like dead trees and fungus are darker than rocks/signs in the wild
const WILD_TREE_COLOUR = 'rgb(112, 64, 0)';

// objects in the wild intended to be WILD_TREE_COLOUR
const WILD_SCENERY = new Set([4, 38, 70, 205]);

const OBJECT_IMAGE = makeObjectImage(OBJECT_COLOUR);
const TREE_IMAGE = makeObjectImage(TREE_COLOUR);
const WILD_TREE_IMAGE = makeObjectImage(WILD_TREE_COLOUR);

const ZOOM_LEVELS = {
    0: 1,
    1: 2
};

// used to colour objects/trees within the wilderness
function inWilderness(x, y) {
    return x >= 1440 && x <= 2304 && y >= 286 && y <= 1286;
}

// create the + symbols for entities
function makeObjectImage(colour) {
    const canvas = document.createElement('canvas');

    canvas.width = 3;
    canvas.height = 3;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = colour;
    ctx.fillRect(1, 0, 1, 3);
    ctx.fillRect(0, 1, 3, 1);

    return canvas;
}

class WorldMap {
    constructor({ container, labels, points, objects }) {
        this.container = container;
        this.labels = labels || defaultLabels;
        this.points = points || defaultPoints;
        this.objects = objects || defaultObjects;

        this.mouseDown = false;

        // the top and left px of the planewrap element
        this.mapRelativeX = -1932;
        this.mapRelativeY = -1816;

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

        // current zoom level (-2, 0, +2)
        this.zoomLevel = 0;
        this.zoomScale = 1;

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

                imageEl.style.transformOrigin = '0 0';
                imageEl.style.imageRendering = '-moz-crisp-edges';
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

    getDragDistance() {
        return Math.sqrt(
            Math.pow(this.dragMapX - this.mapRelativeX, 2) +
                Math.pow(this.dragMapY - this.mapRelativeY, 2)
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
        } else if (this.mapRelativeX < -(IMAGE_WIDTH * this.zoomScale)) {
            this.mapRelativeX = -(IMAGE_WIDTH * this.zoomScale);
        }

        if (this.mapRelativeY > 0) {
            this.mapRelativeY = 0;
        } else if (this.mapRelativeY < -(IMAGE_HEIGHT * this.zoomScale)) {
            this.mapRelativeY = -(IMAGE_HEIGHT * this.zoomScale);
        }

        const x = `${Math.floor(this.mapRelativeX)}px`;
        const y = `${Math.floor(this.mapRelativeY)}px`;

        this.planeWrap.style.transform = `translate(${x}, ${y})`;

        if (Date.now() - this.lastSample >= 100) {
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
            if (this.mouseDown || this.keyElements.open || event.button === 2) {
                return;
            }

            if (this.transitionTimeout) {
                clearTimeout(this.transitionTimeout);
            }

            this.container.style.cursor = 'grabbing';
            this.planeWrap.style.transition = '';

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
            if (!this.mouseDown) {
                return;
            }

            if (this.sampleInterval) {
                clearInterval(this.sampleInterval);
            }

            const distance = this.getDragDistance();

            if (distance) {
                const { deltaX, deltaY } = this.getScrollDelta(distance);
                const delay = Math.floor(200 + distance * 1.25);

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
            if (!this.mouseDown || this.keyElements.open) {
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

            x -= MIN_REGION_X * SECTOR_SIZE * TILE_SIZE;
            y -= MIN_REGION_Y * SECTOR_SIZE * TILE_SIZE;

            const labelEl = document.createElement('span');

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
            x -= MIN_REGION_X * SECTOR_SIZE * TILE_SIZE;
            y -= MIN_REGION_Y * SECTOR_SIZE * TILE_SIZE;

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

            let image = OBJECT_IMAGE;

            if (inWilderness(x, y)) {
                if (WILD_SCENERY.has(id)) {
                    image = WILD_TREE_IMAGE;
                }
            } else if (id === 1) {
                image = TREE_IMAGE;
            }

            ctx.drawImage(image, x, y);
        }

        this.planeWrap.appendChild(this.objectCanvas);
    }

    zoom(zoomLevel) {
        const scale = ZOOM_LEVELS[zoomLevel];
        const transform = `scale(${scale})`;

        this.planeWrap.style.transition = '';

        // scale the entire map image, but not the points or text labels:
        this.planeImage.style.transform = transform;
        this.objectCanvas.style.transform = transform;

        // move text labels and points to match up with the new zoomed-in image:
        const translateScale = scale / this.zoomScale;

        this.mapRelativeX *= translateScale;
        this.mapRelativeY *= translateScale;

        // centre the viewport
        if (zoomLevel === 0) {
            this.mapRelativeX += this.container.clientWidth / 4;
            this.mapRelativeY += this.container.clientHeight / 4;
        } else if (zoomLevel === 1) {
            this.mapRelativeX -= this.container.clientWidth / 2;
            this.mapRelativeY -= this.container.clientHeight / 2;
        }

        for (const child of this.planeWrap.children) {
            if (child.tagName === 'IMG' || child.tagName === 'CANVAS') {
                continue;
            }

            const x = Number.parseInt(child.style.left.slice(0, -2));
            const y = Number.parseInt(child.style.top.slice(0, -2));

            child.style.left = `${x * translateScale}px`;
            child.style.top = `${y * translateScale}px`;

            let offsetX = 0;
            let offsetY = 0;

            if (zoomLevel === 0) {
                child.style.margin = '';

                if (child.tagName === 'SPAN') {
                    child.style.width = 'auto';
                }
            } else if (zoomLevel === 1) {
                if (child.tagName === 'SPAN') {
                    if (child.style.textAlign === 'center') {
                        const { width } = child.getBoundingClientRect();
                        child.style.width = `${width * scale}px`;
                    }

                    const fontSize = Number(child.style.fontSize.slice(0, -2));
                    offsetY = fontSize / 2;
                } else if (child.tagName === 'DIV') {
                    offsetX += 8;
                    offsetY += 8;
                }
            }

            child.style.margin = `${offsetY}px ${offsetX}px 0 0`;
        }

        this.zoomLevel = zoomLevel;
        this.zoomScale = scale;
    }

    async init() {
        await this.loadImages();

        this.pointElements = new PointElements();

        await this.pointElements.init();

        this.planeWrap.innerHTML = '';
        this.planeImage = this.planeImages[0];

        this.planeWrap.appendChild(this.planeImage);
        this.addObjects();
        this.addPoints();
        this.addLabels();

        this.container.appendChild(this.planeWrap);

        this.keyElements = new KeyElements(this);
        this.keyElements.init();

        this.zoomElements = new ZoomElements(this);
        this.zoomElements.init();

        this.attachHandlers();
        this.scrollMap();
    }
}

module.exports = WorldMap;
