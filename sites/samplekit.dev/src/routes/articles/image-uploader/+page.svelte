<script lang="ts" context="module">
	import video from './assets/2024-08-05_21-17-07_465x474_24fps.mp4';
	import imgSm from './assets/image-uploader-thumbnail-1200w.webp';
	import type { RawFrontMatter } from '$lib/articles/schema';

	export const metadata = {
		title: 'Image Cropper And Uploader',
		implementationPath: '/account/profile',
		srcCodeHref:
			'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/cloudStorage/client/cropImgUploadController.ts',
		description:
			'Select an image, upload it to an AWS S3 Bucket with a progress indicator, moderate it with Rekognition, save it to the DB, and serve it via AWS Cloudfront.',
		publishedAt: new Date('2024-03-20 16:37:01 -0400'),
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		imgSm,
		video,
		tags: ['state controller', 'image uploads', 'aws', 'db', 's3', 'cloudfront', 'rekognition', 'rate limiting'],
		featured: true,
	} satisfies RawFrontMatter;
</script>

<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';
	import { TabPanels, TabPanelItem, HAnchor, Admonition } from '$lib/components';
	import AvatarEditor from './AvatarEditor.svelte';
	import CropImgUploadController from './CropImgUploadController.svelte';
	import IAM from './IAM.svelte';
	import Misc from './Misc.svelte';
	import img_uploaderFlow from './assets/image-uploader-flow-q30.webp';

	const { data } = $props();
</script>

<p>
	Let's allow our users to upload an image. We'll use an avatar as an example. This simple feature will touch a lot of
	topics:
</p>

<ul>
	<li>
		<p>Infrastructure</p>
		<ul>
			<li><a href="https://aws.amazon.com/s3" data-external>AWS S3</a> (image storage)</li>
			<li>
				<a href="https://aws.amazon.com/cloudfront" data-external>AWS Cloudfront</a> (distribution)
			</li>
			<li>
				<a href="https://aws.amazon.com/rekognition" data-external>AWS Rekognition</a> (content moderation)
			</li>
			<li><a href="https://aws.amazon.com/iam" data-external>AWS IAM</a> (security)</li>
			<li>
				<a href="https://www.postgresql.org/" data-external>PostgreSQL</a> with
				<a href="https://orm.drizzle.team/docs/overview" data-external>Drizzle ORM</a> (to store the user and their avatar)
			</li>
			<li><a href="https://redis.io/" data-external>Redis</a> (rate limiting)</li>
		</ul>
	</li>
	<li>
		<p>Client Features</p>
		<ul>
			<li>Upload controller with reactive state in a Svelte store</li>
			<li>Crop, file select, upload, and delete capabilities</li>
			<li>Graceful interruption and cancellation handling</li>
			<li>User friendly errors</li>
			<li>Size and file type guards</li>
			<li>File upload progress bar</li>
			<li>Images loaded from CDN</li>
		</ul>
	</li>
	<li>
		<p>Server Guards</p>
		<ul>
			<li>User authorization</li>
			<li>Rate limits</li>
			<li>Explicit content deletion</li>
			<li>Image storage access authorization</li>
			<li>Size and file type limits</li>
			<li>Zero trust client relationship</li>
		</ul>
	</li>
</ul>

<p>
	Of course, there are many alternatives to each infrastructure choice. For example,
	<a href="https://imagekit.io/" data-external>ImageKit</a> could be used as the image storage and CDN, an in-memory
	cache such as
	<a href="https://www.npmjs.com/package/@isaacs/ttlcache" data-external>ttlcache</a> could be used as the kv store,
	<a href="https://console.cloud.google.com/marketplace/product/google/vision.googleapis.com" data-external
		>Google Cloud Vision</a
	> could be used for content moderation, and so on. To keep it simple, we'll use AWS for everything except the database
	and kv store, which will be hosted directly on the server.
</p>

