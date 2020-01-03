import { injectable } from 'tsyringe';
import { JobContext, RetejoContext } from '../..';

@injectable()
export default class HomeController {

	constructor(private job: JobContext) { }

	public async handle(ctx: RetejoContext) {
		ctx.body = `Hello ${ctx.params.name}. ${this.job.id}`;
	}

}
