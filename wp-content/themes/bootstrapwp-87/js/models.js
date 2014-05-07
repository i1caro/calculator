/* globals _ */

define(['./knockout-3.1.0', './constants', './utils', './parser', './pricing'], function(ko, CONSTANTS, utils, parser, pricing) {

  function formatted_price() {
    return utils.format_price(this.price());
  }
  function snap_value(value, snap) {
    if (value > 0)
        return Math.ceil(value / snap) * snap;
    else if (value < 0)
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

  function bandwidth(lower) {
    return new single_slider({
      'name': 'Data',
      'min': CONSTANTS.LIMITS.bandwidth_min,
      'max': CONSTANTS.LIMITS.bandwidth_max,
      'lower_bar': lower,
      'lower_price': pricing.bandwidth_per_gb,
      'upper_price': pricing.bandwidth_per_gb,
      'snap': 1,
      'unit': 'GB'
    });
  }
  function cpu_virtual_machine(lower) {
    return new single_slider({
      'name': 'CPU',
      'min': CONSTANTS.LIMITS.cpu_vm_min,
      'max': CONSTANTS.LIMITS.cpu_vm_max,
      'lower_bar': lower,
      'lower_price': pricing.cpu_per_mhz,
      'upper_price': pricing.cpu_per_mhz,
      'snap': CONSTANTS.LIMITS.cpu_increments,
      'unit': 'MHz'
    });
  }
  function cpu_container(lower_upper) {
    return new double_slider({
      'name': 'CPU',
      'min': CONSTANTS.LIMITS.cpu_container_min,
      'max': CONSTANTS.LIMITS.cpu_container_max,
      'lower_bar': lower_upper[0],
      'lower_price': pricing.cpu_container_per_mhz,
      'upper_bar': lower_upper[1],
      'upper_price': pricing.cpu_container_per_mhz,
      'snap': CONSTANTS.LIMITS.cpu_increments,
      'unit': 'MHz'
    });
  }
  function ram_virtual_machine(lower) {
    return new single_slider({
      'name': 'RAM',
      'min': CONSTANTS.LIMITS.ram_vm_min,
      'max': CONSTANTS.LIMITS.ram_vm_max,
      'lower_bar': lower,
      'lower_price': pricing.memory_per_mb,
      'upper_price': pricing.memory_per_mb,
      'snap': CONSTANTS.LIMITS.ram_increments,
      'unit': 'MB'
    });
  }
  function ram_container(lower_upper) {
    return new double_locked_sliders({
      'name': 'RAM',
      'min': CONSTANTS.LIMITS.ram_container_min,
      'max': CONSTANTS.LIMITS.ram_container_max,
      'lower_bar': lower_upper[0],
      'lower_price': pricing.memory_container_per_mb,
      'upper_bar': lower_upper[1],
      'upper_price': pricing.memory_container_per_mb,
      'snap': CONSTANTS.LIMITS.ram_increments,
      'unit': 'MB'
    });
  }
  function ssd_folder(lower) {
    var self = new single_slider({
      'name': 'SSD',
      'min': CONSTANTS.LIMITS.ssd_min,
      'max': CONSTANTS.LIMITS.ssd_max,
      'lower_bar': lower,
      'lower_price': pricing.ssd_per_gb,
      'upper_price': pricing.ssd_per_gb,
      'snap': 1,
      'unit': 'GB'
    });
    self.template = 'ssd-folder-template';
    self.type = 'ssd';
    return self;
  }
  function ssd_drive(lower) {
    var self = new single_slider({
      'name': 'SSD',
      'min': CONSTANTS.LIMITS.ssd_min,
      'max': CONSTANTS.LIMITS.ssd_max,
      'lower_bar': lower,
      'lower_price': pricing.ssd_per_gb,
      'upper_price': pricing.ssd_per_gb,
      'snap': 1,
      'unit': 'GB'
    });
    self.template = 'ssd-drive-template';
    self.type = 'ssd';
    return self;
  }
  function hdd_drive(lower) {
    var self = new single_slider({
      'name': 'HDD',
      'min': CONSTANTS.LIMITS.hdd_min,
      'max': CONSTANTS.LIMITS.hdd_max,
      'lower_bar': lower,
      'lower_price': pricing.disk_per_gb,
      'upper_price': pricing.disk_per_gb,
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

        upper_lock = value * 4;
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

        lower_lock = value / 4;
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

    self.formatted_price = ko.computed(formatted_price, self);
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
    self.formatted_price = ko.computed(formatted_price, self);
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
    self.formatted_price = ko.computed(formatted_price, self);
    self.choosen = self.value;
  }
  function select_option(option) {
    var self = this;
    self.name = option.name;
    self.price = option.price;
    self.formatted_price = ko.computed(formatted_price, self);
  }
  function server_licenses(options, choosen) {
    var self = this,
        value;
    self.options = ko.observableArray();
    for (var i=0; i < options.length; i++) {
      self.options.push(new select_option(options[i]));
    }
    value = self.options()[choosen] || null;
    self.value = ko.observable(value);
    self.remove_option = function() {
      self.value(0);
    };
    self.price = ko.computed(function() {
      var value2 = self.value();
      if (value2)
        return value2.price();
      return 0;
    });
    self.formatted_price = ko.computed(formatted_price, self);
    self.choosen = function() {
      return _.indexOf(self.options(), self.value());
    };
  }
  function select_percentage_option(option) {
    var self = this;
    self.name = ko.observable(option.name);
    self.price = ko.observable(option.price);
    self.times = ko.
    observable(option.times);
    self.formatted_price = ko.computed(function() {
      var calc_price = self.price() * 100;
      if (calc_price)
        return '(' + calc_price + '%' + ' discount)';
      return '';
    });
  }
  function subscription_plans(options, total_price, choosen) {
    var self = this,
        initial_value;

    self.options = ko.observableArray();
    for (var i=0; i < options.length; i++) {
      self.options.push(new select_percentage_option(options[i]));
    }
    initial_value = self.options()[choosen];

    self.value = ko.observable(initial_value);
    self.price = ko.computed(function() {
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
    self.value = ko.computed(function() {
      if (self.selected())
        return {
          name: self.name,
          price: self.price
        };
    });
    self.price_unit = options.price;
    self.price = ko.computed(function() {
      return self.price_unit() * self.selected();
    });
    self.remove_option = function() {
      self.selected(0);
    };
    self.formatted_price = ko.computed(formatted_price, self);
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

  function base_server(options) {
    var self = this,
        number_of_instances = 1;

    if (options.number_of_instances > 0)
      number_of_instances = options.number_of_instances;

    self.ip = new checkbox({
      'name': 'Static IP',
      'active': options.ip,
      'price': pricing.cost_per_static_ip
    });
    self.firewall = new checkbox({
      'name': 'Firewall',
      'active': options.firewall,
      'price': pricing.cost_per_firewall
    });

    self.drives = ko.observableArray([]);

    self.number_of_instances = ko.observable(number_of_instances);

    self.css_for_instances = function() {
      var result = [];
      for (var i=1; i < self.number_of_instances() && i < 3; i++) {
        result.push({
          'bottom': (i * 6) + 'px',
          'left': (i * 6) + 'px',
          'zIndex': i * -10
        });
      }
      return result;
    };

    // Actions
    self.remove_disk = function(data, event) {
      self.drives.remove(data.data);
    };
  }

  function add_drives(drives, builder) {
    for (var i = 0; i < drives.length; i++) {
      this.drives.push(new builder(drives[i]));
    }
  }
  function server_formatted_price() {
    var single_total = utils.format_price(this.single_price()),
        total = utils.format_price(this.price()),
        number_of_instances = this.number_of_instances();
        stype = this.type.replace("_", " ");
    if (number_of_instances > 1)
      return number_of_instances + ' ' + stype + 's, at ' + single_total + ' per ' + stype + ' = ' + total;
    else
      return total;
  }
  function calc_full_price() {
    return this.single_price() * this.number_of_instances();
  }
  function calc_single_price() {
    var total = 0;
    total += this.cpu.price();
    total += this.ram.price();
    total += this.ip.price();
    total += this.firewall.price();
    total += _.reduce(this.drives(), utils.sum_function, 0);

    return total;
  }

  function container(options) {
    var self = this;

    ko.utils.extend(self, new base_server(options));
    // Normal attributes

    self.cpu = new cpu_container(options.cpu);
    self.ram = new ram_container(options.ram);
    self.type = 'container';
    self.template = 'container-template';

    // Computed
    self.single_price = ko.computed(calc_single_price, self);
    self.price = ko.computed(calc_full_price, self);
    self.formatted_price = ko.computed(server_formatted_price, self);

    self.burst_price = ko.computed(function() {
      var total = 0;
      total += self.cpu.upper_price();
      total += self.ram.upper_price();

      return total * self.number_of_instances();
    });
    self.add_disk = function(data, event) {
      self.drives.unshift(new ssd_folder(50));
      $("#pop1, #pop2, #pop3").fadeOut(2000);
      utils.dynPop();
    };
    self.serialize = parser.serialize_base_server;

    // Init
    add_drives.apply(self, [options.ssd, ssd_folder]);
    add_drives.apply(self, [options.hdd, hdd_drive]);
  }

  var windows_server_licenses = [
    {
      'name': 'Server 2008 Web',
      'price': pricing.cost_per_winserverweb
    },
    {
      'name': 'Server 2008 Standard',
      'price': pricing.cost_per_winserverstd
    },
    {
      'name': 'Server 2008 Enterprise',
      'price': pricing.cost_per_winserverent
    },
    {
      'name': 'Server 2012 Standard',
      'price': pricing.cost_per_winserver12
    }
  ],
  other_windows_licenses = [
    {
      'name': 'SQL Server 2008 / 2012 Web',
      'price': pricing.cost_per_mssqlserverweb
    },
    {
      'name': 'SQL Server 2008 Standard',
      'price': pricing.cost_per_mssqlserverstd
    },
    {
      'name': 'SQL Server 2012 Standard',
      'price': pricing.cost_per_mssqlserver12
    }
  ];

  function virtual_machine(options) {

    var self = this;
    ko.utils.extend(self, new base_server(options));

    self.type = 'virtual_machine';
    self.cpu = new cpu_virtual_machine(options.cpu);
    self.ram = new ram_virtual_machine(options.ram);

    // Normal attributes
    self.template = 'virtual-machine-template';

    self.unique_id = unique_id.build();

    self.windows_server_licenses = new server_licenses(windows_server_licenses, options.windows_server_license);
    self.additional_microsoft_licenses = new server_licenses(other_windows_licenses, options.additional_microsoft_license);
    self.remote_desktops = new remote_desktops({'price': pricing.cost_per_desktopcal, 'choosen': options.remote_desktops});

    // Computed
    self.single_price = ko.computed(function() {
      var total = calc_single_price.call(self);

      total += sum_attr(self.windows_server_licenses);
      total += sum_attr(self.additional_microsoft_licenses);
      total += sum_attr(self.remote_desktops);

      return total;
    }, self);
    self.price = ko.computed(calc_full_price, self);
    self.formatted_price = ko.computed(server_formatted_price, self);

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
        new_drive = new factory(data.lower_input());
        self.drives.remove(data);
        self.drives.splice(index, 0, new_drive);
      }
      utils.dynPop();
    };
    self.add_disk = function(data, event) {
      self.drives.unshift(new ssd_drive(50));
      $("#pop1, #pop2, #pop3").fadeOut(2000);
      utils.dynPop();
    };
    self.serialize = parser.serialize_virtual_machine;

    // Init
    add_drives.apply(self, [options.ssd, ssd_drive]);
    add_drives.apply(self, [options.hdd, hdd_drive]);
  }

  function account_details(options) {
    var self = this;
    self.bandwidth = new bandwidth(options.lower);
    self.additional_ips = new account_option({
      range: 6,
      name: 'Additional IPs',
      price: pricing.cost_per_static_ip,
      value: options.ips
    });
    self.additional_vlans = new account_option({
      range: 6,
      name: 'Additional VLANs',
      price: pricing.cost_per_vlan,
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
