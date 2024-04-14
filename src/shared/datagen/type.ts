import { Type } from "../class/type";
import { Builder } from "../impl/builder";
import { TypeDef } from "../types";

// here be dragons
export type ExtractTypeFromType<T extends Type<unknown>> = T extends Type<infer U> ? U : never;
export type ExtractTypeFromTupleArg<T extends [...Type<unknown>[]]> = {
	[K in keyof T]: T[K] extends Type<infer U> ? U : never;
};
export type ExtractTupleFromArgBuilder<
	T extends ArgumentBuilder<[...unknown[]]> | Omit<ArgumentBuilder<[...unknown[]]>, "appendArgument">,
> = T extends ArgumentBuilder<infer U> ? U : T extends Omit<ArgumentBuilder<infer U>, "appendArgument"> ? U : never;
export type ArgBuilderToTypeTuple<
	T extends ArgumentBuilder<[...unknown[]]>,
	G extends ExtractTupleFromArgBuilder<T> = ExtractTupleFromArgBuilder<T>,
> = G extends (infer U)[] ? Type<U>[] : never;
export type TupleToType<T extends [...unknown[]]> = { [K in keyof T]: Type<T[K]> };

interface ArgBuilderArgument<T> {
	Type: Type<T>;
	Optional: boolean;
}

/**
 * Data generation for building arguments with {@link Type} instances
 * @see {@link Type}
 */
export class ArgumentBuilder<T extends [...unknown[]] = []> extends Builder<TypeDef[]> {
	protected arguments: ArgBuilderArgument<unknown>[] = [];
	protected constructor(private definition: Partial<TypeDef>[]) {
		super();
	}
	/**
	 * Appends an argument to the argument stack.
	 * @param arg The argument, which must be an instance of {@link Type}
	 * @returns The ArgumentBuilder, with argument appended to the argument stack
	 */
	public appendArgument<A extends Type<unknown>>(arg: A): ArgumentBuilder<[...T, ExtractTypeFromType<A>]> {
		if (
			this.arguments[this.arguments.size()] !== undefined &&
			this.arguments[this.arguments.size()].Optional === true
		)
			throw "Cannot have required argument after an optional argument!";
		this.arguments.push({
			Type: arg,
			Optional: false,
		});
		return this as never;
	}
	/**
	 * Append an optional argument.
	 * You **cannot** have any required arguments following an optional one.
	 * @param arg The argument, which must be an instance of {@link Type}
	 * @returns The ArgumentBuilder, with argument appended to the argument stack
	 */
	public appendOptionalArgument<A extends Type<unknown>>(
		arg: A,
	): Omit<ArgumentBuilder<[...T, ExtractTypeFromType<A> | undefined]>, "appendArgument"> {
		this.arguments.push({
			Type: arg,
			Optional: true,
		});
		return this as never;
	}
	/** @hidden */
	public getArguments() {
		return this.arguments.mapFiltered((v) => v.Type) as ReadonlyArray<Type<unknown>>;
	}
	/** @hidden */
	public getArgumentDef() {
		return this.arguments as ReadonlyArray<ArgBuilderArgument<Type<unknown>>>;
	}
	/**
	 * # DO NOT USE
	 * The type will be built automatically with the command builder!
	 * @hidden */
	public build() {
		this.definition = this.arguments.mapFiltered((v, i) => ({
			Name: `arg_${i}`,
			Type: v.Type.getName(),
			Optional: v.Optional,
		}));
		return this.definition as TypeDef[];
	}
	public static create() {
		return new ArgumentBuilder([]);
	}
}
