var bcrypt = require('bcrypt');

module.exports = {
	
  register: function(req, res, next) {
    var devicename = req.body.devicename,
        username = req.body.username,
        password = req.body.password,
        remote_ip = req.connection.remoteAddress,
        port = req.body.port,
        found_user = null,
        created_device;

    function createdPermission(err, permission) {
      sails.log('[RegistrationController.register] finished creating permission for new device');
      return res.status(200).json(created_device);
    }

    function createdDevice(err, device) {
      var params = {device: device.id, user: found_user.id, level: 1};

      created_device = device;
      sails.log('[RegistrationController.register] creating permission for new device');
      DnsManagerSerice.createRecord(found_user, device, function(){})
      Devicepermission.create(params).exec(createdPermission);
    }

    function finish() {
      var hostname = [devicename, username].join('.'),
          params = {name: devicename, ip_addr: remote_ip, hostname: hostname};

      sails.log('[RegistrationController.register] user authenticated, creating: ' + devicename + '[' + remote_ip + ']');
      Device.create(params).exec(createdDevice);
    }

    function authCheck(err, hash) {
      return (err || !hash) ? res.status(401).send() : finish();
    }

    function foundUser(err, user) {
      if(err || !user) {
        sails.log('[RegistrationController.register] errored looking up user: ' + username);
        return res.status(404).send('');
      }

      found_user = user;
      sails.log('[RegistrationController.register] found user, registering a new device: ' + devicename);
      bcrypt.compare(password, user.password, authCheck);
    }

    if(devicename && username && password && port) {
      sails.log('[RegistrationController.register] looking up user: ' + username);
      User.findOne({username: username}).exec(foundUser);
    } else {
      return res.status(400).send('');
    }
  }

};