<Admonition kind="info" title="Bring Your Own Database">
	<p class="my-2">
		This article focuses on the SvelteKit logic and integrating the AWS services. Setting up each AWS service will be
		detailed, but it's assumed you have a database.
	</p>
	<p class="my-0">
		If not, you can use the <code class="text-info-11">dev:db:*</code> and <code class="text-info-11">dev:kv:*</code>
		scripts in <code class="text-info-11">package.json</code> to create docker containers.
	</p>
</Admonition>

<HAnchor tag="h2" title="Upload Flow Options" />

<p>The basic flow is simple. Get a file input from the user, upload it to storage, and save a link in a database.</p>

<p>
	However, there are multiple possible implementation variants to our flow. There are also security features or UI
	enhancements we'll want to implement. First, let's evaluate a few different ways our basic flow could be implemented
	so we can choose one.
</p>

<HAnchor tag="h3" title="0.1 Server Heavy" />

<p>The Flow</p>

<ul>
	<li>The client uploads a file to the server.</li>
	<li>
		The server checks user authorization, rate limits the request, checks the file size, and checks the content
		moderation with <code>Rekognition</code>.
	</li>
	<li>The server uploads the file to an <code>S3</code> bucket.</li>
	<li>The server saves the file url into the database.</li>
	<li>
		In order to show the client the progress that has been made, the server pushes server-sent events with a connection
		made with <code>ReadableStream</code> and <code>EventSource</code>.
	</li>
</ul>

<p>Pros</p>

<ul>
	<li>Simple to make safe. The server has complete control.</li>
</ul>

<p>Cons</p>

<ul>
	<li>Slow. The file has to make two trips (from client to server to AWS).</li>
	<li>Memory inefficient. The server has to hold the file in memory during the entire pipeline.</li>
</ul>

<HAnchor tag="h3" title="0.2 With Webhook" />

<p>The Flow</p>

<ul>
	<li>
		The server checks user authorization, rate limits the request, generates an upload token with a predetermined size,
		and sends the presigned url to the client.
	</li>
	<li>The client uses the token to upload the file to an <code>S3</code> bucket.</li>
	<li>An AWS event notification notifies the server that a file has been created.</li>
	<li>
		The server validates the image with <code>Rekognition</code> (and deletes it if it fails validation) before saving the
		url to the database.
	</li>
</ul>

<p>Pros</p>

<ul>
	<li>Memory efficient. The file is never on the server.</li>
	<li>Simple to make safe. We rely on AWS, not the client to notify the server between steps.</li>
</ul>

<p>Cons</p>

<ul>
	<li>
		Variable speed.
		<a
			href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html#:~:text=manage%20this%20subresource.-,Important,-Amazon%20S3%20event"
			data-external
		>
			Event notifications can take over a minute.
		</a>
	</li>
	<li>
		Higher complexity. Involves setting up an event notification with a lambda that POSTs the event notification data to
		our server.
	</li>
	<li>
		Harder to show the client update progress. If the updates were sent via a long lived connection (server-sent events
		or websockets) with an app scaled to multiple instances, the client request and the AWS notification might hit
		different instances. The client would have to poll the server or an adapter would be necessary to broadcast the
		event to the correct app instance.
	</li>
</ul>

<HAnchor tag="h3" title="0.3 Guarded Client Control" />

<p>The Flow</p>

<ul>
	<li>
		The server checks user authorization, rate limits the request, generates an upload token with a predetermined size,
		stores the presigned url, creates a cleanup job, and sends the presigned url to the client.
	</li>
	<li>The client uses the token to upload the file to an <code>S3</code> bucket.</li>
	<li>
		The client notifies the server that the image has been uploaded. The server confirms the image has truly been
		uploaded to the presigned url location, validates the image with <code>Rekognition</code>, removes the cleanup job,
		saves the url to the database, and returns the response to the client.
	</li>
	<li>
		If the client uploads to the url but doesn't notify us (either due to malicious intent or via a canceled/interrupted
		request), the cleanup job will delete it.
	</li>
</ul>

<p>Pros</p>

