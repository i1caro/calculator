/* globals _ */

define(['./knockout-3.1.0', './utils'], function(ko, utils) {
  function Parser(list) {
    var self = this;
    for (var i=0; i < list.length; i++) {
      self.push(list[i]);
    }
    self.build_virtual_machine = function() {
      var result = {
        'cpu': self.shift(),
        'ram': self.shift(),
        'ip': utils.toBoolean(self.shift()),
        'firewall': utils.toBoolean(self.shift()),
        'ssd': self.get_drives(),
        'hdd': self.get_drives(),
        'windows_server_license': self.shift(),
        'additional_microsoft_license': self.shift(),
        'remote_desktops': self.shift()
      };
      return result;
    };
    self.build_container = function() {
      var result = {
        'cpu': [self.shift(), self.shift()],
        'ram': [self.shift(), self.shift()],
        'ip': utils.toBoolean(self.shift()),
        'firewall': utils.toBoolean(self.shift()),
        'ssd': self.get_drives(),
        'hdd': self.get_drives()
      };
      return result;
    };
    self.get_drives = function() {
      var list = [],
          element = self.shift();
      while(self.not_end(element)) {
        list.push(element);
        element = self.shift();
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
      var element = self[0],
          servers = [];
      while(self.not_end(element)) {
        servers.push(factory());
        element = self[0];
      }
      self.shift(); // remove ']'
      return servers;
    };
    self.not_end = function(element) {
      return element !== ']' && self.length > 0;
    };
    self.build_account_details = function() {
      return {
        'bandwidth': self.shift(),
        'ips': self.shift(),
        'virtual_lans': self.shift()
      };
    };
    self.parse = function() {
      var data = {};
      if (self.length) {
        data['virtual_machines'] = self.get_virtual_machines();
        data['containers'] = self.get_containers();
        data['account_details'] = self.build_account_details();
        data['subscription'] = self.shift();
        data['country'] = self.shift();
      }
      return data;
    };
  }
  Parser.prototype = Object.create(Array.prototype);
  Parser.constructor = Parser;

  function string_into_data(string) {
    var no_hash = string.substring(1),
        decoded = decodeURI(no_hash),
        splited_info = decoded.split('%'),
        checksum = splited_info[0],
        parser = new Parser(splited_info[1].split(','));

    if (parseInt(checksum) !== utils.calc_checksum(splited_info[1]))
      throw "Wrong checksum";
    return parser.parse();
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
      this.firewall.choosen()
    ];
    result.push(drives_data['ssd']);
    result.push(']');
    result.push(drives_data['hdd']);
    result.push(']');
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
    var virtual_machines = this.virtual_machines(),
        containers = this.containers(),
        temp_list,
        result = [],
        i;

    temp_list = [];
    for (i=0; i < virtual_machines.length; i++) {
      temp_list.push(virtual_machines[i].serialize());
    }
    result.push(temp_list);
    result.push(']');
    temp_list = [];
    for (i=0; i < containers.length; i++) {
      temp_list.push(containers[i].serialize());
    }
    result.push(temp_list);
    result.push(']');
    result.push(this.account_details.serialize());
    result.push(this.subscription_plans.choosen());
    result.push(this.country());

    var result_string = _.flatten(result).join(','),
        checksum = utils.calc_checksum(result_string);

    location.hash = encodeURI(checksum + '%' + result_string);
    return result_string;
  }

  return {
    'string_into_data': string_into_data,
    'serialize_base_server': serialize_base_server,
    'serialize_virtual_machine': serialize_virtual_machine,
    'serialize_view': serialize_view
  };
});
