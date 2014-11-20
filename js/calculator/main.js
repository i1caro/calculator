define(
  [
    'lib/knockout',
    'lib/underscore',
    './constants',
    './models',
    './utils',
    './parser',
    './billing_first_time',
    './load_templates'
  ],
  function(ko, _, CONSTANTS, models, utils, parser, billing_first_time) {
    function get_country_container_availability(id) {
      return CONSTANTS.CONTAINER_UNAVAILABILITY[id];
    }
    // Main View Model

    function viewModel() {
      var self = this,
          initial_data = {
            'virtual_machines': [{
              cpu: 2000,
              ram: 1024,
              ip: true,
              firewall: false,
              ssd: [],
              hdd: [20]
            }],
            'containers': [],
            'account_details': {
              'bandwidth': 10,
              'ips': 0,
              'vlans': 0
            }
          };

      // See if the url can turn into a data set
      if (location.hash) {
        try {
          initial_data = parser.string_into_data(location.hash);
        }
        catch (err) {}
      }
      //Constants
      self.country_flags = CONSTANTS.ZONES;
      self.country = ko.observable(utils.get_country_based_on_location());

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
      self.change_country = function(data, event) {
        self.country(data.id);
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

      self.has_resources_choosen = false

      // Normal attributes
      self.coming_soon = ko.computed(function() {
        return get_country_container_availability(self.country());
      });

      self.servers = ko.observableArray();
      for (var i = 0; i < initial_data.containers.length; i++) {
        self.servers.push(
          new models.container(initial_data['containers'][i])
        );
      }
      for (i = 0; i < initial_data['virtual_machines'].length; i++) {
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
      self.serialize = ko.computed(
        parser.serialize_view,
        self
      ).extend({
        rateLimit: 1000
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

    //attach event handlers
    $(".yellow-nohover.hover-huge").click(function(e) {
      e.preventDefault();
      billing_first_time.post();
    });


    // Session ID cookie ==================

    function writeCookie(name, value, days) {
      var date, expires;
      if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      }
      else {
        expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/";
    }

    function makeid(limit) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < limit; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    function readCookie(name) {
      var i, c, ca, nameEQ = name + "=";
      ca = document.cookie.split(';');
      for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
      return '';
    }

    writeCookie("ehSessID", makeid(8), 1);
    readCookie("ehSessID"); // will return session ID value

    // Idle Timer ===================

    var timeoutID;

    function setup() {
      this.addEventListener("mousemove", resetTimer, false);
      this.addEventListener("mousedown", resetTimer, false);
      this.addEventListener("keypress", resetTimer, false);
      this.addEventListener("DOMMouseScroll", resetTimer, false);
      this.addEventListener("mousewheel", resetTimer, false);
      this.addEventListener("touchmove", resetTimer, false);
      this.addEventListener("MSPointerMove", resetTimer, false);

      startTimer();
    }
    setup();

    function startTimer() {
      // wait 2 seconds before calling goInactive
      timeoutID = window.setTimeout(goInactive, 2000);
    }

    function resetTimer(e) {
      window.clearTimeout(timeoutID);
      goActive();
    }

    function goInactive() {
      takeSnapshot();
    }

    function goActive() {
      startTimer();
    }


    // Snapshot ==============
    var current_hash = "";
    function takeSnapshot() {
      var EHhash = encodeURIComponent(JSON.stringify(location.hash));
      if (EHhash !== current_hash){
        var EHcookie = (readCookie("ehSessID") === "" ? "nocookie" : readCookie("ehSessID"));  // make sure it's always 8 chars
        $.ajax({
          url: 'http://jonsmarketingfunnel.co.uk:5001/snapshot?' + EHhash + EHcookie,
            type: 'GET',
            crossDomain: true
          });
          current_hash = EHhash;
        }
      }

    $("#server-list").delegate(".minus", "click", function() {
      var context = ko.contextFor(this);
      utils.serverSlideUp(this, function() {
        context.$root.servers.remove(context.$data.server);
      });

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
      // to hide bandwidth slider
      //$(".bandwith-icon, [data-bind='template: { name: 'input-range-template', data: bandwidth}']").hide()
    }
    tutorialsPop();
    utils.dynPop();
  }
);
