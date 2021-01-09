const Draggable  = require('./draggable');
const EntityCanvas = require('./entity-canvas');
const KeyElements = require('./key-elements');
const LabelElements = require('./label-elements');
const OverviewElements = require('./overview-elements');
const PointElements = require('./point-elements');
const SearchElements = require('./search-elements');
const StairElements = require('./stair-elements');
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

const CONTAINER_STYLES = {
    color: '#fff',
    fontFamily: 'arial, sans-serif'
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

        // height and width of the base map size
        this.imageWidth = IMAGE_WIDTH;
        this.imageHeight = IMAGE_HEIGHT;

        // dungeon, upstairs, overworld, etc. (-1 to 2)
        this.currentPlane = 0;

        this.container.tabIndex = 0;

        Object.assign(this.container.style, CONTAINER_STYLES);

        this.planeWrap = document.createElement('div');
        Object.assign(this.planeWrap.style, PLANE_WRAP_STYLES);

        this.draggable = new Draggable(this.container, this.planeWrap);
        this.scrollMap = this.draggable.scrollMap.bind(this.draggable);
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

    setPlaneLevel(level) {
        this.planeImage.replaceWith(this.planeImages[level]);
        this.planeImage = this.planeImages[level];
        this.overviewElements.refreshPlaneLevel();

        if (level !== 0) {
            this.container.style.backgroundColor = '#000';
        }
    }

    async init() {
        await this.loadImages();

        this.planeImage = this.planeImages[0];

        this.planeWrap.innerHTML = '';
        this.planeWrap.appendChild(this.planeImage);

        this.entityCanvas = new EntityCanvas(this);
        this.entityCanvas.init();

        this.pointElements = new PointElements(this);
        await this.pointElements.init();

        this.labelElements = new LabelElements(this);
        this.labelElements.init();

        this.container.appendChild(this.planeWrap);

        this.keyElements = new KeyElements(this);
        this.keyElements.init();

        this.zoomElements = new ZoomElements(this);
        this.zoomElements.init();

        this.searchElements = new SearchElements(this);
        this.searchElements.init();

        this.overviewElements = new OverviewElements(this);
        this.overviewElements.init();

        this.stairElements = new StairElements(this);
        this.stairElements.init();

        this.searchElements.search('Lumbridge');
    }
}

module.exports = WorldMap;
