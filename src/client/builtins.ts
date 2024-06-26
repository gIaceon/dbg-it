import { LogLevel } from "@rbxts/log";
import { ArgumentBuilder, CommandBuilder, CommandGroups, EnumType, NumberType, StringType } from "../shared";
import { BaseRegistry } from "../shared/class/registry";
import { Command } from "../shared/class/cmd";

export function getBuiltins(reg: BaseRegistry): Command<[...unknown[]]>[] {
	return [
		CommandBuilder.create(reg)
			.name("echo")
			.group(CommandGroups.Debug)
			.desc("Echo command")
			.setArguments(ArgumentBuilder.create().appendArgument(StringType.create()))
			.executes((ctx, _) => {
				return ctx.RawArguments.join(" ");
			})
			.build(),
		CommandBuilder.create(reg)
			.name("log")
			.group(CommandGroups.Debug)
			.desc("Logs to the logger")
			.setArguments(
				ArgumentBuilder.create()
					.appendArgument(EnumType.create(LogLevel, "logLevel"))
					.appendArgument(StringType.create()),
			)
			.executes((ctx, level, _) => {
				const log = reg.dbgit.Logger;
				const message = ctx.RawArguments.filter((_, i) => i !== 0).join(" ");
				switch (level) {
					case LogLevel.Verbose:
						log.Verbose(message);
						break;
					case LogLevel.Warning:
						log.Warn(message);
						break;
					case LogLevel.Fatal:
						log.Fatal(message);
						break;
					case LogLevel.Error:
						log.Error(message);
						break;
					case LogLevel.Information:
						log.Info(message);
						break;
					case LogLevel.Debugging:
						log.Debug(message);
						break;
					default:
						log.Fatal("No logging level {level}", level);
						break;
				}
				return message;
			})
			.build(),
	] as never;
}
