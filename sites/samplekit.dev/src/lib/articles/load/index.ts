export * from './types';
export * from './data/common';
export * from './demos/common';
export * from './demos/types';

// Usage:
// add article frontmatter in articles/[slug]/meta.data.ts
// add previews for live-demos in articles/[slug]/live-demos/[demo-name]/meta.preview.ts
// live-demos/main will show as the hero in the article (data.article.demos.main)
// other demos will be loaded into data.article.demos.lazy[demo-name]

// Loading Process:
// 1. Preprocessing:
// The actual article page is a +page.svx file, which is preprocessed by transforming markdown code and tables into valid html – see svelte.config.js

// 2. Frontmatter:
// Frontmatter is loaded in articles/load/common/data.ts from all the meta.data.ts files in the articles/ folder, processed, and exported as allPostData: ProcessedFrontMatter[]
// that's used for previews and it's also used in +layout.server.ts to load the front matter for a specific article

// 3. Demos:
// articles/load/demos.ts demosMap searches for all articles/[slug]/live-demos/[demo-name]/meta.preview.ts files and creates a map of all the demos in the site
// the splitAndProcess function in demos.ts allows the server to handle the code highlighting in articles/load/demos/server.ts. It that passes the data through +layout.server.ts
// the splitAndProcess function is used again by the client to load the component files in articles/load/demos/client.ts. It is called in +layout.ts and then the server highlighted code and client components are merged back together and passed through the load function
// article.demos.main is awaited eagerly and the rest of the demos are streamed to the client through article.demos.lazy
