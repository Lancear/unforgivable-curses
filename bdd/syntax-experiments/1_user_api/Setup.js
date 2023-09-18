const WebServer = {};
const Get_User = require('./actions/Get_User');

// async / event / promise
when (WebServer.request 'GET /api/users/:id') <req, res> {
  return res.from( Get_User(req.id) );
}
