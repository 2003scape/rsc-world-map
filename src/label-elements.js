const LABEL_STYLES = {
    position: 'absolute',
    userSelect: 'none',
    textShadow: '1px 1px #000',
    display: 'block',
    whiteSpace: 'nowrap',
    transformOrigin: '0 0'
};

class LabelElements {
    constructor(worldMap) {
        this.worldMap = worldMap;
        this.labels = this.worldMap.labels;
        this.planeWrap = this.worldMap.planeWrap;
    }

    init() {
        for (const label of this.labels) {
            const [x, y] = [label.x, label.y];
            const labelEl = document.createElement('span');

            labelEl.dataset.x = x;
            labelEl.dataset.y = y;

            labelEl.innerText = label.text;

            Object.assign(labelEl.style, LABEL_STYLES, {
                color: label.colour || '#fff',
                textAlign: label.align || 'left',
                fontSize: `${label.size + 2}px`,
                fontWeight: label.bold ? 'bold' : 'normal',
                top: `${y}px`,
                left: `${x}px`
            });

            this.planeWrap.appendChild(labelEl);
        }
    }

    refreshPlaneLevel() {
    }
}

module.exports = LabelElements;
