import { container, InjectionToken } from 'tsyringe';
import { App } from './App';

export function run(app: App, host: string, port: number) {
  app.listen(host, port);
}

export function resolve<T>(type: InjectionToken<T>): T {
  return container.resolve(type);
}
