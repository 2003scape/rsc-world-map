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

        const searchInput = document.createElement('input');

        searchInput.type = 'search';
        searchInput.placeholder = 'Enter a location...';

        searchInput.setAttribute('list', labelList.id);
        Object.assign(searchInput.style, INPUT_STYLES);

        searchInput.addEventListener(
            'focus',
            () => {
                searchInput.style.opacity = 1;
            },
            false
        );

        searchInput.addEventListener(
            'blur',
            () => {
                searchInput.style.opacity = 0.6;
            },
            false
        );

        searchInput.addEventListener(
            'keyup',
            (event) => {
                if (event.code === 'Enter') {
                    this.worldMap.search(searchInput.value);
                    this.container.focus();
                }
            },
            false
        );

        const next = getButton('Go', 'Scroll to the specified location.');
        Object.assign(next.style, NEXT_STYLES);

        next.addEventListener(
            'click',
            () => {
                this.worldMap.search(searchInput.value);
                this.container.focus();
            },
            false
        );

        this.elements = { labelList, searchInput, next };
    }

    init() {
        this.container.appendChild(this.elements.labelList);
        this.container.appendChild(this.elements.searchInput);
        this.container.appendChild(this.elements.next);
    }
}

module.exports = SearchElements;
