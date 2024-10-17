import type {
	CreateCart,
	AddToCart,
	RemoveFromCart,
	UpdateCart,
	GetCart,
	GetCollection,
	GetCollections,
	GetCollectionProducts,
	GetProduct,
	GetProductRecommendations,
	GetProducts,
	GetMenu,
	GetPage,
	GetPages,
} from './handlers';

export interface Shop {
	cart: {
		create: CreateCart;
		addTo: AddToCart;
		removeFrom: RemoveFromCart;
		update: UpdateCart;
		get: GetCart;
	};
	collection: {
		get: GetCollection;
		getAll: GetCollections;
	};
	product: {
		get: GetProduct;
		getRecommendations: GetProductRecommendations;
		getAll: GetProducts;
		getByCollection: GetCollectionProducts;
	};
	menu: {
		get: GetMenu;
	};
	page: {
		get: GetPage;
		getAll: GetPages;
	};
}
