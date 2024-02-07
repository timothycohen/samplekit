export const assertUnreachable = (_: never): never => {
	throw new Error('Unchecked');
};

export type Result<T, E = Result.Error> = NonNullable<Result.Err<E> | Result.Ok<T>>;
export namespace Result {
	export type Error = { status: number; message: string; code: string };
	export type Success = { message: 'Success' };
	export type Ok<T> = { data: T; error?: never };
	export type Err<E = Result.Error> = { data?: never; error: E };
}
