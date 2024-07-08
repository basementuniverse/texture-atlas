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
/**
 * Takes an image and some texture atlas options and returns a dictionary
 * of canvases indexed by region name
 */
export declare function textureAtlas(image: HTMLImageElement, options?: Partial<TextureAtlasOptions>): TextureAtlasMap;
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
}>, data: TextureAtlasOptions, imageName: string): Promise<void>;
