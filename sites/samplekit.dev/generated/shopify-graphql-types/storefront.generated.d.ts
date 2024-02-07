/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as StorefrontTypes from './storefront.types.d.ts';

export type CartFragment = (
  Pick<StorefrontTypes.Cart, 'checkoutUrl' | 'id' | 'totalQuantity'>
  & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
        Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
        & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
          & { product: (
            Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
            & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                  Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                  & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
          ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
        ) }
      ) | (
        Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
        & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
          & { product: (
            Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
            & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                  Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                  & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
          ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
        ) }
      ) }> } }
);

export type AddToCartMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type AddToCartMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'checkoutUrl' | 'id' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) }> } }
    )> }> };

export type CreateCartMutationVariables = StorefrontTypes.Exact<{
  lineItems?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput>;
}>;


export type CreateCartMutation = { cartCreate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'checkoutUrl' | 'id' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) }> } }
    )> }> };

export type EditCartItemsMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type EditCartItemsMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'checkoutUrl' | 'id' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) }> } }
    )> }> };

export type RemoveFromCartMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lineIds: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
}>;


export type RemoveFromCartMutation = { cartLinesRemove?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'checkoutUrl' | 'id' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
              & { product: (
                Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
                & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                    ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
              ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }
          ) }> } }
    )> }> };

export type GetCartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCartQuery = { cart?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Cart, 'checkoutUrl' | 'id' | 'totalQuantity'>
    & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, lines: { edges: Array<{ node: (
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
            & { product: (
              Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
              & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                    Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                    & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                  ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
            ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
            & { product: (
              Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
              & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                    Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                    & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
                  ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
            ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
          ) }
        ) }> } }
  )> };

export type CollectionFragment = (
  Pick<StorefrontTypes.Collection, 'description' | 'handle' | 'title' | 'updatedAt'>
  & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'>>, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'>, products: { edges: Array<{ node: { images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> } } }> } }
);

export type GetCollectionQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type GetCollectionQuery = { collection?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Collection, 'description' | 'handle' | 'title' | 'updatedAt'>
    & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'>>, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'>, products: { edges: Array<{ node: { images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> } } }> } }
  )> };

export type GetCollectionsQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetCollectionsQuery = { collections: { edges: Array<{ node: (
        Pick<StorefrontTypes.Collection, 'description' | 'handle' | 'title' | 'updatedAt'>
        & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'>>, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'>, products: { edges: Array<{ node: { images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> } } }> } }
      ) }> } };

export type SeoFragment = Pick<StorefrontTypes.Seo, 'description' | 'title'>;

export type ImageFragment = Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'>;

export type GetMenuQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type GetMenuQuery = { menu?: StorefrontTypes.Maybe<{ items: Array<Pick<StorefrontTypes.MenuItem, 'title' | 'url'>> }> };

export type PageFragment = (
  Pick<StorefrontTypes.Page, 'id' | 'title' | 'handle' | 'body' | 'bodySummary' | 'createdAt' | 'updatedAt'>
  & { seo?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Seo, 'description' | 'title'>> }
);

export type GetPageQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type GetPageQuery = { page?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Page, 'id' | 'title' | 'handle' | 'body' | 'bodySummary' | 'createdAt' | 'updatedAt'>
    & { seo?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Seo, 'description' | 'title'>> }
  )> };

export type GetPagesQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetPagesQuery = { pages: { edges: Array<{ node: (
        Pick<StorefrontTypes.Page, 'id' | 'title' | 'handle' | 'body' | 'bodySummary' | 'createdAt' | 'updatedAt'>
        & { seo?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Seo, 'description' | 'title'>> }
      ) }> } };

export type ProductFragment = (
  Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
  & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
        & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
      ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
);

export type GetProductQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type GetProductQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
    & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
          & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
        ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
  )> };

export type GetProductsQueryVariables = StorefrontTypes.Exact<{
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
}>;


export type GetProductsQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
        & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
              & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
            ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
      ) }> } };

export type GetProductRecommendationsQueryVariables = StorefrontTypes.Exact<{
  productId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetProductRecommendationsQuery = { productRecommendations?: StorefrontTypes.Maybe<Array<(
    Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
    & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
          & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
        ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
  )>> };

export type GetCollectionProductsQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductCollectionSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
  productFilter?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter>;
}>;


export type GetCollectionProductsQuery = { collection?: StorefrontTypes.Maybe<{ products: { edges: Array<{ node: (
          Pick<StorefrontTypes.Product, 'id' | 'handle' | 'availableForSale' | 'title' | 'description' | 'descriptionHtml' | 'tags' | 'updatedAt'>
          & { options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: (
                Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
                & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
              ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'altText' | 'height' | 'url' | 'width'> }> }, seo: Pick<StorefrontTypes.Seo, 'description' | 'title'> }
        ) }> } }> };

