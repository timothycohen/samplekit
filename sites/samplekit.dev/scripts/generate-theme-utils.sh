cd src/lib/styles &&
	cp themeUtils.ts themeUtils.tmp.ts &&
	sed -i '' 's/export //g' themeUtils.tmp.ts &&
	npx tsc themeUtils.tmp.ts &&
	mv themeUtils.tmp.js ../../../static/themeUtils.js &&
	rm themeUtils.tmp.ts
