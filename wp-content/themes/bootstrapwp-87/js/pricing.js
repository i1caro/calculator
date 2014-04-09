/* globals _ */
define(['./knockout-3.1.0.debug', 'text!./templates.html'],
  function(ko, templates) {
    var LIMITS = {
      CPU_CONTAINER_MIN: 0,
      CPU_CONTAINER_MAX: 20000, // Mhz
      RAM_CONTAINER_MIN: 256, // MB
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

    $("body").append(templates);
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
    function compute_value(value, min, max) {
      var parcel = (max - min)/100;
      return value * parcel + min;
    }
    function get_computed_value_back(value, min, max) {
      var parcel = (max - min)/100;
      return (value - min)/parcel;
    }
    function sum_function(memo, obj) {
      var price = parseFloat(obj.price());
      if (_.isNumber(price))
        return memo + price;
      return memo;
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
      return new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'Data',
        'min': LIMITS.BANDWIDTH_MIN,
        'max': LIMITS.BANDWIDTH_MAX,
        'lower_bar': lower,
        'lower_price': prices.BANDWIDTH_PER_GB,
        'upper_bar': 100,
        'upper_price': prices.BANDWIDTH_PER_GB,
        'unit': 'GB',
        'double_bars': false
      });
    }
    function cpu_virtual_machine(lower, prices) {
      return new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'CPU',
        'min': LIMITS.CPU_VM_MIN,
        'max': LIMITS.CPU_VM_MAX,
        'lower_bar': lower,
        'lower_price': prices.CPU_PER_MHZ,
        'upper_bar': 100,
        'upper_price': prices.CPU_PER_MHZ,
        'unit': 'MHz',
        'double_bars': false
      });
    }
    function cpu_container(lower, upper, prices) {
      return new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'CPU',
        'min': LIMITS.CPU_CONTAINER_MIN,
        'max': LIMITS.CPU_CONTAINER_MAX,
        'lower_bar': lower,
        'lower_price': prices.CPU_CONTAINER_PER_MHZ,
        'upper_bar': upper,
        'upper_price': prices.CPU_CONTAINER_PER_MHZ,
        'unit': 'MHz',
        'double_bars': true
      });
    }
    function ram_virtual_machine(lower, prices) {
      return new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'RAM',
        'min': LIMITS.RAM_VM_MIN,
        'max': LIMITS.RAM_VM_MAX,
        'lower_bar': lower,
        'lower_price': prices.MEMORY_PER_MB,
        'upper_bar': 100,
        'upper_price': prices.MEMORY_PER_MB,
        'unit': 'MB',
        'double_bars': false
      });
    }
    function ram_container(lower, upper, prices) {
      return new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'RAM',
        'min': LIMITS.RAM_CONTAINER_MIN,
        'max': LIMITS.RAM_CONTAINER_MAX,
        'lower_bar': lower,
        'lower_price': prices.MEMORY_CONTAINER_PER_MB,
        'upper_bar': upper,
        'upper_price': prices.MEMORY_CONTAINER_PER_MB,
        'unit': 'MB',
        'double_bars': true
      });
    }
    function ssd_folder(lower, prices) {
      var self = this;
      self.drive = new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'SSD',
        'min': LIMITS.SSD_MIN,
        'max': LIMITS.SSD_MAX,
        'lower_bar': lower,
        'lower_price': prices.SSD_PER_GB,
        'upper_bar': 100,
        'upper_price': prices.SSD_PER_GB,
        'unit': 'GB',
        'double_bars': false
      });
      self.price = self.drive.price;
      self.template = 'ssd-folder-template';
    }
    function ssd_drive(lower, prices) {
      var self = this;
      self.drive = new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'SSD',
        'min': LIMITS.SSD_MIN,
        'max': LIMITS.SSD_MAX,
        'lower_bar': lower,
        'lower_price': prices.SSD_PER_GB,
        'upper_bar': 100,
        'upper_price': prices.SSD_PER_GB,
        'unit': 'GB',
        'double_bars': false
      });
      self.price = self.drive.price;
      self.template = 'ssd-drive-template';
    }
    function hdd_drive(lower, prices) {
      var self = this;
      self.drive = new handle_bar({
        'currency': prices.CURRENCY,
        'name': 'HDD',
        'min': LIMITS.HDD_MIN,
        'max': LIMITS.HDD_MAX,
        'lower_bar': lower,
        'lower_price': prices.DISK_PER_GB,
        'upper_bar': 100,
        'upper_price': prices.DISK_PER_GB,
        'unit': 'GB',
        'double_bars': false
      });
      self.price = self.drive.price;
      self.template = 'drive-template';
    }
    function handle_bar(options) {
      var self = this;
      self.unit = options.unit;
      self.name = options.name;
      self.double_bars = options.double_bars;
      self.lower = ko.observable(options.lower_bar);
      self.upper = ko.observable(options.upper_bar);
      self.lower_input = ko.computed({
        read: function() {
          return parseInt(compute_value(self.lower(), options.min, options.max).toFixed(0));
        },
        write: function(value) {
          var upper = self.upper_input();
          if (value < options.min)
            value = options.min;
          if (value > upper)
            value = upper;
          var percentage = get_computed_value_back(value, options.min, options.max);
          self.lower(percentage);
        },
        owner: self
      });
      self.upper_input = ko.computed({
        read: function() {
          return parseInt(compute_value(self.upper(), options.min, options.max).toFixed(0));
        },
        write: function(value) {
          var lower = self.lower_input();
          if (value < lower)
            value = lower;
          else if (value > options.max)
            value = options.max;
          var percentage = get_computed_value_back(value, options.min, options.max);
          self.upper(percentage);
        },
        owner: self
      });
      self.value = ko.computed(function() {
        return compute_value(self.lower(), options.min, options.max);
      });
      self.price = ko.computed(function() {
        return self.lower_input() * options.lower_price();
      });
      self.upper_price = ko.computed(function() {
        return (self.upper_input() - self.lower_input()) * options.upper_price();
      });
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.currency());
      });

      self.lower_style = function() {
        return self.lower() + '%';
      };
      self.upper_style = function() {
        return self.upper() + '%';
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
    }
    function server_licenses(options, currency) {
      var self = this;
      self.options = ko.observableArray(options);
      self.value = ko.observable(0);
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
    }
    function remote_desktops(options) {
      var self = this;
      self.name = 'Remote Desktop CALs';
      self.selected = ko.observable(0);
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
    }
    var unique_id = {
      build: function() {
        unique_id.prev++;
        return unique_id.name + unique_id.prev;
      },
      name: 'server',
      prev: 0
    };
    function container(options) {
      var self = this, i;

      // Normal attributes
      self.range = [
        new cpu_container(options.cpu.lower, options.cpu.upper, options.prices),
        new ram_container(options.ram.lower, options.ram.upper, options.prices)
      ];

      self.aditional_options = [
        new checkbox({'currency': options.prices.CURRENCY, 'name': 'Static IP', 'active': options.ip, 'price': options.prices.COST_PER_STATIC_IP}),
        new checkbox({'currency': options.prices.CURRENCY, 'name': 'Firewall', 'active': options.firewall, 'price': options.prices.COST_PER_FIREWALL})
      ];
      self.drives = ko.observableArray([]);
      // Init
      for (i = 0; i < options.drives.ssd.length; i++) {
        self.drives.push(new ssd_folder(options.drives.ssd[i], options.prices));
      }

      // Actions
      self.remove_disk = function(data, event) {
        self.drives.remove(data.data);
      };
      self.add_disk = function(data, event) {
        self.drives.push(new ssd_folder(20, options.prices));
      };

      self.price = ko.computed(function() {
        var total = 0;
        total += _.reduce(self.range, sum_function, 0);
        total += _.reduce(self.aditional_options, sum_function, 0);
        total += _.reduce(self.drives(), sum_function, 0);

        return total;
      });
      self.burst_price = ko.computed(function() {
        var total = _.reduce(self.range, function(memo, obj) {
          var price = parseFloat(obj.upper_price());
          if (_.isNumber(price))
            return memo + price;
          return memo;
        }, 0);
        return total;
      });

      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.prices.CURRENCY());
      });
    }
    function virtual_machine(options) {
      var self = this, i;
      self.unique_id = unique_id.build();

      // Normal attributes
      self.range = [
        new cpu_virtual_machine(options.cpu.upper, options.prices),
        new ram_virtual_machine(options.ram.upper, options.prices)
      ];
      self.aditional_options = [
        new checkbox({'currency': options.prices.CURRENCY, 'name': 'Static IP', 'active': options.ip, 'price': options.prices.COST_PER_STATIC_IP}),
        new checkbox({'currency': options.prices.CURRENCY, 'name': 'Firewall', 'active': options.firewall, 'price': options.prices.COST_PER_FIREWALL})
      ];
      self.drives = ko.observableArray([]);

      self.windows_server_licenses = new server_licenses([
        {'name': 'Web Server 2008', 'price': options.prices.COST_PER_WINSERVERWEB},
        {'name': 'Server 2008 Standard', 'price': options.prices.COST_PER_WINSERVERSTD},
        {'name': 'Server 2012 Standard', 'price': options.prices.COST_PER_WINSERVERENT},
        {'name': 'Server 2008 Enterprise', 'price': options.prices.COST_PER_WINSERVER12}
      ], options.prices.CURRENCY);
      self.aditional_microsoft_licenses = new server_licenses([
        {'name': 'SQL Server 2008 Web', 'price': options.prices.COST_PER_MSSQLSERVERWEB},
        {'name': 'SQL Server 2008 Std', 'price': options.prices.COST_PER_MSSQLSERVERSTD},
        {'name': 'SQL Server 2012', 'price': options.prices.COST_PER_MSSQLSERVER12}
      ], options.prices.CURRENCY);

      self.remote_desktops = new remote_desktops({'currency': options.prices.CURRENCY, 'price': options.prices.COST_PER_DESKTOPCAL});

      // Init
      for (i = 0; i < options.drives.ssd.length; i++) {
        self.drives.push(new ssd_drive(options.drives.ssd[i], options.prices));
      }
      for (i = 0; i < options.drives.hdd.length; i++) {
        self.drives.push(new hdd_drive(options.drives.hdd[i], options.prices));
      }

      //Computed
      self.price = ko.computed(function() {
        var total = 0;

        total += _.reduce(self.range, sum_function, 0);
        total += _.reduce(self.aditional_options, sum_function, 0);
        total += _.reduce(self.drives(), sum_function, 0);

        total += sum_attr(self.windows_server_licenses);
        total += sum_attr(self.aditional_microsoft_licenses);
        total += sum_attr(self.remote_desktops);

        return total;
      });

      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), options.prices.CURRENCY());
      });

      // Actions
      self.remove_disk = function(data, event) {
        self.drives.remove(data.data);
      };
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
          new_drive = new factory(data.drive.lower(), options.prices);
          self.drives.remove(data);
          self.drives.splice(index, 0, new_drive);
        }
      };
      self.add_disk = function(data, event) {
        self.drives.push(new ssd_drive(20, options.prices));
      };
    }
    function account_details(options) {
      var self = this;
      self.bandwidth = new bandwidth(options.lower, options.prices);
      self.options = [
        new account_option({currency: options.prices.CURRENCY, range: 6, name: 'Additional IPs', price: options.prices.COST_PER_STATIC_IP, value: 0}),
        new account_option({currency: options.prices.CURRENCY, range: 6, name: 'Additional VLANs', price: options.prices.COST_PER_VLAN, value: 0})
      ];
      self.price = ko.computed(function() {
        var options_price = _.reduce(self.options, function(memo, option) {
          return memo + option.price();
        }, 0);
        return self.bandwidth.price() + options_price;
      });
    }

    // Main View Model
    function viewModel() {
      // Actions
      var self = this;
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
        self.prices(event.currentTarget.id);
      };
      self.add_container = function() {
        self.containers.push(new container({
          cpu: {lower:0, upper: 10},
          ram: {lower:0, upper: 2.36307},
          ip: true,
          firewall: false,
          drives: {
            ssd: [],
            hdd: [],
          },
          prices: self.prices()
        }));
      };
      self.add_virtual_machine = function() {
        self.virtual_machines.push(new virtual_machine({
          cpu: {upper: 7.6923},
          ram: {upper: 2.36307},
          ip: true,
          firewall: false,
          drives: {
            ssd: [],
            hdd: [],
          },
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
      self.country = ko.observable('lon-p');

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
      self.prices('lon-p');
      self.virtual_machines = ko.observableArray();
      self.containers = ko.observableArray();
      self.containers.push(new container({
        cpu: {lower:0, upper: 10},
        ram: {lower:0, upper: 2.36307},
        ip: true,
        firewall: false,
        drives: {
          ssd: [0.53763],
        },
        prices: self.prices()
      }));
      self.virtual_machines.push(new virtual_machine({
        cpu: {upper: 7.6923},
        ram: {upper: 2.36307},
        ip: true,
        firewall: false,
        drives: {
          ssd: [],
          hdd: [1.6129],
        },
        prices: self.prices()
      }));
      self.account_details = new account_details({lower:10, vms: 0, ips: 0, prices: self.prices()});


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

      self.formatted_burst_price = ko.computed(function(){
        return format_price(self.burst_price(), self.prices().CURRENCY());
      });
      self.formatted_price = ko.computed(function(){
        return format_price(self.price(), self.prices().CURRENCY());
      });
    }
    var model = new viewModel();
    ko.applyBindings(model);
  }
);


