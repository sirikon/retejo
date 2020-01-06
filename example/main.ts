import { App, run } from '..';

import HomeController from './controllers/HomeController';

const app = new App();

app.route((router, nest, controller) => {

	nest('/admin', router, (r) => {
		r.get('/:name', controller(HomeController, (h) => h.handle));
	});

	router.get('/:name', controller(HomeController, (h) => h.handle));

});

run(app, '0.0.0.0', 3000);
