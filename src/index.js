const fs = require('fs');
const defaultLabels = require('../res/labels');
const defaultPoints = require('../res/points');

const PLANE_IMAGES = [
    fs.readFileSync('./res/plane-0.png'),
    fs.readFileSync('./res/plane-1.png'),
    fs.readFileSync('./res/plane-2.png'),
    fs.readFileSync('./res/plane-3.png')
];

const KEY_IMAGES = {
    altar: fs.readFileSync('./res/key/altar.png'),
    'amulet-shop': fs.readFileSync('./res/key/amulet-shop.png'),
    anvil: fs.readFileSync('./res/key/anvil.png'),
    apothecary: fs.readFileSync('./res/key/apothecary.png'),
    'archery-shop': fs.readFileSync('./res/key/archery-shop.png'),
    'armour-conversion': fs.readFileSync('./res/key/armour-conversion.png'),
    'axe-shop': fs.readFileSync('./res/key/axe-shop.png'),
    bank: fs.readFileSync('./res/key/bank.png'),
    bed: fs.readFileSync('./res/key/bed.png'),
    'body-armour-shop': fs.readFileSync('./res/key/body-armour-shop.png'),
    'certificate-trader': fs.readFileSync('./res/key/certificate-trader.png'),
    'clothes-shop': fs.readFileSync('./res/key/clothes-shop.png'),
    'combat-practice': fs.readFileSync('./res/key/combat-practice.png'),
    'cookery-shop': fs.readFileSync('./res/key/cookery-shop.png'),
    'crafting-shop': fs.readFileSync('./res/key/crafting-shop.png'),
    dungeon: fs.readFileSync('./res/key/dungeon.png'),
    'fishing-point': fs.readFileSync('./res/key/fishing-point.png'),
    'fishing-shop': fs.readFileSync('./res/key/fishing-shop.png'),
    'food-shop': fs.readFileSync('./res/key/food-shop.png'),
    furnace: fs.readFileSync('./res/key/furnace.png'),
    'gem-shop': fs.readFileSync('./res/key/gem-shop.png'),
    'general-shop': fs.readFileSync('./res/key/general-shop.png'),
    'helmet-shop': fs.readFileSync('./res/key/helmet-shop.png'),
    'herblaw-shop': fs.readFileSync('./res/key/herblaw-shop.png'),
    'jewellery-shop': fs.readFileSync('./res/key/jewellery-shop.png'),
    'kebab-shop': fs.readFileSync('./res/key/kebab-shop.png'),
    'leg-armour-shop': fs.readFileSync('./res/key/leg-armour-shop.png'),
    'mace-shop': fs.readFileSync('./res/key/mace-shop.png'),
    'magic-shop': fs.readFileSync('./res/key/magic-shop.png'),
    'mining-site': fs.readFileSync('./res/key/mining-site.png'),
    'pickable-lock': fs.readFileSync('./res/key/pickable-lock.png'),
    pub: fs.readFileSync('./res/key/pub.png'),
    quest: fs.readFileSync('./res/key/quest.png'),
    'rare-trees': fs.readFileSync('./res/key/rare-trees.png'),
    'scimitar-shop': fs.readFileSync('./res/key/scimitar-shop.png'),
    'shield-shop': fs.readFileSync('./res/key/shield-shop.png'),
    'silk-trader': fs.readFileSync('./res/key/silk-trader.png'),
    'skirt-armour-shop': fs.readFileSync('./res/key/skirt-armour-shop.png'),
    'spinning-wheel': fs.readFileSync('./res/key/spinning-wheel.png'),
    'staff-shop': fs.readFileSync('./res/key/staff-shop.png'),
    'sword-shop': fs.readFileSync('./res/key/sword-shop.png'),
    tannery: fs.readFileSync('./res/key/tannery.png')
};

const BUTTON_IMAGE = fs.readFileSync('./res/button.png');

const IMAGE_WIDTH = 2448;
const IMAGE_HEIGHT = 2736;

const MIN_REGION_X = 48;
const MIN_REGION_Y = 37;
const SECTOR_SIZE = 48;
const TILE_SIZE = 3;

const CONTAINER_STYLES = {
    backgroundColor: '#24407f',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'grab'
};

const KEY_STYLES = {
    opacity: 0.6,
    fontSize: '12px',
    width: '43px',
    height: '36px',
    cursor: 'pointer',
    color: '#fff',
    position: 'absolute',
    top: '16px',
    right: '16px',
    border: 0,
    outline: 0,
    margin: 0,
    padding: 0,
    backgroundImage: `url(data:image/png;base64,${BUTTON_IMAGE.toString(
        'base64'
    )})`
};

