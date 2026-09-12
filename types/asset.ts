export type AssetCategory = 'accessories' | 'food-drink' | 'effects' | 'backgrounds';

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  thumbnailUrl: string;
  assetUrl: string;
}

/**
 * Minimal shape needed to render/place any prop on the canvas — satisfied by
 * both the built-in Asset catalog and a user's CustomProp, so layer
 * placement/rendering code can work with either without caring which.
 */
export interface PlaceableAsset {
  id: string;
  name: string;
  assetUrl: string;
  thumbnailUrl: string;
}
