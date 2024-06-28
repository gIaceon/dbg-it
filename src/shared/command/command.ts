import linked_list from "@rbxts/berry-linked-list";
import { LiteralKind } from "../built-ins/kind";
import { CommandSerializable } from "../data";
import { Kind } from "../kind";
import { CommandContext } from "./context";

export type CommandExecution<A extends defined, T extends [...defined[]] = [A]> =
	| ((ctx: CommandContext<Command<A, T>>, ...args: T) => string | undefined | void)
	| undefined;

export type AnyCommand = ReadOnlyCommand<defined, [...defined[]]>;

interface Node {
	cmd: AnyCommand;
	parent: AnyCommand;
}

export class ReadOnlyCommand<A extends defined, T extends [...defined[]] = [A]> {
	protected _executor: CommandExecution<A, T> | undefined;
	/** @hidden */ public readonly children: linked_list<Node> = new linked_list();

	/** @hidden */ public constructor(
		/** @hidden */ public readonly name: string,
		/** @hidden */ public readonly argument: Kind<A>,
	) {}

	/** @hidden */ public getImplementation() {
		return this._executor;
	}

	/** @hidden */ public getExpectedArguments() {
		return (
			this.children
				.array()
				.reduce(
					(accum, current, idx) =>
						accum + current.cmd.argument.label + (idx - 1 >= this.children.array().size() ? "" : ", "),
					"(",
				) + ")"
		);
	}

	/**
	 * TODO implement
	 * @hidden
	 * */
	public serialize(): CommandSerializable {
		return {} as never;
	}
}

export class Command<A extends defined, T extends [...defined[]] = [A]> extends ReadOnlyCommand<A, T> {
	public constructor(name: string, argument: Kind<A>) {
		super(name, argument);
	}

	/**
	 * Add an argument subcommand to this command.
	 *
	 * @param kind The argument that the subcommand takes
	 * @param builder The command implementation
	 * @returns This command
	 */
	appendArgument<A2 extends defined>(
		kind: Kind<A2>,
		builder: (cmd: Command<A2, [...T, A2]>) => ReadOnlyCommand<A2, [...T, A2]>,
	): Command<A, T> {
		const subCommand = builder(new Command(`${this.name}/${kind.label}`, kind));
		this.children.add({
			cmd: subCommand as AnyCommand,
			parent: this as AnyCommand,
		});
		return this;
	}

	/**
	 * Add a literal argument to this command.
	 * This is equivalent to using {@link appendArgument} with a {@link LiteralKind} argument.
	 *
	 * Ensure you register literal arguments after string arguments, as the string argument will conflict with literal arguments.
	 *
	 * @param name Name of the subcommand
	 * @param builder The command implementation
	 * @returns This command
	 */
	appendLiteral<A2 extends string>(
		name: A2,
		builder: (cmd: Command<A2, [...T, A2]>) => ReadOnlyCommand<A2, [...T, A2]>,
	): Command<A, T> {
		this.appendArgument(new LiteralKind(name), builder);
		return this;
	}

	/**
	 * Implements this command's execution function, which is run when the command is executed.
	 *
	 * @param exec The function ran on execution, which contains the arguments of all parent commands
	 * @returns This command
	 */
	public implement(exec: CommandExecution<A, T>) {
		this._executor = exec;
		return this;
	}

	public deimplement() {
		delete this._executor;
		return this;
	}
	// TODO implement
	public static deserialize(serialized: CommandSerializable) {
		// return new Command();
	}
}