const LABEL_STYLES = {
    position: 'absolute',
    userSelect: 'none',
    textShadow: '1px 1px #000',
    fontFamily: 'arial, sans-serif'
};

function formatPointTitle(type) {
    return type.split('-').map((segment) => {
        return segment[0].toUpperCase() + segment.slice(1);
    }).join(' ');
}

function applyStyles(element, styles) {
    for (const [property, value] of Object.entries(styles)) {
        element.style[property] = value;
    }
}

class WorldMap {
    constructor({ container, labels, points }) {
        this.container = container;
        this.labels = labels || defaultLabels;
        this.points = points || defaultPoints;

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

        // when the map transition ends
        this.mapAnimateUntil = 0;

        applyStyles(this.container, CONTAINER_STYLES);

        this.planeWrap = document.createElement('div');
        this.planeWrap.style.position = 'absolute';

        this.keyButton = document.createElement('button');
        this.keyButton.innerText = 'Key';
        this.keyButton.title = 'Toggle points of interest.';

        applyStyles(this.keyButton, KEY_STYLES);

        this._scrollMap = this.scrollMap.bind(this);
    }

    loadImages() {
        return new Promise((resolve, reject) => {
            let total = PLANE_IMAGES.length + Object.keys(KEY_IMAGES).length;

            let loaded = 0;

            const onload = () => {
                loaded += 1;

                if (loaded === total) {
                    resolve();
                }
            };

            this.planeImages = PLANE_IMAGES.map((image) => {
                const imageEl = new Image();
                imageEl.onerror = reject;

                imageEl.onload = onload;
                imageEl.src = `data:image/png;base64,${image.toString(
                    'base64'
                )}`;

                imageEl.style.imageRendering = '-moz-crisp-edges';
                imageEl.style.pointerEvents = 'none';
                imageEl.style.userSelect = 'none';

                return imageEl;
            });

            this.keyImages = {};

            for (const [name, image] of Object.entries(KEY_IMAGES)) {
                const imageEl = new Image();
                imageEl.onerror = reject;

                imageEl.onload = onload;
                imageEl.src = `data:image/png;base64,${image.toString(
                    'base64'
                )}`;

                this.keyImages[name] = image;
            }
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

        if (!this.mouseDown) {
            return;
        }

        window.requestAnimationFrame(this._scrollMap);
    }

    attachHandlers() {
        const mouseDown = (event) => {
            if (this.mouseDown || this.mapAnimateUntil) {
                return;
            }

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

                    this.planeWrap.style.transition =
                        `transform 0.${delay}s ` +
                        'cubic-bezier(0.61, 1, 0.88, 1)';

                    this.mapAnimateUntil = Date.now() + delay;

                    setTimeout(() => {
                        this.planeWrap.style.transition = '';
                        this.mapAnimateUntil = 0;
                    }, delay);

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

        this.keyButton.addEventListener(
            'mouseover',
            () => {
                this.keyButton.style.opacity = 1;
            },
            false
        );

        this.keyButton.addEventListener(
            'mouseleave',
            () => {
                this.keyButton.style.opacity = 0.6;
            },
            false
        );

        this.keyButton.addEventListener(
            'click',
            () => {
                console.log('show key');
            },
            false
        );
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

            applyStyles(labelEl, Object.assign(styles, LABEL_STYLES));

            this.planeWrap.appendChild(labelEl);
        }
    }

    addPoints() {
        for (let { type, x, y } of this.points) {
            x -= MIN_REGION_X * SECTOR_SIZE * TILE_SIZE;
            y -= MIN_REGION_Y * SECTOR_SIZE * TILE_SIZE;

            const imageEl = document.createElement('img');

            imageEl.src = `data:image/png;base64,${this.keyImages[
                type
            ].toString('base64')}`;

            imageEl.style.position = 'absolute';
            imageEl.style.top = `${y}px`;
            imageEl.style.left = `${x}px`;

            imageEl.title = formatPointTitle(type);

            this.planeWrap.appendChild(imageEl);
        }
    }

    async init() {
        await this.loadImages();

        this.planeWrap.innerHTML = '';
        this.planeWrap.appendChild(this.planeImages[0]);
        this.addPoints();
        this.addLabels();

        this.container.appendChild(this.planeWrap);
        this.container.appendChild(this.keyButton);

        this.attachHandlers();
        this.scrollMap();
    }
}

module.exports = WorldMap;
