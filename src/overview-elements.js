const { getBox } = require('./box-element');
const { getButton } = require('./button-element');

const BUTTON_STYLES = {
    width: '78px',
    top: '16px',
    left: '16px'
};

const BOX_STYLES = {
    width: '50%',
    height: '55%',
    top: '22.5%',
    left: '25%',
    position: 'relative',
    padding: 0,
    overflow: 'hidden'
};

const MINIMAP_STYLES = {
    width: '100%',
    height: '100%'
};

const SELECTION_STYLES = {
    position: 'absolute',
    top: 0,
    left: 0,
    border: '1px solid #f00',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    height: '20px'
};

function getMousePosition(container, event) {
    event = event.touches ? event.touches[0] : event;
    const rect = container.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

class OverviewElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = worldMap.container;

        this.open = false;
        this.isMouseDown = false;

        this.mouseX = -1;
        this.mouseY = -1;

        const button = getButton('Overview', 'Show the minimap overview.');
        Object.assign(button.style, BUTTON_STYLES);
        button.addEventListener('click', () => this.toggle(), false);

        const box = getBox();
        Object.assign(box.style, BOX_STYLES);

        box.addEventListener('mousedown', (event) => {
            if (event.button === 2) {
                return;
            }

            this.isMouseDown = true;
            this.scrollMap();
        });

        window.addEventListener('mousemove', (event) => {
            if (!this.isMouseDown) {
                return;
            }

            const containerWidth = this.worldMap.container.clientWidth;
            const containerHeight = this.worldMap.container.clientHeight;

            const minimapWidth = this.elements.minimap.clientWidth;
            const minimapHeight = this.elements.minimap.clientHeight;

            const imageWidth = this.worldMap.planeWrap.clientWidth;
            const imageHeight = this.worldMap.planeWrap.clientHeight;

            const { x, y } = getMousePosition(minimap, event);

            this.mouseX = Math.min(Math.max(x, 0), minimapWidth);
            this.mouseY = Math.min(Math.max(y, 0), minimapHeight);

            this.worldMap.draggable.mapRelativeX = -(
                (x / minimapWidth) * imageWidth -
                containerWidth / 2
            );

            this.worldMap.draggable.mapRelativeY = -(
                (y / minimapHeight) * imageHeight -
                containerHeight / 2
            );
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        const minimap = this.worldMap.planeImage.cloneNode();
        Object.assign(minimap.style, MINIMAP_STYLES);

        const selection = document.createElement('div');
        Object.assign(selection.style, SELECTION_STYLES);

        box.appendChild(minimap);
        box.appendChild(selection);

        this._scrollMap = this.scrollMap.bind(this);

        this.elements = { button, box, minimap, selection };
    }

    toggle() {
        this.open = !this.open;

        if (!this.worldMap.keyElements.open) {
            this.worldMap.draggable.lock = this.open;
            this.container.style.cursor = this.open ? 'inherit' : 'grab';
        }

        this.elements.box.style.display = this.open ? 'block' : 'none';

        Object.assign(this.elements.button.style, {
            opacity: this.open ? 1 : 0.6,
            fontWeight: this.open ? 'bold' : 'inherit'
        });

        this.refreshSelection();
    }

    refreshSelection() {
        const containerWidth = this.worldMap.container.clientWidth;
        const containerHeight = this.worldMap.container.clientHeight;

        const imageWidth = this.worldMap.planeWrap.clientWidth;
        const imageHeight = this.worldMap.planeWrap.clientHeight;

        const minimapWidth = this.elements.minimap.clientWidth;
        const minimapHeight = this.elements.minimap.clientHeight;

        const selectionWidth = minimapWidth * (containerWidth / imageWidth);
        const selectionHeight = minimapHeight * (containerHeight / imageHeight);

        const offsetX =
            Math.abs(
                (minimapWidth * this.worldMap.draggable.mapRelativeX) /
                    imageWidth
            ) -
            selectionWidth / 2;

        const offsetY =
            Math.abs(
                (minimapHeight * this.worldMap.draggable.mapRelativeY) /
                    imageHeight
            ) -
            selectionHeight / 2;

        Object.assign(this.elements.selection.style, {
            width: `${selectionWidth}px`,
            height: `${selectionHeight}px`,
            transformOrigin: '0 0',
            transform: `translate(${offsetX}px, ${offsetY}px)`
        });
    }

    scrollMap() {
        if (this.mouseX > -1 && this.mouseY > -1) {
            this.worldMap.scrollMap();

            const selectionWidth = this.elements.selection.clientWidth;
            const selectionHeight = this.elements.selection.clientHeight;

            const offsetX = Math.abs(this.mouseX) - selectionWidth / 2;
            const offsetY = Math.abs(this.mouseY) - selectionHeight / 2;

            const transform = `translate(${offsetX}px, ${offsetY}px)`;
            this.elements.selection.style.transform = transform;
        }

        if (this.isMouseDown) {
            window.requestAnimationFrame(this._scrollMap);
        }
    }

    refreshPlaneLevel() {
        this.elements.minimap.src = this.worldMap.planeImage.src;
    }

    init() {
        this.container.appendChild(this.elements.button);
        this.container.appendChild(this.elements.box);
    }
}

module.exports = OverviewElements;