interface GeneratedQueryTypes {
  "\n\tquery getCart($cartId: ID!) {\n\t\tcart(id: $cartId) {\n\t\t\t...cart\n\t\t}\n\t}\n\t\n\tfragment cart on Cart {\n\t\tcheckoutUrl\n\t\tcost {\n\t\t\tsubtotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalTaxAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tid\n\t\tlines(first: 100) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tcost {\n\t\t\t\t\t\ttotalAmount {\n\t\t\t\t\t\t\tamount\n\t\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tid\n\t\t\t\t\tmerchandise {\n\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tproduct {\n\t\t\t\t\t\t\t\t...product\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\ttitle\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tquantity\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttotalQuantity\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n\n": {return: GetCartQuery, variables: GetCartQueryVariables},
  "\n\tquery getCollection($handle: String!) {\n\t\tcollection(handle: $handle) {\n\t\t\t...collection\n\t\t}\n\t}\n\t\n\tfragment collection on Collection {\n\t\tdescription\n\t\thandle\n\t\timage {\n\t\t\t...image\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttitle\n\t\tupdatedAt\n\n\t\tproducts(first: 1) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\timages(first: 1) {\n\t\t\t\t\t\tedges {\n\t\t\t\t\t\t\tnode {\n\t\t\t\t\t\t\t\t...image\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\n": {return: GetCollectionQuery, variables: GetCollectionQueryVariables},
  "\n\tquery getCollections {\n\t\tcollections(first: 100, sortKey: TITLE) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...collection\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment collection on Collection {\n\t\tdescription\n\t\thandle\n\t\timage {\n\t\t\t...image\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttitle\n\t\tupdatedAt\n\n\t\tproducts(first: 1) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\timages(first: 1) {\n\t\t\t\t\t\tedges {\n\t\t\t\t\t\t\tnode {\n\t\t\t\t\t\t\t\t...image\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\n": {return: GetCollectionsQuery, variables: GetCollectionsQueryVariables},
  "\n\tquery getMenu($handle: String!) {\n\t\tmenu(handle: $handle) {\n\t\t\titems {\n\t\t\t\ttitle\n\t\t\t\turl\n\t\t\t}\n\t\t}\n\t}\n": {return: GetMenuQuery, variables: GetMenuQueryVariables},
  "\n\tquery getPage($handle: String!) {\n\t\tpage(handle: $handle) {\n\t\t\t...page\n\t\t}\n\t}\n\t\n\tfragment page on Page {\n\t\t... on Page {\n\t\t\tid\n\t\t\ttitle\n\t\t\thandle\n\t\t\tbody\n\t\t\tbodySummary\n\t\t\tseo {\n\t\t\t\t...seo\n\t\t\t}\n\t\t\tcreatedAt\n\t\t\tupdatedAt\n\t\t}\n\t}\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n": {return: GetPageQuery, variables: GetPageQueryVariables},
  "\n\tquery getPages {\n\t\tpages(first: 100) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...page\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment page on Page {\n\t\t... on Page {\n\t\t\tid\n\t\t\ttitle\n\t\t\thandle\n\t\t\tbody\n\t\t\tbodySummary\n\t\t\tseo {\n\t\t\t\t...seo\n\t\t\t}\n\t\t\tcreatedAt\n\t\t\tupdatedAt\n\t\t}\n\t}\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n": {return: GetPagesQuery, variables: GetPagesQueryVariables},
  "\n\tquery getProduct($handle: String!) {\n\t\tproduct(handle: $handle) {\n\t\t\t...product\n\t\t}\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n": {return: GetProductQuery, variables: GetProductQueryVariables},
  "\n\tquery getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $first: Int) {\n\t\tproducts(sortKey: $sortKey, reverse: $reverse, query: $query, first: $first) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...product\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "\n\tquery getProductRecommendations($productId: ID!) {\n\t\tproductRecommendations(productId: $productId) {\n\t\t\t...product\n\t\t}\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n": {return: GetProductRecommendationsQuery, variables: GetProductRecommendationsQueryVariables},
  "\n\tquery getCollectionProducts(\n\t\t$handle: String!\n\t\t$sortKey: ProductCollectionSortKeys\n\t\t$reverse: Boolean\n\t\t$productFilter: [ProductFilter!]\n\t) {\n\t\tcollection(handle: $handle) {\n\t\t\tproducts(sortKey: $sortKey, reverse: $reverse, first: 100, filters: $productFilter) {\n\t\t\t\tedges {\n\t\t\t\t\tnode {\n\t\t\t\t\t\t...product\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n": {return: GetCollectionProductsQuery, variables: GetCollectionProductsQueryVariables},
}

interface GeneratedMutationTypes {
  "\n\tmutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {\n\t\tcartLinesAdd(cartId: $cartId, lines: $lines) {\n\t\t\tcart {\n\t\t\t\t...cart\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment cart on Cart {\n\t\tcheckoutUrl\n\t\tcost {\n\t\t\tsubtotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalTaxAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tid\n\t\tlines(first: 100) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tcost {\n\t\t\t\t\t\ttotalAmount {\n\t\t\t\t\t\t\tamount\n\t\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tid\n\t\t\t\t\tmerchandise {\n\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tproduct {\n\t\t\t\t\t\t\t\t...product\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\ttitle\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tquantity\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttotalQuantity\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n\n": {return: AddToCartMutation, variables: AddToCartMutationVariables},
  "\n\tmutation createCart($lineItems: [CartLineInput!]) {\n\t\tcartCreate(input: { lines: $lineItems }) {\n\t\t\tcart {\n\t\t\t\t...cart\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment cart on Cart {\n\t\tcheckoutUrl\n\t\tcost {\n\t\t\tsubtotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalTaxAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tid\n\t\tlines(first: 100) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tcost {\n\t\t\t\t\t\ttotalAmount {\n\t\t\t\t\t\t\tamount\n\t\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tid\n\t\t\t\t\tmerchandise {\n\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tproduct {\n\t\t\t\t\t\t\t\t...product\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\ttitle\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tquantity\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttotalQuantity\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n\n": {return: CreateCartMutation, variables: CreateCartMutationVariables},
  "\n\tmutation editCartItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n\t\tcartLinesUpdate(cartId: $cartId, lines: $lines) {\n\t\t\tcart {\n\t\t\t\t...cart\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment cart on Cart {\n\t\tcheckoutUrl\n\t\tcost {\n\t\t\tsubtotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalTaxAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tid\n\t\tlines(first: 100) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tcost {\n\t\t\t\t\t\ttotalAmount {\n\t\t\t\t\t\t\tamount\n\t\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tid\n\t\t\t\t\tmerchandise {\n\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tproduct {\n\t\t\t\t\t\t\t\t...product\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\ttitle\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tquantity\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttotalQuantity\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n\n": {return: EditCartItemsMutation, variables: EditCartItemsMutationVariables},
  "\n\tmutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {\n\t\tcartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n\t\t\tcart {\n\t\t\t\t...cart\n\t\t\t}\n\t\t}\n\t}\n\t\n\tfragment cart on Cart {\n\t\tcheckoutUrl\n\t\tcost {\n\t\t\tsubtotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\ttotalTaxAmount {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tid\n\t\tlines(first: 100) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tcost {\n\t\t\t\t\t\ttotalAmount {\n\t\t\t\t\t\t\tamount\n\t\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tid\n\t\t\t\t\tmerchandise {\n\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tproduct {\n\t\t\t\t\t\t\t\t...product\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\ttitle\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tquantity\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttotalQuantity\n\t}\n\t\n\tfragment product on Product {\n\t\tid\n\t\thandle\n\t\tavailableForSale\n\t\ttitle\n\t\tdescription\n\t\tdescriptionHtml\n\t\toptions {\n\t\t\tid\n\t\t\tname\n\t\t\tvalues\n\t\t}\n\t\tpriceRange {\n\t\t\tmaxVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t\tminVariantPrice {\n\t\t\t\tamount\n\t\t\t\tcurrencyCode\n\t\t\t}\n\t\t}\n\t\tvariants(first: 250) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\tid\n\t\t\t\t\ttitle\n\t\t\t\t\tavailableForSale\n\t\t\t\t\tselectedOptions {\n\t\t\t\t\t\tname\n\t\t\t\t\t\tvalue\n\t\t\t\t\t}\n\t\t\t\t\tprice {\n\t\t\t\t\t\tamount\n\t\t\t\t\t\tcurrencyCode\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\timages(first: 20) {\n\t\t\tedges {\n\t\t\t\tnode {\n\t\t\t\t\t...image\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tseo {\n\t\t\t...seo\n\t\t}\n\t\ttags\n\t\tupdatedAt\n\t}\n\t\n\tfragment image on Image {\n\t\taltText\n\t\theight\n\t\turl\n\t\twidth\n\t}\n\n\t\n\tfragment seo on SEO {\n\t\tdescription\n\t\ttitle\n\t}\n\n\n\n": {return: RemoveFromCartMutation, variables: RemoveFromCartMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