<ul>
	<li>Fast. The file goes directly from the client to AWS.</li>
	<li>Memory efficient. The file is never on the server.</li>
	<li>
		Easy to show progress. We can use three distinct http requests and the upload can use an
		<code>XMLHttpRequest</code> with <code>req.upload.addEventListener('progress', cb)</code>.
	</li>
</ul>

<p>Cons</p>

<ul>
	<li>
		Moderate complexity to make safe. We have to store knowledge of the presigned url request and also add a cleanup job
		to thwart malicious actors.
	</li>
</ul>

<HAnchor tag="h3" title="Choice" />

<p>
	This article implements the guarded client control method. It provides the best client experience (fastest, most
	visible progress), incurs minimal strain on the server, avoids extra AWS complexity, and isn't too hard to protect.
</p>

<HAnchor tag="h2" title="Client" />

<p>
	If we try to view the server, client, and services all at once, we end up with something a little hard to reason with
	(rate limiting and presigned url storage not shown):
</p>

<img src={img_uploaderFlow} alt="Upload flow" />

<p>
	By focusing on client, AWS, and server separately, the flow become very easy to reason about. We'll begin with the
	client. Separating the logic from the UI and breaking it down into finite states will make it trivial to understand.
</p>

<HAnchor tag="h3" title="State Controller Interface" />

<p>
	As usual, we'll start by defining some <code>Type</code>s and <code>Interface</code>s that will simplify the
	implementation.
</p>

<HAnchor tag="h4" title="Property Types" />

<p>
	One of our requirements is that the user should be able to crop their image. We'll do a <code>CSS</code> crop so we
	don't have to worry about modifying the image.
	<a href="https://github.com/sabine/svelte-crop-window" data-external>svelte-crop-window</a> will handle the cropping logic
	for us, and we'll simply store their data alongside the url.
</p>

<CodeTopper title="$lib/image/client/schemas.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'imageSchema.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<HAnchor tag="h4" title="States" />

<p>
	We need to break the flow into separate states. That could be done in many ways, but I'm going to break them along the
	following lines.
</p>

<Misc part="state-table" />

<p>We need some static states:</p>

<CropImgUploadController part={1} />

<p>
	If the user has an avatar already, we'll want to allow them to crop it, save the updated crop value, and delete it.
</p>

<CropImgUploadController part={2} />

<p>
	If the user doesn't have an image, or if they are selecting a new image, we'll need states to facilitate selecting the
	file, loading it into memory, cropping it, getting the presigned url, sending it to AWS, and saving the url to the DB.
</p>

<CropImgUploadController part={3} />

<p>Putting it all together, the controller has the following states:</p>

<CropImgUploadController part={4} />

<p>
	The controller will have two logical entry points. If the user already has an avatar, it should start with the
	<code>CroppingPreexisting</code> state. Otherwise, it will be set to the <code>FileSelecting</code> state.
</p>

<AvatarEditor part={1} />

<HAnchor tag="h4" title="HTTP Functions" />

<p>
	Now that we've determined the states, we can define the http wrapper functions that our action functions will consume.
</p>

<CropImgUploadController part={5} />

<p>
	Of the five types, <code>GetUploadArgs</code>, <code>SaveToDb</code>, <code>DeletePreexistingImg</code>, and
	<code>SaveCropToDb</code> are requests to our own server endpoints. They're implemented with the
	<a href="/articles/typesafe-fetch-handler"> TypeSafe Fetch Handler we created in a previous article</a>.
	<code>Upload</code>, however, is a request directly to AWS using the credentials the server sent the client along with
	an <code>uploadProgress</code> object that will show the status of the user.
</p>

<HAnchor tag="h3" title="State Controller Implementation" />

<p>
	We'll make a <code>CropImgUploadController</code> class where the only property is a <code>Writable</code> store that
	holds the <code>CropControllerState</code>.
</p>

<p>
	The state controller will have actions that transfer between states. Before implementing the action functions, we'll
	want a couple helpers.
