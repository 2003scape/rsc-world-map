# rsc-world-map
interactive world map for runescape classic.

features:
* mobile and tablet support with touch controls
* works with any *height x width* >= `300px x 300px`
* four levels of zoom with crisp, pixelated landscape and anti-aliased text
* overview box for quick navigation across ends of the map
* go up and down plane levels to view dungeons and upstairs areas
* search box with automatic suggestions
* toggle labels, object and points of interest
* native javascript with zero framework dependencies, just import and specify a
block container element
* zero additional HTTP requests - everything packed inside the javascript

## install

    $ npm install @2003scape/rsc-world-map

## usage
```javascript
const WorldMap = require('@2003scape/rsc-world-map');

const container = document.createElement('div');
container.style.height = '300px';
container.style.width = '300px';
container.style.border = '1px solid #f0f';

const worldMap = new WorldMap({ container });

worldMap.init().then(() => {
    console.log('loaded');
});

document.body.style.background = '#000';
document.body.appendChild(container);
```

## api

### worldMap = new WorldMap({ container, labels?, points?, objects? })
create a new worldMap instance.

`container` is any block element.

the rest of the properties are optional, and defaulted to official runescape
classic entries (located in `./res`):

`labels` are used for the text overlay on the map:

```javascript
{
    "text": "Kingdom of\nKandarin",
    "x": 7705,
    "y": 6821,
    "size": 12,
    "align": "center" || "left",
    "bold": true, // optional
    "colour": "rgb(254, 165, 0)" || "#ff00ff" || "red" // optional
}
```

`points` are used for the point-of-interest symbols on the map. there's a list
of point types in [`./res/key.json`](/res/key.json):

```javascript
{ "type": "altar", "x": 7253, "y": 7272 }
```

the coordinates for points and labels are absolute.

`objects` are used for the *+* symbols peppered over the map:

```javascript
{ "id": 0, "x": 345, "y": 538 }
```

the coordinates for objects are in-game coordinates from
[@2003scape/rsc-data](https://github.com/2003scape/rsc-data/blob/master/locations/objects.json)
(note that `direction` is not needed here). trees (id 0) are coloured green
while the rest are orange.

### worldMap.init()
load the images, attach the event handlers and populate the container element.

## static map images
to generate a static PNG of the world map, use the CLI tool in
[@2003scape/rsc-landscape](https://github.com/2003scape/rsc-landscape#cli-usage)

you can also use this to generate the `plane-x.png` images in [`./res/`](/res/).

## license
Copyright (C) 2021  2003Scape Team

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
