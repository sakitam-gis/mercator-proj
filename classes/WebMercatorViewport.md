# Class: WebMercatorViewport

## Table of contents

### Constructors

- [constructor](WebMercatorViewport.md#constructor)

### Properties

- [id](WebMercatorViewport.md#id)
- [latitude](WebMercatorViewport.md#latitude)
- [altitude](WebMercatorViewport.md#altitude)
- [longitude](WebMercatorViewport.md#longitude)
- [zoom](WebMercatorViewport.md#zoom)
- [pitch](WebMercatorViewport.md#pitch)
- [bearing](WebMercatorViewport.md#bearing)
- [isGeospatial](WebMercatorViewport.md#isgeospatial)
- [scale](WebMercatorViewport.md#scale)
- [width](WebMercatorViewport.md#width)
- [height](WebMercatorViewport.md#height)
- [center](WebMercatorViewport.md#center)
- [modelMatrix](WebMercatorViewport.md#modelmatrix)
- [viewMatrix](WebMercatorViewport.md#viewmatrix)
- [viewMatrixInverse](WebMercatorViewport.md#viewmatrixinverse)
- [viewMatrixUncentered](WebMercatorViewport.md#viewmatrixuncentered)
- [projectionMatrix](WebMercatorViewport.md#projectionmatrix)
- [pixelProjectionMatrix](WebMercatorViewport.md#pixelprojectionmatrix)
- [pixelUnprojectionMatrix](WebMercatorViewport.md#pixelunprojectionmatrix)
- [viewportMatrix](WebMercatorViewport.md#viewportmatrix)
- [viewProjectionMatrix](WebMercatorViewport.md#viewprojectionmatrix)
- [cameraPosition](WebMercatorViewport.md#cameraposition)
- [focalDistance](WebMercatorViewport.md#focaldistance)
- [distanceScales](WebMercatorViewport.md#distancescales)
- [position](WebMercatorViewport.md#position)
- [projectOffsetZoom](WebMercatorViewport.md#projectoffsetzoom)

### Accessors

- [metersPerPixel](WebMercatorViewport.md#metersperpixel)
- [projectionMode](WebMercatorViewport.md#projectionmode)
- [subViewports](WebMercatorViewport.md#subviewports)

### Methods

- [equals](WebMercatorViewport.md#equals)
- [project](WebMercatorViewport.md#project)
- [unproject](WebMercatorViewport.md#unproject)
- [projectPosition](WebMercatorViewport.md#projectposition)
- [unprojectPosition](WebMercatorViewport.md#unprojectposition)
- [projectFlat](WebMercatorViewport.md#projectflat)
- [unprojectFlat](WebMercatorViewport.md#unprojectflat)
- [getDistanceScales](WebMercatorViewport.md#getdistancescales)
- [containsPixel](WebMercatorViewport.md#containspixel)
- [getFrustumPlanes](WebMercatorViewport.md#getfrustumplanes)
- [getCameraPosition](WebMercatorViewport.md#getcameraposition)
- [\_createProjectionMatrix](WebMercatorViewport.md#_createprojectionmatrix)
- [\_initViewMatrix](WebMercatorViewport.md#_initviewmatrix)
- [\_initProjectionMatrix](WebMercatorViewport.md#_initprojectionmatrix)
- [\_initPixelMatrices](WebMercatorViewport.md#_initpixelmatrices)
- [\_getCenterInWorld](WebMercatorViewport.md#_getcenterinworld)
- [addMetersToLngLat](WebMercatorViewport.md#addmeterstolnglat)
- [getMapCenterByLngLatPosition](WebMercatorViewport.md#getmapcenterbylnglatposition)
- [getBounds](WebMercatorViewport.md#getbounds)

## Constructors

### constructor

• **new WebMercatorViewport**(`opts`): [`WebMercatorViewport`](WebMercatorViewport.md)

Manages coordinate system transformations for deck.gl.
Note: The WebMercatorViewport is immutable in the sense that it only has accessors.
A new viewport instance should be created if any parameters have changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Partial`\<`IViewport`\> |

#### Returns

[`WebMercatorViewport`](WebMercatorViewport.md)

#### Defined in

[viewport/viewport.ts:153](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L153)

## Properties

### id

• **id**: `string` \| `number`

#### Defined in

[viewport/viewport.ts:111](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L111)

___

### latitude

• **latitude**: `number`

#### Defined in

[viewport/viewport.ts:112](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L112)

___

### altitude

• **altitude**: `number`

#### Defined in

[viewport/viewport.ts:113](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L113)

___

### longitude

• **longitude**: `number`

#### Defined in

[viewport/viewport.ts:114](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L114)

___

### zoom

• **zoom**: `number`

#### Defined in

[viewport/viewport.ts:115](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L115)

___

### pitch

• **pitch**: `number`

#### Defined in

[viewport/viewport.ts:116](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L116)

___

### bearing

• **bearing**: `number`

#### Defined in

[viewport/viewport.ts:117](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L117)

___

### isGeospatial

• **isGeospatial**: `boolean`

#### Defined in

[viewport/viewport.ts:118](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L118)

___

### scale

• **scale**: `number`

#### Defined in

[viewport/viewport.ts:119](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L119)

___

### width

• **width**: `number`

#### Defined in

[viewport/viewport.ts:120](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L120)

___

### height

• **height**: `number`

#### Defined in

[viewport/viewport.ts:121](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L121)

___

### center

• **center**: `number`[]

#### Defined in

[viewport/viewport.ts:122](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L122)

___

### modelMatrix

• **modelMatrix**: `number`[]

#### Defined in

[viewport/viewport.ts:124](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L124)

___

### viewMatrix

• **viewMatrix**: `number`[]

#### Defined in

[viewport/viewport.ts:125](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L125)

___

### viewMatrixInverse

• **viewMatrixInverse**: `number`[]

#### Defined in

[viewport/viewport.ts:126](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L126)

___

### viewMatrixUncentered

• **viewMatrixUncentered**: `number`[]

#### Defined in

[viewport/viewport.ts:127](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L127)

___

### projectionMatrix

• **projectionMatrix**: `Float32Array` \| `number`[]

#### Defined in

[viewport/viewport.ts:128](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L128)

___

### pixelProjectionMatrix

• **pixelProjectionMatrix**: `number`[]

#### Defined in

[viewport/viewport.ts:129](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L129)

___

### pixelUnprojectionMatrix

• **pixelUnprojectionMatrix**: `number`[]

#### Defined in

[viewport/viewport.ts:130](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L130)

___

### viewportMatrix

• **viewportMatrix**: `number`[]

#### Defined in

[viewport/viewport.ts:131](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L131)

___

### viewProjectionMatrix

• **viewProjectionMatrix**: `number`[]

#### Defined in

[viewport/viewport.ts:132](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L132)

___

### cameraPosition

• **cameraPosition**: `number`[]

#### Defined in

[viewport/viewport.ts:134](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L134)

___

### focalDistance

• **focalDistance**: `number`

#### Defined in

[viewport/viewport.ts:135](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L135)

___

### distanceScales

• **distanceScales**: `IDistanceScales`

#### Defined in

[viewport/viewport.ts:136](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L136)

___

### position

• **position**: `number`[]

#### Defined in

[viewport/viewport.ts:137](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L137)

___

### projectOffsetZoom

• **projectOffsetZoom**: `number`

#### Defined in

[viewport/viewport.ts:138](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L138)

## Accessors

### metersPerPixel

• `get` **metersPerPixel**(): `number`

#### Returns

`number`

#### Defined in

[viewport/viewport.ts:272](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L272)

___

### projectionMode

• `get` **projectionMode**(): `WEB_MERCATOR` \| `WEB_MERCATOR_AUTO_OFFSET` \| `IDENTITY`

#### Returns

`WEB_MERCATOR` \| `WEB_MERCATOR_AUTO_OFFSET` \| `IDENTITY`

#### Defined in

[viewport/viewport.ts:276](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L276)

___

### subViewports

• `get` **subViewports**(): `undefined` \| [`WebMercatorViewport`](WebMercatorViewport.md)[]

#### Returns

`undefined` \| [`WebMercatorViewport`](WebMercatorViewport.md)[]

#### Defined in

[viewport/viewport.ts:637](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L637)

## Methods

### equals

▸ **equals**(`viewport`): `boolean`

Two viewports are equal if width and height are identical, and if
   their view and projection matrices are (approximately) equal.

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewport` | `any` |

#### Returns

`boolean`

#### Defined in

[viewport/viewport.ts:290](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L290)

___

### project

▸ **project**(`xyz`, `xyz?`): `number`[]

Projects xyz (possibly latitude and longitude) to pixel coordinates in window
using viewport projection parameters
- [longitude, latitude] to [x, y]
- [longitude, latitude, Z] => [x, y, z]
Note: By default, returns top-left coordinates for canvas/SVG type render

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `xyz` | `number`[] | `undefined` |
| `xyz` | `Object` | `{}` |
| `xyz.topLeft?` | `boolean` | `true` |

#### Returns

`number`[]

- [x, y] or [x, y, z] in top left coords

#### Defined in

[viewport/viewport.ts:319](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L319)

___

### unproject

▸ **unproject**(`xyz`, `opts?`): (`undefined` \| `number`)[]

Unproject pixel coordinates on screen onto world coordinates,
(possibly [lon, lat]) on map.
- [x, y] => [lng, lat]
- [x, y, z] => [lng, lat, Z]

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `xyz` | `number`[] | `undefined` |  |
| `opts` | `Object` | `{}` | options |
| `opts.topLeft?` | `boolean` | `true` | - |
| `opts.targetZ?` | `number` | `undefined` | - |

#### Returns

(`undefined` \| `number`)[]

- [lng, lat, Z] or [X, Y, Z]

#### Defined in

[viewport/viewport.ts:345](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L345)

___

### projectPosition

▸ **projectPosition**(`xyz`): `number`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `xyz` | `number`[] |

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:370](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L370)

___

### unprojectPosition

▸ **unprojectPosition**(`xyz`): `number`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `xyz` | `number`[] |

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:376](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L376)

___

### projectFlat

▸ **projectFlat**(`xyz`): `number`[]

Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
Performs the nonlinear part of the web mercator projection.
Remaining projection is done with 4x4 matrices which also handles
perspective.
  Specifies a point on the sphere to project onto the map.

#### Parameters

| Name | Type |
| :------ | :------ |
| `xyz` | `number`[] |

#### Returns

`number`[]

[x,y] coordinates.

#### Defined in

[viewport/viewport.ts:391](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L391)

___

### unprojectFlat

▸ **unprojectFlat**(`xyz`): `number`[]

Unproject world point [x,y] on map onto {lat, lon} on sphere
 representing point on projected map plane

#### Parameters

| Name | Type |
| :------ | :------ |
| `xyz` | `number`[] |

#### Returns

`number`[]

- object with {lat,lon} of point on sphere.
  Has toArray method if you need a GeoJSON Array.
  Per cartographic tradition, lat and lon are specified as degrees.

#### Defined in

[viewport/viewport.ts:406](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L406)

___

### getDistanceScales

▸ **getDistanceScales**(`coordinateOrigin`): `IDistanceScales`

#### Parameters

| Name | Type |
| :------ | :------ |
| `coordinateOrigin` | ``null`` \| `number`[] |

#### Returns

`IDistanceScales`

#### Defined in

[viewport/viewport.ts:413](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L413)

___

### containsPixel

▸ **containsPixel**(`«destructured»`): `boolean`

Judge whether the position is in the range

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | `undefined` |
| › `x` | `number` | `undefined` |
| › `y` | `number` | `undefined` |
| › `width?` | `number` | `1` |
| › `height?` | `number` | `1` |

#### Returns

`boolean`

#### Defined in

[viewport/viewport.ts:431](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L431)

___

### getFrustumPlanes

▸ **getFrustumPlanes**(): `FrustumPlanesInterface`

Extract frustum planes in common space

#### Returns

`FrustumPlanesInterface`

#### Defined in

[viewport/viewport.ts:438](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L438)

___

### getCameraPosition

▸ **getCameraPosition**(): `number`[]

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:449](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L449)

___

### \_createProjectionMatrix

▸ **_createProjectionMatrix**(`«destructured»`): `number`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `fovyRadians` | `number` |
| › `aspect` | `number` |
| › `focalDistance` | `number` |
| › `orthographic?` | `boolean` |
| › `near?` | `number` |
| › `far?` | `number` |

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:454](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L454)

___

### \_initViewMatrix

▸ **_initViewMatrix**(`opts`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `IViewportOpts` |

#### Returns

`void`

#### Defined in

[viewport/viewport.ts:485](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L485)

___

### \_initProjectionMatrix

▸ **_initProjectionMatrix**(`opts`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `IViewportOpts` |

#### Returns

`void`

#### Defined in

[viewport/viewport.ts:547](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L547)

___

### \_initPixelMatrices

▸ **_initPixelMatrices**(): `void`

#### Returns

`void`

#### Defined in

[viewport/viewport.ts:573](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L573)

___

### \_getCenterInWorld

▸ **_getCenterInWorld**(`«destructured»`): `number`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `longitude` | `number` |
| › `latitude` | `number` |

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:616](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L616)

___

### addMetersToLngLat

▸ **addMetersToLngLat**(`lngLatZ`, `xyz`): `number`[]

Add a meter delta to a base lnglat coordinate, returning a new lnglat array

Note: Uses simple linear approximation around the viewport center
Error increases with size of offset (roughly 1% per 100km)

#### Parameters

| Name | Type |
| :------ | :------ |
| `lngLatZ` | `number`[] |
| `xyz` | [`number`, `number`, `number`] |

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:664](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L664)

___

### getMapCenterByLngLatPosition

▸ **getMapCenterByLngLatPosition**(`«destructured»`): `number`[]

Get the map center that place a given [lng, lat] coordinate at screen
point [x, y]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `lngLat` | `number`[] |
| › `pos` | `number`[] |

#### Returns

`number`[]

[lng,lat] new map center.

#### Defined in

[viewport/viewport.ts:678](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L678)

___

### getBounds

▸ **getBounds**(`options?`): `number`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |

#### Returns

`number`[]

#### Defined in

[viewport/viewport.ts:688](https://github.com/sakitam-gis/mercator-proj/blob/master/src/viewport/viewport.ts#L688)