</p>

<CropImgUploadController part={6} />

<p>
	A few of our action functions will have very little logic. Their only purpose is to move the required data from one
	state to another and guard against invalid state transitions.
</p>

<CropImgUploadController part={7} />

<p>
	The action functions used when the user already has an image are more interesting. They'll need to be able to save the
	new crop value and to delete the image.
</p>

<CropImgUploadController part={8} />

<p>
	If the user wants to load a new image, they'll start by selecting a file. The file should be loaded into memory,
	guarding against files that are too large or of the wrong type.
</p>

<CodeTopper title="$lib/image/client/utils.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'imageUtils.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<CropImgUploadController part={9} />

<p>Now that the file is loaded we can create a full upload pipeline.</p>

<CropImgUploadController part={10} />

<p>We've finished the upload state controller! Full code below.</p>

<CodeTopper title="$lib/cloudStorage/client/cropImgUploadController.ts Full" initialCollapsed>
	<TabPanelItem
		panel={{
			rawHTML: data.article.demos?.main?.find((d) => d.title === 'cropImgUploadController.ts')?.rawHTML ?? '',
		}}
	/>
</CodeTopper>

<HAnchor tag="h3" title="UI Components" />

<p>
	We'll need a few components to show our UI state. We'll make them mostly dumb components so the logic can be isolated
	inside the file where the <code>CropImgUploadController</code> is instantiated.
</p>

<TabPanels
	files={data.article.demos?.main?.filter((d) =>
		[
			'FileInput.svelte',
			'ImageCrop.svelte',
			'ImageCardBtns.svelte',
			'ImageCardOverlays.svelte',
			'UploadProgress.svelte',
			'ConfirmDelAvatarModal.svelte',
		].includes(d.title),
	) ?? []}
/>

<HAnchor tag="h3" title="Avatar Editor" />

<p>
	The final UI component will be the controller component <code>AvatarEditor.svelte</code> that orchestrates the UI
	components created above using a <code>Writable&lt;CropControllerState&gt;</code> store <code>s</code>. It receives an
	avatar from the parent and passes the changes back up with <code>onCancel</code> and
	<code>updateAvatar</code> callbacks. The <code>FileInput</code> <code>accept</code> property is restricted to what
	Rekognition can handle. This component lives on a page behind an auth guard. SampleKit uses
	<a href="https://github.com/timothycohen/samplekit/tree/staging/packages/auth" data-external>its own auth package</a>.
	There are many other options. For example,
	<a href="https://lucia-auth.com/" data-external>Lucia Auth</a>.
</p>

<AvatarEditor part={2} />

<p>
	Let's call some unimplemented code to satisfy the callbacks in our UI components. The same
	<code>MAX_UPLOAD_SIZE</code> set in the presigned url is also used on the client to guard against files that are too large
	before uploading them.
</p>

<AvatarEditor part={3} />

<p>
	We've finished the UI, but the client calls three unimplemented files: a client upload function and two server
	endpoints – <code>crop.json</code> and <code>upload.json</code>.
</p>

<HAnchor tag="h3" title="Uploader" />

<p>
	The upload function is called by the client to upload directly to the presigned url. In order to keep the
	<code>uploadProgress</code> in sync with the upload state, we'll use an <code>XMLHttpRequest</code> which supports a
	<code>progress</code> listener instead of <code>fetch</code>. Because <code>XMLHttpRequest</code> uses listeners and
	callbacks, we'll promisify it and split the <code>promise</code> and <code>abort</code>.
</p>

<CodeTopper title="$lib/cloudStorage/client/uploadToCloudStorage.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'uploadToCloudStorage.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<HAnchor tag="h3" title="Client Endpoints" />

<p>
	These define the <a href="/articles/typesafe-fetch-handler">typesafe fetch handlers</a> that will correspond to the
	<code>+server.ts</code> endpoints.
</p>

<TabPanels
	files={data.article.demos?.main?.filter((d) => ['crop.json/index.ts', 'upload.json/index.ts'].includes(d.title)) ??
		[]}
