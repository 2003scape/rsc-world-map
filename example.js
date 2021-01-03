const WorldMap = require('./src');

const mapContainer = document.createElement('div');
mapContainer.style.height = '300px';
mapContainer.style.width = '300px';
mapContainer.style.border = '1px solid #000';

const worldMap = new WorldMap(mapContainer);

worldMap.init().then(() => {
    console.log('hi');
});

document.body.appendChild(mapContainer);
