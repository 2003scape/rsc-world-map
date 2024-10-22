const WorldMap = require('./src');

const container = document.createElement('div');
container.style.height = '300px';
container.style.width = '300px';
container.style.border = '1px solid #000';

const worldMap = new WorldMap({ container });

worldMap.init().then(() => {
    console.log('loaded');
});

document.body.style.background = '#000';
document.body.appendChild(container);
