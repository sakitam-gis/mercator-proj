# Function: memoize

▸ **memoize**(`compute`): (`args`: `any`) => \{ `[key: string]`: `any`;  }

Speed up consecutive function calls by caching the result of calls with identical input
https://en.wikipedia.org/wiki/Memoization

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compute` | (`args`: `any`) => `any` | the function to be memoized |

#### Returns

`fn`

▸ (`args`): `Object`

##### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `any` |

##### Returns

`Object`

#### Defined in

[index.ts:78](https://github.com/sakitam-gis/mercator-proj/blob/master/src/index.ts#L78)
