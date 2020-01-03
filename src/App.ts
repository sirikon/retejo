import Koa, { BaseContext } from 'koa';
import KoaRouter from 'koa-router';
import { container, InjectionToken } from 'tsyringe';
import { v4 } from 'uuid';

import { IRetejoContext, JobContext, RetejoContext } from './models';

export class App {

	private koa: Koa<any, IRetejoContext>;

	constructor() {
		this.koa = new Koa<any, IRetejoContext>();

		this.koa.use(async (ctx, next) => {
			const jobCtx = new JobContext(v4());
			const requestContainer = container.createChildContainer();
			requestContainer.register(JobContext, { useValue: jobCtx });
			ctx.ioc = requestContainer;
			await next();
		});

	}

	// tslint:disable-next-line: max-line-length
	public route(cb: (r: KoaRouter<any, IRetejoContext>, c: <T>(type: InjectionToken<T>, callback: (c: T) => ((ctx: RetejoContext) => Promise<void>)) => (ctx: RetejoContext) => Promise<void>) => void) {
		const r = new KoaRouter<any, IRetejoContext>();
		cb(r, controllerResolver);
		this.koa.use(r.routes()).use(r.allowedMethods());
	}

	public listen(host: string, port: number) {
		this.koa.listen(port, host, () => {
			// tslint:disable-next-line: no-console
			console.log('Listening...');
		});
	}
}

// tslint:disable-next-line: max-line-length
function controllerResolver<T>(type: InjectionToken<T>, callback: (c: T) => ((ctx: RetejoContext) => Promise<void>)): (ctx: RetejoContext) => Promise<void> {
	return async (ctx) => {
		const controller = ctx.ioc.resolve(type);
		await callback(controller).call(controller, ctx);
	};
}
