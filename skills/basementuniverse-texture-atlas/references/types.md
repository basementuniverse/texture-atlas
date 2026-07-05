# Type Reference

## Types

### `TextureAtlasOptions`

Configuration object for the texture atlas extraction.

```typescript
type TextureAtlasOptions = {
  relative: boolean;
  width: number;
  height: number;
  regions: Record<string, TextureAtlasRegion>;
  cellMargin?: number;
}
```

**Properties:**

- **`relative`** (`boolean`): Operating mode selector
  - `true`: Relative mode - image divided into grid of cells
  - `false`: Absolute mode - direct pixel coordinates
  - Default: `true`

- **`width`** (`number`): Grid width in cells
  - Only used in relative mode
  - Must be greater than 0
  - Default: `1`

- **`height`** (`number`): Grid height in cells
  - Only used in relative mode
  - Must be greater than 0
  - Default: `1`

- **`regions`** (`Record<string, TextureAtlasRegion>`): Dictionary of regions to extract
  - Keys are region names (become keys in output map)
  - Values are region definitions
  - Required (cannot be empty)

- **`cellMargin`** (`number`, optional): Pixel spacing between grid cells
  - Only used in relative mode
  - Adjacent margins collapse (like CSS margins)
  - Default: `0`

---

### `TextureAtlasRegion`

Defines a single region to extract from the source image.

```typescript
type TextureAtlasRegion = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  repeat?: number;
  repeatOffset?: {
    x: number;
    y: number;
  };
  repeatNameFormat?: string;
}
```

**Properties:**

- **`x`** (`number`): Horizontal offset
  - Relative mode: measured in cells
  - Absolute mode: measured in pixels

- **`y`** (`number`): Vertical offset
  - Relative mode: measured in cells
  - Absolute mode: measured in pixels

- **`width`** (`number`, optional): Region width
  - Relative mode: measured in cells (default: `1`)
  - Absolute mode: measured in pixels (default: remaining width from `x` to image edge)

- **`height`** (`number`, optional): Region height
  - Relative mode: measured in cells (default: `1`)
  - Absolute mode: measured in pixels (default: remaining height from `y` to image edge)

- **`repeat`** (`number`, optional): Number of times to repeat this region
  - If `> 0`, creates multiple regions
  - Each repetition offset by `repeatOffset`
  - Output names formatted according to `repeatNameFormat`
  - Default: no repetition (single region)

- **`repeatOffset`** (`{x: number, y: number}`, optional): Offset between repetitions
  - Relative mode: measured in cells
  - Absolute mode: measured in pixels
  - Default: `{x: width, y: 0}` (advance horizontally by region width)

- **`repeatNameFormat`** (`string`, optional): Template for naming repeated regions
  - `{name}` replaced with region name
  - `{n}` replaced with 1-based repetition index
  - Default: `'{name}-{n}'`

**Examples:**

Single region:
```typescript
{ x: 0, y: 0, width: 2, height: 2 }
```

Animation frames (4 frames, horizontally spaced):
```typescript
{
  x: 0,
  y: 1,
  width: 1,
  height: 1,
  repeat: 4
  // Uses default repeatOffset: {x: 1, y: 0}
}
```

Vertical animation frames:
```typescript
{
  x: 2,
  y: 0,
  repeat: 3,
  repeatOffset: { x: 0, y: 1 }  // Advance vertically
}
```

Custom naming:
```typescript
{
  x: 0,
  y: 0,
  repeat: 5,
  repeatNameFormat: 'frame_{n}'
  // Produces: frame_1, frame_2, frame_3, frame_4, frame_5
}
```

---

### `TextureAtlasMap`

Return type of `textureAtlas()` function.

```typescript
type TextureAtlasMap = Record<string, HTMLCanvasElement>
```

A dictionary where:
- **Keys**: Region names (from `regions` keys, or repeated region names)
- **Values**: `HTMLCanvasElement` objects containing the extracted image data

**Example:**
```typescript
const atlas: TextureAtlasMap = {
  hero: HTMLCanvasElement,
  enemy_1: HTMLCanvasElement,
  enemy_2: HTMLCanvasElement,
  background: HTMLCanvasElement
};

// Use the extracted regions:
context.drawImage(atlas.hero, x, y);
```

---

## Coordinate Systems

### Relative Mode (`relative: true`)

Image is divided into a grid:

```
cellWidth = (image.width - cellMargin) / width
cellHeight = (image.height - cellMargin) / height
```

For each region:
- Actual pixel X = `region.x * cellWidth + cellMargin`
- Actual pixel Y = `region.y * cellHeight + cellMargin`
- Actual pixel width = `region.width * cellWidth - cellMargin`
- Actual pixel height = `region.height * cellHeight - cellMargin`

Cell margins add spacing that collapses between adjacent cells.

### Absolute Mode (`relative: false`)

Direct pixel coordinates:
- `region.x`, `region.y` = exact pixel positions
- `region.width`, `region.height` = exact pixel dimensions
- `width` and `height` options are ignored
- `cellMargin` is ignored

---

## Repetition Behavior

When `region.repeat > 0`:

For each repetition index `i` (from 0 to `repeat - 1`):

1. **Calculate offset:**
   ```typescript
   offsetX = repeatOffset.x * i
   offsetY = repeatOffset.y * i
   ```

2. **Extract region at:**
   ```typescript
   x: region.x + offsetX
   y: region.y + offsetY
   ```

3. **Generate name:**
   ```typescript
   name = repeatNameFormat
     .replace('{name}', regionName)
     .replace('{n}', (i + 1).toString())  // 1-based!
   ```

**Note:** Repetition index in names is **1-based** (starts at 1, not 0).

---

## Content Manager Types

When using `textureAtlasContentProcessor`, the content dictionary entries have this structure:

```typescript
{
  name: string;        // Region name
  type: 'image';       // Always 'image'
  content: HTMLCanvasElement;  // Extracted region
  status: 'processed'; // Always 'processed'
}
```

Content keys follow the pattern: `{dataName}_{regionName}`

**Example:**
```typescript
// data.name = 'sprites'
// regions = { hero: {...}, enemy: {...} }
//
// Results in content entries:
content['sprites_hero']  = { name: 'hero', type: 'image', content: <canvas>, status: 'processed' }
content['sprites_enemy'] = { name: 'enemy', type: 'image', content: <canvas>, status: 'processed' }
```
