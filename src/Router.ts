import KoaRouter from 'koa-router';
import { InjectionToken } from 'tsyringe';

import { CRouter, Handler, HandlerResolver, IRetejoContext } from './models';

type RoutingCallback = (router: Router) => void;

export class Router {

	public static create(): Router {
		return new Router(new KoaRouter<any, IRetejoContext>());
	}

	constructor(
		private readonly koaRouter: CRouter) { }

	public get<CtrlT>(path: string, type: InjectionToken<CtrlT>, resolver: HandlerResolver<CtrlT>) {
		this.koaRouter.get(path, async (ctx) => {
			const controller = ctx.ioc.resolve(type);
			await resolver(controller).call(controller, ctx);
		});
	}

	public handleGet(path: string, handler: Handler) {
		this.koaRouter.get(path, handler);
	}

	public use(handler: Handler) {
		this.koaRouter.use(handler);
	}

	public route(path: string, cb: RoutingCallback) {
		const subRouter = Router.create();
		cb(subRouter);
		this.koaRouter.use(path, subRouter.koaRouter.routes(), subRouter.koaRouter.allowedMethods());
	}

}
