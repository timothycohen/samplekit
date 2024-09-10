# SampleKit

SampleKit houses [SvelteKit](https://kit.svelte.dev/) NPM packages, corresponding VS Code extensions, and [documentation](https://preprocessors.samplekit.dev/docs/code-decoration/).

It also showcases the integration of common patterns and useful libraries for SvelteKit via demos and articles.

It addresses common questions that come up when building a full stack application – or backend for frontend – using SvelteKit that are beyond the scope of the SvelteKit documentation, but are still specifically oriented towards integration with SvelteKit.

Here a few of the questions (in no particular order) that this repo addresses:

How can I...

- facilitate typesafe, fast, and maintainable REST endpoints?
- integrate user authentication with passkeys, OAuth, device management and MFA?
- create and run preprocessors?
- integrate with AWS services?
- integrate a headless shop such as Shopify or Medusa?
- create and use custom themes with intellisense?
- protect against malicious users and bots?
- wrap Svelte stores with custom logic controllers?
- colocate – but effortlessly separate – server and client code?
- inject typed services via the context API?
- manage complex reactive Svelte state?
- use SvelteKit adapters?
- use SvelteKit in a pnpm workspace?
- self host to avoid vendor lock-in?
- dockerize and use githooks / github actions for CI/CD?

## Features

Smaller topics are siloed into articles with interactive demos and links to the source code.

Larger topics such as authentication and shop integration live outside of specific articles, but are grouped in their respective lib/routes folders. In the future, these will also have dedicated articles.

## Stack

This repo is meant to show ideas, not a particular tech-stack (other than SvelteKit obviously). That being said, this is what's being used:

| Package                                                             | Kind                 | Description                                                                            |
| :------------------------------------------------------------------ | -------------------- | :------------------------------------------------------------------------------------- |
| [Svelte](https://svelte.dev/)                                       | Core                 | Reactive library                                                                       |
| [SvelteKit](https://kit.svelte.dev/) + [Vite](https://vitejs.dev/)  | Core                 | Full stack framework                                                                   |
| [TypeScript](https://www.typescriptlang.org/)                       | Core                 | Language                                                                               |
| [PostgreSQL](https://node-postgres.com/)                            | Database             | SQL Database                                                                           |
| [Drizzle](https://orm.drizzle.team/docs/overview)                   | Database             | ORM, migrations, and DB GUI                                                            |
| [Redis](https://redis.io/)                                          | Database             | In-memory KV store                                                                     |
| [Zod](https://zod.dev/)                                             | User Input           | Validation                                                                             |
| [Superforms](https://superforms.rocks/)                             | User Input           | Enhanced form handling                                                                 |
| Custom Fetch Helper                                                 | User Input           | Fully define client request right next to server response                              |
| [Radix UI](https://www.radix-ui.com/)                               | Style                | Design tokens                                                                          |
| [Tailwindcss](https://tailwindcss.com/)                             | Style                | CSS framework                                                                          |
| [PostCSS](https://postcss.org/)                                     | Style                | Build Tailwind utilities/components with intellisense                                  |
| [Lucide](https://lucide.dev/)                                       | Style                | Icons                                                                                  |
| [Twilio](https://www.twilio.com/)                                   | Transport            | SMS (currently disabled)                                                               |
| [AWS SES](https://aws.amazon.com/ses)                               | Transport            | Email                                                                                  |
| [Logflare](https://logflare.app/)                                   | Logging              | Logs                                                                                   |
| [Sentry](https://sentry.io/)                                        | Logging              | Error tracking                                                                         |
| [Platform](https://github.com/bestiejs/platform.js)                 | Logging              | Browser and OS detection to add context to the session                                 |
| [Dozzle](https://dozzle.dev/)                                       | Logging              | Real-time Docker logs viewer                                                           |
| [AWS S3](https://aws.amazon.com/s3/)                                | Storage and Delivery | Object (image) storage                                                                 |
| [AWS Cloudfront](https://aws.amazon.com/cloudfront/)                | Storage and Delivery | CDN for object storage                                                                 |
| [AWS Rekognition](https://aws.amazon.com/rekognition/)              | Storage and Devivery | Content moderation                                                                     |
| [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile) | Bot Management       | Client side bot detection (CAPTCHA alternative)                                        |
| [Prettier](https://prettier.io/) + [ESLint](https://eslint.org/)    | CI/CD                | Formatter + Linter                                                                     |
| Custom Githooks                                                     | CI/CD                | pre-commit install, format, lint, and check<br/>pre-push reinstall frozen lockfile     |
| [Docker](https://www.docker.com/)                                   | CI/CD                | Containers                                                                             |
| [Caprover](https://caprover.com/)                                   | CI/CD                | Self-hosting PaaS                                                                      |
| [GitHub Actions](https://github.com/features/actions)               | CI/CD                | check/build/deploy                                                                     |
| [Shopify Storefront](https://shopify.dev/docs/api/storefront)       | Shop Integration     | Headless shop                                                                          |
| [Google Cloud](https://console.cloud.google.com/apis)               | Auth                 | Sign in with Google                                                                    |
| Custom Auth Package                                                 | Auth                 | Wrap the DB and handle sessions, email confirmation, password reset, tokens, MFA, etc. |

Auth packages:

| Package                                                                                                    | Description                                                                            |
| :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| [Node Crypto Scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback) | Password hasher                                                                        |
| [Nanoid](https://github.com/ai/nanoid)                                                                     | Tiny, URL-friendly, crpytographically secure, and collision resistant string generator |
| [SimpleWebAuthn](https://simplewebauthn.dev/)                                                              | Client & server helper fns for passkeys                                                |
| [otplib](https://github.com/yeojz/otplib) & [qrcode](https://github.com/soldair/node-qrcode)               | Helper fns for authenticator apps                                                      |

### Installation

To run the `sites/samplekit.dev` app, you'll need to set up Redis and Postgres.
The `package.json` scripts have one-off docker commands to start them.
Just make sure your docker daemon is running!

```sh
cd sites/samplekit.dev
cp .env.example .env._development
pnpm install
pnpm dev:up
pnpm build:dependencies
pnpm run dev

# details on how to set up services and create environmental variables in .env.example
```

`initServer.ts` will init the services and either warn or fail if they're not set up properly.

If you want to test authentication without providing your own Turnstile key, comment out the client and server checks.

```ts
// src/routes/(auth)/(login)/signup/+page.server.ts
const signupWithPassword: Action = async (event) => {
  ...
    // const turnstileValidation = await validateTurnstile({
    // 	clientToken,
    // 	ip: request.headers.get('CF-Connecting-IP'),
    // });
    // signupForm.data['turnstile-used'] = true;
    // if (turnstileValidation.error) {
    // 	signupForm.data.password = '';
    // 	return message(
    // 		signupForm,
    // 		{ fail: `We've detected unusual traffic. Please refresh and try again.` },
    // 		{ status: 403 },
    // 	);
    // }
  ...
}
```

```diff
<!-- src/routes/(auth)/(login)/signup/+page.svelte -->
- <button ... disabled={$submitting|| !turnstile.token} type="submit">
+ <button ... disabled={$submitting} type="submit">
```

```diff
<!-- src/routes/(auth)/(login)/login/+page.svelte -->
- const signinDisabled = $derived($signinSubmitting || $resetSubmitting || !turnstile.token);
+ const signinDisabled = $derived($signinSubmitting || $resetSubmitting);
```

### Uninstall

To remove the docker containers, you can run the following:

```sh
pnpm dev:down
```

### DevOps

See [deploy-permissions.md](./.github/workflows/deploy-permissions.md) for the necessary GitHub secrets, vars, and permissions.

#### TL;DR Sites

Merging feature branches into main will trigger validation and staging deployments for the sites as necessary.
Push a `sk-prod/{{ sha }}` or `pp-docs-prod/{{ sha }}` tag to trigger a production deployment.

#### Detailed Sites

Creating a PR to main will cause the [validate.yaml workflow](./.github/workflows/validate.yaml) to run.

When main receives pushes with changes that impact `sites/samplekit.dev`, [deploy-sk-staging.yaml](./.github/workflows/deploy-sk-staging.yaml) will build a staging docker image, push it to the GitHub container registry, pull it on the CapRover server, deploy it to the staging app in the swarm, and add a git tag associated with the docker image.
The same goes for `sites/preprocessor-docs`.

To create a production deployment, use `TAG=sk-prod/$(git rev-parse --short HEAD) && git tag $TAG && git push origin $TAG`.
[deploy-sk-prod.yaml](./.github/workflows/deploy-sk-prod.yaml) will run a similar pipeline as `deploy-sk-staging`, except it obviously won't need to create the git tag.
Again, the same goes for `sites/preprocessor-docs` (use `pp-docs-prod/{{ sha }}`).

#### Packages

The NPM packages and VS Code extensions use [changesets](https://github.com/changesets/changesets?).

The workflow done locally:

1. `pnpm changeset`
   Run this command before you commit changes that will impact SEMVER on a published package.
   It creates a Markdown file with a new unique name that lists each package:SEMVER change along with a summary.

1. `pnpm changeset version`
   This consumes the generated Markdown files, bumps the `package.json` versions, and updates the `CHANGELOG.md`s.
   It requires a `GITHUB_TOKEN` environment variable

1. `pnpm changeset publish`
   This runs `pnpm publish` under the hood to push the changes to the NPM. It also generates git tags corresponding to the release.

1. `git push --follow-tags`
   This will push the generated release tags to the remote repo.

The workflow done with `changesets.yaml`:

1. `pnpm changeset`
   Run this command before you commit changes that will impact SEMVER on a published package.
   It creates a Markdown file with a new unique name that lists each package:SEMVER change along with a summary.

1. Review PR
   The [changesets.yaml workflow](./.github/workflows/changesets.yaml) will automatically create a PR titled `Version Packages` which does the same thing as `pnpm changeset version`.
   Each commit with changesets will automatically update the PR.

1. Merge PR
   When you merge the generated PR, it will run `pnpm changeset publish` and push the tags.

#### Other Apps

Additional apps like databases, kv storage, cron jobs, etc, are containerized.
Look at the `/caprover` folder for scripts to create them on the server.
