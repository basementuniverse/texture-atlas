# Public API Reference

## Functions

### `textureAtlas()`

Takes an image and texture atlas options, returns a dictionary of canvases indexed by region name.

**Signature:**
```typescript
function textureAtlas(
  image: HTMLImageElement | HTMLCanvasElement,
  options?: Partial<TextureAtlasOptions>
): TextureAtlasMap
```

**Parameters:**
- `image` - Source image to extract regions from. Can be an `HTMLImageElement` or `HTMLCanvasElement`.
- `options` - Optional configuration object. All properties are optional and will be merged with defaults.

**Returns:**
- `TextureAtlasMap` - Dictionary mapping region names to `HTMLCanvasElement` objects containing the extracted regions.

**Throws:**
- Error if `width <= 0` or `height <= 0`
- Error if no regions are defined
- Error if canvas context creation fails

**Example:**
```typescript
const atlas = textureAtlas(myImage, {
  relative: true,
  width: 4,
  height: 4,
  regions: {
    sprite1: { x: 0, y: 0 },
    sprite2: { x: 1, y: 0 },
  }
});
// atlas.sprite1 and atlas.sprite2 are HTMLCanvasElement objects
```

---

### `textureAtlasContentProcessor()`

Content Manager processor wrapper for using `textureAtlas()` as a content processor.

**Signature:**
```typescript
async function textureAtlasContentProcessor(
  content: Record<string, {
    name: string;
    type: string;
    content: any;
    status: string;
  }>,
  data: {
    name: string;
    type: string;
    content: any;
    status: string;
  },
  imageName: string
): Promise<void>
```

**Parameters:**
- `content` - Content Manager's content dictionary. Extracted regions will be added here.
- `data` - Content item being processed. `data.content` should contain `TextureAtlasOptions`.
- `imageName` - Name of the image content item to extract regions from.

**Side Effects:**
- Adds extracted regions to `content` with keys: `{data.name}_{regionName}`
- Each region entry has:
  - `name`: region name
  - `type`: `'image'`
  - `content`: `HTMLCanvasElement` containing the region
  - `status`: `'processed'`

**Throws:**
- Error if `data.content` is not valid `TextureAtlasOptions`
- Error if image with `imageName` is not found in `content`

**Example:**
```typescript
import ContentManager from '@basementuniverse/content-manager';
import { textureAtlasContentProcessor } from '@basementuniverse/texture-atlas';

ContentManager.initialise({
  processors: {
    atlas: textureAtlasContentProcessor,
  },
});

ContentManager.load([
  { name: 'sheet', type: 'image', args: ['./sheet.png'] },
  {
    name: 'myAtlas',
    type: 'json',
    args: [{
      relative: true,
      width: 4,
      height: 4,
      regions: { icon: { x: 0, y: 0 } }
    }],
    processors: [{ name: 'atlas', args: ['sheet'] }]
  }
]);

// Result: content item 'myAtlas_icon' will be available
const icon = ContentManager.get('myAtlas_icon');
```

---

## Type Guards

### `isTextureAtlasOptions()`

Type guard to check if a value is a valid `TextureAtlasOptions` object.

**Signature:**
```typescript
function isTextureAtlasOptions(value: unknown): value is TextureAtlasOptions
```

**Parameters:**
- `value` - Value to check

**Returns:**
- `true` if value is a valid `TextureAtlasOptions` object
- `false` otherwise

**Validation:**
- Checks for required properties: `relative`, `width`, `height`, `regions`
- Validates all property types
- Recursively validates all regions using `isTextureAtlasRegion()`
- Checks optional `cellMargin` if present

---

### `isTextureAtlasRegion()`

Type guard to check if a value is a valid `TextureAtlasRegion` object.

**Signature:**
```typescript
function isTextureAtlasRegion(value: unknown): value is TextureAtlasRegion
```

**Parameters:**
- `value` - Value to check

**Returns:**
- `true` if value is a valid `TextureAtlasRegion` object
- `false` otherwise

**Validation:**
- Checks for required properties: `x`, `y`
- Validates all property types
- Checks optional properties if present: `width`, `height`, `repeat`, `repeatOffset`, `repeatNameFormat`
- Validates `repeatOffset` structure if present

---

## Default Configuration

```typescript
{
  relative: true,
  width: 1,
  height: 1,
  regions: {
    default: { x: 0, y: 0 }
  },
  cellMargin: 0
}
```

## Constants

### `DEFAULT_REPEATING_REGION_NAME_FORMAT`

Default template for naming repeated regions: `'{name}-{n}'`

Where:
- `{name}` is replaced with the region name
- `{n}` is replaced with the 1-based repetition index
