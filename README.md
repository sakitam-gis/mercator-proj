[![Build Status](https://img.shields.io/travis/com/sakitam-gis/mercator-proj)](https://travis-ci.com/sakitam-gis/mercator-proj) [![GZIP size](http://img.badgesize.io/https://unpkg.com/mercator-proj/dist/mercator-proj.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/mercator-proj/dist/mercator-proj.min.js) [![GitHub license](https://img.shields.io/github/license/sakitam-gis/mercator-proj?style=flat-square)](https://github.com/sakitam-gis/mercator-proj/blob/main/LICENSE) [![NPM](https://img.shields.io/npm/v/mercator-proj.svg)](https://www.npmjs.com/package/mercator-proj)

   mercator-proj is a tool library for calculating web Mercator projection on GPU using webgl
   This project using a technique borrowed from [deck.gl](https://medium.com/vis-gl/how-sometimes-assuming-the-earth-is-flat-helps-speed-up-rendering-in-deck-gl-c43b72fd6db4),
all codes are from [deck.gl](https://github.com/visgl/deck.gl/blob/master/modules/core/src/shaderlib/project/project.glsl.js).
   The community already has projects like [mercator-gl](https://github.com/tsherif/mercator-gl), but I also found some problems in practical application see [link](https://github.com/tsherif/mercator-gl/issues/19), And by comparison deck.gl More abundant tool functions are provided.


## Use

```js
  const coordinates = [
    // [90.55771935117303, 39.90989714727357],
    // [102.51084435117338, 24.846755709924764],
    // [114.46396935117377, 39.232415634606724]
    [114.10487758204431, 38.88828732993963],
    [114.14962984763685, 38.8959443667861],
    [114.14943694993866, 38.87387184490794]
  ];

  class CustomLayer {
    constructor(options) {
      this.id = 'custom-layer';
      this.type = 'custom';
      this.renderingMode = '2d';

      this.options = { ...options };
    }

    onAdd(m, gl) {
      this.map = m;

      this.regl = createREGL({
        gl: gl,
      });

      const positions = [];

      coordinates.forEach((coords, i) => {
        // eslint-disable-next-line prefer-destructuring
        positions[i * 2] = coords[0];
        // eslint-disable-next-line prefer-destructuring
        positions[i * 2 + 1] = coords[1];
      });

      const precisionData = mercatorProj.highPrecisionLngLat(positions);

      const uniforms = {};

      const keys = mercatorProj.getUniformKeys();
      keys.forEach(key => {
        uniforms[key] = this.regl.prop(key);
      });

      this.drawTriangle = this.regl({

        // Shaders in regl are just strings.  You can use glslify or whatever you want
        // to define them.  No need to manually create shader objects.
        frag: `precision highp float;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 0.5);
}
`,

        vert: mercatorProj.injectMercatorGLSL(gl, `attribute vec2 positions;
attribute vec2 precisionBits;
attribute vec3 a_colors;
varying vec3 vColor;

void main(void) {
  gl_Position = project_position_to_clipspace(vec3(positions, 0.0), vec3(precisionBits, 0.0), vec3(0.0));
  vColor = a_colors;
}
`),

        // Here we define the vertex attributes for the above shader
        attributes: {
          // regl.buffer creates a new array buffer object
          positions: this.regl.buffer(positions),
          precisionBits: this.regl.buffer(precisionData),
          a_colors: this.regl.buffer([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]),
        },

        uniforms: uniforms,

        // This tells regl the number of vertices to draw in this command
        count: 3,
        primitive: 'triangle'
      });
    }

    render(gl, matrix) {
      const center = this.map.getCenter();
      const centerArray = center.toArray();
      const zoom = this.map.getZoom();
      const { width, height } = gl.canvas;

      // console.log(scale);
      // Mapbox passes us a projection matrix
      // const { projMatrix, invProjMatrix, glCoordMatrix, mercatorMatrix, width, height, pixelMatrix, pixelMatrixInverse } = this.map.transform;

      this.viewport = new mercatorProj.WebMercatorViewport({
        width: width,
        height: height,
        longitude: center && centerArray[0],
        latitude: center && centerArray[1],
        zoom,
        pitch: this.map.getPitch(),
        bearing: this.map.getBearing(),
      });

      const projectUniforms = mercatorProj.getUniforms({
        viewport: this.viewport,
        devicePixelRatio: 1,
        projectOffsetZoom: 12
      });

      const uniforms = {
        u_zoom: zoom,
        u_radiusScale: projectUniforms.project_metersPerPixel,
        ...projectUniforms,
      };

      window.uniforms = uniforms;
      window.viewport = this.viewport;

      this.drawTriangle(uniforms);
    }

    onRemove() {
    }
  }
```
