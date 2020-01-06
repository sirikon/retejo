import koaBasicAuth from 'koa-basic-auth';
import { Handler } from '../models';

interface IBasicAuthOptions {
	username: string;
	password: string;
}

export function basicAuth(options: IBasicAuthOptions): Handler {
	return async (ctx, next) => {
		try {
			koaBasicAuth({
				name: options.username,
				pass: options.password,
			})(ctx, async () => await next!());
		} catch (err) {
			if (401 === err.status) {
				ctx.status = 401;
				ctx.set('WWW-Authenticate', 'Basic');
			} else {
				throw err;
			}
		}
	};
}
