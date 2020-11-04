[![Build Status](https://img.shields.io/travis/com/sakitam-gis/mercator-proj)](https://travis-ci.com/sakitam-gis/mercator-proj) [![GZIP size](https://badge-size.herokuapp.com/sakitam-gis/mercator-proj/master/build/mercator-proj.min.js.svg?compression=gzip)](https://github.com/sakitam-gis/mercator-proj/blob/master/build/mercator-proj.min.js) [![License](https://img.shields.io/github/license/sakitam-gis/mercator-proj.svg)](https://github.com/sakitam-gis/mercator-proj/blob/master/LICENSE) [![NPM](https://img.shields.io/npm/v/mercator-proj.svg)](https://www.npmjs.com/package/mercator-proj)

   mercator-proj is a tool library for calculating web Mercator projection on GPU using webgl
   This project using a technique borrowed from [deck.gl](https://medium.com/vis-gl/how-sometimes-assuming-the-earth-is-flat-helps-speed-up-rendering-in-deck-gl-c43b72fd6db4),
all codes are from [deck.gl](https://github.com/visgl/deck.gl/blob/master/modules/core/src/shaderlib/project/project.glsl.js).
   The community already has projects like [mercator-gl](https://github.com/tsherif/mercator-gl), but I also found some problems in practical application see [link](https://github.com/tsherif/mercator-gl/issues/19), And by comparison deck.gl More abundant tool functions are provided.


