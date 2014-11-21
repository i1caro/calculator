define(['lib/underscore', 'calculator/main'],
  function(_, calculator) {

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
        initial_data = calculator.parser.string_into_data(location.hash);
      }
      catch (err) {}
    }
    self.change_country = function(data, event) {
      self.country(data.id);
    };

    // Add initial values
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

    self.serialize = ko.computed(
      parser.serialize_view,
      self
    ).extend({
      rateLimit: 1000
    });



    //Constants
    self.country_flags = CONSTANTS.ZONES;
    self.country = ko.observable(utils.get_country_based_on_location());


    // JAvascript nonsense

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

    function dynPop() {
      var timeoutId;
      $('.icon-image, .icon-image').hover(function() {
          if (!timeoutId) {
            timeoutId = window.setTimeout(function() {
              timeoutId = null;
              $("#dynamicpop").text(".icon-image:hover:before, .icon-image:hover:before {white-space:normal; width:180px;content: attr(data-long);}");
            }, 1000);
          }
        },
        function() {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
          }
          else {
            $("#dynamicpop").text("");
          }
        });
    }

    // function serverSlideDown() {
    //   jQuery("div.server").first().hide();
    //   jQuery("div.server").first().slideDown();
    // }

    function serverSlideUp(e, callback) {
      jQuery(e).parents(".server").slideUp();
      window.setTimeout(function() {callback();}, 500);
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
      serverSlideUp(this, function() {
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
        dynPop();
      });
      $(".my-event blue-hover hover-small").click(function() {
        $("#pop1, #pop2, #pop3").fadeOut(2000);
      });
      // to hide bandwidth slider
      //$(".bandwith-icon, [data-bind='template: { name: 'input-range-template', data: bandwidth}']").hide()
    }
    tutorialsPop();
    dynPop();
  }
);
