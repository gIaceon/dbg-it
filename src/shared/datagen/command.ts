import { RunService } from "@rbxts/services";
import { Command } from "../class/cmd";
import { BaseRegistry } from "../class/registry";
import { CommandGroups } from "../enum";
import { Builder } from "../impl/builder";
import { CommandCtx, CommandDef } from "../types";
import { ArgumentBuilder, ExtractTupleFromArgBuilder } from "./type";

export class CommandBuilder<G extends [...unknown[]] = []> extends Builder<Command<G>> {
	protected arguments?: ArgumentBuilder<G>;
	private exec?: (ctx: CommandCtx, ...args: G) => string | undefined | void;
	protected constructor(
		private definition: Partial<CommandDef>,
		private registry: BaseRegistry,
	) {
		super();
		this.definition.IsServer = RunService.IsServer();
	}

	public name(name: string) {
		this.definition.Name = name;
		return this;
	}

	public group(group: CommandGroups) {
		this.definition.Group = group;
		return this;
	}

	public desc(desc: string) {
		this.definition.Description = desc;
		return this;
	}

	/**
	 * Sets the arguments of this command using an {@link ArgumentBuilder}.
	 * @param args {@link ArgumentBuilder}
	 * @returns This command builder, with the arguments of `args`.
	 */
	public setArguments<
		S extends ArgumentBuilder<[...unknown[]]> | Omit<ArgumentBuilder<[...unknown[]]>, "appendArgument">,
	>(args: S): CommandBuilder<ExtractTupleFromArgBuilder<S>> {
		this.arguments = args as never;
		return this as never;
	}

	/**
	 * Sets the function which is executed when this command is run.
	 *
	 * ### Return data
	 * Execution functions can return data in the form of a string.
	 *
	 * Inline commands will replace themselves with the returned data from their execution function, eg:
	 * you have a command `mycommand` which returns some data,
	 * you then run the command `echo ${mycommand}`, which will replace `${mycommand}` with whatever `mycommand` returns.
	 * @param exec Function to run on execution.
	 * @returns This command builder.
	 */
	public executes(exec: (ctx: CommandCtx, ...args: G) => string | undefined | void) {
		this.exec = exec;
		return this;
	}

	/**
	 * Build the command object.
	 * @returns The built {@link Command}
	 */
	public build() {
		this.definition.Arguments = this.arguments === undefined ? [] : this.arguments.build();
		return Command.fromDef(this.definition as CommandDef, this.registry)
			.injectExecMethod(this.exec as never)
			.injectArguments(this.arguments) as never as Command<G>;
	}

	public static create(registry: BaseRegistry) {
		return new CommandBuilder(
			{
				Group: CommandGroups.Unimplemented,
			},
			registry,
		);
	}
}
