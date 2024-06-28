import { CommandRegistry } from "../dbg-it/command-registry";
import { BooleanKind } from "./kind";

export function addBuiltInCommands(registry: CommandRegistry) {
	registry.register("test", (cmd) =>
		cmd.appendArgument(new BooleanKind(), (cmd) => cmd.implement((ctx, a0, a1) => (a1 ? a0.upper() : a0.lower()))),
	);
}
