[@emit-js/cli](../README.md) > ["cli"](../modules/_cli_.md) > [Cli](../classes/_cli_.cli.md)

# Class: Cli

## Hierarchy

**Cli**

## Index

### Methods

* [cli](_cli_.cli.md#cli)
* [findComposerPath](_cli_.cli.md#findcomposerpath)
* [globPaths](_cli_.cli.md#globpaths)
* [updateFromConfig](_cli_.cli.md#updatefromconfig)

---

## Methods

<a id="cli"></a>

###  cli

▸ **cli**(e: *`EventType`*): `Promise`<`any`>

*Defined in cli.ts:18*

**Parameters:**

| Name | Type |
| ------ | ------ |
| e | `EventType` |

**Returns:** `Promise`<`any`>

___
<a id="findcomposerpath"></a>

### `<Private>` findComposerPath

▸ **findComposerPath**(configPath: *`string`*, eventName: *`string`*): `Promise`<`string`>

*Defined in cli.ts:52*

**Parameters:**

| Name | Type |
| ------ | ------ |
| configPath | `string` |
| eventName | `string` |

**Returns:** `Promise`<`string`>

___
<a id="globpaths"></a>

### `<Private>` globPaths

▸ **globPaths**(argv: *`ParsedOptions`*): `Promise`<`string`[]>

*Defined in cli.ts:77*

**Parameters:**

| Name | Type |
| ------ | ------ |
| argv | `ParsedOptions` |

**Returns:** `Promise`<`string`[]>

___
<a id="updatefromconfig"></a>

### `<Private>` updateFromConfig

▸ **updateFromConfig**(argv: *`ParsedOptions`*, cwd: *`string` \| `undefined`*, eventName: *`string`*): `Promise`<[`string`, `string`]>

*Defined in cli.ts:88*

**Parameters:**

| Name | Type |
| ------ | ------ |
| argv | `ParsedOptions` |
| cwd | `string` \| `undefined` |
| eventName | `string` |

**Returns:** `Promise`<[`string`, `string`]>

___

