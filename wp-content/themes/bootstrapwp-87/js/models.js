/* globals _ */

define(['./knockout-3.1.0', './constants', './utils', './parser'], function(ko, CONSTANTS, utils, parser) {
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
    return 43.4294 * Math.log((max - 10 * min + 9 * snapped_value) / (max - min));
  }
  function sum_attr(attribute) {
    var price_func = attribute.price();
    if (price_func)
      return price_func;
    return 0;
  }
  function bandwidth(lower, prices) {
    return new single_slider({
      'currency': prices.currency,
      'name': 'Data',
      'min': CONSTANTS.LIMITS.bandwidth_min,
      'max': CONSTANTS.LIMITS.bandwidth_max,
      'lower_bar': lower,
      'lower_price': prices.bandwidth_per_gb,
      'upper_price': prices.bandwidth_per_gb,
      'snap': 1,
      'unit': 'GB'
    });
  }
  function cpu_virtual_machine(lower, prices) {
    return new single_slider({
      'currency': prices.currency,
      'name': 'CPU',
      'min': CONSTANTS.LIMITS.cpu_vm_min,
      'max': CONSTANTS.LIMITS.cpu_vm_max,
      'lower_bar': lower,
      'lower_price': prices.cpu_per_mhz,
      'upper_price': prices.cpu_per_mhz,
      'snap': CONSTANTS.LIMITS.cpu_increments,
      'unit': 'MHz'
    });
  }
  function cpu_container(lower_upper, prices) {
    return new double_slider({
      'currency': prices.currency,
      'name': 'CPU',
      'min': CONSTANTS.LIMITS.cpu_container_min,
      'max': CONSTANTS.LIMITS.cpu_container_max,
      'lower_bar': lower_upper[0],
      'lower_price': prices.cpu_container_per_mhz,
      'upper_bar': lower_upper[1],
      'upper_price': prices.cpu_container_per_mhz,
      'snap': CONSTANTS.LIMITS.cpu_increments,
      'unit': 'MHz'
    });
  }
  function ram_virtual_machine(lower, prices) {
    return new single_slider({
      'currency': prices.currency,
      'name': 'RAM',
      'min': CONSTANTS.LIMITS.ram_vm_min,
      'max': CONSTANTS.LIMITS.ram_vm_max,
      'lower_bar': lower,
      'lower_price': prices.memory_per_mb,
      'upper_price': prices.memory_per_mb,
      'snap': CONSTANTS.LIMITS.ram_increments,
      'unit': 'MB'
    });
  }
  function ram_container(lower_upper, prices) {
    return new double_locked_sliders({
      'currency': prices.currency,
      'name': 'RAM',
      'min': CONSTANTS.LIMITS.ram_container_min,
      'max': CONSTANTS.LIMITS.ram_container_max,
      'lower_bar': lower_upper[0],
      'lower_price': prices.memory_container_per_mb,
      'upper_bar': lower_upper[1],
      'upper_price': prices.memory_container_per_mb,
      'snap': CONSTANTS.LIMITS.ram_increments,
      'unit': 'MB'
    });
  }
  function ssd_folder(lower, prices) {
    var self = this;
    self = new single_slider({
      'currency': prices.currency,
      'name': 'SSD',
      'min': CONSTANTS.LIMITS.ssd_min,
      'max': CONSTANTS.LIMITS.ssd_max,
      'lower_bar': lower,
      'lower_price': prices.ssd_per_gb,
      'upper_price': prices.ssd_per_gb,
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
      'currency': prices.currency,
      'name': 'SSD',
      'min': CONSTANTS.LIMITS.ssd_min,
      'max': CONSTANTS.LIMITS.ssd_max,
      'lower_bar': lower,
      'lower_price': prices.ssd_per_gb,
      'upper_price': prices.ssd_per_gb,
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
      'currency': prices.currency,
      'name': 'HDD',
      'min': CONSTANTS.LIMITS.hdd_min,
      'max': CONSTANTS.LIMITS.hdd_max,
      'lower_bar': lower,
      'lower_price': prices.disk_per_gb,
      'upper_price': prices.disk_per_gb,
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

    self.choosen = self.lower_input;
    return self;
  }

  // to much duplicated code do it again
  function double_locked_sliders(options) {
    var self = new double_slider(options);

    self.lower_input = ko.computed({
      read: function() {
        var result = parseInt(compute_value(self.lower(), options.min, options.max, options.snap).toFixed(0)),
            upper_lock = result * 4;
        if (upper_lock < self.upper_input()) {
          self.upper_input(upper_lock);
        }
        return result;
      },
      write: function(value) {
        var upper = self.upper_input(),
            upper_lock;

        if (value < options.min)
          value = options.min;
        if (value > upper)
          value = upper;

        upper_lock = value*4;
        if (upper_lock < self.upper_input()) {
          self.upper_input(upper_lock);
        }
        var percentage = get_percentage_from_value(value, options.min, options.max, options.snap);
        self.lower(percentage);
      },
      owner: self
    });
    self.upper_input = ko.computed({
      read: function() {
        var result = parseInt(compute_value(self.upper(), options.min, options.max, options.snap).toFixed(0)),
            lower_lock = result / 4;
        if (lower_lock > self.lower_input()) {
          self.lower_input(lower_lock);
        }
        return result;
      },
      write: function(value) {
        var lower = self.lower_input(),
            lower_lock;

        if (value < lower)
          value = lower;
        else if (value > options.max)
          value = options.max;

        lower_lock = value/4;
        if (lower_lock > self.lower_input()) {
          self.lower_input(lower_lock);
        }

        var percentage = get_percentage_from_value(value, options.min, options.max, options.snap);
        self.upper(percentage);
      },
      owner: self
    });
    return self;
  }
  function double_slider(options) {
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
    self.choosen = function() {
      return [self.lower_input(), self.upper_input()];
    };
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
      return utils.format_price(self.price(), options.currency());
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
      return utils.format_price(self.price(), options.currency());
    });
    self.choosen = function() {
      return ~~self.active(); // turns true to 1 and false to 0
    };
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
      return utils.format_price(self.price(), options.currency());
    });
    self.choosen = self.value;
  }
  function select_option(option, currency) {
    var self = this;
    self.name = option.name;
    self.price = option.price;
    self.formatted_price = ko.computed(function(){
      return utils.format_price(self.price(), currency());
    });
  }
  function server_licenses(options, currency, choosen) {
    var self = this,
        value;
    self.options = ko.observableArray();
    for (var i=0; i < options.length; i++) {
      self.options.push(new select_option(options[i], currency));
    }
    value = self.options()[choosen] || null;
    self.value = ko.observable(value);
    self.remove_option = function() {
      self.value(0);
    };
    self.price = ko.computed(function(){
      var value2 = self.value();
      if (value2)
        return value2.price();
      return 0;
    });
    self.formatted_price = ko.computed(function(){
      return utils.format_price(self.price(), currency());
    });
    self.choosen = function() {
      return _.indexOf(self.options(), self.value());
    };
  }
  function select_percentage_option(option) {
    var self = this;
    self.name = ko.observable(option.name);
    self.price = ko.observable(option.price);
    self.times = ko.observable(option.times);
    self.formatted_price = ko.computed(function(){
      var calc_price = self.price() * 100;
      if (calc_price)
        return '(' + calc_price + '%' + ' discount)';
      return '';
    });
  }
  function subscription_plans(options, currency, total_price, choosen) {
    var self = this,
        initial_value;

    self.options = ko.observableArray();
    for (var i=0; i < options.length; i++) {
      self.options.push(new select_percentage_option(options[i], currency));
    }
    initial_value = self.options()[choosen];

    self.value = ko.observable(initial_value);
    self.price = ko.computed(function(){
      var choice = self.value();
      if (choice)
        return -1 * choice.price() * total_price();
      return 0;
    });
    self.times = ko.computed(function() {
      var value = self.value();
      return  value ? value.times() : 0;
    });
    self.choosen = function() {
      return _.indexOf(self.options(), self.value());
    };
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

      return utils.format_price(self.price(), options.currency());
    });
    self.choosen = function() {
      return self.selected() || 0;
    };
  }
  var unique_id = {
    build: function() {
      unique_id.prev++;
      return unique_id.name + unique_id.prev;
    },
    name: 'server',
    prev: 0
  };

  function base_server(options, builder) {
    var self = this,
        i;
    self.ip = new checkbox({
      'currency': options.prices.currency,
      'name': 'Static IP',
      'active': options.ip,
      'price': options.prices.cost_per_static_ip
    });
    self.firewall = new checkbox({
      'currency': options.prices.currency,
      'name': 'Firewall',
      'active': options.firewall,
      'price': options.prices.cost_per_firewall
    });

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
    total += _.reduce(this.drives(), utils.sum_function, 0);

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
      return utils.format_price(self.price(), options.prices.currency());
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
      utils.dynPop();
    };
    self.serialize = parser.serialize_base_server;
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
      {'name': 'Server 2008 Web', 'price': options.prices.cost_per_winserverweb},
      {'name': 'Server 2008 Standard', 'price': options.prices.cost_per_winserverstd},
      {'name': 'Server 2008 Enterprise', 'price': options.prices.cost_per_winserverent},
      {'name': 'Server 2012 Standard', 'price': options.prices.cost_per_winserver12}
    ], options.prices.currency, options.windows_server_license);
    self.additional_microsoft_licenses = new server_licenses([
      {'name': 'SQL Server 2008 / 2012 Web', 'price': options.prices.cost_per_mssqlserverweb},
      {'name': 'SQL Server 2008 Standard', 'price': options.prices.cost_per_mssqlserverstd},
      {'name': 'SQL Server 2012 Standard', 'price': options.prices.cost_per_mssqlserver12}
    ], options.prices.currency, options.additional_microsoft_license);
    self.remote_desktops = new remote_desktops({
      'currency': options.prices.currency, 'price': options.prices.cost_per_desktopcal, 'choosen': options.remote_desktops
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
      return utils.format_price(self.price(), options.prices.currency());
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
      utils.dynPop();
    };
    self.add_disk = function(data, event) {
      self.drives.push(new ssd_drive(50, options.prices));
      $("#pop1, #pop2, #pop3").fadeOut(2000);
      utils.dynPop();
    };
    self.serialize = parser.serialize_virtual_machine;
    return self;
  }

  function account_details(options) {
    var self = this;
    self.bandwidth = new bandwidth(options.lower, options.prices);
    self.additional_ips = new account_option({currency: options.prices.currency,
      range: 6,
      name: 'Additional IPs',
      price: options.prices.cost_per_static_ip,
      value: options.ips
    });
    self.additional_vlans = new account_option({currency: options.prices.currency,
      range: 6,
      name: 'Additional VLANs',
      price: options.prices.cost_per_vlan,
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

  return {
    'account_details': account_details,
    'subscription_plans': subscription_plans,
    'container': container,
    'virtual_machine': virtual_machine,
  };
});
