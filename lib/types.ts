export type PreviewVariant =
  | "neonGrid"
  | "tokenBoard"
  | "atlasPanel"
  | "monoWire"
  | "candyStack"
  | "brutalist";

export type SortMode = "trending" | "newest" | "mostViewed";

export interface DesignSystem {
  _id: string;
  _creationTime: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  previewVariant: PreviewVariant;
  cover: string;
  tags: string[];
  externalUrl: string;
  authorId: string;
  authorName: string;
  views: number;
  upvotes: number;
  createdAt: number;
  updatedAt: number;
  published: boolean;
}
