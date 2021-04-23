const Users = {
  'Hans#1435': {
    id: 'Hans#1435',
    username: 'Hans',
    password: 'Gans',
    state: 'Online'
  },
  exists: (id) => Users[id] != undefined,
  find: (id) => Users[id]
};

const UserId = {
  isValid: (id) => id.includes('#')
};



module.exports = {
  Users,
  UserId
};