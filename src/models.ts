import { DefaultContext, DefaultState, ParameterizedContext } from 'koa';
import KoaRouter, { IRouterParamContext } from 'koa-router';
import { DependencyContainer } from 'tsyringe';

export type CRouter = KoaRouter<any, IRetejoContext>;

export type Next = () => Promise<void>;
export type Handler = (ctx: RetejoContext, next?: Next) => Promise<void>;
export type HandlerResolver<CtrlT> = (controller: CtrlT) => Handler;

export interface IRetejoContext {
	params: any;
	ioc: DependencyContainer;
}

export type RetejoContext = ParameterizedContext<any, IRetejoContext>;

export class JobContext {
	constructor(
		public readonly id: string) { }
}
