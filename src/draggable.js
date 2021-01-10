// make an element flingable within a container

const CONTAINER_STYLES = {
    backgroundColor: '#24407f',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'grab'
};

// how often (in ms) to record the last coordinate when we move the mouse
const DRAG_SAMPLE_THRESHOLD = 100;

function getMousePosition(container, event) {
    event = event.touches ? event.touches[0] : event;
    const rect = container.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

class Draggable {
    constructor(container, dragee) {
        this.container = container;
        this.dragee = dragee;

        // the top and left px of the dragee element
        this.mapRelativeX = 0;
        this.mapRelativeY = 0;

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

        this.isMouseDown = false;

        // taken every X ms to determine how far to fling the map
        this.lastSample = 0;

        // prevent the user from dragging the map
        this.lock = false;

        this._scrollMap = this.scrollMap.bind(this);

        Object.assign(this.container.style, CONTAINER_STYLES);

        const mouseDown = (event) => {
            if (this.lock || this.isMouseDown || event.button === 2) {
                return;
            }

            if (this.transitionTimeout) {
                this.dragee.style.transition = '';
                clearTimeout(this.transitionTimeout);
            }

            this.container.style.cursor = 'grabbing';

            this.isMouseDown = true;
            this.startMapX = this.mapRelativeX;
            this.startMapY = this.mapRelativeY;
            this.lastSample = Date.now();

            const { x, y } = getMousePosition(this.container, event);

            this.startMouseX = x;
            this.startMouseY = y;

            this.scrollMap();
        };

        this.container.addEventListener('mousedown', mouseDown, false);
        this.container.addEventListener('touchstart', mouseDown, false);

        const mouseUp = () => {
            if (!this.isMouseDown || this.lock) {
                return;
            }

            const distance = Math.sqrt(
                Math.pow(this.dragMapX - this.mapRelativeX, 2) +
                    Math.pow(this.dragMapY - this.mapRelativeY, 2)
            );

            if (distance) {
                const deltaX = (this.startMapX - this.mapRelativeX) / distance;
                const deltaY = (this.startMapY - this.mapRelativeY) / distance;
                const delay = Math.floor(200 + distance * 1.25);

                // https://easings.net/#easeOutSine
                this.dragee.style.transition =
                    `transform 0.${delay}s ` + 'cubic-bezier(0.61, 1, 0.88, 1)';

                this.transitionTimeout = setTimeout(() => {
                    this.dragee.style.transition = '';
                }, delay);

                this.mapRelativeX -= deltaX * (distance / 2);
                this.mapRelativeY -= deltaY * (distance / 2);
            }

            this.isMouseDown = false;
            this.container.style.cursor = 'grab';
        };

        window.addEventListener('mouseup', mouseUp, false);
        window.addEventListener('touchend', mouseUp, false);

        const mouseMove = () => {
            if (!this.isMouseDown || this.lock) {
                return;
            }

            const { x, y } = getMousePosition(this.container, event);

            this.mapRelativeX = this.startMapX - (this.startMouseX - x);
            this.mapRelativeY = this.startMapY - (this.startMouseY - y);
        };

        window.addEventListener('mousemove', mouseMove, false);
        window.addEventListener('touchmove', mouseMove, false);
    }

    scrollMap() {
        console.log('test poop');

        const { width, height } = this.dragee.getBoundingClientRect();
        const maxX = -(width - this.container.clientWidth);

        if (this.mapRelativeX > 0) {
            this.mapRelativeX = 0;
        } else if (this.mapRelativeX < maxX) {
            this.mapRelativeX = maxX;
        }

        const maxY = -(height - this.container.clientHeight);

        if (this.mapRelativeY > 0) {
            this.mapRelativeY = 0;
        } else if (this.mapRelativeY < maxY) {
            this.mapRelativeY = maxY;
        }

        const x = `${Math.floor(this.mapRelativeX)}px`;
        const y = `${Math.floor(this.mapRelativeY)}px`;

        this.dragee.style.transform = `translate(${x}, ${y})`;

        if (Date.now() - this.lastSample >= DRAG_SAMPLE_THRESHOLD) {
            this.dragMapX = this.mapRelativeX;
            this.dragMapY = this.mapRelativeY;
            this.lastSample = Date.now();
        }

        if (!this.isMouseDown) {
            return;
        }

        window.requestAnimationFrame(this._scrollMap);
    }
}

module.exports = Draggable;
