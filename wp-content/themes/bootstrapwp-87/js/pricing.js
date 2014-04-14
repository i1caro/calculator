/* globals _ */
define(['./knockout-3.1.0.debug', 'text!./templates.html'],
  function(ko, templates) {
    var LIMITS = {
      CPU_CONTAINER_MIN: 0,
      CPU_CONTAINER_MAX: 20000, // Mhz
      CPU_INCREMENTS: 50,
      RAM_CONTAINER_MIN: 256, // MB
      RAM_INCREMENTS: 64,
      RAM_CONTAINER_MAX: 32768,
      CPU_VM_MIN: 500,
      CPU_VM_MAX: 20000, // Mhz
      RAM_VM_MIN: 256, // MB
      RAM_VM_MAX: 32768,
      HDD_MIN: 0, // GB
      HDD_MAX: 1862,
      SSD_MIN: 0,
      SSD_MAX: 1862,
      BANDWIDTH_MIN: 0, // GB
      BANDWIDTH_MAX: 1000
    };
    var UK_PRICE = {
      CPU_PER_MHZ: 0.012 *720/1000.0,
      MEMORY_PER_MB: 0.016 *720/1024.0,
      CPU_CONTAINER_PER_MHZ: 0.005 *720/1000.0,
      MEMORY_CONTAINER_PER_MB: 0.007 *720/1024.0,

      // Disk/transfer costs.
      DISK_PER_GB: 0.06,
      SSD_PER_GB: 0.15,
      BANDWIDTH_PER_GB: 0.06,

      // Extra costs.
      COST_PER_STATIC_IP:  2.00,
      COST_PER_VLAN: 5.00,
      COST_PER_FIREWALL: 5.00,
      COST_PER_WINSERVERWEB: 10.00,
      COST_PER_WINSERVERSTD: 20.00,
      COST_PER_WINSERVERENT: 45.00,
      COST_PER_WINSERVER12: 20.00,
      COST_PER_MSSQLSERVERWEB: 15.00,
      COST_PER_MSSQLSERVERSTD: 240.00,
      COST_PER_MSSQLSERVER12: 240.00,
      COST_PER_DESKTOPCAL: 4.00,
      CURRENCY: '£'
    };
    var NL_PRICE = {
      CPU_PER_MHZ: 0.015 *720/1000.0,
      MEMORY_PER_MB: 0.02 *720/1024.0,
      CPU_CONTAINER_PER_MHZ: 0.006 *720/1000.0,
      MEMORY_CONTAINER_PER_MB: 0.009 *720/1024.0,

      // Disk/transfer costs.
      DISK_PER_GB: 0.07,
      SSD_PER_GB: 0.18,
      BANDWIDTH_PER_GB: 0.06,

      // Extra costs.
      COST_PER_STATIC_IP:  2.50,
      COST_PER_VLAN: 6.00,
      COST_PER_FIREWALL: 6.00,
      COST_PER_WINSERVERWEB: 12.00,
      COST_PER_WINSERVERSTD: 24.00,
      COST_PER_WINSERVERENT: 55.00,
      COST_PER_WINSERVER12: 24.00,
      COST_PER_MSSQLSERVERWEB: 18.00,
      COST_PER_MSSQLSERVERSTD: 300.00,
      COST_PER_MSSQLSERVER12: 300.00,
      COST_PER_DESKTOPCAL: 5.00,
      CURRENCY: '€'
    };
    var US_LA_PRICE = {
      CPU_PER_MHZ: 0.018 *720/1000.0,
      MEMORY_PER_MB: 0.025 *720/1024.0,
      CPU_CONTAINER_PER_MHZ: 0.008 *720/1000.0,
      MEMORY_CONTAINER_PER_MB: 0.011 *720/1024.0,

      // Disk/transfer costs. Quoted in US dollars per month.
      DISK_PER_GB: 0.10,
      SSD_PER_GB: 0.25,
      BANDWIDTH_PER_GB: 0.15,

      // Extra costs. Quoted in US dollars per month.
      COST_PER_STATIC_IP:  3.00,
      COST_PER_VLAN: 7.50,
      COST_PER_FIREWALL: 7.50,
      COST_PER_WINSERVERWEB: 15.00,
      COST_PER_WINSERVERSTD: 30.00,
      COST_PER_WINSERVERENT: 75.00,
      COST_PER_WINSERVER12: 30.00,
      COST_PER_MSSQLSERVERWEB: 22.50,
      COST_PER_MSSQLSERVERSTD: 385.00,
      COST_PER_MSSQLSERVER12: 385.00,
      COST_PER_DESKTOPCAL: 5.50,
      CURRENCY: '$'
    };
    var US_SAN_JOSE_PRICE = _.clone(US_LA_PRICE),
        US_TEXAS_PRICE = _.clone(US_LA_PRICE),
        CANADA_PRICE = _.clone(US_LA_PRICE),
        HONG_KONG_PRICE = _.clone(US_LA_PRICE),
        AUSTRALIA_PRICE = _.clone(US_LA_PRICE);

    US_SAN_JOSE_PRICE.BANDWIDTH_PER_GB = 0.05;
    HONG_KONG_PRICE.BANDWIDTH_PER_GB = 0.40;
    AUSTRALIA_PRICE.BANDWIDTH_PER_GB = 0.65;

    var COUNTRIES_PRICES = {
      'lon-p': UK_PRICE,
      'lon-b': UK_PRICE,
      'ams-e': NL_PRICE,
      'sjc-c': US_SAN_JOSE_PRICE,
      'lax-p': US_LA_PRICE,
      'sat-p': US_TEXAS_PRICE,
      'tor-p': CANADA_PRICE,
      'hkg-e': HONG_KONG_PRICE,
      'syd-v': AUSTRALIA_PRICE
    };
    var ZONES = [
      {
        id: "lon-p",
        name: "London Portsmouth",
        flag: "UKflag.png",
      },
      {
        id: "lon-b",
        name: "London Maidenhead",
        flag: "UKflag.png",
      },
      {
        id: "ams-e",
        name: "Amsterdam",
        flag: "NLFlag.png",
      },
      {
        id: "sjc-c",
        name: "San Jose, CA",
        flag: "USAFlag.png",
      },
      {
        id: "lax-p",
        name: "Los Angeles, CA",
        flag: "USAFlag.png",
      },
      {
        id: "sat-p",
        name: "San Antonio, TX",
        flag: "USAFlag.png",
      },
      {
        id: "tor-p",
        name: "Toronto",
        flag: "CANFlag.png",
      },
      {
        id: "hkg-e",
        name: "Hong Kong",
        flag: "HKGFlag.png",
      },
      {
        id: "syd-v",
        name: "Sydney",
        flag: "AUSFlag.png",
      }
    ];
    var DOMAINS_TO_LOCATION = {
      'nl' : 'ams-e',
      'au' : 'hkg-e',
      'hk' : 'hkg-e',
      'ca' : 'tor-p',
      'uk' : 'lon-b',
      'com': 'sjc-c'
    };
    $("body").append(templates);

    function get_country_based_on_location(){
      var domain = location.host.split('.').splice(-1, 1)[0],
          local = DOMAINS_TO_LOCATION[domain];
      if (local)
        return local;
      return DOMAINS_TO_LOCATION['com'];
    }
    function pageOffset() {
      if(window.pageXOffset === undefined ){
        window.pageXOffset = document.documentElement.scrollLeft;
      }
      return window.pageXOffset;
    }
    function limit(distance, lower_bound, upper_bound) {
      if (distance < lower_bound)
        return lower_bound;
      else if (distance > upper_bound)
        return upper_bound;
      return distance;
    }
    function snap_value(value, snap) {
      if(value > 0)
          return Math.ceil(value / snap) * snap;
      else if(value < 0)
          return Math.floor(value / snap) * snap;
      else
          return value;
    }
    function compute_value(percentage, min, max, snap) {
      var value = min + (max - min) * (Math.pow(10, (percentage / 100.0)) - 1) / (10 - 1);

      return snap_value(value, snap);
    }
    function get_percentage_from_value(value, min, max, snap) {
      var snapped_value = snap_value(value, snap);
      return 43.4294*Math.log((max-10*min+9*snapped_value)/(max-min));
    }
    function sum_function(memo, obj) {
      var price = obj.price();
      return memo + price;
    }
    function format_price(price, signal) {
      var clean_price = price ? price.toFixed(2) : '0.00';
      return signal + clean_price;
    }
    function sum_attr(attribute) {
      var price_func = attribute.price();
      if (price_func)
        return price_func;
      return 0;
    }
    function bandwidth(lower, prices) {
      return new single_slider({
        'currency': prices.CURRENCY,
        'name': 'Data',
        'min': LIMITS.BANDWIDTH_MIN,
        'max': LIMITS.BANDWIDTH_MAX,
        'lower_bar': lower,
        'lower_price': prices.BANDWIDTH_PER_GB,
        'upper_price': prices.BANDWIDTH_PER_GB,
        'snap': 1,
        'unit': 'GB'
      });
    }
    function cpu_virtual_machine(lower, prices) {
      return new single_slider({
        'currency': prices.CURRENCY,
        'name': 'CPU',
        'min': LIMITS.CPU_VM_MIN,
        'max': LIMITS.CPU_VM_MAX,
        'lower_bar': lower,
        'lower_price': prices.CPU_PER_MHZ,
        'upper_price': prices.CPU_PER_MHZ,
        'snap': LIMITS.CPU_INCREMENTS,
        'unit': 'MHz'
      });
    }
    function cpu_container(lower_upper, prices) {
      return new double_slider({
        'currency': prices.CURRENCY,
        'name': 'CPU',
        'min': LIMITS.CPU_CONTAINER_MIN,
        'max': LIMITS.CPU_CONTAINER_MAX,
        'lower_bar': lower_upper[0],
        'lower_price': prices.CPU_CONTAINER_PER_MHZ,
        'upper_bar': lower_upper[1],
        'upper_price': prices.CPU_CONTAINER_PER_MHZ,
        'snap': LIMITS.CPU_INCREMENTS,
        'unit': 'MHz'
      });
    }
    function ram_virtual_machine(lower, prices) {
      return new single_slider({
        'currency': prices.CURRENCY,
        'name': 'RAM',
        'min': LIMITS.RAM_VM_MIN,
        'max': LIMITS.RAM_VM_MAX,
        'lower_bar': lower,
        'lower_price': prices.MEMORY_PER_MB,
        'upper_price': prices.MEMORY_PER_MB,
        'snap': LIMITS.RAM_INCREMENTS,
        'unit': 'MB'
      });
    }
    function ram_container(lower_upper, prices) {
      return new double_slider({
        'currency': prices.CURRENCY,
        'name': 'RAM',
        'min': LIMITS.RAM_CONTAINER_MIN,
        'max': LIMITS.RAM_CONTAINER_MAX,
        'lower_bar': lower_upper[0],
        'lower_price': prices.MEMORY_CONTAINER_PER_MB,
        'upper_bar': lower_upper[1],
        'upper_price': prices.MEMORY_CONTAINER_PER_MB,
        'snap': LIMITS.RAM_INCREMENTS,
        'unit': 'MB'
      });
    }
    function ssd_folder(lower, prices) {
      var self = this;
      self = new single_slider({
        'currency': prices.CURRENCY,
        'name': 'SSD',
        'min': LIMITS.SSD_MIN,
        'max': LIMITS.SSD_MAX,
        'lower_bar': lower,
        'lower_price': prices.SSD_PER_GB,
        'upper_price': prices.SSD_PER_GB,
        'snap': 1,
        'unit': 'GB'
      });
      self.template = 'ssd-folder-template';
      self.type = 'ssd';
      return self;
    }
    function ssd_drive(lower, prices) {
      var self = this;
      self = new single_slider({
        'currency': prices.CURRENCY,
        'name': 'SSD',
        'min': LIMITS.SSD_MIN,
        'max': LIMITS.SSD_MAX,
        'lower_bar': lower,
        'lower_price': prices.SSD_PER_GB,
        'upper_price': prices.SSD_PER_GB,
        'snap': 1,
        'unit': 'GB'
      });
      self.template = 'ssd-drive-template';
      self.type = 'ssd';
      return self;
    }
    function hdd_drive(lower, prices) {
      var self = this;
      self = new single_slider({
        'currency': prices.CURRENCY,
        'name': 'HDD',
        'min': LIMITS.HDD_MIN,
        'max': LIMITS.HDD_MAX,
        'lower_bar': lower,
        'lower_price': prices.DISK_PER_GB,
        'upper_price': prices.DISK_PER_GB,
        'snap': 1,
        'unit': 'GB'
      });
      self.type = 'hdd';
      self.template = 'drive-template';
      return self;
    }
    function single_slider(options) {
      options.double_bars = false;
      var self = new slider(options);

      self.choosen = ko.computed(function() {
        return self.lower_input();
      });
      return self;
    }
    function double_slider(options){
      options.double_bars = true;
      var self = new slider(options);
      self.upper_input = ko.computed({
        read: function() {
          return parseInt(compute_value(self.upper(), options.min, options.max, options.snap).toFixed(0));
        },
        write: function(value) {
          var lower = self.lower_input();
          if (value < lower)
            value = lower;
          else if (value > options.max)
            value = options.max;
          var percentage = get_percentage_from_value(value, options.min, options.max, options.snap);
          self.upper(percentage);
        },
        owner: self
      });
      self.upper_price = ko.computed(function() {
        return (self.upper_input() - self.lower_input()) * options.upper_price() * 2;
      });
      self.upper_style = function() {
        return self.upper() + '%';
      };
      self.choosen = ko.computed(function() {
        return [self.lower_input(), self.upper_input()];
      });
      return self;
    }
    function slider(options) {
      var self = this;
      self.unit = options.unit;
      self.name = options.name;
      self.double_bars = options.double_bars;
      self.lower = ko.observable(get_percentage_from_value(options.lower_bar, options.min, options.max, options.snap));
      self.upper = ko.observable(get_percentage_from_value(options.upper_bar, options.min, options.max, options.snap));
      self.lower_input = ko.computed({
        read: function() {
          return parseInt(compute_value(self.lower(), options.min, options.max, options.snap).toFixed(0));
        },
        write: function(value) {
          var upper = self.upper_input();
          if (value < options.min)
            value = options.min;
          if (value > upper)
            value = upper;
          var percentage = get_percentage_from_value(value, options.min, options.max, options.snap);
          self.lower(percentage);
        },
        owner: self
      });

      self.value = ko.computed(function() {
        return compute_value(self.lower(), options.min, options.max, options.snap);
      });
      self.price = ko.computed(function() {
        return self.lower_input() * options.lower_price();
      });

      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.currency());
      });
      self.upper_input = function() {
        return options.max;
      };
      self.lower_style = function() {
        return self.lower() + '%';
      };
    }

    function checkbox(options) {
      var self = this;
      self.name = options.name;
      self.active = ko.observable(options.active);
      self.price = ko.computed(function() {
        if (self.active())
          return options.price();
        else
          return 0;
      });
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.currency());
      });
      self.choosen = ko.computed(function() {
        return self.active();
      });
    }
    function account_option(options) {
      var self = this;
      self.name = options.name;
      self.range = _.range(options.range);
      self.value = ko.observable(options.value);
      self.price = ko.computed(function() {
        return self.value() * options.price();
      });
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.currency());
      });
      self.choosen = ko.computed(function(){
        return self.value();
      });
    }
    function server_licenses(options, currency, choosen) {
      var self = this,
          value;
      self.options = ko.observableArray(options);
      value = self.options()[choosen] || null;
      self.value = ko.observable(value);
      self.remove_option = function() {
        self.value(0);
      };
      self.price = ko.computed(function(){
        var value = self.value();
        if (value)
          return value.price();
        return 0;
      });
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), currency());
      });
      self.choosen = ko.computed(function() {
        return _.indexOf(self.options(), self.value());
      });
    }
    function remote_desktops(options) {
      var self = this;
      self.name = 'Remote Desktop CALs';
      self.selected = ko.observable(options.choosen);
      self.value = ko.computed(function(){
        if (self.selected())
          return {
            name: self.name,
            price: self.price
          };
      });
      self.price_unit = options.price;
      self.price = ko.computed(function(){
        return self.price_unit() * self.selected();
      });
      self.remove_option = function() {
        self.selected(0);
      };
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.currency());
      });
      self.choosen = ko.computed(function() {
        return self.selected() || 0;
      });
    }
    var unique_id = {
      build: function() {
        unique_id.prev++;
        return unique_id.name + unique_id.prev;
      },
      name: 'server',
      prev: 0
    };
    function serialize_function() {
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

    function base_server(options, builder) {
      var self = this,
          i;
      self.ip = new checkbox({'currency': options.prices.CURRENCY, 'name': 'Static IP', 'active': options.ip, 'price': options.prices.COST_PER_STATIC_IP});
      self.firewall = new checkbox({'currency': options.prices.CURRENCY, 'name': 'Firewall', 'active': options.firewall, 'price': options.prices.COST_PER_FIREWALL});

      self.drives = ko.observableArray([]);

      // Init
      for (i = 0; i < options.ssd.length; i++) {
        self.drives.push(new builder.ssd(options.ssd[i], options.prices));
      }
      for (i = 0; i < options.hdd.length; i++) {
        self.drives.push(new builder.hdd(options.hdd[i], options.prices));
      }

      // Actions
      self.remove_disk = function(data, event) {
        self.drives.remove(data.data);
      };
    }


    function get_base_server_price() {
      var total = 0;
      total += this.cpu.price();
      total += this.ram.price();
      total += this.ip.price();
      total += this.firewall.price();
      total += _.reduce(this.drives(), sum_function, 0);

      return total;
    }
    function container(options) {
      var builder = {
            ssd: ssd_folder,
            hdd: hdd_drive
          },
          self = new base_server(options, builder);

      // Normal attributes
      self.cpu = new cpu_container(options.cpu, options.prices);
      self.ram = new ram_container(options.ram, options.prices);

      self.price = ko.computed(get_base_server_price, self);
      self.formatted_price = ko.computed(function() {
        return format_price(self.price(), options.prices.CURRENCY());
      });

      self.burst_price = ko.computed(function() {
        var total = 0;
        total += self.cpu.upper_price();
        total += self.ram.upper_price();

        return total;
      });
      self.add_disk = function(data, event) {
        self.drives.push(new ssd_folder(50, options.prices));
        $("#pop1, #pop2, #pop3").fadeOut(2000);
      };
      self.serialize = ko.computed(serialize_function, self);
      return self;
    }
    function virtual_machine(options) {
      var builder = {
            ssd: ssd_drive,
            hdd: hdd_drive
          },
          self = new base_server(options, builder);
      self.unique_id = unique_id.build();

      // Normal attributes
      self.cpu = new cpu_virtual_machine(options.cpu, options.prices);
      self.ram = new ram_virtual_machine(options.ram, options.prices);

      self.windows_server_licenses = new server_licenses([
        {'name': 'Web Server 2008', 'price': options.prices.COST_PER_WINSERVERWEB},
        {'name': 'Server 2008 Standard', 'price': options.prices.COST_PER_WINSERVERSTD},
        {'name': 'Server 2012 Standard', 'price': options.prices.COST_PER_WINSERVERENT},
        {'name': 'Server 2008 Enterprise', 'price': options.prices.COST_PER_WINSERVER12}
      ], options.prices.CURRENCY, options.windows_server_license);
      self.additional_microsoft_licenses = new server_licenses([
        {'name': 'SQL Server 2008 Web', 'price': options.prices.COST_PER_MSSQLSERVERWEB},
        {'name': 'SQL Server 2008 Std', 'price': options.prices.COST_PER_MSSQLSERVERSTD},
        {'name': 'SQL Server 2012', 'price': options.prices.COST_PER_MSSQLSERVER12}
      ], options.prices.CURRENCY, options.additional_microsoft_license);
      self.remote_desktops = new remote_desktops({
        'currency': options.prices.CURRENCY, 'price': options.prices.COST_PER_DESKTOPCAL, 'choosen': options.remote_desktops
      });

      //Computed
      self.price = ko.computed(function() {
        var total = get_base_server_price.call(self);

        total += sum_attr(self.windows_server_licenses);
        total += sum_attr(self.additional_microsoft_licenses);
        total += sum_attr(self.remote_desktops);

        return total;
      });
      self.formatted_price = ko.computed(function() {
        return format_price(self.price(), options.prices.CURRENCY());
      });


      // Actions
      self.switch_to_hdd = function(data, event) {
        self.switch_type_disk(data.data, event, hdd_drive);
      };
      self.switch_to_ssd = function(data, event) {
        self.switch_type_disk(data.data, event, ssd_drive);
      };
      self.switch_type_disk = function(data, event, factory) {
        var index = _.indexOf(self.drives(), data),
            new_drive;
        if (index > -1) {
          new_drive = new factory(data.lower_input(), options.prices);
          self.drives.remove(data);
          self.drives.splice(index, 0, new_drive);
        }
      };
      self.add_disk = function(data, event) {
        self.drives.push(new ssd_drive(50, options.prices));
        $("#pop1, #pop2, #pop3").fadeOut(2000);
      };
      self.serialize = ko.computed(function() {
        var machine_data = serialize_function.call(self),
            result = [
              self.windows_server_licenses.choosen(),
              self.additional_microsoft_licenses.choosen(),
              self.remote_desktops.choosen()
            ];
        machine_data.push(result);
        return machine_data;
      });
      return self;
    }

    function account_details(options) {
      var self = this;
      self.bandwidth = new bandwidth(options.lower, options.prices);
      self.additional_ips = new account_option({currency: options.prices.CURRENCY,
        range: 6,
        name: 'Additional IPs',
        price: options.prices.COST_PER_STATIC_IP,
        value: options.ips
      });
      self.additional_vlans = new account_option({currency: options.prices.CURRENCY,
        range: 6,
        name: 'Additional VLANs',
        price: options.prices.COST_PER_VLAN,
        value: options.virtual_lans
      });

      self.price = ko.computed(function() {
        var total = 0;
        total += self.bandwidth.price();
        total += self.additional_vlans.price();
        total += self.additional_vlans.price();

        return total;
      });
      self.serialize = ko.computed(function() {
        var result = [
          self.bandwidth.choosen(),
          self.additional_ips.choosen(),
          self.additional_vlans.choosen()
        ];
        return result;
      });
    }

    function Parser(list) {
      var self = this;
      for (var i=0; i < list.length; i++) {
        self.push(list[i]);
      }

      self.build_virtual_machine = function() {
        var result = {
          'cpu': self.shift(),
          'ram': self.shift(),
          'ip': self.shift(),
          'firewall': self.shift(),
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
          'ip': self.shift(),
          'firewall': self.shift(),
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
          'virtual_lans': self.shift(),
          'ips': self.shift()
        };
      };
      self.parse = function() {
        var data = {};
        if (self.length) {
          data['virtual_machines'] = self.get_virtual_machines();
          data['containers'] = self.get_containers();
          data['account_details'] = self.build_account_details();
          data['country'] = self.shift();
        }
        return data;
      };
    }
    Parser.prototype = Object.create(Array.prototype);
    Parser.constructor = Parser;

    function parse_string_into_data(string) {
      var no_hash = string.substring(1),
          decoded = decodeURI(no_hash),
          parser = new Parser(decoded.split(','));
      return parser.parse();
    }
    // Main View Model
    function viewModel() {
      var self = this,
          first_country = get_country_based_on_location(),
          initial_data = {
            'virtual_machines': [],
            'containers': [],
            'account_details': {
              'bandwidth': 10,
              'ips': 0,
              'vlans': 10
            },
            'country': first_country
          };

      // See if the url can turn into a data set
      if (location.hash)
        initial_data = parse_string_into_data(location.hash);
      //Constants
      self.country_flags = ZONES;

      // Actions
      var move_handler = function(event) {
            var data = event.data,
                mouse_move = ((event.clientX - data.offset) * 100) / data.bar_size,
                distance = limit(data.start + mouse_move, data.lower_bound, data.upper_bound);
            data.element(distance);
          },
          stop_move_handler  = function(event) {
            $(document).off('mousemove', move_handler);
          },
          start_mouse_down = function(data, event, element, lower_bound, upper_bound) {
            $(document).on('mousemove', {
              offset: event.pageX - pageOffset(),
              start: element(),
              bar_size: $(event.currentTarget).parents("div.noUi-base").width(),
              element: element,
              lower_bound: lower_bound,
              upper_bound: upper_bound

            }, move_handler);
            $(document).one('mouseup', stop_move_handler);
          };
      self.mouse_down_lower = function(data, event) {
        var upper_bound = 100;
        if (data.double_bars)
          upper_bound = data.upper();
        start_mouse_down(data, event, this.lower, 0, upper_bound);
      };
      self.mouse_down_upper = function(data, event) {
        var lower_bound = 0;
        if (data.double_bars)
          lower_bound = data.lower();
        start_mouse_down(data, event, this.upper, lower_bound, 100);
      };
      self.change_country = function(data, event) {
        self.prices(data.id);
      };
      self.add_container = function() {
        self.containers.push(new container({
          cpu: [0, 2000],
          ram: [256, 1024],
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [],
          prices: self.prices()
        }));
      };
      self.add_virtual_machine = function() {
        self.virtual_machines.push(new virtual_machine({
          cpu: 2000,
          ram: 1024,
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [],
          prices: self.prices()
        }));
      };
      self.remove_virtual_machine = function(data, event) {
        self.virtual_machines.remove(data.server);
      };
      self.remove_container = function(data, event) {
        self.containers.remove(data.server);
      };
      // Normal attributes
      self.country = ko.observable(initial_data['country']);

      function build_prices_obj() {
        var result = {};
        for (var key in UK_PRICE)
          result[key] = ko.observable();
        return result;
      }
      self.countries_prices = build_prices_obj();
      self.prices = ko.computed({
        read: function() {
          return self.countries_prices;
        },
        write: function(value) {
          self.country(value);
          var prices = COUNTRIES_PRICES[value];
          for (var key in self.countries_prices) {
            self.countries_prices[key](prices[key]);
          }
        },
        owner: self
      });
      // Set country for first time
      self.prices(self.country());

      self.virtual_machines = ko.observableArray();
      var temp,
          temp_prices = self.prices();
      for (var i=0; i < initial_data['virtual_machines'].length; i++) {
        temp = initial_data['virtual_machines'][i];
        temp['prices'] = temp_prices;
        self.virtual_machines.push(new virtual_machine(temp));
      }
      self.containers = ko.observableArray();
      for (i=0; i < initial_data.containers.length; i++) {
        temp = initial_data['containers'][i];
        temp['prices'] = temp_prices;
        self.containers.push(new container(temp));
      }
      self.account_details = new account_details({
        lower: initial_data['account_details']['bandwidth'],
        virtual_lans: initial_data['account_details']['virtual_lans'],
        ips: initial_data['account_details']['ips'],
        prices: self.prices()
      });

      // Computed
      self.price =  ko.computed(function() {
        var total = 0;

        total += _.reduce(self.virtual_machines(), sum_function, 0);
        total += _.reduce(self.containers(), sum_function, 0);
        total += self.account_details.price();

        return total;
      });
      self.burst_price = ko.computed(function() {
        var total = _.reduce(self.containers(), function(memo, obj) {
          var price = parseFloat(obj.burst_price());
          if (_.isNumber(price))
            return memo + price;
          return memo;
        }, 0);

        return total;
      });
      self.serialize = ko.computed(function() {
        var virtual_machines = self.virtual_machines(),
            containers = self.containers(),
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
        result.push(self.account_details.serialize());
        result.push(self.country());

        var result_string = _.flatten(result).join(',');
        location.hash = encodeURI(result_string);
        return result_string;
      });

      self.formatted_burst_price = ko.computed(function(){
        return format_price(self.burst_price(), self.prices().CURRENCY());
      });
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), self.prices().CURRENCY());
      });
    }
    var model = new viewModel();
    ko.applyBindings(model);
    tutorialsPop();
    function tutorialsPop(){
      var popServer = _.once(function(){
        $("#pop1").fadeOut(2000);
        $("#pop2").fadeIn(2000);
      });
      var popDisk = _.once(function(){
        var popstr =
          '<div id="pop3" class="popover left" style="position: absolute;top: -48px;left: -185px;width: 150px;white-space: normal;">' +
            '<div class="arrow" style="border-left:5px solid #313785"></div>' +
            '<div class="popover-content" style="background-color:#313785;color: #fff;border-radius: 3px;">' +
            'Click here to add drives and storage to this server.</div>' +
          '</div>'
        $("a[data-bind='event: {click: add_disk}']").css("position","relative").prepend(popstr);
        $("#pop1, #pop2").fadeOut(2000);
        $("#pop3").fadeIn(2000);
      });
      $("#pop1").fadeIn(2000);
      $(".zoneselector").click(popServer);
      $(".hover-large").click(popDisk);
      $("my-event blue-hover hover-small").click(function(){
        $("#pop1, #pop2, #pop3").fadeOut(2000);
      });
    }
  }
);


