import { Type } from "../class/type";
import { Builder } from "../impl/builder";
import { TypeDef } from "../types";

// here be dragons
export type ExtractTypeFromType<T extends Type<unknown>> = T extends Type<infer U> ? U : never;
export type ExtractTypeFromTupleArg<T extends [...Type<unknown>[]]> = {
	[K in keyof T]: T[K] extends Type<infer U> ? U : never;
};
export type ExtractTupleFromArgBuilder<T extends ArgumentBuilder<[...unknown[]]>> =
	T extends ArgumentBuilder<infer U> ? U : never;
export type ArgBuilderToTypeTuple<
	T extends ArgumentBuilder<[...unknown[]]>,
	G extends ExtractTupleFromArgBuilder<T> = ExtractTupleFromArgBuilder<T>,
> = G extends (infer U)[] ? Type<U>[] : never;
export type TupleToType<T extends [...unknown[]]> = { [K in keyof T]: Type<T[K]> };

export class ArgumentBuilder<T extends [...unknown[]] = []> extends Builder<TypeDef[]> {
	protected arguments: Type<unknown>[] = [];
	protected constructor(private definition: Partial<TypeDef[]>) {
		super();
	}
	public addArgument<A extends Type<unknown>>(arg: A): ArgumentBuilder<[...T, ExtractTypeFromType<A>]> {
		this.arguments.push(arg);
		return this as never;
	}
	public getArguments() {
		return this.arguments as ReadonlyArray<Type<unknown>>;
	}
	public build() {
		return this.definition as TypeDef[];
	}
	public static create() {
		return new ArgumentBuilder([]);
	}
}
