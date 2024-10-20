export const LaTeX = String.raw as (
	template: { raw: readonly string[] | ArrayLike<string> },
	...substitutions: unknown[]
) => string;
