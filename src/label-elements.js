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

    addLabels() {
        for (const label of this.labels) {
            let [x, y] = [label.x, label.y];

            if (
                Math.floor(y / this.worldMap.imageHeight) !==
                this.worldMap.currentPlane
            ) {
                continue;
            }

            y %= this.worldMap.imageHeight;

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

    init() {
        this.addLabels();
    }

    refreshPlaneLevel() {
        if (this.worldMap.keyElements.showLabels) {
            this.addLabels();
        }
    }
}

module.exports = LabelElements;
