var Logger = require('./Logger');

module.exports = (function() {

  var DeviceSockets = { users: {} },
      connected = [],
      users = [],
      uuid = (function() {
        var i = 0;
        return (function() { return ['_', ++i, '_'].join(''); });
      })(),
      log = Logger('::DeviceSockets');

  function clean() {
    var i = 0,
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i] && !connected[i].socket.writable) connected[i].cleanup();
    }
  }

  DeviceSockets.users.add = function(user, device, socket) {
    var new_id = uuid();

    users.push({
      user: user,
      device: device,
      socket: socket,
      id: new_id
    });
  };

  DeviceSockets.users.remove = function(user_id, callback) {
    log('removing user socket');
    var i = 0, l = users.length, f = -1;

    for(i; i < l; i++) {
      var us = users[i];
      if(us.user === user_id) f = i;
    }

    if(f < 0) return callback();

    users.splice(f, 1);
    callback();
    log('successfully removed socket for user: ' + user_id);
  };

  DeviceSockets.users.broadcast = function(device_id, message) {
    var i = 0, l = users.length;

    function send(user) {
      log("broadcasting message["+message+"] to user["+user.user+"]");
      user.socket.emit('update', message);
    }

    for(i; i < l; i++) {
      if(users[i].device === device_id) send(users[i]);
    }
  };

  DeviceSockets.add = function(socket, device_id) {
    var id = uuid(),
        noop = function() { };

    clean();

    function remove() {
      var i = 0,
          n = -1;

      for(i; i < connected.length; i++) {
        var s = connected[i];
        if(s.id === id) { n = i; break; }
      }

      if(n < 0) return;

      log("removing socket at ["+n+"]");
      connected.splice(n, 1);
      DeviceSockets.users.broadcast(device_id, "DEVICE_DISCONNECTED");
      DeviceStateService.update(device_id, {connected: false}, noop);
    }

    log("adding socket ["+id+"] for device["+device_id+"] and setting state");

    connected.push({
      device: device_id, 
      socket: socket, 
      id: id,
      cleanup: remove
    });

    DeviceStateService.update(device_id, {connected: true}, noop);
    DeviceSockets.users.broadcast(device_id, "DEVICE_CONNECTED");
    socket.on('close', remove);
  };

  DeviceSockets.send = function(message, device_id, callback) {
    var i = 0, c = connected.length,
        d = false,
        device_ids = [];

    for(i; i < c; i++) device_ids.push(connected[i].device);

    i = 0;
    log('searching for device['+device_id+'] in connected['+device_ids+']');

    for(i; i < c; i++) {
      if(connected[i].device === device_id) { d = connected[i]; break; }
    }

    if(!d) {
      log('device socket not found - failed writing');
      return callback('missing device', false);
    }

    log('writing ['+message+'] to device...');
    d.socket.write(message);
    log('finished.');
    return callback(null, 'ok');
  };

  DeviceSockets.isConnected = function(device_id) {
    var i = 0, 
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i].device == device_id) return true;
    }

    return false;
  };

  return DeviceSockets;

})();
