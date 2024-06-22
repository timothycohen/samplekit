<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';

	interface Props {
		part: 1 | 2 | 3;
	}

	const { part }: Props = $props();
</script>

{#if part === 1}
	<CodeTopper title="Select User name you created -> Add permissions -> Create Inline Policy -> JSON">
		<!-- shiki-start
```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "s3",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:DeleteObject"
			],
			"Resource": [
				"arn:aws:s3:::samplekit",
				"arn:aws:s3:::samplekit/*"
			]
		}
	]
}
```
shiki-end -->
	</CodeTopper>
{:else if part === 2}
	<CodeTopper title="IAM -> Users -> User name you created -> Policy you created">
		<!-- shiki-start
```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "s3",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:DeleteObject"
			],
			"Resource": [
				"arn:aws:s3:::samplekit",
				"arn:aws:s3:::samplekit/*"
			]
		},
		{ // [!diff-add]
			"Sid": "cloudfront", // [!diff-add]
			"Effect": "Allow", // [!diff-add]
			"Action": [ // [!diff-add]
				"cloudfront:CreateInvalidation" // [!diff-add]
			], // [!diff-add]
			"Resource": [ // [!diff-add]
				"arn:aws:cloudfront::069636842578:distribution/*" // [!diff-add]
			] // [!diff-add]
		} // [!diff-add]
	]
}
```
shiki-end -->
	</CodeTopper>
{:else if part === 3}
	<CodeTopper title="IAM -> Users -> User name you created -> Policy you created">
		<!-- shiki-start
```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "s3",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:DeleteObject",
				"s3:GetObject" // [!diff-add]
			],
			"Resource": [
				"arn:aws:s3:::samplekit",
				"arn:aws:s3:::samplekit/*"
			]
		},
		{
			"Sid": "cloudfront",
			"Effect": "Allow",
			"Action": [
				"cloudfront:CreateInvalidation"
			],
			"Resource": [
				"arn:aws:cloudfront::069636842578:distribution/*"
			]
		},
		{ // [!diff-add]
			"Sid": "rekognition", // [!diff-add]
			"Effect": "Allow", // [!diff-add]
			"Action": [ // [!diff-add]
				"rekognition:DetectModerationLabels" // [!diff-add]
			], // [!diff-add]
			"Resource": [ // [!diff-add]
				"*" // [!diff-add]
			] // [!diff-add]
		} // [!diff-add]
	]
}
```
shiki-end -->
	</CodeTopper>
{/if}