/>

<p>We've finished our client code, but these two fetch handlers route to unimplemented server endpoints.</p>

<HAnchor tag="h2" title="AWS" />

<p>
	The two unimplemented server endpoints will call the AWS SDKs, so we'll set up AWS and then finish with our server
	endpoints.
</p>

<p>
	If you don't already have one, you will need to <a href="https://aws.amazon.com/" data-external>
		set up account at aws.amazon.com
	</a>. We will create four services. S3 will hold the images, Rekognition will moderate explicit content, CloudFront
	will serve the images, and IAM will manage access.
</p>

<Admonition kind="warning" title="Pay Per Use">
	<p class="my-2">These services are pay per use and cost cents to test.</p>
	<p class="my-2">
		However, if they are not properly protected, a malicious user could use them to rack up a large bill.
	</p>
	<p class="my-0">Be sure to protect your keys, limit access methods, rate limit, and set up billing alerts.</p>
</Admonition>

<HAnchor tag="h3" title="Install AWS SDKs" />

<p>All of the AWS code will use the official client SDKs.</p>

<Misc part="package.json" />

<p>
	Using the SDKs, a client is created and then commands are sent with the client. Here are the commands we'll be using.
</p>

<Misc part="aws-sdk" />

<p>We need to enable the services on AWS, and then configure their permissions with an AWS IAM policy.</p>

<HAnchor tag="h3" title="Enable Services" />

<HAnchor tag="h4" title="Creating the S3 Bucket" />

<p>
	Choose "create bucket" on the <a href="https://s3.console.aws.amazon.com/s3/" data-external>S3 dashboard</a> and create
	a new bucket with a unique name (for example the name of your app) and all the default settings.
</p>

<p>
	Edit the <code>CORS</code> configuration so the client can <code>POST</code> directly to the AWS bucket. "Block all public
	access" will prevent users from uploading directly without a presigned key.
</p>

<Misc part="cors" />

<HAnchor tag="h4" title="Creating the IAM Policy" />

<p>
	At <a href="https://us-east-1.console.aws.amazon.com/iamv2/home#/users" data-external>IAM</a>, create a new user –
	naming it the same as your app will make it easy to remember. Use all default settings.
</p>

<p>Create a policy that will allow creating and deleting images in our bucket.</p>

<IAM part={1} />

