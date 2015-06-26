define(['lib/underscore', './utils'], function(_, utils) {
  var SPLIT_CHECKSUM = '+',
      SPLIT_INSTANCES = '/';

  function Parser(list) {
    this.list = list;
    _.bindAll(this, 'build_virtual_machine', 'build_container');
  }
  _.extend(Parser.prototype, {
    build_server: function() {
      return {
        'cpu': Number(this.list.shift()),
        'ram': Number(this.list.shift()),
        'ip': utils.toBoolean(this.list.shift()),
        'firewall': utils.toBoolean(this.list.shift()),
        'ssd': this.get_drives(),
        'hdd': this.get_drives()
      };
    },
    build_virtual_machine: function() {
      var result = this.build_server();

      result['windows_server_license'] = Number(this.list.shift());
      result['additional_license'] = Number(this.list.shift());
      result['remote_desktops'] = Number(this.list.shift());

      return result;
    },
    build_container: function() {
      return this.build_server();
    },
    get_drives: function() {
      var list = [],
          element = this.list.shift();
      while (this.not_end(element)) {
        list.push(element);
        element = this.list.shift();
      }
      return list;
    },
    get_virtual_machines: function() {
      return this.get_servers(this.build_virtual_machine);
    },
    get_containers: function() {
      return this.get_servers(this.build_container);
    },
    get_servers: function(factory) {
      var servers = [];
      while (this.not_end(this.list[0])) {
        servers.push(factory());
      }
      this.list.shift(); // remove SPLIT_INSTANCES
      return servers;
    },
    not_end: function(element) {
      return element !== SPLIT_INSTANCES && this.list.length > 0;
    },
    build_account_details: function() {
      return {
        'bandwidth': this.list.shift(),
        'ips': this.list.shift(),
        'vlans': this.list.shift()
      };
    },
    parse: function() {
      var data = {};
      if (this.list.length) {
        data['virtual_machines'] = this.get_virtual_machines();
        data['containers'] = this.get_containers();
        data['account_details'] = this.build_account_details();
        data['subscription'] = this.list.shift();
      }
      return data;
    }
  });

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
      storage_data[storage.type].push(storage.chosen());
    });
    return storage_data;
  }

  function serialize_base_server() {
    var storage_data = serialize_storages(this.storages()),
        result = [
          this.cpu.chosen(),
          this.ram.chosen(),
          this.ip.chosen(),
          this.firewall.chosen()
        ];
    result.push(storage_data['ssd']);
    result.push(SPLIT_INSTANCES);
    result.push(storage_data['hdd']);
    result.push(SPLIT_INSTANCES);
    return result;
  }

  function licenses() {
    return [
      this.windows_server_licenses.chosen(),
      this.additional_licenses.chosen(),
      this.remote_desktops.value()
    ];
  }

  function serialize_virtual_machine() {
    var machine_data = serialize_base_server.call(this),
        result = licenses.call(this.licenses);
    machine_data.push(result);
    return machine_data;
  }

  function serialize_dump() {
    var servers = this.servers(),
        temp_list,
        result = [];

    temp_list = {
      'container': [],
      'virtual_machine': []
    };

    _.each(servers, function(server) {
      temp_list[server.type].push(server.serialize());
    });

    result.push(temp_list['virtual_machine']);
    result.push(SPLIT_INSTANCES);
    result.push(temp_list['container']);
    result.push(SPLIT_INSTANCES);
    result.push(this.account_details().serialize());

    return _.flatten(result).join(',');
  }

  function serialize_dump_to_url() {
    var result_string = serialize_dump.call(this),
        checksum = utils.calc_checksum(result_string),
        encoded_uri = checksum + SPLIT_CHECKSUM + result_string;
    return encoded_uri;
  }

  return {
    'serialize_load': serialize_load,
    'serialize_storages': serialize_storages,
    'serialize_base_server': serialize_base_server,
    'serialize_virtual_machine': serialize_virtual_machine,
    'serialize_dump': serialize_dump,
    'serialize_dump_to_url': serialize_dump_to_url,
    'unchecked_serialize_load': unchecked_serialize_load
  };
});
