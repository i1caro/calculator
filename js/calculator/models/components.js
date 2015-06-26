define(['lib/knockout', 'lib/underscore', '../utils', '../pricing'],
  function(ko, _, utils, pricing) {

  var prices = pricing.prices;

  function ValueToPercentage(min, max, step) {
    this.min = min;
    this.max = max;
    this.step = step;
    this.min_percentage = ko.pureComputed(this._compute_min_percentage, this);
    this.max_percentage = ko.pureComputed(this._compute_max_percentage, this);
  }
  _.extend(ValueToPercentage.prototype, {
    _compute_min_percentage: function() {
      return this.compute_percentage(this.min());
    },
    _compute_max_percentage: function() {
      return this.compute_percentage(this.max());
    },
    trim_value: function(value) {
      return utils.trim(value, this.min(), this.max());
    },
    trim_percentage: function(value) {
      return utils.trim(value, this.min_percentage(), this.max_percentage());
    },
    calc_from_log_scale_value: function(percentage) {
      return (this.max()) * (Math.pow(10, (percentage / 100.0)) - 1) / (10 - 1);
    },
    compute_value: function(percentage) {
      var value = this.calc_from_log_scale_value(percentage),
          snapped = this.round_to_step(value);
      return this.trim_value(snapped);
    },
    compute_percentage: function(value) {
      var trimmed = this.trim_value(value),
          snapped = this.round_to_step(trimmed);
      return this.calc_log_scale_percentage(snapped);
    },
    calc_log_scale_percentage: function(value) {
      return 43.4294 * Math.log((this.max() + 9 * value) / this.max());
    },
    round_to_step: function(value) {
      if (value > 0)
        return Math.ceil(value / this.step()) * this.step();
      else if (value < 0)
        return Math.floor(value / this.step()) * this.step();
      else
        return value;
    }
  });

  function BindedValuePercentage(options) {
    ValueToPercentage.call(this, options.min, options.max, options.step);

    this._percentage = ko.observable();

    this.percentage = ko.computed({
      read: this._percentage,
      write: this._set_percentage,
      owner: this
    });

    this.value = ko.computed({
      read: this._read_value,
      write: this._set_value,
      owner: this
    });

    // Init
    this.value(options.value);
  }
  _.extend(BindedValuePercentage.prototype, ValueToPercentage.prototype, {
    _set_percentage: function(percentage) {
      var clean = utils.clean_number(percentage),
          precentage_value = this.trim_percentage(clean);
      this._percentage(precentage_value);
    },
    _read_value: function() {
      return this.compute_value(this.percentage());
    },
    _set_value: function(value) {
      var clean = utils.clean_number(value),
          percentage = this.compute_percentage(clean);
      this.percentage(percentage);
    }
  });

  function ValuePrice(price) {
    this.unit_price = price;

    this.price = ko.pureComputed(this._compute_price, this);
    this.formatted_price = ko.pureComputed(this._formatted_price, this);
  }
  _.extend(ValuePrice.prototype, {
    _compute_price: function() {
      return this.value() * this.unit_price();
    },
    _formatted_price: function() {
      return utils.format_price(this.price());
    }
  });

  function Slider(options) {
    /**
    Range/slider UI widget

    Options:
      * min:          Minimum limit
      * max:          Maximum limit
      * step:         Limit factor of value
      * value:        Initial numeric value

      * price:        Price per value

      * name:         Label for this slider
      * unit:         Unit label for this slider
    */
    BindedValuePercentage.call(this, options);
    ValuePrice.call(this, options.price);

    this.name = options.name;
    this.unit = options.unit;
    this.percentage_style = ko.pureComputed(this._percentage_style, this);

    this.chosen = this.value;
  }
  _.extend(
    Slider.prototype, BindedValuePercentage.prototype, ValuePrice.prototype,
    {
      _percentage_style: function() {
        return this.percentage() + '%';
      }
    }
  );

  function LimitedSlider(options) {
    /**
    Range/slider UI widget

    Options:
      * min:          Minimum limit
      * max:          Maximum limit
      * limit:        Limits to the value after max

      * step:         Limit factor of value
      * value:        Initial numeric value

      * price:        Price per value

      * name:         Label for this slider
      * unit:         Unit label for this slider
    */

    this.limit = options.limit;
    options.value = utils.trim(
      options.value, options.min(), this.limit()
    );
    Slider.call(this, options);
  }
  _.extend(LimitedSlider.prototype, Slider.prototype, {
    subscription_max: function() {
      // To break recursiveness this is called before value is defined
      // and after value is defined
      var value = this.value ? this.value() : 0;
      return this.limit() + value;
    },
    trim_value: function(value) {
      return utils.trim(value, this.min(), this.subscription_max());
    }
  });

  function AccountOption(options) {
    /**
    Input Box UI widget

    Options:
      * max:          Max Limit
      * price:        Initial numeric price
      * name:         Label for this slider
    */
    this.name = options.name;
    this.max = options.max;

    ValuePrice.call(this, options.price);

    this._value = ko.observable();
    this.value = ko.computed({
      read: this._value,
      write: this._set_value,
      owner: this
    });
    this.chosen = this.value;

    // Init
    this.value(options.value);
  }
  _.extend(AccountOption.prototype, ValuePrice.prototype, {
    _set_value: function(value) {
      var clean = utils.clean_number(value);
      this._value(
        this.trim(clean)
      );
    },
    trim: function(value) {
      return utils.trim(value, 0, this.max());
    },
  });

  function Checkbox(options) {
    /**
    Checkbox UI widget

    Options:
      * price:        Price per value
      * name:         Label for this slider
      * checked:      Boolean indicating whether or not the checkbox is checked
      * active:       Function that checks if checkbox can be used
    */
    ValuePrice.call(this, options.price);
    this.name = options.name;

    this._is_active = options.active || utils.returns(true);

    if (this._is_active())
      this.checked = ko.observable(options.checked);
    else
      this.checked = ko.observable(false);

    this.active = ko.pureComputed(this._active, this);
    this.chosen = this.value;
  }
  _.extend(Checkbox.prototype, ValuePrice.prototype, {
    _active: function() {
      return (this._is_active() || this.checked());
    },
    value: function() {
      return ~~this.checked(); // ~~ turns true to 1 and false to 0
    }
  });

  function SelectOption(options) {
    /**
    Select Box Option UI widget

    Options:
      * price:        Initial numeric price
      * name:         Label for this slider
    */
    ValuePrice.call(this, prices[options.id]);
    this.name = options.name;
    this.resource_id = options.resource_id;
  }
  _.extend(SelectOption.prototype, ValuePrice.prototype, {
    value: function() {
      return 1;
    }
  });

  function SimpleInput(options) {
   /**
   Input Box UI widget

   Options:
     * max:          Max Limit
     * value:        Initial numeric value
     * price:        Initial numeric price
     * name:         Label for this slider
   */
    AccountOption.call(this, options);

    this.formatted_unit_price = ko.pureComputed(
      this._formatted_unit_price, this
    );
    this.formatted_name = ko.pureComputed(
      this._formatted_name, this
    );
  }
  _.extend(SimpleInput.prototype, AccountOption.prototype, {
    _formatted_unit_price: function() {
      return utils.format_price(this.unit_price());
    },
    _formatted_name: function() {
      var chosen_option = this.value();
      if (chosen_option)
        return chosen_option + ' X ' + this.name;
      return '';
    },
    remove_choice: function() {
      this.value(0);
    }
  });

  function ServerLicenses(options) {
    /**
    Select Box UI widget

    Options:
      * license:      Index value of the selected license
      * choices:      Select choices to choose from
    */
    ValuePrice.call(this);


    this.valid_choices = ko.pureComputed(this._valid_choices, this);
    this.formatted_name = ko.pureComputed(this._formatted_name, this);
    // Init
    this.choices = _.map(options.choices, function(choice) {
      return new SelectOption(choice);
    });
    this.value = ko.observable();
    this.choose(options.license);
  }
  _.extend(ServerLicenses.prototype, ValuePrice.prototype, {
    _valid_choices: function() {
      return _.filter(this.choices, function(choice) {
        return !!choice.price();
      });
    },
    _compute_price: function() {
      var choice = this.value();
      if (choice)
        return choice.price();
      return 0;
    },
    _formatted_name: function() {
      var choice = this.value();
      if (choice)
        return choice.name;
      return '';
    },
    remove_choice: function() {
      this.value(null);
    },
    choose: function(choice) {
      this.value(this.choices[choice] || null);
    },
    chosen: function() {
      return _.indexOf(this.choices, this.value());
    }
  });

  return {
    'SimpleInput': SimpleInput,
    'Slider': Slider,
    'LimitedSlider': LimitedSlider,
    'Checkbox': Checkbox,
    'AccountOption': AccountOption,
    'ServerLicenses': ServerLicenses
  };
});