<p>
	Click "Next", give it a policy name (again I've used the name of my app), and hit "Create Policy". Done! Now we have
	permission to create and delete objects in the bucket.
</p>

<HAnchor tag="h4" title="Creating the Cloudfront Distribution" />

<p>
	Choose "Create Distribution" at <a href="https://us-east-1.console.aws.amazon.com/cloudfront" data-external
		>AWS Cloudfront</a
	>.
</p>

<ul>
	<li>Origin Domain: Choose S3 bucket</li>
	<li>Origin Access -> Origin access control settings -> Choose Bucket Name</li>
	<li>Redirect HTTP to HTTPS: Yes</li>
	<li>Do not enable security protections (WAF is not pay per use)</li>
</ul>

<p>
	After finishing with "Create distribution", you will be given a bucket policy. Copy this into your S3 bucket: Select
	Bucket -> Permissions -> Bucket Policy.
</p>

<HAnchor tag="h4" title="Add Cloudfront to the IAM Policy" />

<p>
	When an S3 object is deleted, the Cloudfront cache is not automatically invalidated. We'll do that manually, and
	therefore <code>cloudfront:CreateInvalidation</code> permissions will need to be granted.
</p>

<IAM part={2} />

<HAnchor tag="h4" title="Add Rekognition to the IAM Policy" />

<p>
	We will grant

	<code>rekognition:DetectModerationLabels</code> permissions, but also <code>s3:GetObject</code> so Rekognition is able
	to detect directly from the S3 bucket.
</p>

<IAM part={3} />

<p>Let's create an IAM access token and add our environmental variables.</p>

<Misc part="env" />

<HAnchor tag="h3" title="AWS Server Code" />

<HAnchor tag="h4" title="AWS SDKs" />

<p>
	AWS has been configured on our account and we are ready to use them with the SDKs. The clients are wrapped in getters
	so they are not created during the app build.
</p>

<TabPanels
	files={data.article.demos?.main?.filter((d) => ['s3.ts', 'cloudfront.ts', 'rekognition.ts'].includes(d.title)) ?? []}
/>

<HAnchor tag="h4" title="Helpers" />

<p>
	We need some way to organize the S3 files. We could add meta tags, but it becomes cumbersome because S3 doesn't have a
	way to perform CRUD actions based on the tags without intermediary requests. Instead we'll silo the files into
	"folders" by manipulating the key. That way, we can download the entire dev branch, delete all of a user's images,
	etc. Creating keys by hand on each call would be messy, so let's make a key controller.
</p>

<CodeTopper title="$lib/cloudStorage/server/utils.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'keyController.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<p>
	Lastly, we saw in our flow that we will need to create some kind of job that will remove any images that weren't
	uploaded within a certain time. Let's implement that.
</p>

<CodeTopper title="$lib/cloudStorage/server/unsavedUploadsCleaner.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'unsavedUploadsCleaner.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<HAnchor tag="h2" title="Server" />

<p>
	The last piece of this is to implement the two server endpoints <code>crop.json</code> and <code>upload.json</code>.
</p>

<HAnchor tag="h3" title="Crop" />

<p>
	<code>crop.json/+server.ts</code> is easy because we're just updating the crop value. Let's get that out of the way.
</p>

<CodeTopper title="$routes/account/profile/avatar/crop.json/+server.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'crop.json/+server.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<HAnchor tag="h3" title="Upload" />

<p>For the uploader, we require a rate limiter and some way to save the presigned urls.</p>

<HAnchor tag="h4" title="Rate Limiter" />

<p>
	SampleKit uses its
	<a
		href="https://github.com/timothycohen/samplekit/blob/staging/sites/samplekit.dev/src/lib/botProtection/rateLimit/server.ts"
		data-external
	>
		own rate limiter
	</a>
	around a Redis client. A good in-memory rate limiter is
	<a href="https://github.com/ciscoheat/sveltekit-rate-limiter/blob/main/src/lib/server/index.ts" data-external>
		sveltekit-rate-limiter</a
	>, a package created by the author of sveltekit-superforms.
</p>

<HAnchor tag="h4" title="Signed URL Storage" />

<p>The presigned urls are stored in the database.</p>

<TabPanels
	files={data.article.demos?.main?.filter((d) =>
		['presignedUrls.ts', 'presignedUrlsController.ts'].includes(d.title),
	) ?? []}
/>

<HAnchor tag="h4" title="Endpoint" />

<p>We can now implement the last endpoint, and with it, complete the entire feature.</p>

<CodeTopper title="$routes/account/profile/avatar/upload.json/+server.ts">
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'upload.json/+server.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<HAnchor tag="h2" title="Conclusion" />

<p>
	This one covered a lot of ground. I hope it helps you integrate AWS services into your SvelteKit app, provides some
	ideas for how to handle a state controller, and opens up the possibility of safely allowing users to upload images
	directly to your S3 bucket. There are of course more features that could be added, such as using image transformations
	so the client isn't loading a full size image for a tiny avatar. For that, there is an
	<a href="https://aws.amazon.com/solutions/implementations/serverless-image-handler/" data-external>
		AWS solution (Serverless Image Handler)
	</a>
	and a third party way <a href="https://imagekit.io/" data-external>(imagekit.io)</a>. No matter which service you
	choose, the client and server code we've created could just as easily be applied there.
</p>

<p>
	As always, please do share your thoughts over in the
	<a href="https://github.com/timothycohen/samplekit/discussions" data-external>GitHub discussions</a>. Until next time,
	happy coding!
</p>
