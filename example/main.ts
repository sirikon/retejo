import { App, run } from '..';

import HomeController from './controllers/HomeController';

const app = new App();

app.route((router, nest, controller) => {

	nest('/admin', router, (r) => {
		r.get('/:name', controller(HomeController, (c) => c.handle));
	});

	router.get('/:name', controller(HomeController, (c) => c.handle));

});

run(app, '0.0.0.0', 3000);
