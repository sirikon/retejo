import { injectable } from 'tsyringe';
import { Logger, Measurer, RetejoContext } from '../..';

@injectable()
export default class HomeController {
	constructor(
		private logger: Logger) { }

	public async handle(ctx: RetejoContext) {
		const name = ctx.params.name;
		this.logger.info('Working!', { name });
		ctx.body = `Hello ${name}.`;
	}
}
