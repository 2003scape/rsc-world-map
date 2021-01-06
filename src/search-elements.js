const { getButton } = require('./button-element');

const INPUT_STYLES = {
    width: 'calc(100% - 174px)',
    boxSizing: 'border-box',
    height: '28px',
    position: 'absolute',
    outline: '2px solid #000',
    border: '3px outset #373737',
    bottom: '20px',
    left: '16px',
    fontSize: '13px',
    padding: '2px',
    fontFamily: 'arial, sans-serif',
    opacity: 0.6,
    color: '#000',
    backgroundColor: '#eee'
};

const NEXT_STYLES = {
    bottom: '20px',
    right: '110px',
    width: '32px',
    height: '28px'
};

class SearchElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.container = this.worldMap.container;

        const textLabels = Array.from(
            new Set(
                this.worldMap.labels.map(({ text }) => text.replace(/\s/g, ' '))
            )
        ).sort();

        const labelList = document.createElement('datalist');

        labelList.id = 'rsc-map-labels';

        for (const label of textLabels) {
            labelList.appendChild(new Option(label));
        }

        const input = document.createElement('input');

        input.type = 'search';
        input.placeholder = 'Enter a location...';

        input.setAttribute('list', labelList.id);
        Object.assign(input.style, INPUT_STYLES);

        input.addEventListener(
            'focus',
            () => {
                input.style.opacity = 1;
            },
            false
        );

        input.addEventListener(
            'blur',
            () => {
                input.style.opacity = 0.6;
            },
            false
        );

        const next = getButton('Go', 'Scroll to the specified location.');
        Object.assign(next.style, NEXT_STYLES);

        this.elements = { labelList, input, next };
    }

    init() {
        this.container.appendChild(this.elements.labelList);
        this.container.appendChild(this.elements.input);
        this.container.appendChild(this.elements.next);
    }
}

module.exports = SearchElements;
