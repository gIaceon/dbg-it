import { ILogEventSink, LogEvent, LogLevel } from "@rbxts/log/out/Core";
import { MessageTemplateParser, PlainTextMessageTemplateRenderer } from "@rbxts/message-templates";

interface DbgItLogOptions {
	logMiddleware: (severity: LogLevel, time: string | undefined, message: string) => void;
}

export class DbgItLoggingSink implements ILogEventSink {
	constructor(private readonly options: DbgItLogOptions = { logMiddleware: () => {} }) {}
	Emit(message: LogEvent): void {
		const template = new PlainTextMessageTemplateRenderer(MessageTemplateParser.GetTokens(message.Template));
		const time = DateTime.fromIsoDate(message.Timestamp)?.FormatLocalTime("HH:mm:ss", "en-us");
		let tag: string | undefined = undefined;
		switch (message.Level) {
			case LogLevel.Verbose:
				tag = "VERBOSE";
				break;
			case LogLevel.Debugging:
				tag = "DEBUG";
				break;
			case LogLevel.Error:
				tag = "ERROR";
				break;
			case LogLevel.Fatal:
				tag = "FATAL";
				break;
			case LogLevel.Information:
				tag = "INFO";
				break;
			case LogLevel.Warning:
				tag = "WARNING";
				break;
			default:
				tag = "UNKNOWN";
				break;
		}
		const renderedMessage = template.Render(message);
		const formattedMessage = `[${tag!}]: ${renderedMessage}`;
		this.options.logMiddleware(message.Level, time, formattedMessage);
		warn(formattedMessage);
	}
}
