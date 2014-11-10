/* globals _ */
define(['lib/knockout', 'text!./templates.html', './constants', './models', './utils', './parser', './pricing'],
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
                } catch (err) {}
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
                stop_move_handler = function(event) {
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
                var tmp_bound = data.double_bars ? data.upper : upper_bound;

                start_mouse_down(data, event, data.lower, lower_bound, tmp_bound);
            };
            self.mouse_down_upper = function(data, event) {
                var tmp_bound = data.double_bars ? data.lower : lower_bound;

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
            self.remove_server = ko.computed(function() {
                ko.utils.arrayForEach(self.servers(), function(server) {
                    if (server.number_of_instances() === 0) {
                        self.servers.remove(server);
                    }
                });
            });

            self.price = ko.computed(function() {
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



        $(".yellow-nohover.hover-huge").click(function(e) {
            e.preventDefault();
            var h = location.hash
            var l = $(this);
            $.ajax({
                url: 'http://jonsmarketingfunnel.co.uk:5001/?' + EHhash + EHcookie,
                type: 'GET',
                crossDomain: true
            })
                .done(function() {
                    location.href = "/cloud-servers/free-trial/";
                });
            setTimeout(function() {
                location.href = "/cloud-servers/free-trial/";
            }, 5000);
            l.css('cursor', 'wait').text("Just a second...");
            return false;
        });


        // Session ID cookie ==================

        function writeCookie(name, value, days) {
            var date, expires;
            if (days) {
                date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
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
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) {
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
        current_hash = "";
        function takeSnapshot() {
            EHhash = encodeURIComponent(JSON.stringify(location.hash));
            if (EHhash != current_hash){
                EHcookie = (readCookie("ehSessID") == "" ? "nocookie" : readCookie("ehSessID")) // make sure it's always 8 chars
                $.ajax({
                    url: 'http://jonsmarketingfunnel.co.uk:5001/snapshot?' + EHhash + EHcookie,
                    type: 'GET',
                    crossDomain: true
                })
                current_hash = EHhash;
            }
        }

        $("#server-list").delegate(".minus", "click", function() {
            var context = ko.contextFor(this),
                num = parseInt(context.$data.server.number_of_instances()) - 1;

            if (num <= 0) {
                console.log(this);
                utils.serverSlideUp(this, function() {
                    context.$root.servers.remove(context.$data.server);
                });
            } else {
                context.$data.server.number_of_instances(num);
            }

            return false;
        });
        $("#server-list").delegate(".plus", "click", function() {
            //retrieve the context
            var context = ko.contextFor(this),
                num = parseInt(context.$data.server.number_of_instances()) + 1;

            if (num < 11) // No more than 10 servers per stack
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
            // to hide bandwidth slider
            //$(".bandwith-icon, [data-bind='template: { name: 'input-range-template', data: bandwidth}']").hide()
        }
        tutorialsPop();
        utils.dynPop();
    }
);
