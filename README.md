# SampleKit

SampleKit is a monorepo which houses NPM packages for [SvelteKit](https://kit.svelte.dev/) with corresponding VS Code extensions and documentation.

It's also home to a site dedicated to Svelte and SvelteKit learning resources.

## Packages, Extensions, & Sites

| Package                                                                                                          | Kind              | Description                                            |
| :--------------------------------------------------------------------------------------------------------------- | ----------------- | :----------------------------------------------------- |
| [@samplekit/preprocess-katex](https://www.npmjs.com/package/@samplekit/preprocess-katex)                         | NPM Package       | Render math in Svelte markup.                          |
| [@samplekit/preprocess-markdown](https://www.npmjs.com/package/@samplekit/preprocess-markdown)                   | NPM Package       | Transpile Markdown to HTML in Svelte markup.           |
| [@samplekit/preprocess-shiki](https://www.npmjs.com/package/@samplekit/preprocess-shiki)                         | NPM Package       | Decorate code in Svelte markup.                        |
| [samplekit.svelte-pp-katex](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-katex)       | VS Code Extension | Syntax highlighting for @samplekit/preprocess-katex    |
| [samplekit.svelte-pp-markdown](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-markdown) | VS Code Extension | Syntax highlighting for @samplekit/preprocess-markdown |
| [samplekit.svelte-pp-shiki](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki)       | VS Code Extension | Syntax highlighting for @samplekit/preprocess-shiki    |

| Sites                                                     | Description                                                                                            |
| :-------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| [samplekit.dev](https://www.samplekit.dev)                | Showcase the integration of common patterns and useful libraries for SvelteKit via demos and articles. |
| [preprocessor docs](https://preprocessors.samplekit.dev/) | Documentation for the preprocessor packages and extensions.                                            |

## Internal Packages

| Package                                                                                                          | Description                                                                                                                                                      |
| :--------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@samplekit/auth](https://github.com/timothycohen/samplekit/tree/main/packages/auth)                             | Provide auth functionality for the websites.                                                                                                                     |
| [@samplekit/svelte-crop-window](https://github.com/timothycohen/samplekit/tree/main/packages/svelte-crop-window) | A loving Svelte 5 compatibile rewrite of [sabine/svelte-crop-window](https://github.com/sabine/svelte-crop-window) utilizing a Melt-UI inspired builder pattern. |

## SampleKit.dev

[SampleKit.dev](https://www.samplekit.dev) is the main website for this repo.

It addresses common questions that come up when building a full stack application – or backend for frontend – using SvelteKit.

It targets questions that are beyond the scope of the SvelteKit documentation but which fall squarely within the realm of SvelteKit apps.

Here are a few of the questions (in no particular order) that it addresses:

How can I...

- facilitate typesafe, fast, and maintainable REST endpoints?
- integrate user authentication with passkeys, OAuth, device management and MFA?
- create and run preprocessors?
- integrate AWS services?
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

### Features

Smaller topics are siloed into articles that include interactive demos and links to the source code.

Larger topics such as authentication and shop integration live outside of specific articles, but are grouped in their respective lib/routes folders. In the future, these will also have dedicated article series.

### Stack

The SampleKit repo is meant to show ideas, not a particular tech-stack (other than SvelteKit obviously). That being said, this is what's being used in `samplekit.dev`:

| Package                                                                                                                      | Kind                 | Description                                                                           |
| :--------------------------------------------------------------------------------------------------------------------------- | -------------------- | :------------------------------------------------------------------------------------ |
| [Svelte](https://svelte.dev/)                                                                                                | Core                 | Reactive library                                                                      |
| [SvelteKit](https://kit.svelte.dev/) + [Vite](https://vitejs.dev/)                                                           | Core                 | Full stack framework                                                                  |
| [TypeScript](https://www.typescriptlang.org/)                                                                                | Core                 | Language                                                                              |
| [PostgreSQL](https://node-postgres.com/)                                                                                     | Database             | SQL database                                                                          |
| [Drizzle](https://orm.drizzle.team/docs/overview)                                                                            | Database             | ORM, migrations, and DB GUI                                                           |
| [Redis](https://redis.io/)                                                                                                   | Database             | In-memory KV store                                                                    |
| [Zod](https://zod.dev/)                                                                                                      | User Input           | Validation                                                                            |
| [Superforms](https://superforms.rocks/)                                                                                      | User Input           | Enhanced form handling                                                                |
| [Custom Fetch Helper](https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/http/client.svelte.ts) | User Input           | Fully defined client requests right next to the server responses                      |
| [Radix UI](https://www.radix-ui.com/)                                                                                        | Style                | Design tokens                                                                         |
| [Tailwindcss](https://tailwindcss.com/)                                                                                      | Style                | CSS framework                                                                         |
| [PostCSS](https://postcss.org/)                                                                                              | Style                | Building Tailwind utilities/components with intellisense                              |
| [Lucide](https://lucide.dev/)                                                                                                | Style                | Icons                                                                                 |
| [Twilio](https://www.twilio.com/)                                                                                            | Transport            | SMS (currently disabled)                                                              |
| [AWS SES](https://aws.amazon.com/ses)                                                                                        | Transport            | Email                                                                                 |
| [Logflare](https://logflare.app/)                                                                                            | Logging              | Log storage                                                                           |
| [Sentry](https://sentry.io/)                                                                                                 | Logging              | Error tracking                                                                        |
| [Platform](https://github.com/bestiejs/platform.js)                                                                          | Logging              | Browser and OS detection to add context to the session                                |
| [Dozzle](https://dozzle.dev/)                                                                                                | Logging              | Real-time Docker logs viewer                                                          |
| [AWS S3](https://aws.amazon.com/s3/)                                                                                         | Storage and Delivery | Object (image) storage                                                                |
| [AWS Cloudfront](https://aws.amazon.com/cloudfront/)                                                                         | Storage and Delivery | CDN for object storage                                                                |
| [AWS Rekognition](https://aws.amazon.com/rekognition/)                                                                       | Storage and Devivery | Content moderation                                                                    |
| [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile)                                                          | Bot Management       | Client side bot detection (CAPTCHA alternative)                                       |
| [Shopify Storefront](https://shopify.dev/docs/api/storefront)                                                                | Shop Integration     | Headless shop                                                                         |
| [Google Cloud](https://console.cloud.google.com/apis)                                                                        | Auth                 | Sign in with Google                                                                   |
| [Custom Auth Package](https://github.com/timothycohen/samplekit/tree/main/packages/auth)                                     | Auth                 | Wrapper for session management, email confirmation, password reset, tokens, MFA, etc. |

External Auth Packages Used in Custom Auth Package:

| Package                                                                                                    | Description                                                                            |
| :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| [Node Crypto Scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback) | Password hasher                                                                        |
| [Nanoid](https://github.com/ai/nanoid)                                                                     | Tiny, URL-friendly, crpytographically secure, and collision resistant string generator |
| [SimpleWebAuthn](https://simplewebauthn.dev/)                                                              | Client & server helper fns for passkeys                                                |
| [otplib](https://github.com/yeojz/otplib) & [qrcode](https://github.com/soldair/node-qrcode)               | Helpers for authenticator apps                                                         |

### Installation

To run the `sites/samplekit.dev` app, you'll need to set up Redis and Postgres.
`sites/samplekit.dev/package.json` has scripts with docker commands to start and stop them.
Just make sure your docker daemon is running!

```sh
cd sites/samplekit.dev
cp .env.example .env.development
pnpm install # install node_modules
pnpm build:dependencies # build the required @samplekit packages (see package.json)
pnpm dev:up # start the docker services (see DockerCompose.samplekit.dev.yaml)
pnpm dev # start the vite server

# Find instructions on setting up services and creating environmental variables in .env.example
```

`initServer.ts` will init the services and either warn or fail if they're not set up properly.

#### Note on Turnstile

If you want to test authentication without providing your own Turnstile key, comment out the client and server checks.

```ts
// src/routes/(auth)/(login-signup)/signup/+page.server.ts
const signupWithPassword: Action = async (event) => {
  ...
  // const turnstileValidation = await validateTurnstile({ formData, headers: request.headers });
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
<!-- src/routes/(auth)/(login-signup)/signup/+page.svelte -->
- <button ... disabled={$submitting|| !turnstile.token} type="submit">
+ <button ... disabled={$submitting} type="submit">
```

```diff
<!-- src/routes/(auth)/(login-signup)/login/+page.svelte -->
- const signinDisabled = $derived($signinSubmitting || $resetSubmitting || !turnstile.token);
+ const signinDisabled = $derived($signinSubmitting || $resetSubmitting);
```

### Uninstall

To remove the docker containers, you can run the following:

```sh
pnpm dev:down
```

If desired, you can remove the `redis:latest` and `postgres:latest` images with `docker rmi`.

## Contributing

Contributions are welcome – [create an issue](https://github.com/timothycohen/samplekit/issues) or submit a pull request to main from a feature branch.

Run `pnpm validate` before committing.
This runs the same [validation script](./scripts/.githooks/pre-commit) used in the CI pipeline and will block merges if it fails.
If you haven't already, you may have to build the packages and create the `.svelte-kit` files first: `pnpm install --frozen-lockfile && pnpm build:packages && pnpm sync && pnpm validate`.

If you plan to make multiple commits, run `pnpm githooks:init`, which will automatically run the validation script on commit.

If a contribution to an NPM package or VS Code extension results in a SEMVER change, please run `pnpm changeset` and follow the instructions before committing.
This is unnecessary for websites.

## DevOps Overview for Contributors

The SampleKit repo deploys its apps via Docker containers on a private server orchestrated with CapRover.

| Package                                                                                  | Description                                                                                                          |
| :--------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [Prettier](https://prettier.io/) + [ESLint](https://eslint.org/)                         | Formatter + Linter                                                                                                   |
| [Custom Githooks](https://github.com/timothycohen/samplekit/tree/main/scripts/.githooks) | `pre-commit` install, format, lint, and check<br/>pre-push reinstall frozen lockfile                                 |
| [Docker](https://www.docker.com/)                                                        | Containers                                                                                                           |
| [Caprover](https://caprover.com/)                                                        | Self-hosting PaaS                                                                                                    |
| [GitHub Actions](https://github.com/features/actions)                                    | validation/versioning/deployments [workflows](https://github.com/timothycohen/samplekit/tree/main/.github/workflows) |
