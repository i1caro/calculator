define(['lib/knockout', 'lib/underscore', './utils'],
  function(ko, _, utils) {

  function formatted_price() {
    return utils.format_price(this.price());
  }

  function trim_value(value, min, max) {
    if (value < min)
      return min;
    else if (value > max)
      return max;
    return value;
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
    var value = (max) * (Math.pow(10, (percentage / 100.0)) - 1) / (10 - 1),
        snapped = snap_value(value, snap);

    return trim_value(snapped, min, max);
  }

  function get_percentage_from_value(value, min, max, snap) {
    var trimmed = trim_value(value, min, max),
        snapped = snap_value(trimmed, snap);

    return 43.4294 * Math.log((max - 10 + 9 * snapped) / (max));
  }

  function single_slider(options) {
    var self = this,
        defaults = {
          'min': 0,
          'max': 0,
          'lower_bar': 0,
          'snap': 0
        };

    options = _.defaults(options, defaults);

    self.unit = options.unit;
    self.name = options.name;
    self._lower = ko.observable(get_percentage_from_value(options.lower_bar, options.min, options.max, options.snap));

    var min_percentage = get_percentage_from_value(options.min, options.min, options.max, options.snap),
        max_percentage = get_percentage_from_value(options.max, options.min, options.max, options.snap);

    self.lower = ko.computed({

      read: function() {
        return self._lower();
      },
      write: function(value) {
        var clean_value = trim_value(value, min_percentage, max_percentage);
        self._lower(clean_value);
      },
      owner: self
    });

    self.lower_input = ko.computed({
      read: function() {
        return parseInt(compute_value(self.lower(), options.min, options.max, options.snap).toFixed(0));
      },
      write: function(value) {
        if (value < options.min)
          value = options.min;
        if (value > options.max)
          value = options.max;
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
    self.lower_style = function() {
      return self.lower() + '%';
    };
    self.lower_round = function() {
      return Math.round(self.lower());
    };

    self.choosen = self.lower_input;
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

  function removable_account_option(options) {
    var self = this;
    ko.utils.extend(self, new account_option(options));
    self.remove_option = function() {};
  }

  function account_option(options) {
    var self = this;
    self.name = options.name;
    self.unit = options.unit;
    self.max = options.max;
    self._value = ko.observable(options.value);
    self.value = ko.computed({
      write: function(value) {
        if (value < 0)
          value = 0;
        else if (value > self.max)
          value = self.max;
        self._value(value);
      },
      read: self._value
    });
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

  function simple_input(options) {
    var self = this;

    self.name = options.name;
    self.value = ko.observable(options.value || 0);

    self.remove_option = function() {
      self.value(0);
    };

    self.unit_price = options.price;
    self.price = ko.computed(function() {
      return self.value() * self.unit_price();
    });
    self.formatted_price = ko.computed(formatted_price, self);
    self.formatted_unit_price = ko.computed(function() {
      return utils.format_price(self.unit_price());
    });
  }

  function server_licenses(name, options, choosen) {
    var self = this;

    self.name = name;
    self.options = ko.observableArray();
    self.options.push(new select_option({
      name: '',
      price: function() {
        return 0;
      }
    }));
    self.valid_options = ko.computed(function() {
      var options = self.options();
      return options.slice(1, options.length);
    });
    for (var i=0; i < options.length; i++) {
      self.options.push(new select_option(options[i]));
    }

    self.value = ko.observable();

    self.remove_option = function() {
      self.value(0);
    };

    self.choose = function(option) {
      if (option)
        self.value(self.options()[option] || null);
      else
        self.remove_option();
    };

    self.choose(choosen);

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

  return {
    'formatted_price': formatted_price,
    'simple_input': simple_input,
    'single_slider': single_slider,
    'checkbox': checkbox,
    'account_option': account_option,
    'removable_account_option': removable_account_option,
    'server_licenses': server_licenses,
  };
});
