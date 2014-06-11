/* globals _ */

define(['./utils'], function(utils) {
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
        'number_of_instances': output.shift(),
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
        'number_of_instances': output.shift(),
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
        'virtual_lans': output.shift()
      };
    };
    self.parse = function() {
      var data = {};
      if (output.length) {
        data['virtual_machines'] = self.get_virtual_machines();
        data['containers'] = self.get_containers();
        data['account_details'] = self.build_account_details();
        data['subscription'] = output.shift();
        data['country'] = output.shift();
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

  function string_into_data(string) {
    var result = split_string(string);

    if (parseInt(result.checksum) !== utils.calc_checksum(data))
      throw "Wrong checksum";
    return new Parser(result.data.split(',')).parse();
  }

  function unchecked_string_into_data(string) {
    var result = split_string(string);
    return new Parser(result.data.split(',')).parse();
  }

  function serialize_base_server() {
    var drives_data = {ssd: [], hdd: []},
        drives = this.drives();
    for (var i=0; i < drives.length; i++) {
      drives_data[drives[i].type].push(drives[i].choosen());
    }
    var result = [
      this.cpu.choosen(),
      this.ram.choosen(),
      this.ip.choosen(),
      this.firewall.choosen(),
      this.number_of_instances()
    ];
    result.push(drives_data['ssd']);
    result.push(SPLIT_INSTANCES);
    result.push(drives_data['hdd']);
    result.push(SPLIT_INSTANCES);
    return result;
  }

  function serialize_virtual_machine() {
    var machine_data = serialize_base_server.call(this),
        result = [
          this.windows_server_licenses.choosen(),
          this.additional_microsoft_licenses.choosen(),
          this.remote_desktops.choosen()
        ];
    machine_data.push(result);
    return machine_data;
  }

  function serialize_view() {
    var servers = this.servers(),
        temp_server,
        temp_list,
        result = [],
        i;
    temp_list = {
      'container': [],
      'virtual_machine': []
    };
    for (i=0; i < servers.length; i++) {
      temp_server = servers[i];
      temp_list[temp_server.type].push(temp_server.serialize());
    }
    result.push(temp_list['virtual_machine']);
    result.push(SPLIT_INSTANCES);
    result.push(temp_list['container']);
    result.push(SPLIT_INSTANCES);
    result.push(this.account_details.serialize());
    result.push(this.subscription_plans.choosen());
    result.push(this.country());

    var result_string = _.flatten(result).join(','),
        checksum = utils.calc_checksum(result_string),
        encoded_uri = checksum + SPLIT_CHECKSUM + result_string;
    location.hash = encoded_uri;
    return result_string;
  }

  return {
    'string_into_data': string_into_data,
    'serialize_base_server': serialize_base_server,
    'serialize_virtual_machine': serialize_virtual_machine,
    'serialize_view': serialize_view
  };
});
