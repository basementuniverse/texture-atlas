/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.textureAtlasContentProcessor = exports.textureAtlas = void 0;\nconst DEFAULT_REPEATING_REGION_NAME_FORMAT = '{name}-{n}';\nconst DEFAULT_OPTIONS = {\n    relative: true,\n    width: 1,\n    height: 1,\n    regions: {\n        default: {\n            x: 0,\n            y: 0,\n        },\n    },\n    cellMargin: 0,\n};\n/**\n * Takes an image and some texture atlas options and returns a dictionary\n * of canvases indexed by region name\n */\nfunction textureAtlas(image, options) {\n    var _a, _b, _c, _d;\n    const actualOptions = Object.assign({}, DEFAULT_OPTIONS, options !== null && options !== void 0 ? options : {});\n    if (actualOptions.width <= 0 || actualOptions.height <= 0) {\n        throw new Error('Width and height must be greater than 0');\n    }\n    if (Object.keys(actualOptions.regions).length === 0) {\n        throw new Error('No regions defined');\n    }\n    let cellWidth = 1;\n    let cellHeight = 1;\n    if (actualOptions.relative) {\n        let imageWidth = image.width;\n        let imageHeight = image.height;\n        if (actualOptions.cellMargin > 0) {\n            imageWidth -= actualOptions.cellMargin;\n            imageHeight -= actualOptions.cellMargin;\n        }\n        cellWidth = Math.ceil(imageWidth / actualOptions.width);\n        cellHeight = Math.ceil(imageHeight / actualOptions.height);\n    }\n    const map = {};\n    for (const [name, region] of Object.entries(actualOptions.regions)) {\n        let absoluteX = Math.floor(region.x * cellWidth);\n        let absoluteY = Math.floor(region.y * cellHeight);\n        let absoluteWidth = Math.ceil(region.width\n            ? (actualOptions.relative\n                ? region.width * cellWidth\n                : region.width)\n            : (actualOptions.relative\n                ? cellWidth\n                : image.width - absoluteX));\n        let absoluteHeight = Math.ceil(region.height\n            ? (actualOptions.relative\n                ? region.height * cellHeight\n                : region.height)\n            : (actualOptions.relative\n                ? cellHeight\n                : image.height - absoluteY));\n        if (actualOptions.relative && actualOptions.cellMargin > 0) {\n            absoluteX += actualOptions.cellMargin;\n            absoluteY += actualOptions.cellMargin;\n            absoluteWidth -= actualOptions.cellMargin;\n            absoluteHeight -= actualOptions.cellMargin;\n        }\n        if (region.repeat && region.repeat > 0) {\n            for (let i = 0; i < region.repeat; i++) {\n                const repeatName = getRepeatingRegionName(name, i + 1, region.repeatNameFormat);\n                let repeatOffsetX = Math.floor((((_a = region.repeatOffset) === null || _a === void 0 ? void 0 : _a.x) !== undefined &&\n                    ((_b = region.repeatOffset) === null || _b === void 0 ? void 0 : _b.x) !== null)\n                    ? (actualOptions.relative\n                        ? region.repeatOffset.x * cellWidth\n                        : region.repeatOffset.x)\n                    : cellWidth);\n                let repeatOffsetY = Math.floor((((_c = region.repeatOffset) === null || _c === void 0 ? void 0 : _c.y) !== undefined &&\n                    ((_d = region.repeatOffset) === null || _d === void 0 ? void 0 : _d.y) !== null)\n                    ? (actualOptions.relative\n                        ? region.repeatOffset.y * cellHeight\n                        : region.repeatOffset.y)\n                    : 0);\n                map[repeatName] = chopRegion(image, absoluteX + repeatOffsetX * i, absoluteY + repeatOffsetY * i, absoluteWidth, absoluteHeight);\n            }\n        }\n        else {\n            map[name] = chopRegion(image, absoluteX, absoluteY, absoluteWidth, absoluteHeight);\n        }\n    }\n    return map;\n}\nexports.textureAtlas = textureAtlas;\n/**\n * Chop a rectangular region from an image into a new canvas\n */\nfunction chopRegion(image, x, y, width, height) {\n    const canvas = document.createElement('canvas');\n    const context = canvas.getContext('2d');\n    canvas.width = width;\n    canvas.height = height;\n    if (!context) {\n        throw new Error('Failed to get 2D context');\n    }\n    context.drawImage(image, x, y, width, height, 0, 0, width, height);\n    return canvas;\n}\n/**\n * Get the name of a repeating region\n */\nfunction getRepeatingRegionName(regionName, repetitionIndex, regionNameFormat) {\n    return (regionNameFormat !== null && regionNameFormat !== void 0 ? regionNameFormat : DEFAULT_REPEATING_REGION_NAME_FORMAT)\n        .replace('{name}', regionName)\n        .replace('{n}', repetitionIndex.toString());\n}\n/**\n * Content Manager Processor wrapper which allows the textureAtlas function\n * to be used as a processor in a Content Manager\n *\n * @see https://www.npmjs.com/package/@basementuniverse/content-manager\n */\nasync function textureAtlasContentProcessor(content, data, imageName) {\n    var _a;\n    const image = (_a = content[imageName]) === null || _a === void 0 ? void 0 : _a.content;\n    if (!image) {\n        throw new Error(`Image '${imageName}' not found`);\n    }\n    const map = textureAtlas(image, data.content);\n    for (const [name, canvas] of Object.entries(map)) {\n        content[name] = {\n            name,\n            type: 'image',\n            content: canvas,\n            status: 4,\n        };\n    }\n}\nexports.textureAtlasContentProcessor = textureAtlasContentProcessor;\n\n\n//# sourceURL=webpack://@basementuniverse/texture-atlas/./index.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./index.ts"](0, __webpack_exports__);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});