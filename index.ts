export type TextureAtlasOptions = {
  /**
   * In relative mode, the width and height of the texture atlas is
   * measured in cells
   *
   * (i.e. the image will be divided into `width` sections horizontally
   * and `height` sections vertically, with each section representing a
   * cell in the atlas)
   *
   * In non-relative (absolute) mode, the width and height properties
   * represent the size of a cell in the atlas, measured in pixels
   */
  relative: boolean;

  /**
   * The width of the texture atlas (measured in cells) or the width of
   * a cell in the atlas (measured in pixels), depending on relative or
   * absolute mode
   */
  width: number;

  /**
   * The height of the texture atlas (measured in cells) or the height
   * of a cell in the atlas (measured in pixels), depending on relative
   * or absolute mode
   */
  height: number;

  /**
   * A dictionary of regions, where each key is a name for the resulting
   * region's image
   *
   * If using the Content Manager Processor function, the key will be used
   * as the name of each image in the Content Manager
   */
  regions: Record<string, TextureAtlasRegion>;
};

export type TextureAtlasRegion = {
  /**
   * X-offset for this region, measured in cells or pixels, depending on
   * relative or absolute mode
   */
  x: number;

  /**
   * Y-offset for this region, measured in cells or pixels, depending on
   * relative or absolute mode
   */
  y: number;

  /**
   * Width of this region, measured in cells or pixels, depending on
   * relative or absolute mode
   *
   * If not defined:
   * - in absolute mode use the remaining width of the image
   * - in relative mode this defaults to 1
   */
  width?: number;

  /**
   * Height of this region, measured in cells or pixels, depending on
   * relative or absolute mode
   *
   * If not defined:
   * - in absolute mode use the remaining height of the image
   * - in relative mode this defaults to 1
   */
  height?: number;

  /**
   * If set to an integer greater than 0, repeat this region multiple times
   *
   * The resulting image names will be postfixed with -{n}
   *
   * (e.g. if the region name is 'test-animation' and repeat is set to 3, we
   * will get 'test-animation-1', 'test-animation-2' and 'test-animation-3'
   * in the result)
   */
  repeat?: number;

  /**
   * An optional offset for each repetition's cell
   *
   * If this is omitted, assume the repeat cells are arranged along the
   * positive-x direction and use width as the stride size
   *
   * In absolute mode, this is measured in pixels
   * In relative mode, this is measured in cells
   */
  repeatOffset?: {
    x: number;
    y: number;
  };

  /**
   * The name format to use for repeating sections
   *
   * `{name}` will be replaced with the current region's name
   * `{n}` will be replaced with the current repetition's index (1-based)
   *
   * Default is '{name}-{n}'
   */
  repeatNameFormat?: string;
};

export type TextureAtlasMap = Record<string, HTMLCanvasElement>;

const DEFAULT_REPEATING_REGION_NAME_FORMAT = '{name}-{n}';
const DEFAULT_OPTIONS: TextureAtlasOptions = {
  relative: true,
  width: 1,
  height: 1,
  regions: {
    default: {
      x: 0,
      y: 0,
    },
  },
};

/**
 * Takes an image and some texture atlas options and returns a dictionary
 * of canvases indexed by region name
 */
export function textureAtlas(
  image: HTMLImageElement | HTMLCanvasElement,
  options?: Partial<TextureAtlasOptions>
): TextureAtlasMap {
  const actualOptions = Object.assign(
    {},
    DEFAULT_OPTIONS,
    options ?? {}
  );

  if (actualOptions.width <= 0 || actualOptions.height <= 0) {
    throw new Error('Width and height must be greater than 0');
  }

  if (Object.keys(actualOptions.regions).length === 0) {
    throw new Error('No regions defined');
  }

  const cellWidth = actualOptions.relative
    ? Math.ceil(image.width / actualOptions.width)
    : actualOptions.width;
  const cellHeight = actualOptions.relative
    ? Math.ceil(image.height / actualOptions.height)
    : actualOptions.height;

  const map: TextureAtlasMap = {};

  for (const [name, region] of Object.entries(actualOptions.regions)) {
    const absoluteX = Math.floor(region.x * cellWidth);
    const absoluteY = Math.floor(region.y * cellHeight);
    const absoluteWidth = Math.ceil(
      region.width
        ? (actualOptions.relative
            ? region.width * cellWidth
            : region.width)
        : (actualOptions.relative
            ? cellWidth
            : image.width - absoluteX)
    );
    const absoluteHeight = Math.ceil(
      region.height
        ? (actualOptions.relative
            ? region.height * cellHeight
            : region.height)
        : (actualOptions.relative
            ? cellHeight
            : image.height - absoluteY)
    );

    if (region.repeat && region.repeat > 0) {
      for (let i = 0; i < region.repeat; i++) {
        const repeatName = getRepeatingRegionName(
          name,
          i + 1,
          region.repeatNameFormat
        );

        let repeatOffsetX = Math.floor(
          (
            region.repeatOffset?.x !== undefined &&
            region.repeatOffset?.x !== null
          )
            ? (actualOptions.relative
                ? region.repeatOffset.x * cellWidth
                : region.repeatOffset.x)
            : cellWidth
        );
        let repeatOffsetY = Math.floor(
          (
            region.repeatOffset?.y !== undefined &&
            region.repeatOffset?.y !== null
          )
            ? (actualOptions.relative
                ? region.repeatOffset.y * cellHeight
                : region.repeatOffset.y)
            : 0
        );

        map[repeatName] = chopRegion(
          image,
          absoluteX + repeatOffsetX * i,
          absoluteY + repeatOffsetY * i,
          absoluteWidth,
          absoluteHeight
        );
      }
    } else {
      map[name] = chopRegion(
        image,
        absoluteX,
        absoluteY,
        absoluteWidth,
        absoluteHeight
      );
    }
  }

  return map;
}

/**
 * Chop a rectangular region from an image into a new canvas
 */
function chopRegion(
  image: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  if (!context) {
    throw new Error('Failed to get 2D context');
  }

  context.drawImage(image, x, y, width, height, 0, 0, width, height);

  return canvas;
}

/**
 * Get the name of a repeating region
 */
function getRepeatingRegionName(
  regionName: string,
  repetitionIndex: number,
  regionNameFormat?: string
): string {
  return (regionNameFormat ?? DEFAULT_REPEATING_REGION_NAME_FORMAT)
    .replace('{name}', regionName)
    .replace('{n}', repetitionIndex.toString());
}

/**
 * Content Manager Processor wrapper which allows the textureAtlas function
 * to be used as a processor in a Content Manager
 *
 * @see https://www.npmjs.com/package/@basementuniverse/content-manager
 */
export async function textureAtlasContentProcessor(
  content: Record<string, {
    name: string;
    type: string;
    content: any;
    status: number;
  }>,
  data: TextureAtlasOptions,
  imageName: string
): Promise<void> {
  const image = content[imageName]?.content;
  if (!image) {
    throw new Error(`Image '${imageName}' not found`);
  }

  const map = textureAtlas(image as HTMLImageElement, data);

  for (const [name, canvas] of Object.entries(map)) {
    content[name] = {
      name,
      type: 'image',
      content: canvas,
      status: 4,
    };
  }
}
