import {
	createCart,
	getCart,
	addToCart,
	updateCart,
	removeFromCart,
	getCollection,
	getCollections,
	getCollectionProducts,
	getProduct,
	getProductRecommendations,
	getProducts,
	getMenu,
	getPage,
	getPages,
} from './handlers';
import type { Shop } from '../types/repository';

export const shop: Shop = {
	cart: {
		create: createCart,
		get: getCart,
		addTo: addToCart,
		update: updateCart,
		removeFrom: removeFromCart,
	},
	collection: {
		get: getCollection,
		getAll: getCollections,
	},
	product: {
		get: getProduct,
		getRecommendations: getProductRecommendations,
		getAll: getProducts,
		getByCollection: getCollectionProducts,
	},
	menu: {
		get: getMenu,
	},
	page: {
		get: getPage,
		getAll: getPages,
	},
};
