import Koa from 'koa';
import KoaRouter from 'koa-router';
import { container } from 'tsyringe';
import { v4 } from 'uuid';

import { Logger } from './Logger';
import { IRetejoContext, JobContext } from './models';
import { Router } from './Router';

type RoutingCallback = (route: Router) => void;

export class App {

	public static create(): App {
		return new App(new Koa<any, IRetejoContext>());
	}

	constructor(
		private readonly koa: Koa<any, IRetejoContext>) {
		this.useInit();
		this.useErrorHandling();
	}

	public route(cb: RoutingCallback) {
		const koaRouter = new KoaRouter<any, IRetejoContext>();
		const router = new Router(koaRouter);
		cb(router);
		this.koa
			.use(koaRouter.routes())
			.use(koaRouter.allowedMethods());
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

function getLogger(): Logger {
	const childContainer = container.createChildContainer();
	childContainer.register(JobContext, { useValue: new JobContext('app-start') });
	return childContainer.resolve(Logger);
}
