### Permissions in order to use `build-publish` job:

- Package Write Permissions
  - Reason: Give `docker/build-push-action` permission to push the image to the registry
  - Modify on GitHub: GitHub / [Repo] / Settings / Actions / General / Workflow permissions -> Read and write permissions
- `ENV_FILE`
  - Reason: These are the .env variables that will be baked into the container when `vite build` is run
  - Generate: Copy paste from .env files. Make sure to remove any comments and quotes. They should look like this: `ENV_VAR1=value1` with only whitespace between vars
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets and variables / Actions / Secrets / New repository secret

### Permissions in order to use `pull-deploy` job:

- `CR_APP_TOKEN`
  - Reason: Give `caprover/deploy-from-github` permission to trigger app deployment
  - Generate: CapRover / Apps / [Your-App-Name] / Deployment / Enable App Token
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets / Actions / Secrets / New repository secret
- `CR_APP`, `CR_SERVER`, `DOCKER_REGISTRY`
  - Reason:
    - `CR_APP` is the name of the app on CapRover. It tells `caprover/deploy-from-github` which app to deploy to.
    - `CR_SERVER` is the name of the server as found on the CapRover dashboard (`captain.[Your-Root-Name]`). It tells `caprover/deploy-from-github` which server to trigger the deployment on.
    - `DOCKER_REGISTRY` is the registry where the images are pushed to, e.g. ghcr.io or registry.hub.docker.com
  - Add to GitHub: GitHub / [Repo] / Settings / Secrets and variables / Actions / Variables

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
