/* globals DEVICE_LIST */

define(['lib/knockout', 'lib/underscore', './constants', './utils', './parser', './components', './connectors'],
  function(ko, _, CONSTANTS, utils, parser, components, connectors) {

  function sum_attr(attribute) {
    var price_func = attribute.price();
    if (price_func)
      return price_func;
    return 0;
  }

  function bandwidth(lower) {
    var self = this;
    ko.utils.extend(self, new components.single_slider({
      'name': 'Data',
      'min': CONSTANTS.LIMITS.bandwidth_min,
      'max': CONSTANTS.LIMITS.bandwidth_max,
      'lower_bar': lower,
      'lower_price': CONSTANTS.PRICES.bandwidth_per_gb,
      'snap': 1,
      'unit': 'GB'
    }));
  }
  function cpu_virtual_machine(lower) {
    var self = this;
    ko.utils.extend(self, new components.single_slider({
      'name': 'CPU',
      'min': CONSTANTS.LIMITS.cpu_vm_min,
      'max': CONSTANTS.LIMITS.cpu_vm_max,
      'lower_bar': lower,
      'lower_price': CONSTANTS.PRICES.cpu_virtual_machine_per_mhz,
      'snap': CONSTANTS.LIMITS.cpu_increments,
      'unit': 'MHz'
    }));
  }
  function cpu_container(lower_upper) {
    var self = this;
    ko.utils.extend(self, new components.single_slider({
      'name': 'CPU',
      'min': CONSTANTS.LIMITS.cpu_container_min,
      'max': CONSTANTS.LIMITS.cpu_container_max,
      'lower_bar': lower_upper[0],
      'lower_price': CONSTANTS.PRICES.cpu_container_per_mhz,
      'snap': CONSTANTS.LIMITS.cpu_increments,
      'unit': 'MHz'
    }));
  }
  function ram_virtual_machine(lower) {
    var self = this;
    ko.utils.extend(self, new components.single_slider({
      'name': 'RAM',
      'min': CONSTANTS.LIMITS.ram_vm_min,
      'max': CONSTANTS.LIMITS.ram_vm_max,
      'lower_bar': lower,
      'lower_price': CONSTANTS.PRICES.ram_virtual_machine_per_mb,
      'snap': CONSTANTS.LIMITS.ram_increments,
      'unit': 'MB'
    }));
  }
  function ram_container(lower_upper) {
    var self = this;
    ko.utils.extend(self, new components.single_slider({
      'name': 'RAM',
      'min': CONSTANTS.LIMITS.ram_container_min,
      'max': CONSTANTS.LIMITS.ram_container_max,
      'lower_bar': lower_upper[0],
      'lower_price': CONSTANTS.PRICES.ram_container_per_mb,
      'snap': CONSTANTS.LIMITS.ram_increments,
      'unit': 'MB'
    }));
  }
  function ssd_folder(lower) {
    var self = this;

    ko.utils.extend(self, new components.single_slider({
      'name': 'SSD',
      'min': CONSTANTS.LIMITS.ssd_min,
      'max': CONSTANTS.LIMITS.ssd_max,
      'lower_bar': lower,
      'lower_price': CONSTANTS.PRICES.ssd_per_gb,
      'snap': 1,
      'unit': 'GB'
    }));
    self.template = 'ssd-folder-template';
    self.type = 'ssd';
  }
  function ssd_drive(lower) {
    var self = this;

    ko.utils.extend(self, new components.single_slider({
      'name': 'SSD',
      'min': CONSTANTS.LIMITS.ssd_min,
      'max': CONSTANTS.LIMITS.ssd_max,
      'lower_bar': lower,
      'lower_price': CONSTANTS.PRICES.ssd_per_gb,
      'snap': 1,
      'unit': 'GB'
    }));
    self.template = 'ssd-drive-template';
    self.type = 'ssd';
  }
  function hdd_drive(lower) {
    var self = this;
    ko.utils.extend(self, new components.single_slider({
      'name': 'HDD',
      'min': CONSTANTS.LIMITS.hdd_min,
      'max': CONSTANTS.LIMITS.hdd_max,
      'lower_bar': lower,
      'lower_price': CONSTANTS.PRICES.hdd_per_gb,
      'snap': 1,
      'unit': 'GB'
    }));
    self.type = 'hdd';
    self.template = 'hdd-drive-template';
  }

  function switch_disk_type(observable_array, data, build) {
    var index = _.indexOf(observable_array(), data),
        new_drive;
    if (index > -1) {
      new_drive = build(data);
      observable_array.remove(data);
      observable_array.splice(index, 0, new_drive);
    }
  }

  function base_server(options) {
    var self = this,
        number_of_instances = 1;

    if (options.number_of_instances > 0)
      number_of_instances = options.number_of_instances;

    self.ip = new components.checkbox({
      'name': 'Static IP',
      'active': options.ip,
      'price': CONSTANTS.PRICES.cost_per_static_ip
    });
    self.firewall = new components.checkbox({
      'name': 'Firewall',
      'active': options.firewall,
      'price': CONSTANTS.PRICES.cost_per_firewall
    });

    self.storages = ko.observableArray();

    self.number_of_instances = ko.observable(number_of_instances);

    // Actions
    self.remove_storage = function(data, event) {
      self.storages.remove(data.data);
    };
  }

  function add_storages(storages, builder) {
    for (var i = 0; i < storages.length; i++) {
      this.storages.push(new builder(storages[i]));
    }
  }

  function server_formatted_price() {
    var single_total = utils.format_price(this.single_price()),
        total = utils.format_price(this.price()),
        number_of_instances = this.number_of_instances(),
        stype = this.type.replace("_", " ");
    if (number_of_instances > 1)
      return number_of_instances + ' ' + stype + 's, at ' + single_total + ' per ' + stype + ' = ' + total;
    else
      return total;
  }

  function calc_server_full_price() {
    return this.single_price() * this.number_of_instances();
  }

  function calc_server_single_price() {
    var total = 0;
    total += this.cpu.price();
    total += this.ram.price();
    total += this.ip.price();
    total += this.firewall.price();
    total += _.reduce(this.storages(), utils.sum_function, 0);

    return total;
  }

  function container(options) {
    var self = this;

    self.name = 'Container ' + utils.unique_id.build();

    ko.utils.extend(self, new base_server(options));
    // Normal attributes

    self.cpu = new cpu_container(options.cpu);
    self.ram = new ram_container(options.ram);
    self.type = 'container';
    self.template = 'container-template';

    // Computed
    self.single_price = ko.computed(calc_server_single_price, self);
    self.price = ko.computed(calc_server_full_price, self);
    self.formatted_price = ko.computed(server_formatted_price, self);

    self.add_disk = function(data, event) {
      self.storages.push(new ssd_folder(CONSTANTS.LIMITS.ssd_min + 5));
    };
    self.serialize = function() {
      return parser.serialize_base_server.call(self);
    };
    self.resources = ko.computed(parser.container_resources, self);

    // Init
    add_storages.apply(self, [options.ssd, ssd_folder]);
    add_storages.apply(self, [options.hdd, hdd_drive]);
  }

  var windows_server_licenses = [
    {
      'name': 'Server 2008 Web',
      'price': CONSTANTS.PRICES.cost_per_winserverweb
    },
    {
      'name': 'Server 2008 Standard',
      'price': CONSTANTS.PRICES.cost_per_winserverstd
    },
    {
      'name': 'Server 2008 Enterprise',
      'price': CONSTANTS.PRICES.cost_per_winserverent
    }
  ],
  other_windows_licenses = [
    {
      'name': 'SQL Server 2008 / 2012 Web',
      'price': CONSTANTS.PRICES.cost_per_mssqlserverweb
    },
    {
      'name': 'SQL Server 2008 Standard',
      'price': CONSTANTS.PRICES.cost_per_mssqlserverstd
    },
    {
      'name': 'SQL Server 2012 Standard',
      'price': CONSTANTS.PRICES.cost_per_mssqlserver12
    }
  ];

  function apply_licenses(options) {
    return {
      'windows_server_licenses': new components.server_licenses(
        'windows_server_licenses', windows_server_licenses, options.windows_server_license
      ),
      'additional_microsoft_licenses': new components.server_licenses(
        'other_windows_licenses', other_windows_licenses, options.additional_microsoft_license
      ),
      'remote_desktops': new components.simple_input({
        name: 'Remote Desktop CALs',
        price: CONSTANTS.PRICES.cost_per_desktopcal,
        value: options.remote_desktops
      })
    };
  }

  function virtual_machine(options) {

    var self = this,
        unique_id = utils.unique_id.build();
    ko.utils.extend(self, new base_server(options));

    self.type = 'virtual_machine';
    self.cpu = new cpu_virtual_machine(options.cpu);
    self.ram = new ram_virtual_machine(options.ram);

    // Normal attributes
    self.template = 'virtual-machine-template';

    self.unique_id = 'VM' + unique_id;

    self.name = 'VM ' + unique_id;

    self = _.extend(self, apply_licenses(options));

    // Computed
    self.single_price = ko.computed(function() {
      var total = calc_server_single_price.call(self);

      total += sum_attr(self.windows_server_licenses);
      total += sum_attr(self.additional_microsoft_licenses);
      total += sum_attr(self.remote_desktops);

      return total;
    }, self);
    self.price = ko.computed(calc_server_full_price, self);
    self.formatted_price = ko.computed(server_formatted_price, self);

    // Actions
    self.switch_to_hdd_drive = function(data, event) {

      switch_disk_type(self.storages, data.data, function(data) {
        return new hdd_drive(data.lower_input());
      });
    };
    self.switch_to_ssd_drive = function(data, event) {
      switch_disk_type(self.storages, data.data, function(data) {
        return new ssd_drive(data.lower_input());
      });
    };
    self.add_disk = function(data, event) {
      self.storages.push(new ssd_drive(CONSTANTS.LIMITS.ssd_min + 5));
    };
    self.serialize = function() {
      return parser.serialize_virtual_machine.call(self);
    };

    self.resources = ko.computed(parser.virtual_machine_resources, self);

    // Init
    add_storages.apply(self, [options.ssd, ssd_drive]);
    add_storages.apply(self, [options.hdd, hdd_drive]);
  }

  function account_details(options) {
    var self = this;
    self.bandwidth = new bandwidth(options.lower);
    self.additional_ips = new components.account_option({
      name: 'Additional IPs',
      unit: 'IPs',
      price: CONSTANTS.PRICES.cost_per_static_ip,
      max: CONSTANTS.LIMITS.ip_max,
      value: options.ips
    });
    self.additional_vlans = new components.account_option({
      name: 'Additional VLANs',
      unit: 'VLANs',
      price: CONSTANTS.PRICES.cost_per_vlan,
      max: CONSTANTS.LIMITS.vlan_max,
      value: options.vlans
    });

    self.price = ko.computed(function() {
      var total = 0;
      total += self.bandwidth.price();
      total += self.additional_ips.price();
      total += self.additional_vlans.price();

      return total;
    });
    self.serialize = function() {
      var result = [
        self.bandwidth.choosen(),
        self.additional_ips.choosen(),
        self.additional_vlans.choosen()
      ];
      return result;
    };
    self.resources = ko.computed(function() {
      var resources = {};
      resources[CONSTANTS.RESOURCES.bandwidth] = utils.force_int(self.bandwidth.choosen());
      resources[CONSTANTS.RESOURCES.ip] = utils.force_int(self.additional_ips.choosen());
      resources[CONSTANTS.RESOURCES.ip6] = 0;
      resources[CONSTANTS.RESOURCES.vlan] = utils.force_int(self.additional_vlans.choosen());
      return resources;
    });
  }

  function has_firewall(server) {
    return (!!(server['nic:0:firewall:accept'] ||
      server['nic:0:firewall:reject'] ||
      (server['nic:0:firewall:policy'] || 'accept') !== 'accept'));
  }

  function has_ip(server) {
    return (!!(server['nic:0:dhcp'] && server['nic:0:dhcp'] === 'auto'));
  }

  function count_remote_desktops(drives) {
    var all_licenses = _.map(drives, function(drive) {
          return drive.properties ? drive.properties.licenses : undefined;
        }),
        expression_re = new RegExp(CONSTANTS.RESOURCES.windows_remote_desktop + '(:(\\d+))?'),
        remote_desktops = _.reduce(all_licenses, function(memo, licenses) {
          if (!licenses)
            return memo + 0;

          var matched = licenses.match(expression_re);
          if (!matched)
            return memo + 0;
          else if (matched[2])
            return parseInt(matched[2]);
          else
            return memo + 1;
        }, 0);
    return remote_desktops;
  }

  function find_license(drives, available_licenses) {
    var all_licenses = _.map(drives, function(drive) {
          return drive.properties ? drive.properties.licenses : undefined;
        }),
        windows_values = _.map(all_licenses, function(licenses) {
          if (!licenses)
            return 0;

          for (var i = available_licenses.length - 1; i >= 0; i--) {
            if (licenses.match(available_licenses[i]))
              return i;
          }
        });
    return _.max(windows_values);
  }

  function find_windows_server_license(drives) {
    return find_license(drives, CONSTANTS.WINDOWS_LICENSE_ORDER);
  }

  function find_additional_microsoft_license(drives) {
    return find_license(drives, CONSTANTS.ADDITIONAL_MICROSOFT_LICENSE_ORDER);
  }

  function raw_drive_factory(data) {
    var calls = {}, func;
    calls[CONSTANTS.TYPES.hdd] = raw_hdd_drive;
    calls[CONSTANTS.TYPES.ssd] = raw_ssd_drive;

    func = calls[data['tier']];
    return new func(data);
  }


  function computed_observable_array(caller) {
    var self = this;
    self.data = ko.observableArray();
    self.updater = ko.computed(
      caller,
      self,
      {
        disposeWhen: function() {
          var loaded = connectors.ajax_responses_loaded();
          return loaded.folders && loaded.drives;
        }
      }
    );
  }

  function disconnected_drives() {
    var calls = {}, func, computed;
    calls[CONSTANTS.TYPES.hdd] = raw_disconnected_hdd_drive;
    calls[CONSTANTS.TYPES.ssd] = raw_disconnected_ssd_drive;

    computed = _.map(find_disconnected_drives(), function(drive) {
      func = calls[drive['tier']];
      return new func(drive);
    });
    this.data(computed);
  }

  function disconnected_folders() {
    var computed = _.map(find_disconnected_folders(), function(data) {
      return new raw_disconnected_ssd_folder(data);
    });
    this.data(computed);
  }

  function raw_storage(builder, type, data) {
    var self = this,
        size;
    self.properties = utils.copy(data);
    size = utils.bytes_to_gigabytes(data[type]);

    ko.utils.extend(self, new builder(size));
  }

  function raw_hdd_drive(data) {
    var self = this;
    ko.utils.extend(self, new raw_storage(hdd_drive, 'size', data));
  }

  function raw_ssd_drive(data) {
    var self = this;
    ko.utils.extend(self, new raw_storage(ssd_drive, 'size', data));
  }

  function raw_ssd_folder(data) {
    var self = this;
    ko.utils.extend(self, new raw_storage(ssd_folder, 'used', data));
  }

  function raw_virtual_machine(data) {
    var self = this;
    // put this is constants file
    var data_defaults = {
          cpu: 2000,
          ram: 1024,
          ip: false,
          firewall: false,
          number_of_instances: 1,
          ssd: [],
          hdd: [],
          windows_server_license: 0,
          additional_microsoft_license: 0,
          remote_desktops: 0
        },
        data_copy = utils.copy(data);

    self.properties = data;

    self.connected_storage_ids = ko.computed(function() {
      var result = {};
      _.each(DEVICE_LIST, function(device_id) {
        var drive_id = data_copy[device_id];

        if (drive_id)
          result[drive_id] = null;
      });
      return result;
    });


    data_copy = _.defaults(data_copy, data_defaults);
    data_copy['ip'] = has_ip(data_copy);
    data_copy['firewall'] = has_firewall(data_copy);
    data_copy['ram'] = data_copy['mem'];

    ko.utils.extend(self, new virtual_machine(data_copy));

    self.name = data['name'];

    self.computed_drives = ko.computed(function() {
      var raw_drives = _.filter(connectors.raw.drives(), function(drive) {
            return drive['drive'] in self.connected_storage_ids();
          }),
          drives = _.map(raw_drives, raw_drive_factory);
          _.each(drives, function(drive) {
            self.storages.push(drive);
          });
      return drives;
    });

    self._update_drives_licenses = ko.computed(function() {
      self.remote_desktops.value(count_remote_desktops(self.computed_drives()));
      self.windows_server_licenses.choose(find_windows_server_license(self.computed_drives()));
      self.additional_microsoft_licenses.choose(find_additional_microsoft_license(self.computed_drives()));
    });
  }

  function raw_container(data) {
    // put this is constants file
    var self = this,
        data_defaults = {
          cpu: [0, 2000],
          ram: [256, 1024],
          ip: false,
          firewall: false,
          number_of_instances: 1,
          ssd: [],
          hdd: []
        },
        data_copy = utils.copy(data);

    self.properties = data;

    self.connected_storage_ids = ko.computed(function() {
      var result = {},
          FILESYSTEM_RE = /^(?:fs:\d+)$/;

      function clean_filesystem_id(id) {
        return id.split('/')[0];
      }

      _.each(_.keys(self.properties), function(key) {
        if (FILESYSTEM_RE.test(key))
          result[clean_filesystem_id(self.properties[key])] = null;
      });
      return result;
    });

    data_copy = _.defaults(data_copy, data_defaults);
    data_copy['ram'] = [data_copy['mem'], data_copy['mem']];
    data_copy['cpu'] = [data_copy['cpu'], data_copy['cpu']];
    data_copy['ip'] = has_ip(data_copy);
    data_copy['firewall'] = has_firewall(data_copy);
    data_copy['type'] = data_copy['tier'];

    ko.utils.extend(self, new container(data_copy));

    self.name = data['name'];

    self._storages = ko.computed(function() {
      var raw_folders = _.filter(connectors.raw.folders(), function(folder) {
            return folder['folder'] in self.connected_storage_ids();
          }),
          folders = _.map(raw_folders, function(data) {
            return new raw_ssd_folder(data);
          });
      _.each(folders, function(folder) {
        self.storages.push(folder);
      });
      return folders;
    });
  }

  function raw_server_factory(data) {
    var calls = {}, func;

    calls[CONSTANTS.TYPES.virtual_machine] = raw_virtual_machine;
    calls[CONSTANTS.TYPES.container] = raw_container;
    func = calls[data['type']];

    return new func(data);
  }

  function trial_server_observable_array(observable) {
    var self = this;

    self.data = ko.observableArray();

    self.update_data = ko.computed(function() {
      var parser_values = _.map(observable(), function(data) {
        return raw_server_factory(data);
      });
      self.data(parser_values);
    });
  }

  function additional_ips() {
    var ips = _.filter(connectors.raw.resources(), function(resource) {
          return resource['type'] === 'ip';
        }),
        num_of_servers_with_ips = _.filter(servers_data(), function(server) {
          return server.ip.active;
        });
    return ips.length - num_of_servers_with_ips.length;
  }

  function additional_vlans() {
    var vlans = _.filter(connectors.raw.resources(), function(resource) {
        return resource['type'] === 'vlan';
      });
    return vlans.length;
  }

  function find_disconnected_storages(type, where) {
    var used_ids = _.reduce(servers_data(), function(memo, server) {
          return _.extend(memo, server.connected_storage_ids());
        }, {}),
        unused_storage = _.filter(where(), function(storage) {
          return !(storage[type] in used_ids);
        });

    return unused_storage;
  }

  function find_disconnected_drives() {
    return find_disconnected_storages('drive', connectors.raw.drives);
  }

  function find_disconnected_folders() {
    return find_disconnected_storages('folder', connectors.raw.folders);
  }

  function raw_disconnected_drive_licenses(data) {
    var self = this,
        options = {};

    options['remote_desktops'] = count_remote_desktops([data]);
    options['windows_server_license'] = find_windows_server_license([data]);
    options['additional_microsoft_license'] = find_additional_microsoft_license([data]);
    self = _.extend(self, apply_licenses(options));
  }

  function raw_disconnected_hdd_drive(data) {
    var self = this;
    ko.utils.extend(self, new raw_hdd_drive(data));
    ko.utils.extend(self, new raw_disconnected_drive_licenses(self));

    disconnected_drive_price.apply(self);

    self.template = 'disconnected-hdd-drive-template';
    self.resources = ko.computed(parser.disconnected_hdd_drive_resources, self);
  }

  function raw_disconnected_ssd_drive(data) {
    var self = this;
    ko.utils.extend(self, new raw_ssd_drive(data));
    ko.utils.extend(self, new raw_disconnected_drive_licenses(self));

    disconnected_drive_price.apply(self);

    self.template = 'disconnected-ssd-drive-template';
    self.resources = ko.computed(parser.disconnected_ssd_drive_resources, self);
  }

  function disconnected_drive_price() {
    var self = this;
    self._data_price = self.price;
    self.price = function() {
      var total = self._data_price();
      total += sum_attr(self.windows_server_licenses);
      total += sum_attr(self.additional_microsoft_licenses);
      total += sum_attr(self.remote_desktops);

      return  total;
    };
  }

  function raw_disconnected_ssd_folder(data) {
    var self = this;
    ko.utils.extend(self, new raw_ssd_folder(data));
    self.resources = ko.computed(parser.disconnected_folder_resources, self);
  }

  function build_account_details() {
    var data = {
      'ips': additional_ips(),
      'vlans': additional_vlans(),
      'bandwidth': 0,
    };
    return new account_details(data);
  }

  function turn_to_disconnected_ssd_drive(data) {
    return turn_to_disconnected(data, raw_disconnected_ssd_drive);
  }

  function turn_to_disconnected_hdd_drive(data) {
    return turn_to_disconnected(data, raw_disconnected_hdd_drive);
  }

  function turn_to_disconnected(data, factory) {
    var raw_data = data.properties;
    raw_data['size'] = parseInt(data.lower_input());

    return new factory(raw_data);
  }

  var servers_data = new trial_server_observable_array(connectors.raw.servers).data;

  return {
    'servers_data': servers_data,
    'disconnected_drives_data': new computed_observable_array(disconnected_drives).data,
    'disconnected_folders_data': new computed_observable_array(disconnected_folders).data,
    'account_details': account_details,
    'built_account_details': ko.computed(build_account_details),
    'container': container,
    'virtual_machine': virtual_machine,
    'switch_disconnected_drive': {
      'ssd': turn_to_disconnected_ssd_drive,
      'hdd': turn_to_disconnected_hdd_drive,
    },
    'switch_disk_type': switch_disk_type
  };
});
