define(
  [
    'lib/knockout',
    'lib/underscore',
    './constants',
    './models',
    './utils',
    './parser',
    './mouse_actions',
    './load_templates'
  ],
  function(ko, _, CONSTANTS, models, utils, parser, mouse_actions) {
    // Main View Model

    function viewModel() {
      var self = this;

      self.has_disconnected_drives = ko.computed(function() {
        return false;
      });
      self.disconnected_drives = [];
      self.disconnected_folders = [];

      self.add_container = function() {
        self.servers.unshift(new models.container({
          cpu: [0, 2000],
          ram: [256, 1024],
          ip: true,
          firewall: false,
          ssd: [20],
          hdd: []
        }));
      };
      self.add_virtual_machine = function() {
        self.servers.unshift(new models.virtual_machine({
          cpu: 2000,
          ram: 1024,
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [20]
        }));
      };

      self.account_details = new models.account_details({
        lower: 0,
        virtual_lans: 0,
        ips: 0
      });

      // To be fixed attributes
      self.disconnected_storage_formatted_price = function() {
        return 0;
      };
      self.has_less_resources_than_needed = function() {
        return false;
      };

      self.has_resources_choosen = false;

      self.servers = ko.observableArray();

      // Computed
      self.remove_server = function(data) {
        self.servers.remove(data.server);
      };

      self.price = ko.computed(function() {
        var total = 0;
        total += _.reduce(self.servers(), utils.sum_function, 0);
        total += self.account_details.price();

        return total;
      });

      self.burst_price = ko.computed(function() {
        return _.reduce(self.servers(), function(memo, obj) {
          var burst = obj.burst_price ? obj.burst_price() : 0,
              price = parseFloat(burst);

          if (_.isNumber(price))
            return memo + price;
          return memo;
        }, 0);
      });

      self.formatted_burst_price = ko.computed(function() {
        return utils.format_price(self.burst_price());
      });

      self.formatted_price = ko.computed(function() {
        return utils.format_price(self.price());
      });
      self.formatted_total_price = ko.computed(function() {
        var price_month = self.price(),
            price_month_formatted = utils.format_price(price_month);
        return price_month_formatted;
      });

      // Actions
      self.click_handle_down = mouse_actions.click_handle_down;
      self.click_slider_down = mouse_actions.click_slider_down;
    }

    var model = new viewModel();
    ko.applyBindings(model);

    return model;
  }
);

