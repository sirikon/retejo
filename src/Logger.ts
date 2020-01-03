import c from 'ansi-colors';
import { MESSAGE } from 'triple-beam';
import { injectable } from 'tsyringe';
import winston from 'winston';
import { JobContext } from './models';

@injectable()
export class Logger {

	private readonly winstonLogger: winston.Logger;

	constructor(jobCtx: JobContext) {
		this.winstonLogger = createLogger(jobCtx);
	}

	public info(message: string, meta?: any) {
		this.winstonLogger.info(message, meta);
	}

	public warn(message: string, meta?: any) {
		this.winstonLogger.warn(message, meta);
	}

	public error(message: string, meta?: any) {
		this.winstonLogger.error(message, meta);
	}

}

function createLogger(jobCtx: JobContext): winston.Logger {
	return winston.createLogger({
		level: 'info',
		defaultMeta: { jobId: jobCtx.id },
		transports: [
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.timestamp(),
					customFormat()),
			}),
		],
	});
}

const customFormat = winston.format((info) => {
	const metadata = Object.assign({}, info, {
		level: undefined,
		message: undefined,
		splat: undefined,
	});

	let message = info.message;
	const level = info.level;

	switch (level) {
		case 'warn': message = c.redBright(message); break;
		case 'error': message = c.bold.red(message); break;
	}

	info[MESSAGE] = `${message} ${c.grey(stringifyMetadata(metadata))}`;
	return info;
});

function stringifyMetadata(metadata: any) {
	const parts = Object.keys(metadata)
		.map((k) => {
			return { k, v: metadata[k] };
		})
		.filter(({ k, v }) => !!v)
		.map(({ k, v }) => {
			return `${k}=${v.toString()}`;
		})
		.join(' ');
	return `[${parts}]`;
}
