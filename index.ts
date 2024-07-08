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
};

export type TextureAtlasMap = Record<string, HTMLCanvasElement>;

const defaultOptions: TextureAtlasOptions = {
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
  image: HTMLImageElement,
  options?: Partial<TextureAtlasOptions>
): TextureAtlasMap {
  const actualOptions = Object.assign(
    {},
    defaultOptions,
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
    const regionCanvas = document.createElement('canvas');
    const regionContext = regionCanvas.getContext('2d');
    if (!regionContext) {
      throw new Error('Failed to get 2D context');
    }

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

    regionCanvas.width = absoluteWidth;
    regionCanvas.height = absoluteHeight;

    regionContext.drawImage(
      image,
      absoluteX,
      absoluteY,
      absoluteWidth,
      absoluteHeight,
      0,
      0,
      absoluteWidth,
      absoluteHeight
    );

    map[name] = regionCanvas;
  }

  return map;
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
