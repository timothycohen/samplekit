export const seoFragment = /* GraphQL */ `
	fragment seo on SEO {
		description
		title
	}
`;

export const imageFragment = /* GraphQL */ `
	fragment image on Image {
		altText
		height
		url
		width
	}
`;
