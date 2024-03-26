export abstract class Builder<S = unknown> {
	protected constructor() {}
	public abstract build(): S;
	public static create(...args: unknown[]): unknown {
		throw "No implementation for Builder";
	}
}
