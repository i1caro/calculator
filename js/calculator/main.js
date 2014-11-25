define(
  [
    'lib/knockout',
    'lib/underscore',
    './pricing',
    './models',
    './constants',
    './utils',
    './parser',
    './mouse_actions',
    './load_templates'
  ],
  function(ko, _, pricing, models, CONSTANTS, utils, parser, mouse_actions) {
    function viewModel(limits, prices, initial_data) {
      var self = this;

      // __init__
      if (!limits)
        limits = CONSTANTS.DEFAULT_LIMITS;
      if (!prices)
        prices = {};

      models = models(limits);
      pricing.set_pricing(prices);


      // To fixed variables
      self.disconnected_storage_formatted_price = function() {
        return 0;
      };
      self.has_less_resources_than_needed = function() {
        return false;
      };

      self.has_resources_choosen = false;

      self.has_disconnected_drives = false;
      self.disconnected_drives = [];
      self.disconnected_folders = [];

      // Observables
      self.servers = ko.observableArray();

      self.account_details = new models.account_details({
        bandwidth: 0,
        virtual_lans: 0,
        ips: 0
      });

      self.remove_server = function(data) {
        self.servers.remove(data.server);
      };

      // Actions
      self.click_handle_down = mouse_actions.click_handle_down;
      self.click_slider_down = mouse_actions.click_slider_down;

      self.add_container = function() {
        self.servers.unshift(new models.container({
          cpu: 500,
          ram: 126,
          ip: true,
          firewall: false,
          ssd: [10],
          hdd: []
        }));
      };
      self.add_virtual_machine = function() {
        self.servers.unshift(new models.virtual_machine({
          cpu: 500,
          ram: 126,
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [10]
        }));
      };

      // External
      self.set_pricing = pricing.set_pricing;

      self.set_servers = function(data) {
        self.servers.removeAll();
        _.each(data.containers, function(container) {
          self.servers.push(new models.container(container));
        });
        _.each(data.virtual_machines, function(virtual_machine) {
          self.servers.push(new models.virtual_machine(virtual_machine));
        });
      };
      self.set_account_details = function(data) {
        self.account_details = new models.account_details(data);
      };
      self.set_data = function(data) {
        self.set_servers(data);
        self.set_account_details(data['account_details']);
      };

      // __init__
      if (initial_data)
        self.set_data(initial_data);

      // Computed
      self.price = ko.computed(function() {
        var total = 0;
        total += _.reduce(self.servers(), utils.sum_function, 0);
        total += self.account_details.price();

        return total;
      });

      self.formatted_price = ko.computed(function() {
        return utils.format_price(self.price());
      });
      self.formatted_total_price = ko.computed(function() {
        var price_month = self.price(),
            price_month_formatted = utils.format_price(price_month);
        return price_month_formatted;
      });

      self.serialize_dump = parser.serialize_dump;
      self.serialize_load = parser.serialize_load;
      self.serialize_dump_to_url = parser.serialize_dump_to_url;
    }

    return viewModel;
  }
);

