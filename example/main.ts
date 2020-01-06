import { App, basicAuth, run } from '..';

import HomeController from './controllers/HomeController';

const app = App.create();

app.route((router) => {
	router.route('/admin', (ar) => {
		ar.use(basicAuth({ username: 'sirikon', password: 'admin' }));
		ar.get('/:name', HomeController, (c) => c.handle);
	});
	router.get('/:name', HomeController, (c) => c.handle);
});

run(app, '0.0.0.0', 3000);
