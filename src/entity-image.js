// the orange + symbol colour used to indicate game objects
const OBJECT_COLOUR = 'rgb(175, 95, 0)';

// only regular/evergreen trees outside of the wild are this colour
const TREE_COLOUR = 'rgb(0, 160, 0)';

// objects like dead trees and fungus are darker than rocks/signs in the wild
const WILD_TREE_COLOUR = 'rgb(112, 64, 0)';

// objects in the wild intended to be WILD_TREE_COLOUR
const WILD_SCENERY = new Set([4, 38, 70, 205]);

const OBJECT_IMAGE = makeObjectImage(OBJECT_COLOUR);
const TREE_IMAGE = makeObjectImage(TREE_COLOUR);
const WILD_TREE_IMAGE = makeObjectImage(WILD_TREE_COLOUR);

// used to colour objects/trees within the wilderness
function inWilderness(x, y) {
    return x >= 1440 && x <= 2304 && y >= 286 && y <= 1286;
}

// create the + symbols for entities
function makeObjectImage(colour) {
    const canvas = document.createElement('canvas');

    canvas.width = 3;
    canvas.height = 3;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = colour;
    ctx.fillRect(1, 0, 1, 3);
    ctx.fillRect(0, 1, 3, 1);

    return canvas;
}

function getObjectImage(id, x, y) {
    if (inWilderness(x, y) && WILD_SCENERY.has(id)) {
        return WILD_TREE_IMAGE;
    }

    if (id === 1) {
        return TREE_IMAGE;
    }

    return OBJECT_IMAGE;
}

module.exports = { getObjectImage };
