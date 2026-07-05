---
name: basementuniverse-texture-atlas
description: >
  Use when working with sprite sheets, texture atlases, or extracting rectangular regions from images into separate canvases. Handles grid-based and pixel-based extraction, repeating regions for animations, and integrates with @basementuniverse/content-manager.
---

# Basement Universe Texture Atlas

Use this skill when working with `@basementuniverse/texture-atlas`.

## When to Use This Skill

- Splitting sprite sheets into individual sprites or animation frames
- Extracting regions from texture atlases for game development
- Converting tiled image grids into separate canvases
- Creating animation frame sequences from sprite sheets
- Processing image assets with the Content Manager
- Working with grid-based or pixel-precise image extraction

## Key Concepts

### Operating Modes

The library operates in two modes:

1. **Relative Mode** (default): Image is divided into a grid of cells
   - Define grid dimensions (width × height in cells)
   - Region positions and sizes use cell coordinates
   - Supports cell margins for spacing between grid cells
   - Ideal for uniform sprite sheets with consistent spacing

2. **Absolute Mode**: Direct pixel-based positioning
   - Region positions and sizes use exact pixel coordinates
   - No grid constraints
   - Ideal for irregularly-sized regions or hand-positioned sprites

### Region Extraction

Each region is extracted from the source image and rendered into a new `HTMLCanvasElement`. Regions are defined with:
- Position (x, y)
- Optional size (width, height)
- Optional repetition for animation frames
- Customizable naming for repeated regions

### Animation Support

The `repeat` feature extracts multiple consecutive regions with automatic naming:
- Define how many frames to extract
- Control spacing between frames with `repeatOffset`
- Customize output names with `repeatNameFormat` template

## Common Usage Patterns

### Basic Grid Extraction

```typescript
import { textureAtlas } from '@basementuniverse/texture-atlas';

const spriteSheet = new Image();
spriteSheet.src = './sprites.png';
spriteSheet.onload = () => {
  const atlas = textureAtlas(spriteSheet, {
    relative: true,
    width: 4,      // 4 columns
    height: 3,     // 3 rows
    regions: {
      hero: { x: 0, y: 0 },           // Single cell at grid (0,0)
      enemy: { x: 2, y: 1, width: 2 }  // 2-cell wide region
    }
  });
  // atlas.hero and atlas.enemy are now HTMLCanvasElements
};
```

### Animation Frames

```typescript
const atlas = textureAtlas(spriteSheet, {
  relative: true,
  width: 8,
  height: 4,
  regions: {
    walk: {
      x: 0,
      y: 1,
      repeat: 4,  // Extract 4 frames
      // Creates: walk-1, walk-2, walk-3, walk-4
    }
  }
});
```

### Absolute Mode (Pixel-Precise)

```typescript
const atlas = textureAtlas(image, {
  relative: false,  // Use pixel coordinates
  regions: {
    logo: { x: 10, y: 20, width: 200, height: 100 },
    icon: { x: 220, y: 20, width: 64, height: 64 }
  }
});
```

### With Content Manager

```typescript
import { textureAtlasContentProcessor } from '@basementuniverse/texture-atlas';
import ContentManager from '@basementuniverse/content-manager';

ContentManager.initialise({
  processors: {
    textureAtlas: textureAtlasContentProcessor,
  },
});

ContentManager.load([
  {
    name: 'sprite-sheet',
    type: 'image',
    args: ['./sprites.png'],
  },
  {
    name: 'character',
    type: 'json',
    args: [{
      relative: true,
      width: 5,
      height: 2,
      regions: {
        idle: { x: 0, y: 0 },
        walk: { x: 1, y: 0, width: 4 },
      },
    }],
    processors: [{
      name: 'textureAtlas',
      args: ['sprite-sheet'],
    }],
  },
]);

// Results in content items: character_idle, character_walk
```

## Important Behaviors

### Default Values
- `relative: true` (grid mode)
- `width: 1`, `height: 1` (single cell)
- `cellMargin: 0` (no spacing)
- Region defaults:
  - Relative mode: 1×1 cells
  - Absolute mode: remaining width/height from position

### Cell Margins (Relative Mode Only)
Adjacent cell margins collapse, similar to CSS margin collapse:
- A margin of 2px between cells means 2px spacing, not 4px
- Margins are added between all grid cells

### Repeat Naming
Default format is `{name}-{n}` where:
- `{name}` = original region name
- `{n}` = 1-based index (starts at 1, not 0)

Custom format example: `repeatNameFormat: 'frame_{name}_{n}'`

### Content Manager Integration
When used as a content processor:
- Regions are added to content with keys: `{dataName}_{regionName}`
- Original image remains accessible
- All extracted regions become available as content items

## Error Handling

The library throws errors for:
- `width <= 0` or `height <= 0`
- No regions defined
- Invalid texture atlas options (when using content processor)
- Missing image reference (when using content processor)
- Failed canvas context creation

## References

- Public API surface: [references/api.md](references/api.md)
- Type reference: [references/types.md](references/types.md)
