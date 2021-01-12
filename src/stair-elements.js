// the buttons to go upstairs/downstairs

const { getButton, enableButton, disableButton } = require('./button-element');

const UPSTAIRS_STYLES = {
    width: '48px',
    bottom: '103px',
    right: '16px',
    height: '28px'
};

const DOWNSTAIRS_STYLES = {
    bottom: '65px',
    width: '48px',
    right: '16px',
    height: '28px'
};

class StairElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = this.worldMap.container;

        this.isMouseDown = false;

        const lockMapDrag = () => {
            this.isMouseDown = true;
            this.worldMap.lockDrag();
        };

        const unlockMapDrag = () => {
            if (this.isMouseDown) {
                this.isMouseDown = false;
                this.worldMap.unlockDrag();
            }
        };

        const upstairs = getButton('Up', 'View the upstairs map.');
        Object.assign(upstairs.style, UPSTAIRS_STYLES);

        upstairs.addEventListener('mousedown', lockMapDrag, false);

        upstairs.addEventListener('click', () => {
            const plane = this.worldMap.currentPlane;

            if (plane === 3) {
                this.worldMap.setPlaneLevel(0);
                enableButton(downstairs);
            } else if (plane < 2) {
                this.worldMap.setPlaneLevel(plane + 1);
                enableButton(downstairs);
            }

            if (this.worldMap.currentPlane >= 2) {
                disableButton(upstairs);
            }
        });

        const downstairs = getButton('Down', 'View the downstairs map.');
        Object.assign(downstairs.style, DOWNSTAIRS_STYLES);

        downstairs.addEventListener('mousedown', lockMapDrag, false);

        downstairs.addEventListener('click', () => {
            const plane = this.worldMap.currentPlane;

            if (plane === 0) {
                this.worldMap.setPlaneLevel(3);
            } else if (plane > 0 && plane < 3) {
                this.worldMap.setPlaneLevel(plane - 1);
                enableButton(upstairs);
            }

            if (this.worldMap.currentPlane >= 3) {
                disableButton(downstairs);
            }
        });

        window.addEventListener('mouseup', unlockMapDrag, false);

        this.elements = { upstairs, downstairs };
    }

    init() {
        this.container.appendChild(this.elements.upstairs);
        this.container.appendChild(this.elements.downstairs);
    }
}

module.exports = StairElements;
