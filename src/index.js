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
const { useDraggable } = require('./draggable');

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

const PLANE_WRAP_STYLES = {
    position: 'absolute',
    top: 0,
    left: 0
};

class WorldMap {
    constructor({ container, labels, points, objects }) {
        this.container = container;
        this.labels = labels || defaultLabels;
        this.points = points || defaultPoints;
        this.objects = objects || defaultObjects;

        this.container.tabIndex = 0;

        Object.assign(this.container.style, CONTAINER_STYLES);

        this.planeWrap = document.createElement('div');
        Object.assign(this.planeWrap.style, PLANE_WRAP_STYLES);

        this.draggable = useDraggable(this.container, this.planeWrap);
        this.scrollMap = this.draggable.scrollMap;
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

        this.searchElements.search('Lumbridge');
    }
}

module.exports = WorldMap;
