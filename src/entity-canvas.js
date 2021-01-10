const { getObjectImage } = require('./entity-image');

const MIN_REGION_X = 48;
const MIN_REGION_Y = 37;
const MAX_REGION_X = 64;
const MAX_REGION_Y = 55;
const SECTOR_SIZE = 48;
const TILE_SIZE = 3;

const ENTITY_CANVAS_STYLES = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    top: 0,
    left: 0,
    transformOrigin: '0 0',
    imageRendering: '-moz-crisp-edges'
};

class EntityCanvas {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.objects = this.worldMap.objects;
        this.planeWrap = this.worldMap.planeWrap;

        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, ENTITY_CANVAS_STYLES);
        this.context = canvas.getContext('2d');

        this.elements = { canvas };
    }

    addObjects() {
        const plane = this.worldMap.currentPlane;

        for (let { id, x, y } of this.objects) {
            y *= TILE_SIZE;
            y -= 1;

            y -=
                plane *
                    SECTOR_SIZE *
                    TILE_SIZE *
                    (MAX_REGION_Y - MIN_REGION_Y) +
                plane * 240;

            x *= TILE_SIZE;
            x = this.worldMap.imageWidth - x - 2;

            this.context.drawImage(getObjectImage(id, x, y), x, y);
        }
    }

    refreshPlaneLevel() {
        if (this.worldMap.keyElements.showObjects) {
            this.elements.canvas.width = this.elements.canvas.width;
            this.addObjects();
        }
    }

    init() {
        this.elements.canvas.width = this.worldMap.imageWidth;
        this.elements.canvas.height = this.worldMap.imageHeight;

        this.addObjects();

        this.planeWrap.appendChild(this.elements.canvas);
    }
}

module.exports = EntityCanvas;
