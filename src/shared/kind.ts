import { t } from "@rbxts/t";

export type KindType<T extends Kind<defined> | undefined> = T extends Kind<infer K> ? K : undefined;
export type Kindize<T extends defined[]> = { [K in keyof T]: Kind<T[K]> };

export abstract class Kind<T extends defined> {
	protected constructor(public readonly label: string) {}
	public abstract transform(data: string): T | undefined;
	public abstract verify(data: unknown): data is T;
}

export abstract class tKind<T extends defined> extends Kind<T> {
	protected constructor(
		public readonly label: string,
		protected readonly check: t.check<T>,
	) {
		super(label);
	}
	public verify(data: unknown): data is T {
		return this.check(data);
	}
}
