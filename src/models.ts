import { DefaultContext, DefaultState, ParameterizedContext } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { DependencyContainer } from 'tsyringe';

// interface IRetejoContextExtensor extends DefaultContext {
// 	ioc: DependencyContainer;
// }

export interface IRetejoContext {
	params: any;
	ioc: DependencyContainer;
}

export type RetejoContext = ParameterizedContext<any, IRetejoContext>;

export class JobContext {
	constructor(
		public readonly id: string) { }
}
