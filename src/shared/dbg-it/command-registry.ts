import { HttpService, RunService } from "@rbxts/services";
import { LiteralKind } from "../built-ins/kind";
import { AnyCommand, Command } from "../command/command";
import { CommandContext } from "../command/context";
import { CommandExecutor } from "../command/executor";
import { CommandSyntaxError, ExecutionError, RegistryWarnings } from "../messages";
import { TokenStream } from "../token";

export class CommandRegistry {
	protected readonly commands: Map<string, AnyCommand> = new Map();
	protected constructor(
		public readonly guid: string,
		public readonly doesWarn: boolean = RunService.IsStudio(),
	) {}

	public register<N extends string, C extends Command<N, [N]> = Command<N, [N]>>(name: N, builder: (cmd: C) => C) {
		if (this.commands.has(name) && this.doesWarn) warn(RegistryWarnings.OVERWRITTEN.format(name));
		this.commands.set(name, builder(new Command(name, new LiteralKind(name)) as C) as AnyCommand);
		return this;
	}

	public execute(commandString: string, executor: Player | undefined) {
		const tokenized = TokenStream.create(commandString);
		const command = tokenized.getPosition(0) ?? "";
		if (!this.commands.has(command)) error(ExecutionError.NOCMD.format(command), 0);

		const rootCommand = this.commands.get(command)!;
		const argumentsToCommand: defined[] = [command];
		let currentCommand: AnyCommand = rootCommand;

		const processNextCommand = (): string | undefined => {
			let foundCommand: AnyCommand | undefined = undefined;
			let foundArgument: unknown = undefined;
			let didWarnArgPriority = false;
			// Check if there are any commands left to process

			// Command string too long!
			if (!currentCommand.children.head) return CommandSyntaxError.TOOLONG;

			for (const subCommand of currentCommand.children.array()) {
				const argument = subCommand.cmd.argument.transform(tokenized.get());
				const isValid = subCommand.cmd.argument.verify(argument);
				if (isValid && argument) {
					// Warn the user about argument priority.
					// This may be intended behavior from the end user, so I do not want to throw an error here.
					// This is a bad practice however, so we should warn the user to not do this.
					if (
						(foundCommand !== undefined || foundArgument !== undefined) &&
						this.doesWarn &&
						!didWarnArgPriority
					) {
						warn(RegistryWarnings.ARGPRIORITY.format(commandString, tokenized.get()));
						didWarnArgPriority = true;
					}
					foundCommand = subCommand.cmd;
					foundArgument = argument;
				}
			}

			// Invalid argument!
			if (foundCommand === undefined || foundArgument === undefined)
				return CommandSyntaxError.BADARG.format(tokenized.get(), currentCommand.getExpectedArguments());

			currentCommand = foundCommand;
			argumentsToCommand.push(foundArgument!);

			return undefined;
		};

		// eslint-disable-next-line no-constant-condition
		while (tokenized.inRange()) {
			tokenized.next();
			if (!tokenized.inRange()) break;
			const syntaxError = processNextCommand();
			if (syntaxError === undefined) continue;
			error(syntaxError, 0);
		}

		if (currentCommand.getImplementation() === undefined) error(ExecutionError.UNIMPL.format(commandString), 0);

		const ctx = new CommandContext(
			currentCommand as never,
			currentCommand.name,
			commandString,
			new CommandExecutor(executor),
		);

		const [done, result] = pcall(() => currentCommand.getImplementation()?.(ctx, ...argumentsToCommand));

		if (!done) error(`Command execution error: ${result}`, 0);
		result !== undefined && print(result); // TOOD: FIX
		return result;
	}

	public static create() {
		return new CommandRegistry(HttpService.GenerateGUID());
	}
}
