export type Result<T, E = App.JSONError> = NonNullable<Result.Err<E> | Result.Ok<T>>;
export namespace Result {
	export type Success = { message: 'Success' };
	export type Ok<T> = { data: T; error?: never };
	export type Err<E> = { data?: never; error: E };
}
