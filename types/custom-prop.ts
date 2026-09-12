import type { AssetCategory } from './asset';

export interface CustomProp {
  id: string;
  userId: string;
  name: string;
  assetUrl: string;
  thumbnailUrl: string;
  prompt: string;
  /** Set for uploaded props so they can appear in their category's tab; absent (undefined) for AI-generated props, which only ever show in "All" and "My Props". */
  category?: AssetCategory;
  createdAt: string;
  updatedAt: string;
}
