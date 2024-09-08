### Permissions in order to use `build_publish` job:

- Package Write Permissions

  - Reason: Give `docker/build-push-action` permission to push the image to the registry
  - Modify on GitHub: GitHub / [Repo] / Settings / Actions / General / Workflow permissions -> Read and write permissions

- `secrets.SK_PROD_ENV_FILE` and `secrets.SK_STAGING_ENV_FILE`

  - Reason: These are the .env variables that will be baked into the container when `vite build` is run
  - Generate: Copy paste from .env files. Make sure to remove any comments and quotes. They should look like this: `ENV_VAR1=value1` with only whitespace between vars
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets and variables / Actions / Secrets / New repository secret

### Permissions in order to use `pull_deploy` job:

- `secrets.SK_PROD_CR_APP_TOKEN`, `secrets.SK_STAGING_CR_APP_TOKEN`, `secrets.PP_DOCS_PROD_CR_APP_TOKEN`, `secrets.PP_DOCS_STAGING_CR_APP_TOKEN`

  - Reason: Give `caprover/deploy-from-github` permission to trigger app deployment
  - Generate: CapRover / Apps / [Your-App-Name] / Deployment / Enable App Token
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets / Actions / Secrets / New repository secret

- `vars.SK_PROD_CR_APP`, `vars.SK_STAGING_CR_APP`, `vars.PP_DOCS_PROD_CR_APP`, `vars.PP_DOCS_STAGING_CR_APP`, `vars.CR_SERVER`, `vars.DOCKER_REGISTRY`

  - Reason:
    - `*_CR_APP` are the names of the apps on CapRover. It tells `caprover/deploy-from-github` which app to deploy to.
    - `CR_SERVER` is the name of the server as found on the CapRover dashboard (`captain.[Your-Root-Name]`). It tells `caprover/deploy-from-github` which server to trigger the deployment on.
    - `DOCKER_REGISTRY` is the registry where the images are pushed to, e.g. ghcr.io or registry.hub.docker.com
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets and variables / Actions / Variables

### Permissions in order to use `release_npm` job:

- PR Permissions

  - Reason: Give `changesets/action@v1` permission to make the PR.
  - Modify on GitHub: GitHub / [Repo] / Settings / Actions / General / Workflow permissions -> Allow GitHub Actions to create and approve pull requests

- `secrets.NPM_PUBLISH_TOKEN`
  - Reason: `changesets/action@v1` uses `changeset publish` which runs `pnpm publish`.
  - Generate: NPM -> Settings -> Access Tokens -> Generate New Token
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets / Actions / Secrets / New repository secret
  - Note: Require two-factor authentication for write actions must be disabled

### Permissions in order to use `release_vscode` job:

- `secrets.VSCE_PAT`
  - Reason: `changesets/action@v1` uses this to publish to the VS Code Marketplace.
  - Generate: [Follow the official guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets / Actions / Secrets / New repository secret

### Extra permissions to use workflow with private ghcr.io registries:

- Personal Access Token
  - Reason: If the registry is private, CapRover will need a token to pull the image
  - Generate: GitHub / Settings / Developer settings / Personal access tokens / Classic / Generate new token / read:packages scope / Generate Token
  - Add to CapRover: CapRover / Apps / Cluster / Docker Registry Configuration / Add Remote Registry:
    - Username: github contact
    - Password: The PAT we just created on GitHub
    - Domain: ghcr.io
    - Image Prefix: github-username
- Change default push registry to disabled push
  - Reason: CapRover can't push an image to our private registry, so we need to disable it from trying when it creates a One-Click App
  - Disable: CapRover / Apps / Cluster / Docker Registry Configuration / Default Push Registry / Edit Push Registry / disabled push

### Note

The gh cli makes this easy to automate. For example:

- `gh secret set SK_PROD_ENV_FILE -b "$(cat sites/samplekit.dev/.env._production)"`
- `gh variable set DOCKER_REGISTRY -b ghcr.io`
