const BOX_STYLES = {
    backgroundColor: '#000',
    border: '2px solid #fff',
    boxSizing: 'border-box',
    boxShadow: '4px 4px 8px #222',
    outline: '2px solid #000',
    position: 'absolute',
    display: 'none',
    padding: '4px',
    fontSize: '13px',
    zIndex: 1
};

function getBox() {
    const box = document.createElement('div');

    box.tabIndex = 0;
    Object.assign(box.style, BOX_STYLES);

    return box;
}

module.exports = { getBox };
