import type { Cart, Collection, SearchQuery, Product, Menu, Page } from './models';

export type CreateCart = (a: { fetch: Fetch }) => Promise<Cart>;
export type AddToCart = (a: {
	cartId: string;
	lines: { merchandiseId: string; quantity: number }[];
	fetch: Fetch;
}) => Promise<Cart>;
export type RemoveFromCart = (a: { cartId: string; lineIds: string[]; fetch: Fetch }) => Promise<Cart>;
export type UpdateCart = (a: {
	cartId: string;
	lines: { id: string; merchandiseId: string; quantity: number }[];
	fetch: Fetch;
}) => Promise<Cart>;
export type GetCart = (a: { cartId: string; fetch: Fetch }) => Promise<Cart | undefined>;
export type GetCollection = (a: { handle: string; fetch: Fetch }) => Promise<Collection | undefined>;
export type GetCollections = (a: { fetch: Fetch }) => Promise<Collection[]>;
export type GetCollectionProducts = (a: {
	filters: Partial<SearchQuery>;
	collectionHandle: string;
	fetch: Fetch;
}) => Promise<Product[] | null>;
export type GetProduct = ({ handle, fetch }: { handle: string; fetch: Fetch }) => Promise<Product | undefined>;
export type GetProductRecommendations = (a: { productId: string; fetch: Fetch }) => Promise<Product[]>;
export type GetProducts = (a: {
	filters: Partial<SearchQuery> & { first?: number };
	fetch: Fetch;
}) => Promise<Product[]>;
export type GetMenu = (a: { handle: string; fetch: Fetch }) => Promise<Menu>;
export type GetPage = (a: { handle: string; fetch: Fetch }) => Promise<Page>;
export type GetPages = (a: { fetch: Fetch }) => Promise<Page[]>;
