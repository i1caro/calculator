define(['lib/underscore', './utils', './constants'], function(_, utils, CONSTANTS) {
  var SPLIT_CHECKSUM = '+',
      SPLIT_INSTANCES = '/';

  function Parser(list) {
    var self = this,
        output = [];

    for (var i=0; i < list.length; i++) {
      output.push(list[i]);
    }
    self.build_virtual_machine = function() {
      var result = {
        'cpu': output.shift(),
        'ram': output.shift(),
        'ip': utils.toBoolean(output.shift()),
        'firewall': utils.toBoolean(output.shift()),
        'ssd': self.get_drives(),
        'hdd': self.get_drives(),
        'windows_server_license': output.shift(),
        'additional_microsoft_license': output.shift(),
        'remote_desktops': output.shift()
      };
      return result;
    };
    self.build_container = function() {
      var result = {
        'cpu': [output.shift(), output.shift()],
        'ram': [output.shift(), output.shift()],
        'ip': utils.toBoolean(output.shift()),
        'firewall': utils.toBoolean(output.shift()),
        'ssd': self.get_drives(),
        'hdd': self.get_drives()
      };
      return result;
    };
    self.get_drives = function() {
      var list = [],
          element = output.shift();
      while (self.not_end(element)) {
        list.push(element);
        element = output.shift();
      }
      return list;
    };
    self.get_virtual_machines = function() {
      return self.get_servers(self.build_virtual_machine);
    };
    self.get_containers = function() {
      return self.get_servers(self.build_container);
    };
    self.get_servers = function(factory) {
      var element = output[0],
          servers = [];
      while (self.not_end(element)) {
        servers.push(factory());
        element = output[0];
      }
      output.shift(); // remove SPLIT_INSTANCES
      return servers;
    };
    self.not_end = function(element) {
      return element !== SPLIT_INSTANCES && output.length > 0;
    };
    self.build_account_details = function() {
      return {
        'bandwidth': output.shift(),
        'ips': output.shift(),
        'vlans': output.shift()
      };
    };
    self.parse = function() {
      var data = {};
      if (output.length) {
        data['virtual_machines'] = self.get_virtual_machines();
        data['containers'] = self.get_containers();
        data['account_details'] = self.build_account_details();
        data['subscription'] = output.shift();
      }
      return data;
    };
  }
  Parser.prototype = Object.create(Array.prototype);
  Parser.constructor = Parser;

  function split_string(string) {
    var no_hash = string.substring(1),
        splited_info = no_hash.split(SPLIT_CHECKSUM);

    return {checksum: splited_info[0], data: splited_info[1]};
  }

  function serialize_load(string) {
    var result = split_string(string);
    if (parseInt(result.checksum) !== utils.calc_checksum(result.data))
      throw "Wrong checksum";
    return new Parser(result.data.split(',')).parse();
  }

  function unchecked_serialize_load(string) {
    var result = split_string(string);
    return new Parser(result.data.split(',')).parse();
  }

  function serialize_storages(storages) {
    var storage_data = {'ssd': [], 'hdd': []};
    _.each(storages, function(storage) {
      storage_data[storage.type].push(storage.choosen());
    });
    return storage_data;
  }

  function serialize_base_server() {
    var storage_data = serialize_storages(this.storages()),
        result = [
          this.cpu.choosen(),
          this.ram.choosen(),
          this.ip.choosen(),
          this.firewall.choosen()
        ];
    result.push(storage_data['ssd']);
    result.push(SPLIT_INSTANCES);
    result.push(storage_data['hdd']);
    result.push(SPLIT_INSTANCES);
    return result;
  }

  function licenses() {
    var self = this;
    return [
      self.windows_server_licenses.choosen(),
      self.additional_microsoft_licenses.choosen(),
      self.remote_desktops.value()
    ];
  }

  function serialize_virtual_machine() {
    var self = this,
        machine_data = serialize_base_server.call(self),
        result = licenses.call(self);
    machine_data.push(result);
    return machine_data;
  }

  function serialize_dump() {
    var servers = this.servers(),
        temp_server,
        temp_list,
        result = [];

    temp_list = {
      'container': [],
      'virtual_machine': []
    };
    for (var i=0; i < servers.length; i++) {
      temp_server = servers[i];
      temp_list[temp_server.type].push(temp_server.serialize());
    }
    result.push(temp_list['virtual_machine']);
    result.push(SPLIT_INSTANCES);
    result.push(temp_list['container']);
    result.push(SPLIT_INSTANCES);
    result.push(this.account_details.serialize());

    return _.flatten(result).join(',');
  }

  function serialize_dump_to_url() {
    var result_string = serialize_dump.call(this),
        checksum = utils.calc_checksum(result_string),
        encoded_uri = checksum + SPLIT_CHECKSUM + result_string;
    return encoded_uri;
  }

  function common_server_resources() {
    var self = this,
        resources = {},
        storages;


    resources[CONSTANTS.RESOURCES.ip] = self.ip.choosen() ? 1 : 0;
    resources[CONSTANTS.RESOURCES.firewall] = self.firewall.choosen() ? 1 : 0;

    storages = serialize_storages(self.storages());

    resources[CONSTANTS.RESOURCES.ssd] = _.reduce(storages['ssd'], function(memo, size) {
      return memo + utils.force_int(size);
    }, 0);
    resources[CONSTANTS.RESOURCES.hdd] = _.reduce(storages['hdd'], function(memo, size) {
      return memo + utils.force_int(size);
    }, 0);

    return resources;
  }

  function licenses_resources() {
    var self = this,
        resources = {}, key;

    resources[CONSTANTS.RESOURCES.windows_remote_desktop] = utils.force_int(self.remote_desktops.value());

    key = CONSTANTS.ADDITIONAL_MICROSOFT_LICENSE_ORDER[self.additional_microsoft_licenses.choosen()];
    if (key)
      resources[key] = 1;

    key = CONSTANTS.WINDOWS_LICENSE_ORDER[self.windows_server_licenses.choosen()];
    if (key)
      resources[key] = 1;

    return resources;
  }

  function virtual_machine_resources(data) {
    var self = this,
        resources = common_server_resources.call(self);

    resources[CONSTANTS.RESOURCES.cpu_virtual_machine] = utils.force_int(self.cpu.choosen());
    resources[CONSTANTS.RESOURCES.ram_virtual_machine] = utils.force_int(self.ram.choosen());

    return _.extend(resources, licenses_resources.call(self));
  }

  function container_resources() {
    var self = this,
        resources = common_server_resources.call(self);

    resources[CONSTANTS.RESOURCES.cpu_container] = utils.force_int(self.cpu.choosen());
    resources[CONSTANTS.RESOURCES.ram_container] = utils.force_int(self.ram.choosen());

    return resources;
  }

  function disconnected_storage_resources(type) {
    var self = this,
        resources = {};

    resources[type] = self.choosen();

    return resources;
  }

  function disconnected_folder_resources() {
    var self = this;
    return disconnected_storage_resources.call(self, CONSTANTS.RESOURCES.ssd);
  }

  function disconnected_ssd_drive_resources() {
    var self = this,
        resources = disconnected_storage_resources.call(self, CONSTANTS.RESOURCES.ssd);

    return _.extend(resources, licenses_resources.call(self));
  }

  function disconnected_hdd_drive_resources() {
    var self = this,
        resources = disconnected_storage_resources.call(self, CONSTANTS.RESOURCES.hdd);

    return _.extend(resources, licenses_resources.call(self));
  }

  return {
    'disconnected_folder_resources': disconnected_folder_resources,
    'disconnected_ssd_drive_resources': disconnected_ssd_drive_resources,
    'disconnected_hdd_drive_resources': disconnected_hdd_drive_resources,
    'virtual_machine_resources': virtual_machine_resources,
    'container_resources': container_resources,
    'serialize_load': serialize_load,
    'serialize_base_server': serialize_base_server,
    'serialize_virtual_machine': serialize_virtual_machine,
    'serialize_dump': serialize_dump,
    'serialize_dump_to_url': serialize_dump_to_url,
    'unchecked_serialize_load': unchecked_serialize_load
  };
});
