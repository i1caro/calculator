/* globals _ */
define(['./knockout-3.1.0.debug', 'text!./templates.html', './constants', './models', './utils', './parser'],
  function(ko, templates, CONSTANTS, models, utils, parser) {

    $("body").append(templates);


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
        self.prices(data.id);
      };
      self.add_container = function() {
        self.containers.push(new models.container({
          cpu: [0, 2000],
          ram: [256, 1024],
          ip: true,
          firewall: false,
          ssd: [20],
          hdd: [],
          prices: self.prices()
        }));
      };
      self.add_virtual_machine = function() {
        self.virtual_machines.push(new models.virtual_machine({
          cpu: 2000,
          ram: 1024,
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [20],
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

      self.countries_prices = CONSTANTS.KO_PRICE_OBJ;
      self.prices = ko.computed({
        read: function() {
          return self.countries_prices;
        },
        write: function(value) {
          self.country(value);
          var prices = CONSTANTS.COUNTRIES_PRICES[value];
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
        self.virtual_machines.push(new models.virtual_machine(temp));
      }
      self.containers = ko.observableArray();
      for (i=0; i < initial_data.containers.length; i++) {
        temp = initial_data['containers'][i];
        temp['prices'] = temp_prices;
        self.containers.push(new models.container(temp));
      }

      self.account_details = new models.account_details({
        lower: initial_data['account_details']['bandwidth'],
        virtual_lans: initial_data['account_details']['virtual_lans'],
        ips: initial_data['account_details']['ips'],
        prices: self.prices()
      });

      // Computed
      self.price =  ko.computed(function() {
        var total = 0;

        total += _.reduce(self.virtual_machines(), utils.sum_function, 0);
        total += _.reduce(self.containers(), utils.sum_function, 0);
        total += self.account_details.price();

        return total;
      });

      self.subscription_plans = new models.subscription_plans(
        [
          {'name': 'No plan', 'times':0, 'price': 0},
          {'name': '6 Months', 'times':6, 'price': 0.10},
          {'name': '12 Months', 'times':12, 'price': 0.15},
          {'name': '24 Months', 'times':24, 'price': 0.25}
        ],
        self.prices().currency,
        self.price,
        initial_data['subscription']
      );
      self.burst_price = ko.computed(function() {
        var total = _.reduce(self.containers(), function(memo, obj) {
          var price = parseFloat(obj.burst_price());
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
        return utils.format_price(self.burst_price(), self.prices().currency());
      });
      self.formatted_discount = ko.computed(function() {
        var price = self.subscription_plans.price();
        if (price)
          return '-' + utils.format_price(-1*price, self.prices().currency());
        return utils.format_price(price, self.prices().currency());
      });
      self.formatted_price = ko.computed(function() {
        return utils.format_price(self.price(), self.prices().currency());
      });
      self.formatted_total_price = ko.computed(function() {
        var price_month = self.subscription_plans.price() + self.price(),
            price_month_formatted = utils.format_price(price_month, self.prices().currency()),
            times = self.subscription_plans.times(),
            total_formatted = utils.format_price(price_month * times, self.prices().currency());
        if (times)
          return price_month_formatted + ' * ' + times + ' = ' + total_formatted;
        return price_month_formatted;
      });
    }

    var model = new viewModel();
    ko.applyBindings(model);
    function tutorialsPop() {
      var popZone = _.once(function(){
        $("#pop1").fadeIn(2000);
      });
      var popServer = _.once(function(){
        $("#pop2").fadeIn(2000);
      });
      var popDisk = _.once(function(){
        var popstr =
          '<div id="pop3" class="popover left" style="position: absolute; line-height:16px;top: -58px;left: -185px;width: 150px;white-space: normal;">' +
            '<div class="arrow" style="border-left:5px solid #313785"></div>' +
            '<div class="popover-content" style="background-color:#313785;color: #fff;border-radius: 3px;">' +
            'Click here to add more storage devices to this server, or move the sliders to increase size.</div>' +
          '</div>';
        $("a[data-bind='event: {click: add_disk}']").css("position","relative").prepend(popstr);
        $("#pop3").fadeIn(2000);
        window.setTimeout(function(){
          $("#pop3").fadeOut(2000);
        },4000);
      });
      // Longer explanation in Folder popover on longer mouseover
      var popFolder = function(){
        $("<style type='text/css' id='dynamic' />").appendTo("head");
        var timeoutId;
        $(".drive-folder").hover(function() {
          if (!timeoutId) {
            timeoutId = window.setTimeout(function() {
              timeoutId = null;
              $("#dynamic").text(".drive-folder:hover:before{white-space:normal; width:150px;;content: 'Folders are the cloud storage that Elastic Containers use. They are also elastic and resize automatically to fit their contents'!important}");
            }, 1500);
          }
        }, function () {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
          }
          else {
            $("#dynamic").text("");
          }
        });
      };
      popZone();
      popFolder();
      $(".zoneselector").click(function(){
        popServer();
        $("#pop1").fadeOut(2000);
      });
      $(".hover-large").click(function(){
        popDisk();
        $("#pop1, #pop2").fadeOut(2000);
        popFolder();
      });
      $("my-event blue-hover hover-small").click(function(){
        $("#pop1, #pop2, #pop3").fadeOut(2000);
      });
    }
    tutorialsPop();
  }
);


