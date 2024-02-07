cd src/lib/styles &&
	cp colorThemeUtils.ts themeUtils.ts &&
	sed -i '' 's/export //g' themeUtils.ts &&
	npx tsc themeUtils.ts &&
	mv themeUtils.js ../../../static/themeUtils.js &&
	rm themeUtils.ts
