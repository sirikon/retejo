import { injectable } from 'tsyringe';

import { Logger } from './Logger';

@injectable()
export class Measurer {
	constructor(
		private logger: Logger) { }

	public async measure<T>(name: string, cb: () => Promise<T>): Promise<T> {
		const hrstart = process.hrtime();
		const result = await cb();
		const hrend = process.hrtime(hrstart);
		const seconds = hrend[0];
		const millis = hrend[1] / 1000000;
		this.logger.info(`Block '${name}' took ${seconds}s ${millis}ms`, { seconds, millis });
		return result;
	}
}
