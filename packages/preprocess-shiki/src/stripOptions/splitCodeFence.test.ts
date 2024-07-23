import { expect, test } from 'vitest';
import { splitCodeFence } from './splitCodeFence.js';

test('happy path', () => {
	const a = `\`\`\`ts

  const foo = "bar";

const baz = 'foo';


\`\`\``;

	const b = `~~~js
const foo = "bar"
~~~`;

	expect(splitCodeFence(a)).toEqual({
		globalOptGroups: [],
		fence: '```',
		lang: 'ts',
		codeAndOptGroupLines: ['', '  const foo = "bar";', '', "const baz = 'foo';", '', ''],
		tranName: null,
	});
	expect(splitCodeFence(b)).toEqual({
		globalOptGroups: [],
		fence: '~~~',
		lang: 'js',
		codeAndOptGroupLines: [`const foo = "bar"`],
		tranName: null,
	});
});

test('whitespace', () => {
	const a = `~~~ts
const foo = "bar"
~~~`;
	const b = `~~~   ts
const foo = "bar"
~~~`;
	const c = `
		   ~~~ts
const foo = "bar"
~~~`;
	const d = `~~~ts
const foo = "bar"
   ~~~`;
	const e = `~~~ts
const foo = "bar"
~~~

`;
	const expected = {
		globalOptGroups: [],
		fence: '~~~',
		lang: 'ts',
		codeAndOptGroupLines: [`const foo = "bar"`],
		tranName: null,
	};
	expect(splitCodeFence(a)).toEqual(expected);
	expect(splitCodeFence(b)).toEqual(expected);
	expect(splitCodeFence(c)).toEqual(expected);
	expect(splitCodeFence(d)).toEqual(expected);
	expect(splitCodeFence(e)).toEqual(expected);
});

test('before', () => {
	const a = `foo
~~~ts
const foo = "bar"
~~~`;

	const b = `
foo

~~~ts
const foo = "bar"
~~~`;

	const c = `
foo

~~~ts
const foo = "bar"
~~~`;

	const d = `t-foo
   foo

~~~ts
const foo = "bar"
~~~`;

	const expected = {
		globalOptGroups: ['foo'],
		fence: '~~~',
		lang: 'ts',
		codeAndOptGroupLines: [`const foo = "bar"`],
		tranName: null,
	};
	expect(splitCodeFence(a)).toEqual(expected);
	expect(splitCodeFence(b)).toEqual(expected);
	expect(splitCodeFence(c)).toEqual(expected);
	expect(splitCodeFence(d)).toEqual({ ...expected, tranName: 'foo' });
});

test('errors', () => {
	const empty = ``;
	expect((splitCodeFence(empty) as Error).message).toBe('Codeblock empty');

	const oneLine = `const foo = 'bar';`;
	expect((splitCodeFence(oneLine) as Error).message).toBe('Missing start code fence');

	const noFence = `js
		foo`;
	expect((splitCodeFence(noFence) as Error).message).toBe('Missing start code fence');

	const sameFrontLine = `~~~ts const foo = "bar"
		~~~`;
	expect((splitCodeFence(sameFrontLine) as Error).message).toBe(
		'Start code fence must be on separate line. Got `~~~ts const foo = "bar"`',
	);

	const oneFenceEnd = `const foo = "bar"
		~~~`;
	expect((splitCodeFence(oneFenceEnd) as Error).message).toBe('Unbalanced code fence');

	const afterCodeFence = `~~~ts
		const foo = "bar"
		~~~
		foo`;
	expect((splitCodeFence(afterCodeFence) as Error).message).toBe('Expected end code fence (~~~). Got `foo`');

	const noEndFence = `~~~js
		foo`;
	expect((splitCodeFence(noEndFence) as Error).message).toBe('Expected end code fence (~~~). Got `foo`');

	const sameEndLine = `~~~ts
const foo = "bar" ~~~
`;
	expect((splitCodeFence(sameEndLine) as Error).message).toBe(
		'End code fence (~~~) must be on separate line. Got `const foo = "bar" ~~~`',
	);
});
