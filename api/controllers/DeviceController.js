var net = require('net');

module.exports = (function() {

  var DeviceController = {};

  DeviceController.find = function(req, res) { 
    var current_user = parseInt(req.session.userid, 10);
    
    if(!(current_user > 0)) return res.forbidden();

    function error(err) {
      sails.log(err);
      res.badRequest('');
    }

    function found(err, devices) {
      if(err) return error(err);
      var valid = [], i = 0, l = devices.length;

      for(i; i < l; i++) {
        var has_permission = devices[i].permissions.length > 0;
        if(has_permission) valid.push(devices[i]);
      }

      return res.json(valid);
    }

    sails.log('[DeviceController] looking for devies for user: ' + current_user);
    Device.find({}).populate('permissions').exec(found);
  };

  DeviceController.create = function(req, res, next) {
    var body = req.body,
        serial = body ? body.serial_number : false,
        name =  body ? body.name : false,
        user_id = parseInt(req.session.userid, 10),
        created_device;

    if(!(user_id > 0)) 
      return res.forbidden();

    if(!serial || !name) 
      return res.badRequest('missing device name or serial');

    function finish(err) {
      if(err) return res.badRequest(err);

      return res.json(created_device);
    }

    function created(err, device) {
      if(err) return res.badRequest(err);

      created_device = device;

      DeviceShareService.share({
        device: device.id,
        target: user_id,
        level: DeviceShareService.LEVELS.DEVICE_OWNER,
        force: true
      }, finish);
    }

    Device.create({
      serial_number: serial,
      name: name,
      registered_name: name,
      token: DeviceTokenService.generate(name)
    }, created);
  };

  DeviceController.update = function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10),
        device_id = parseInt(req.params.id, 10);

    function finish(err, device) {
      if(err) {
        sails.log('[DeviceController][update] failed saving after update err['+err+']');
        return res.status(422).json(err);
      }

      return res.status(200).json(device[0]);
    }

    function foundDevice(err, device) {
      if(err) {
        sails.log('[DeviceController][update] failed getting device for updating');
        return res.status(404).send('');
      }

      if(!device) {
        sails.log('[DeviceController][update] unable to find device for update');
        return res.status(404).send('');
      }

      sails.log('[DeviceController][update] found device, checking permissions');

      var allowed = false,
          LEVELS = DeviceShareService.LEVELS;

      for(var i = 0; i < device.permissions.length; i++) {
        var current = device.permissions[i],
            is_current = current.user === user_id,
            is_owner = current.level == LEVELS.DEVICE_OWNER;

        if(is_current && is_owner)
          allowed = true;
      }

      if(!allowed) {
        sails.log('[DeviceController][update] current user not allowed to update the device, fail out');
        return res.status(401).send('');
      }

      var updates = {},
          body = req.body || {};

      if(body.name)
        updates.name = body.name;

      Device.update({id: device_id}, updates).exec(finish);
    }

    sails.log('[DeviceController][update] attempting to get device info for device['+device_id+']');
    Device.findOne({id: device_id}).populate('permissions').exec(foundDevice);
  };

  DeviceController.destroy = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function destroyed(err, device) {
      return res.status(200).send('');
    }

    function finish(err, device) {
      if(err) {
        sails.log('[DeviceController][destroy] errored finding device: ' + err);
        return res.status(404).send('');
      }

      if(!device) {
        sails.log('[DeviceController][destroy] unable to find device for destroy');
        return res.status(404).send('');
      }

      sails.log('[DeviceController][destroy] found device');

      var can_destroy = false,
          permissions = device.permissions,
          levels = DeviceShareService.LEVELS;

      for(var i = 0; i < permissions.length; i++) {
        var permission = permissions[i],
            is_owner =  permission.level === levels.DEVICE_OWNER,
            is_current_user = permission.user === user_id;

        if(!is_current_user)
          continue;

        if(is_owner)
          can_destroy = true;
        else
          can_destroy = false;

        break;
      }

      if(can_destroy) 
        device.destroy(destroyed);
      else
        return res.status(404).send('');
    }

    if(device_id >= 0)
      Device.findOne(device_id).populate('permissions').exec(finish);
    else
      return res.status(404).send('');
  };

  DeviceController.findOne = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10);

    function finish(err, device) {
      if(err) {
        sails.log('[DeviceController][findOne] errored finding device: ' + err);
        return rest.status(404).send('');
      }

      return device ? res.json(device) : res.status(404).send('');
    }

    if(device_id >= 0)
      Device.findOne(device_id).exec(finish);
    else
      return res.status(404).send('');
  };

  DeviceController.ping = function(req, res, next) {
    var device_id = req.params.id,
        user_id = req.session.userid,
        username = req.session.username,
        failed = false,
        found_device = null,
        attempt;

    if(!user_id)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('');

    return res.status(200).send('');
  };

  DeviceController.missing = function(req, res) {
    res.status(404).send('not found');
  };

  return DeviceController;

})();

