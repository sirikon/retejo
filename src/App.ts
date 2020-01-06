import Koa from 'koa';
import KoaRouter from 'koa-router';
import { container, InjectionToken } from 'tsyringe';
import { v4 } from 'uuid';

import { Logger } from './Logger';
import { IRetejoContext, JobContext, RetejoContext } from './models';

type CRouter = KoaRouter<any, IRetejoContext>;
type CMiddleware = KoaRouter.IMiddleware<any, IRetejoContext>;

type RootRoutingCallback = (route: CRouter, nest: NestRouting, controller: ControllerHandlerResolver) => void;
type NestRouting = (prefix: string, route: CRouter, cb: NestRoutingCallback) => void;
type NestRoutingCallback = (router: CRouter) => void;

type Handler = (ctx: RetejoContext) => Promise<void>;
type HandlerResolver<T> = (controller: T) => Handler;
type ControllerHandlerResolver = <T>(type: InjectionToken<T>, handlerResolver: HandlerResolver<T>) => Handler;

export class App {

	private koa: Koa<any, IRetejoContext>;

	constructor() {
		this.koa = new Koa<any, IRetejoContext>();
		this.useInit();
		this.useErrorHandling();
	}

	// tslint:disable-next-line: max-line-length
	public route(cb: RootRoutingCallback) {
		const router = createRouter();
		cb(router, nestRouting, controllerResolver);
		this.koa
			.use(router.routes())
			.use(router.allowedMethods());
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

function createRouter(): CRouter {
	return new KoaRouter<any, IRetejoContext>();
}

function nestRouting(prefix: string, parentRouter: CRouter, cb: NestRoutingCallback) {
	const router = createRouter();
	cb(router);
	parentRouter
		.use(prefix, router.routes(), router.allowedMethods());
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
