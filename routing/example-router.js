const RouterBuilder = require('./RouterBuilder');

const controller = { /* the controller with the functionality */ };
// controllor method args: req.auth, ...req.params, req.body?, req.query, req
// req.body only for non-get routes

const {RestaurantModel, TableStateModel} = require('../interfaceJS/v2');

module.exports = new RouterBuilder()
  .router('/restaurants', $=>$
    .get('/', controller.search)
    .post('/', controller.create, RestaurantModel.full())
    .router('/:restaurantId', $=>$
      .get('/', controller.get)
      .patch('/', controller.update, RestaurantModel.partial())
      .delete('/', controller.remove)
      .router('/tables', $=>$
        .get('/', controller.listTablesOf)
        .router('/:tableNr', $=>$
          .patch('/', controller.updateTableOf, TableStateModel.partial())
          .get('/token', controller.createTableToken)
        )
      )
    )
  )
  .router('/owners/@me/restaurants', $=>$
    .get('/', controller.listOf)
  )
  .build();
