[![Build Status](https://img.shields.io/travis/com/sakitam-gis/mercator-proj)](https://travis-ci.com/sakitam-gis/mercator-proj) [![GZIP size](http://img.badgesize.io/https://unpkg.com/mercator-proj/dist/mercator-proj.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/mercator-proj/dist/mercator-proj.min.js) [![GitHub license](https://img.shields.io/github/license/sakitam-gis/mercator-proj?style=flat-square)](https://github.com/sakitam-gis/mercator-proj/blob/main/LICENSE) [![NPM](https://img.shields.io/npm/v/mercator-proj.svg)](https://www.npmjs.com/package/mercator-proj)

   mercator-proj is a tool library for calculating web Mercator projection on GPU using webgl
   This project using a technique borrowed from [deck.gl](https://medium.com/vis-gl/how-sometimes-assuming-the-earth-is-flat-helps-speed-up-rendering-in-deck-gl-c43b72fd6db4),
all codes are from [deck.gl](https://github.com/visgl/deck.gl/blob/master/modules/core/src/shaderlib/project/project.glsl.js).
   The community already has projects like [mercator-gl](https://github.com/tsherif/mercator-gl), but I also found some problems in practical application see [link](https://github.com/tsherif/mercator-gl/issues/19), And by comparison deck.gl More abundant tool functions are provided.


