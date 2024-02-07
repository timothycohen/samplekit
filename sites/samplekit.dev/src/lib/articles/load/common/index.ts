export * from './data';
export * from './types';
export * from './demoRenderableMeta';

// Usage:
// add article frontmatter in articles/[slug]/meta.data.ts
// define article demos (components and highlighted code in panels) by creating a demo folder: articles/[slug]/live-demos/[demo-name]
// live-demos/main will show as the hero in the article (data.article.mainDemo)
// other demos will be loaded into data.article.lazyDemos[demo-name]
// by default, Demo.svelte is loaded as the only component. Change this by defining a meta.components.ts in the live-demos/[demo-name] folder.
// be default, all files in live-demos/[demo-name] are loaded as code. Add explicit files from outside the folder via meta.code.ts.

// Loading Process:
// .svx files are first processed by transforming markdown code and tables into valid html – see svelte.config.js
// in articles/load/common/data.ts, all meta.data.ts files are imported and transformed from RawFrontMatter into ProcessedFrontMatter
// in articles/load/server/demoCode, all files in the live-demos/ folders and also those referenced in meta.code.ts are imported as raw strings and passed to mdCodeBlockToRawHtml to highlight and transpile
// in articles/load/common/demoRenderableMeta.ts all meta.components.ts files inside the live-demos/ are imported and transformed from MetaRawComponents into MetaProcessedComponents
// then, in articles/load/client/demoRenderableComponents, all components specified by the live-demos meta.components.ts files are imported as modules, loaded and mapped to .default (the component).
// in articles/[slug], the LayoutServerLoad splits the main from the rest to await the highlighter promises for the main component eagerly. It passes the data to the client LayoutLoad
// finally, the LayoutLoad adds the Component to the LayoutServerLoad's data and passes it all the to TabPanels.svelte in +layout.svelte
// live-demos/main is eager and is in article.mainDemo. All the other live-demos/[demo-name] are streamed to the browser and are in article.lazyDemos[some-demo-slug]
