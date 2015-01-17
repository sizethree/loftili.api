module.exports.routes = {
  /* Session */
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',

  'GET /clients': 'ClientController.find',
  'POST /clients': 'ClientController.create',

  'POST /clientauth': 'ClientAuthController.authenticate',

  'POST /clienttokens': 'ClientTokenController.create',
  'GET /clienttokens': 'ClientTokenController.find',
  'DELETE /clienttokens/:id': 'ClientTokenController.destroy',

  /* User information*/
  'POST /users': 'UserController.create',
  'GET /users/search': 'UserController.search',
  'GET /users/:id/tracks': 'UserController.tracks',
  'PUT /users/:id/tracks': 'UserController.addTrack',
  'DELETE /users/:id/tracks/:track_id': 'UserController.dropTrack',
  'PUT /users/:id': 'UserController.update',
  'POST /passwordreset': 'UserController.passwordReset',
  
  /* Dns */
  'POST /dns': 'DnsController.create',
  'DELETE /dns': 'DnsController.destroy',

  /* Device & Device management */
  'GET /devices/:id/ping': 'DeviceController.ping',
  'GET /devices/:id': 'DeviceController.findOne',
  'PUT /devices/:id': 'DeviceController.update',
  'DELETE /devices/:id': 'DeviceController.destroy',

  'POST /registration': 'RegistrationController.register',

  'GET /queues/:id': 'QueueController.findOne',
  'PUT /queues/:id': 'QueueController.enqueue',
  'POST /queues/:id/move': 'QueueController.move',
  'DELETE /queues/:id/:position': 'QueueController.remove',
  'POST /queues/:id/pop': 'QueueController.pop',

  'POST /playback/restart': 'PlaybackController.restart',
  'POST /playback/start': 'PlaybackController.start',
  'POST /playback/stop': 'PlaybackController.stop',

  'PUT /devicestates/:id': 'DeviceStateController.update',
  'GET /devicestates/:id': 'DeviceStateController.findOne',

  /* Device visibility */
  'GET /devicepermissions': 'DevicepermissionController.find',
  'POST /devicepermissions': 'DevicepermissionController.create',
  'DELETE /devicepermissions/:id': 'DevicepermissionController.destroy',

  /* Tracks */
  'GET /tracks': 'TrackController.find',
  'GET /tracks/scout': 'TrackController.scout',
  'GET /tracks/search': 'TrackController.search',
  'POST /tracks/upload': 'TrackController.upload',
  'PUT /tracks/:id': 'TrackController.update',
  'DELETE /tracks/:id': 'TrackController.destroy',

  /* Tracks */
  'GET /artists/:id': 'ArtistController.findOne'
};
