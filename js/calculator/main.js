define(
  [
    'lib/knockout',
    'lib/underscore',
    './constants',
    './models',
    './utils',
    './parser',
    './load_templates'
  ],
  function(ko, _, CONSTANTS, models, utils, parser) {
    function get_country_container_availability(id) {
      return CONSTANTS.CONTAINER_UNAVAILABILITY[id];
    }
    // Main View Model

    function viewModel() {
      var self = this;

      // Actions
      function move_handler(event) {
        var data = event.data,
            mouse_move = ((event.clientX - data.offset) * 100) / data.bar_size,
            distance = utils.limit(data.start + mouse_move, 0, 100);
        data.element(distance);
      }
      function stop_move_handler(event) {
        $(document).off('mousemove', move_handler);
      }

      function start_mouse_down(data, event, element, lower_bound, upper_bound) {
        $(document).on('mousemove', {
          offset: event.pageX - utils.pageOffset(),
          start: element(),
          bar_size: $(event.currentTarget).parent().width(),
          element: element,
          lower_bound: lower_bound,
          upper_bound: upper_bound
        }, move_handler);
        $(document).one('mouseup', stop_move_handler);
      }

      function get_click_position(event) {
        var parent_position = get_position(event.currentTarget),
            x = event.clientX - parent_position.x,
            y = event.clientY - parent_position.y;
        return {x: x, y: y};
      }

      function get_position(element) {
        var x = 0,
            y = 0;

        while (element) {
          x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
          y += (element.offsetTop - element.scrollTop + element.clientTop);
          element = element.offsetParent;
        }
        return {x: x, y: y};
      }

      self.mouse_down_handle = function(data, event) {
        start_mouse_down(data, event, data.lower);
      };

      self.mouse_down = function(data, event) {
        var position = get_click_position(event),
            clicked = position.x / $(event.currentTarget).width() * 100;
        data.lower(clicked);

        self.mouse_down_handle(data, event);
      };

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
        utils.serverSlideDown();
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
        utils.serverSlideDown();
      };

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
    }

    var model = new viewModel();
    ko.applyBindings(model);

    return model;
  }
);
