define(['lib/underscore', 'lib/knockout', 'calculator/main', 'marketing_site/constants'],
  function(_, ko, calculator, CONSTANTS) {
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

      if (location.hash) {
        try {
          initial_data = calculator.serialize_load(location.hash);
        }
        catch (err) {}
      }

      function get_country_based_on_location() {
        var domain = location.host.split('.').splice(-1, 1)[0],
          local = CONSTANTS.DOMAINS_TO_LOCATION[domain];
        if (local)
          return local;
        return CONSTANTS.DOMAINS_TO_LOCATION['com'];
      }

      self.country = ko.observable(get_country_based_on_location());

      self.change_country = function(data, event) {
        self.country(data.id);
      };

      calculator.set_data(initial_data);
      self.update_prices = ko.computed(function() {
        calculator.set_pricing(CONSTANTS.LOCAL_PRICES[self.country()]);
      });

      self.update_serializer = ko.computed(function() {
        location.hash = calculator.serialize_dump_to_url();
      }).extend({
        rateLimit: 1000
      });


      //Constants
      self.country_flags = CONSTANTS.ZONES;

      function get_country_container_availability(id) {
        return CONSTANTS.CONTAINER_UNAVAILABILITY[id];
      }
    }

    ko.applyBindings({
      'marketing': new viewModel(),
      'calculator': calculator
    });
    // // JAvascript nonsense

    // //attach event handlers
    // $(".yellow-nohover.hover-huge").click(function(e) {
    //   e.preventDefault();
    //   billing_first_time.post();
    // });


    // // Session ID cookie ==================

    // function writeCookie(name, value, days) {
    //   var date, expires;
    //   if (days) {
    //     date = new Date();
    //     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    //     expires = "; expires=" + date.toGMTString();
    //   }
    //   else {
    //     expires = "";
    //   }
    //   document.cookie = name + "=" + value + expires + "; path=/";
    // }

    // function makeid(limit) {
    //   var text = "";
    //   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    //   for (var i = 0; i < limit; i++)
    //     text += possible.charAt(Math.floor(Math.random() * possible.length));

    //   return text;
    // }

    // function readCookie(name) {
    //   var i, c, ca, nameEQ = name + "=";
    //   ca = document.cookie.split(';');
    //   for (i = 0; i < ca.length; i++) {
    //     c = ca[i];
    //     while (c.charAt(0) === ' ') {
    //       c = c.substring(1, c.length);
    //     }
    //     if (c.indexOf(nameEQ) === 0) {
    //       return c.substring(nameEQ.length, c.length);
    //     }
    //   }
    //   return '';
    // }

    // writeCookie("ehSessID", makeid(8), 1);
    // readCookie("ehSessID"); // will return session ID value

    // // Idle Timer ===================

    // var timeoutID;

    // function setup() {
    //   this.addEventListener("mousemove", resetTimer, false);
    //   this.addEventListener("mousedown", resetTimer, false);
    //   this.addEventListener("keypress", resetTimer, false);
    //   this.addEventListener("DOMMouseScroll", resetTimer, false);
    //   this.addEventListener("mousewheel", resetTimer, false);
    //   this.addEventListener("touchmove", resetTimer, false);
    //   this.addEventListener("MSPointerMove", resetTimer, false);

    //   startTimer();
    // }
    // setup();

    // function startTimer() {
    //   // wait 2 seconds before calling goInactive
    //   timeoutID = window.setTimeout(goInactive, 2000);
    // }

    // function resetTimer(e) {
    //   window.clearTimeout(timeoutID);
    //   goActive();
    // }

    // function goInactive() {
    //   takeSnapshot();
    // }

    // function goActive() {
    //   startTimer();
    // }

    // function dynPop() {
    //   var timeoutId;
    //   $('.icon-image, .icon-image').hover(function() {
    //       if (!timeoutId) {
    //         timeoutId = window.setTimeout(function() {
    //           timeoutId = null;
    //           $("#dynamicpop").text(".icon-image:hover:before, .icon-image:hover:before {white-space:normal; width:180px;content: attr(data-long);}");
    //         }, 1000);
    //       }
    //     },
    //     function() {
    //       if (timeoutId) {
    //         window.clearTimeout(timeoutId);
    //         timeoutId = null;
    //       }
    //       else {
    //         $("#dynamicpop").text("");
    //       }
    //     });
    // }

    // // function serverSlideDown() {
    // //   jQuery("div.server").first().hide();
    // //   jQuery("div.server").first().slideDown();
    // // }

    // function serverSlideUp(e, callback) {
    //   jQuery(e).parents(".server").slideUp();
    //   window.setTimeout(function() {callback();}, 500);
    // }


    // // Snapshot ==============
    // var current_hash = "";
    // function takeSnapshot() {
    //   var EHhash = encodeURIComponent(JSON.stringify(location.hash));
    //   if (EHhash !== current_hash){
    //     var EHcookie = (readCookie("ehSessID") === "" ? "nocookie" : readCookie("ehSessID"));  // make sure it's always 8 chars
    //     $.ajax({
    //       url: 'http://jonsmarketingfunnel.co.uk:5001/snapshot?' + EHhash + EHcookie,
    //         type: 'GET',
    //         crossDomain: true
    //       });
    //       current_hash = EHhash;
    //     }
    //   }

    // $("#server-list").delegate(".minus", "click", function() {
    //   var context = ko.contextFor(this);
    //   serverSlideUp(this, function() {
    //     context.$root.calculator.servers.remove(context.$data.server);
    //   });

    //   return false;
    // });

    // function tutorialsPop() {
    //   $("<style type='text/css' id='dynamicpop' />").appendTo("head");
    //   var popZone = _.once(function() {
    //         $("#pop1").fadeIn(2000);
    //         window.setTimeout(function() {
    //           $("#pop1").fadeOut(2000);
    //         }, 15000);
    //       });
    //   var popServer = _.once(function() {
    //         $("#pop2").fadeIn(2000);
    //         window.setTimeout(function() {
    //           $("#pop2").fadeOut(2000);
    //         }, 15000);
    //       });
    //   var popDisk = _.once(function() {
    //         var popstr =
    //             '<div id="pop3" class="popover left" style="position: absolute; line-height:16px;top: -58px;left: -185px;width: 150px;white-space: normal;">' +
    //             '<div class="arrow" style="border-left:5px solid #313785"></div>' +
    //             '<div class="popover-content">' +
    //             'Click here to add more storage devices to this server, or move the sliders to increase size.</div>' +
    //             '</div>';
    //         $("a[data-bind='event: {click: add_disk}']").css("position", "relative").prepend(popstr);
    //         $("#pop3").fadeIn(2000);
    //         window.setTimeout(function() {
    //             $("#pop3").fadeOut(2000);
    //         }, 10000);
    //       });
    //   popZone();
    //   $(".zoneselector").click(function() {
    //     popServer();
    //     $("#pop1").fadeOut(2000);
    //   });
    //   $(".hover-large").click(function() {
    //     popDisk();
    //     $("#pop1, #pop2").fadeOut(2000);
    //     dynPop();
    //   });
    //   $(".my-event blue-hover hover-small").click(function() {
    //     $("#pop1, #pop2, #pop3").fadeOut(2000);
    //   });
    //   // to hide bandwidth slider
    //   //$(".bandwith-icon, [data-bind='template: { name: 'input-range-template', data: bandwidth}']").hide()
    // }
    // tutorialsPop();
    // dynPop();
  }
);
