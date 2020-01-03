import { App, run } from '..';

import HomeController from './controllers/HomeController';

const app = new App();

app.route((r, c) => {
  r.get('/:name', c(HomeController, (h) => h.handle));
});

run(app, '0.0.0.0', 3000);
