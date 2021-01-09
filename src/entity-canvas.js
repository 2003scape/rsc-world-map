const { getObjectImage } = require('./entity-image');

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

        this.elements = { canvas };
    }

    addObjects() {
        const ctx = this.elements.canvas.getContext('2d');

        for (let { id, x, y } of this.objects) {
            x *= TILE_SIZE;
            x = this.worldMap.imageWidth - x - 2;
            y *= TILE_SIZE;
            y -= 1;

            const image = getObjectImage(id, x, y);

            ctx.drawImage(image, x, y);
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
