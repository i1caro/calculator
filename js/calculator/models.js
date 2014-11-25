define(['lib/knockout', 'lib/underscore', './constants', './pricing', './utils', './parser', './components'],
  function(ko, _, CONSTANTS, pricing, utils, parser, components) {

    function ModelsView(limits) {
      var prices = pricing.prices;

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
          'min': limits.bandwidth_min,
          'max': limits.bandwidth_max,
          'lower_bar': lower,
          'lower_price': prices.bandwidth_per_gb,
          'snap': 1,
          'unit': 'GB'
        }));
      }
      function cpu_virtual_machine(lower) {
        var self = this;
        ko.utils.extend(self, new components.single_slider({
          'name': 'CPU',
          'min': limits.cpu_vm_min,
          'max': limits.cpu_vm_max,
          'lower_bar': lower,
          'lower_price': prices.cpu_virtual_machine_per_mhz,
          'snap': limits.cpu_increments,
          'unit': 'MHz'
        }));
      }
      function cpu_container(lower_upper) {
        var self = this;
        ko.utils.extend(self, new components.single_slider({
          'name': 'CPU',
          'min': limits.cpu_container_min,
          'max': limits.cpu_container_max,
          'lower_bar': lower_upper,
          'lower_price': prices.cpu_container_per_mhz,
          'snap': limits.cpu_increments,
          'unit': 'MHz'
        }));
      }
      function ram_virtual_machine(lower) {
        var self = this;
        ko.utils.extend(self, new components.single_slider({
          'name': 'RAM',
          'min': limits.ram_vm_min,
          'max': limits.ram_vm_max,
          'lower_bar': lower,
          'lower_price': prices.ram_virtual_machine_per_mb,
          'snap': limits.ram_increments,
          'unit': 'MB'
        }));
      }
      function ram_container(lower_upper) {
        var self = this;
        ko.utils.extend(self, new components.single_slider({
          'name': 'RAM',
          'min': limits.ram_container_min,
          'max': limits.ram_container_max,
          'lower_bar': lower_upper,
          'lower_price': prices.ram_container_per_mb,
          'snap': limits.ram_increments,
          'unit': 'MB'
        }));
      }
      function ssd_folder(lower) {
        var self = this;

        ko.utils.extend(self, new components.single_slider({
          'name': 'SSD',
          'min': limits.ssd_min,
          'max': limits.ssd_max,
          'lower_bar': lower,
          'lower_price': prices.ssd_per_gb,
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
          'min': limits.ssd_min,
          'max': limits.ssd_max,
          'lower_bar': lower,
          'lower_price': prices.ssd_per_gb,
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
          'min': limits.hdd_min,
          'max': limits.hdd_max,
          'lower_bar': lower,
          'lower_price': prices.hdd_per_gb,
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
        var self = this;

        self.ip = new components.checkbox({
          'name': 'Static IP',
          'active': options.ip,
          'price': prices.cost_per_static_ip
        });
        self.firewall = new components.checkbox({
          'name': 'Firewall',
          'active': options.firewall,
          'price': prices.cost_per_firewall
        });

        self.storages = ko.observableArray();

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
        return utils.format_price(this.price());
      }

      function calc_server_full_price() {
        return this.single_price();
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
          self.storages.push(new ssd_folder(limits.ssd_min + 5));
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
          'price': prices.cost_per_winserverweb
        },
        {
          'name': 'Server 2008 Standard',
          'price': prices.cost_per_winserverstd
        },
        {
          'name': 'Server 2008 Enterprise',
          'price': prices.cost_per_winserverent
        }
      ],
      other_windows_licenses = [
        {
          'name': 'SQL Server 2008 / 2012 Web',
          'price': prices.cost_per_mssqlserverweb
        },
        {
          'name': 'SQL Server 2008 Standard',
          'price': prices.cost_per_mssqlserverstd
        },
        {
          'name': 'SQL Server 2012 Standard',
          'price': prices.cost_per_mssqlserver12
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
            price: prices.cost_per_desktopcal,
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
          self.storages.push(new ssd_drive(limits.ssd_min + 5));
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

        self.bandwidth = new bandwidth(options.bandwidth);
        self.additional_ips = new components.account_option({
          name: 'Additional IPs',
          unit: 'IPs',
          price: prices.cost_per_static_ip,
          max: limits.ip_max,
          value: options.ips
        });
        self.additional_vlans = new components.account_option({
          name: 'Additional VLANs',
          unit: 'VLANs',
          price: prices.cost_per_vlan,
          max: limits.vlan_max,
          value: options.vlans
        });

        self.free_bandwidth = ko.observable(false);

        self.update_bandwidth = ko.computed(function() {
          if (self.free_bandwidth())
            self.bandwidth.lower_input(0);
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

      return {
        'account_details': account_details,
        'container': container,
        'virtual_machine': virtual_machine,
        'switch_disk_type': switch_disk_type
      };
    }

    return ModelsView;
  }
);
