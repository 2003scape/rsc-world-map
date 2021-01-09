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

        const upstairs = getButton('Up', 'View the upstairs map.');
        Object.assign(upstairs.style, UPSTAIRS_STYLES);

        upstairs.addEventListener('click', () => {
            this.worldMap.setPlaneLevel(this.worldMap.currentPlane + 1);
        });

        const downstairs = getButton('Down', 'View the downstairs map.');
        Object.assign(downstairs.style, DOWNSTAIRS_STYLES);

        this.elements = { upstairs, downstairs };
    }

    init() {
        this.container.appendChild(this.elements.upstairs);
        this.container.appendChild(this.elements.downstairs);
    }
}

module.exports = StairElements;
