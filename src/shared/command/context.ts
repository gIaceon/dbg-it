import { Command } from "./command";
import { CommandExecutor } from "./executor";

export class CommandContext<A extends defined, T extends [...defined[]] = defined[]> {
	public constructor(
		public readonly command: Command<A, T>,
		public readonly name: string,
		public readonly commandString: string,
		public readonly executor: CommandExecutor,
	) {}
}
