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

        // used for same labels used in different locations
        this.lastSearchChildren = new Set();
        this.lastSearchTerms = '';

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
                    this.search(searchInput.value);
                    searchInput.style.opacity = 0.6;
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
                this.search(searchInput.value);
                this.container.focus();
            },
            false
        );

        this.elements = { labelList, searchInput, next };
    }

    // navigate to the specified label
    search(terms) {
        terms = terms.trim();

        if (!terms.length) {
            return;
        }

        if (terms !== this.lastSearchTerms) {
            this.lastSearchChildren.clear();
        }

        this.lastSearchTerms = terms;

        for (const child of this.worldMap.planeWrap.children) {
            if (
                this.lastSearchChildren.has(child) ||
                child.tagName !== 'SPAN'
            ) {
                continue;
            }

            const label = child.innerText;

            if (new RegExp(terms, 'i').test(label.replace(/\s/g, ' '))) {
                this.lastSearchChildren.add(child);

                this.worldMap.lockMap = true;
                this.elements.searchInput.disabled = true;
                this.elements.next.disabled = true;

                this.worldMap.planeWrap.style.transition =
                    'transform 0.5s ease-in';

                this.worldMap.draggable.mapRelativeX =
                    this.worldMap.zoomElements.scale *
                        -Number(child.dataset.x) +
                    this.worldMap.container.clientWidth / 2 -
                    child.clientWidth / 2 -
                    (Number.parseFloat(child.style.marginLeft) || 0);

                this.worldMap.draggable.mapRelativeY =
                    this.worldMap.zoomElements.scale *
                        -Number(child.dataset.y) +
                    this.worldMap.container.clientHeight / 2 -
                    child.clientHeight / 2 -
                    (Number.parseFloat(child.style.marginTop) || 0);

                this.worldMap.scrollMap();

                setTimeout(() => {
                    this.worldMap.lockMap = false;
                    this.elements.searchInput.disabled = false;
                    this.elements.next.disabled = false;
                    this.worldMap.planeWrap.style.transition = '';
                }, 500);

                return;
            }
        }

        if (this.lastSearchChildren.size) {
            this.lastSearchChildren.clear();
            return this.search(terms);
        }
    }

    init() {
        this.container.appendChild(this.elements.labelList);
        this.container.appendChild(this.elements.searchInput);
        this.container.appendChild(this.elements.next);
    }
}

module.exports = SearchElements;
