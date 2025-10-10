# Function: getOffsetOrigin

▸ **getOffsetOrigin**(`viewport`, `coordinateSystem`, `coordinateOrigin?`): `Object`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `viewport` | [`WebMercatorViewport`](../classes/WebMercatorViewport.md) | `undefined` |
| `coordinateSystem` | `COORDINATE_SYSTEM` | `undefined` |
| `coordinateOrigin` | `number`[] | `DEFAULT_COORDINATE_ORIGIN` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `geospatialOrigin` | `any` |
| `shaderCoordinateOrigin` | `number`[] |
| `offsetMode` | `boolean` |

#### Defined in

[index.ts:244](https://github.com/sakitam-gis/mercator-proj/blob/master/src/index.ts#L244)
