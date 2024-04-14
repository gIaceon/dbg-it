import { NumberType } from "./builtinTypes";
import { Command } from "./class/cmd";
import { BaseRegistry } from "./class/registry";
import { ArgumentBuilder, CommandBuilder } from "./datagen";
import { CommandGroups } from "./enum";

export function getBuiltins(reg: BaseRegistry): Command<[...unknown[]]>[] {
	return [
		CommandBuilder.create(reg)
			.name("cmds")
			.group(CommandGroups.Misc)
			.desc("Lists all commands and their arguments.\nSeperated into pages, with 10 commands per page.")
			.setArguments(ArgumentBuilder.create().appendOptionalArgument(NumberType.create()))
			.executes((ctx, idx = 1) => reg.helpPage(idx))
			.build(),
		CommandBuilder.create(reg)
			.name("whoami")
			.group(CommandGroups.Misc)
			.desc("Returns the executor of the command.")
			.executes((ctx) => ctx.Executor.Name)
			.build(),
	] as never;
}
