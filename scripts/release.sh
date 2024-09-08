#!/usr/bin/env bash

# this creates the tags for all packages, but only publishes the npm packages
pnpm changeset publish

# publish vs code extensions too
pnpm build:extensions

for vsix_path in $(find packages -name "*.vsix"); do
  vsce publish --packagePath $vsix_path 2>/dev/null || echo "warn: $vsix_path is not being published because this version is already published on the VS Code Marketplace"
done
