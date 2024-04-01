import { CommandGroups, HookInjectPoints } from "./enum";

export interface CommandDef {
	Name: string;
	Group: CommandGroups;
	Description?: string;
	Arguments: TypeDef[];
}
export interface TypeDef {
	Name: string;
	Type: string;
	Optional?: boolean;
	// Default?: string;
}
export interface CommandCtx {
	RawCommandString: string;
	CommandName: string;
	RawArguments: string[];
	Executor: Player;
	Group: CommandGroups;
	CommandDefinition: CommandDef;
}
export interface HookDef {
	InjectionPoint: HookInjectPoints;
	HookName: string;
}
