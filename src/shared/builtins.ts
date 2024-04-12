import { NumbersType } from "./builtinTypes";
import { BaseRegistry } from "./class/registry";
import { ArgumentBuilder, CommandBuilder } from "./datagen";
import { CommandGroups } from "./enum";

export function registerBuiltins(reg: BaseRegistry) {
	CommandBuilder.create(reg)
		.name("whoami")
		.group(CommandGroups.Misc)
		.desc("Returns the executor of the command.")
		.executes((ctx) => ctx.Executor.Name)
		.build()
		.register();
	CommandBuilder.create(reg)
		.name("sum")
		.group(CommandGroups.Misc)
		.desc("Returns the sum of the values passed seperated with commas.")
		.setArguments(ArgumentBuilder.create().addArgument(NumbersType.create()))
		.executes((ctx, numbers) => {
			return string.format(
				"%.2f",
				numbers.reduce((crnt, total) => crnt + total),
			);
		})
		.build()
		.register();
}
