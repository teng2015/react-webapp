import express                   from 'express';
import React                     from 'react';
import { renderToString }        from 'react-dom/server'
import { RoutingContext, match } from 'react-router';
import createLocation            from 'history/lib/createLocation';
import getRoutes                    from 'routes';
import { Provider }              from 'react-redux';
import fetchComponentData        from 'helpers/fetchComponentData';
import path                      from 'path';
import webpackDevServerMiddleware                from './webpack/dev-server-middleware';
import createStore from 'store/createStore';

const app = express();

if (process.env.NODE_ENV !== 'production') {
  webpackDevServerMiddleware(app);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.use( (req, res) => {
  const location = createLocation(req.url);
  const store    = createStore();
  const routes = getRoutes(store);

  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if (redirectLocation) return res.redirect(redirectLocation.pathname + redirectLocation.search);
    if (err) return res.status(500).end('Internal server error');
    if(!renderProps) return res.status(404).end('Not found');

    function renderView() {
      const InitialView = (
        <Provider store={store}>
          <RoutingContext {...renderProps} />
        </Provider>
      );

      const componentHTML = renderToString(InitialView);

      const initialState = store.getState();

      const HTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>My Buzznog</title> 
          <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
          </script>

        </head>
        <body class="container with-top-navbar">
          <div id="react-view">${componentHTML}</div>
          <script type="application/javascript" src="/bundle.js"></script>
        </body>
      </html>
      `;

      return HTML;
    }

    fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
      .then(renderView)
      .then(html => res.end(html))
      .catch(err => res.end(err.message));
  });
});

export default app;
