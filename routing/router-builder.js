const {Router} = require('express');

module.exports = class RouterBuilder {

  constructor() {
    // eslint-disable-next-line new-cap
    this._router = Router({mergeParams: true});
  }

  build() {
    return this._router;
  }

  use(path, handler) {
    if (arguments.length === 1) {
      handler = path;
      path = '/';
    }

    this._router.use(path, handler);
    return this;
  }

  /**
   * @param {string} path default: `'/'`
   * @param {(ctx: RouterBuilder) => RouterBuilder} routerBuilderHandler
   */
  router(path, routerBuilderHandler) {
    if (arguments.length === 1) {
      middleware = path;
      path = '/';
    }

    this._router.use(path, routerBuilderHandler(new RouterBuilder()).build());
    return this;
  }

  get(path, handler, queryModel = undefined, statusCode = 200) {
    queryModel
      ? this._router.get(path, validateRequestField('query', queryModel), handlerWrapper(statusCode, handler))
      : this._router.get(path, handlerWrapper(statusCode, handler));

    return this;
  }

  post(path, handler, bodyModel = undefined, statusCode = 201) {
    bodyModel
      ? this._router.post(path, validateRequestField('body', bodyModel), handlerWrapper(statusCode, handler))
      : this._router.post(path, handlerWrapper(statusCode, handler));

    return this;
  }

  patch(path, handler, bodyModel = undefined, statusCode = 200) {
    bodyModel
      ? this._router.patch(path, validateRequestField('body', bodyModel), handlerWrapper(statusCode, handler))
      : this._router.patch(path, handlerWrapper(statusCode, handler));

    return this;
  }

  put(path, handler, bodyModel = undefined, statusCode = 200) {
    bodyModel
      ? this._router.put(path, validateRequestField('body', bodyModel), handlerWrapper(statusCode, handler))
      : this._router.put(path, handlerWrapper(statusCode, handler));

    return this;
  }

  delete(path, handler, bodyModel = undefined, statusCode = 204) {
    bodyModel
      ? this._router.delete(path, validateRequestField('body', bodyModel), handlerWrapper(statusCode, handler))
      : this._router.delete(path, handlerWrapper(statusCode, handler));

    return this;
  }

};


function handlerWrapper(statusCode, handler) {
  return async (req, res, errorHandler) => {
    try {
      // args: auth, ...params, body?, query, req
      // body only for non-get routes
      const args = [req.auth, ...Object.values(req.params)];
      if (req.method !== 'GET') args.push(req.body);
      args.push((Object.keys(req.query).length > 0) ? req.query : undefined);
      args.push(req);

      const result = await handler(...args);
      res.status(statusCode).json(result ?? '');
    }
    catch (err) {
      errorHandler(err);
    }
  };
}

function validateRequestField(field, model) {
  return (req, res, next) => {
    model.validate(req[field]);
    next();
  };
}
