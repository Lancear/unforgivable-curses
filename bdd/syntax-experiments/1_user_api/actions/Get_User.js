const { Users, UserId } = require('../State');

scenario User_Exists(id) {
  given:
    (UserId.isValid(id) && Users.exists(id));

  then:
    return Users.find(id);
}

scenario User_Not_Found(id) {
  given:
    (UserId.isValid(id) && !Users.exists(id));
  
  then:
    fail 404;
}

scenario Invalid_UserId(id) {
  given:
    (!UserId.isValid(id));
  
  then:
    fail 400, 'Invalid id';
}


function Get_User(id) {

  // User exists
  if (UserId.isValid(id) && Users.exists(id)) {
    return Users.find(id);
  }

  // User does not exist
  if (UserId.isValid(id) && !Users.exists(id)) {
    fail 404;
  }

  // UserId is invalid
  if (!UserId.isValid(id)) {
    fail 400, 'Invalid id'
  }

}