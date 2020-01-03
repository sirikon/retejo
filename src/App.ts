import Koa from 'koa';
import KoaRouter from 'koa-router';
import { container, InjectionToken } from 'tsyringe';
import { v4 } from 'uuid';

import { Logger } from './Logger';
import { IRetejoContext, JobContext, RetejoContext } from './models';

export class App {

	private koa: Koa<any, IRetejoContext>;

	constructor() {
		this.koa = new Koa<any, IRetejoContext>();
		this.useInit();
		this.useErrorHandling();
	}

	// tslint:disable-next-line: max-line-length
	public route(cb: (r: KoaRouter<any, IRetejoContext>, c: <T>(type: InjectionToken<T>, callback: (c: T) => ((ctx: RetejoContext) => Promise<void>)) => (ctx: RetejoContext) => Promise<void>) => void) {
		const r = new KoaRouter<any, IRetejoContext>();
		cb(r, controllerResolver);
		this.koa.use(r.routes()).use(r.allowedMethods());
	}

	public listen(host: string, port: number) {
		const logger = getLogger();
		this.koa.listen(port, host, () => {
			logger.info('App started', { host, port });
		});
	}

	private useInit() {
		this.koa.use(async (ctx, next) => {
			const jobCtx = new JobContext(v4());
			const requestContainer = container.createChildContainer();
			requestContainer.register(JobContext, { useValue: jobCtx });
			ctx.ioc = requestContainer;
			await next();
		});
	}

	private useErrorHandling() {
		this.koa.use(async (ctx, next) => {
			try {
				await next();
			} catch (err) {
				ctx.status = 500;
				ctx.body = err.stack || err;
			}
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

function getLogger(): Logger {
	const childContainer = container.createChildContainer();
	childContainer.register(JobContext, { useValue: new JobContext('app-start') });
	return childContainer.resolve(Logger);
}
