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
     * won't be used, instead each region should define a position and size
     * measured in pixels
     */
    relative: boolean;
    /**
     * The width of the texture atlas, measured in cells
     *
     * Not used in non-relative (absolute) mode
     */
    width: number;
    /**
     * The height of the texture atlas, measured in cells
     *
     * Not used in non-relative (absolute) mode
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
/**
 * Takes an image and some texture atlas options and returns a dictionary
 * of canvases indexed by region name
 */
export declare function textureAtlas(image: HTMLImageElement | HTMLCanvasElement, options?: Partial<TextureAtlasOptions>): TextureAtlasMap;
/**
 * Content Manager Processor wrapper which allows the textureAtlas function
 * to be used as a processor in a Content Manager
 *
 * @see https://www.npmjs.com/package/@basementuniverse/content-manager
 */
export declare function textureAtlasContentProcessor(content: Record<string, {
    name: string;
    type: string;
    content: any;
    status: number;
}>, data: {
    name: string;
    type: string;
    content: TextureAtlasOptions;
    status: number;
}, imageName: string): Promise<void>;
