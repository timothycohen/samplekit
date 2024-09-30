export * from './data/common';
export * from './demos/common';
export * from './demos/types';

// Metadata:
// `export const metadata {} satisfies RawFrontMatter;` in a <script lang="ts" module> tag to add metadata to that article.
// In dev mode, changes are watched and written to `generated/metadata.ts`
// The metadata is used to create `allPostData`, which adds prev/next links, groups items by series, and sorts by date

// FeatureCards:
// Add a `articles/[slug]/demos/[demo-name]/FeatureCard.svelte to add it to `$page.data.featureCards`

// Demos:
// `export default [] satisfies ModuleDefinitions;` in articles/[slug]/demos/[demo-name]/meta.preview.ts
// `demos/main` is awaited eagerly and will show as the hero in the article (`data.article.demos.main`)
// other demos will be loaded into `data.article.demos.lazy[demo-name]` and streamed to the client

// How Demos Are Loaded:
// load/demos/common.ts searches for all articles/[slug]/demos/[demo-name]/meta.preview.ts files and creates a map of all the demos in the site
// the splitAndProcess function in common.ts allows the server to handle the code highlighting in articles/load/demos/server.ts
// the splitAndProcess function is also used by the client to load the component files in articles/load/demos/client.ts
// articles/+layout.server.ts grabs the code part of the demos and loads/caches it if necessary
// articles/+layout.ts grabs the client components, awaits the main demo components, and merges it all back together to pass through the load function
