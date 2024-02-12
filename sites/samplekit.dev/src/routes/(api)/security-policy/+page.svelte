<script lang="ts">
	import { securityEmail } from '../consts';
</script>

<div class="page">
	<div class="prose prose-radix">
		<h1>Security</h1>

		<p>
			This project is open source and contributions are welcomed. Thank you for contributing to the security of our
			users.
		</p>

		<h2>Contact</h2>
		<p>Please do not report security vulnerabilities through GitHub or any public arena.</p>
		<p>
			Instead, please email us at
			<a href="mailto:{securityEmail}">{securityEmail}</a>
		</p>

		<h2>Reporting Security Issues</h2>
		<p>Please include as much information as possible. That might include, but not be limited to:</p>
		<h3>All users</h3>
		<ul>
			<li>What you were doing when the issue occurred</li>
			<li>What you expected to happen</li>
			<li>What actually happened</li>
		</ul>

		<h3>Technical users</h3>
		<ul>
			<li>The type of issue (xss, unchecked authorization, sql injection, leaked keys, csrf, etc.)</li>
			<li>Implicated source file paths or git commits</li>
			<li>Reproduction steps</li>
			<li>Example exploit code or methodology</li>
		</ul>

		<p>
			Thank you for helping us keep our users secure. We will respond to your report as soon as possible and will keep
			you informed of our progress.
		</p>
	</div>
</div>
