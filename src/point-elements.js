const fs = require('fs');

const POINT_IMAGES = {
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

const POINT_WRAP_STYLES = {
    backgroundColor: '#c0c0c0',
    border: '1px solid #000',
    borderRadius: '8px',
    width: '15px',
    height: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

class PointElements {
    constructor() {
        this.elements = {};
    }

    loadImages() {
        return new Promise((resolve, reject) => {
            const total = Object.keys(POINT_IMAGES).length;
            let loaded = 0;

            this.keyImages = {};

            for (const [name, image] of Object.entries(POINT_IMAGES)) {
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

                this.keyImages[name] = image;
            }
        });
    }

    generatePoints() {
        for (const type of Object.keys(POINT_IMAGES)) {
            const wrapEl = document.createElement('div');

            Object.assign(wrapEl.style, POINT_WRAP_STYLES);

            wrapEl.title = PointElements.formatPointTitle(type);

            const imageEl = document.createElement('img');

            imageEl.src = `data:image/png;base64,${this.keyImages[
                type
            ].toString('base64')}`;

            //imageEl.style.imageRendering = '-moz-crisp-edges';
            imageEl.style.pointerEvents = 'none';
            imageEl.style.userSelect = 'none';

            wrapEl.appendChild(imageEl);

            this.elements[type] = wrapEl;
        }
    }

    getPoint(type, x, y) {
        const el = this.elements[type].cloneNode(true);

        if (typeof x == 'number') {
            el.style.position = 'absolute';
            el.style.top = `${y}px`;
            el.style.left = `${x}px`;
        }

        return el;
    }

    async init() {
        await this.loadImages();
        this.generatePoints();
    }

    static formatPointTitle(type) {
        return type
            .split('-')
            .map((segment) => {
                return segment[0].toUpperCase() + segment.slice(1);
            })
            .join(' ');
    }
}

module.exports = PointElements;
