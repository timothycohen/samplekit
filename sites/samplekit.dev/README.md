# SampleKit.dev

In depth details are in the [monorepo root README](../../README.md#samplekitdev).

### To run the dev server:

```sh
cp .env.example .env.development
pnpm install # install node_modules
pnpm build:dependencies # build the required @samplekit packages (see package.json)
pnpm dev:up # start the docker services (see DockerCompose.samplekit.dev.yaml)
pnpm dev # start the vite server
```

### To build and run the preview server:

```sh
cp .env.example .env.preview
pnpm preview:up # see DockerCompose.samplekit.preview.yaml
```

## Environments

There are four environments – two for local usage and two for the remote deployment server. Each environment has its own `.env` file.
For example, the `staging` environment expects `.env.staging` to exist.

| Command                             | `$app/environment['dev']` | `import.meta.env.MODE` |
| ----------------------------------- | ------------------------- | ---------------------- |
| `pnpm dev:up && pnpm dev`           | `true`                    | development            |
| `pnpm preview:up`                   | `false`                   | preview                |
| GH Action: `deploy-sk-staging.yaml` | `false`                   | staging                |
| GH Action: `deploy-sk-prod.yaml`    | `false`                   | production             |
