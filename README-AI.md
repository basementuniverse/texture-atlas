# Texture Atlas Library - AI Documentation

## Overview
TypeScript library for extracting rectangular regions from images into separate canvases. Supports grid-based (relative) and pixel-based (absolute) positioning, repeating regions, and cell margins.

## Core Function

```typescript
textureAtlas(
  image: HTMLImageElement | HTMLCanvasElement,
  options?: Partial<TextureAtlasOptions>
): TextureAtlasMap
```

Returns dictionary mapping region names to HTMLCanvasElement objects containing extracted image regions.

## Types

```typescript
type TextureAtlasOptions = {
  relative: boolean;              // true=grid mode, false=pixel mode
  width: number;                  // grid columns (relative) or unused (absolute)
  height: number;                 // grid rows (relative) or unused (absolute)
  regions: Record<string, TextureAtlasRegion>;
  cellMargin?: number;            // pixel spacing between cells (relative mode only, default 0)
}

type TextureAtlasRegion = {
  x: number;                      // offset in cells (relative) or pixels (absolute)
  y: number;                      // offset in cells (relative) or pixels (absolute)
  width?: number;                 // size in cells (relative) or pixels (absolute)
                                  // defaults: relative=1, absolute=remaining width
  height?: number;                // size in cells (relative) or pixels (absolute)
                                  // defaults: relative=1, absolute=remaining height
  repeat?: number;                // if >0, create multiple regions
  repeatOffset?: {                // offset between repetitions
    x: number;                    // default: width (relative mode) or width (absolute mode)
    y: number;                    // default: 0
  };                              // measured in cells (relative) or pixels (absolute)
  repeatNameFormat?: string;      // default '{name}-{n}', {name}=region name, {n}=1-based index
}

type TextureAtlasMap = Record<string, HTMLCanvasElement>;
```

## Type Guards

```typescript
isTextureAtlasOptions(value: unknown): value is TextureAtlasOptions
isTextureAtlasRegion(value: unknown): value is TextureAtlasRegion
```

## Content Manager Integration

```typescript
textureAtlasContentProcessor(
  content: Record<string, {name: string; type: string; content: any; status: string}>,
  data: {name: string; type: string; content: any; status: string},
  imageName: string
): Promise<void>
```

Processor for @basementuniverse/content-manager. Extracts regions and adds them to content dictionary with keys `{data.name}_{regionName}`.

## Behavior Details

### Relative Mode (relative: true)
- Image divided into `width` × `height` grid
- `cellWidth = (image.width - cellMargin) / width`
- `cellHeight = (image.height - cellMargin) / height`
- Region coordinates/sizes multiplied by cell dimensions
- cellMargin adds pixel spacing (collapsed between adjacent cells)
- Default region size: 1×1 cells

### Absolute Mode (relative: false)
- Direct pixel coordinates
- width/height options ignored
- Region coordinates/sizes in pixels
- Default region size: width=remaining, height=remaining
- cellMargin ignored

### Repeating Regions
- `repeat > 0`: creates multiple regions
- Names formatted via repeatNameFormat: '{name}' → region name, '{n}' → 1-based index
- Default repeatOffset: x advances by region width, y stays 0
- Each repetition offset by `repeatOffset * index`

### Defaults
```typescript
{
  relative: true,
  width: 1,
  height: 1,
  regions: { default: { x: 0, y: 0 } },
  cellMargin: 0
}
```

## Error Conditions
- `width <= 0` or `height <= 0`: throws
- Empty regions object: throws
- Missing 2D context: throws
- Invalid texture atlas options (content processor): throws
- Missing image reference (content processor): throws

## Usage Patterns

### Basic Grid Extraction
```typescript
textureAtlas(image, {
  relative: true,
  width: 4,
  height: 3,
  regions: {
    sprite1: { x: 0, y: 0 },
    sprite2: { x: 1, y: 0, width: 2, height: 2 }
  }
})
```

### Animation Frames
```typescript
textureAtlas(image, {
  relative: true,
  width: 8,
  height: 1,
  regions: {
    walk: { x: 0, y: 0, repeat: 8, repeatNameFormat: '{name}_{n}' }
  }
})
// Returns: { walk_1, walk_2, ..., walk_8 }
```

### Absolute Positioning
```typescript
textureAtlas(image, {
  relative: false,
  width: 0,
  height: 0,
  regions: {
    icon: { x: 10, y: 20, width: 32, height: 32 }
  }
})
```

### With Cell Margins
```typescript
textureAtlas(image, {
  relative: true,
  width: 4,
  height: 4,
  cellMargin: 2,
  regions: { tile: { x: 0, y: 0 } }
})
// 2px margin applied to all sides of each cell
```
