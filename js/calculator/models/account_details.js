define(['lib/knockout', 'lib/underscore', '../pricing', '../limiting',  '../utils', './resources', './components'],
  function(ko, _, pricing, limiting, utils, resources, Components) {
    var prices = pricing.prices,
        limits = limiting.limits;

    function Bandwidth(value) {
      Components.Slider.call(this, {
        name: 'Data',
        min: limits.subscription.min_xfer,
        max: limits.subscription.max_xfer,
        value: value,
        price: prices.xfer,
        step: utils.returns(1),
        unit: 'GB'
      });
    }
    _.extend(Bandwidth.prototype, Components.Slider.prototype);

    function AdditionalIps(value) {
      Components.AccountOption.call(this, {
        name: 'Additional IPs',
        unit: 'IPs',
        price: prices.ip,
        max: this.max,
        value: value
      });
    }
    _.extend(AdditionalIps.prototype, Components.AccountOption.prototype, {
      max: function() {
        return limits.subscription.max_ip() + this.value();
      }
    });

    function AdditionalVlans(value) {
      Components.AccountOption.call(this, {
        name: 'Additional VLANs',
        unit: 'VLANs',
        price: prices.vlan,
        max: limits.subscription.max_vlan,
        value: value
      });
    }
    _.extend(AdditionalVlans.prototype, Components.AccountOption.prototype);

    function AccountDetails(options) {
      /**
      AccountDetails model

      Options:
        * bandwidth:         Initial numeric value for bandwidth
        * ips:               Initial number of ips
        * vlans:             Initial number of vlans
      */

      this.bandwidth = new Bandwidth(options.bandwidth);
      this.additional_ips = new AdditionalIps(options.ips);
      this.additional_vlans = new AdditionalVlans(options.vlans);

      this.free_bandwidth = ko.observable(0);

      this.have_free_bandwidth = ko.pureComputed(
        this._have_free_bandwidth, this
      );

      this.free_bandwidth_message = ko.pureComputed(
        this._free_bandwidth_message, this
      );

      this.update_bandwidth = ko.computed(this._update_bandwidth, this);

      this.price = ko.pureComputed(this._compute_price, this);
    }
    _.extend(AccountDetails.prototype, {
      _have_free_bandwidth: function() {
        return !!this.free_bandwidth();
      },
      _free_bandwidth_message: function() {
        var price = utils.format_price(this.bandwidth.unit_price()),
            free_bandwidth = utils.gigaToTera(this.free_bandwidth());
        return free_bandwidth + ' TB free, then ' + price + ' per GB';
      },
      _compute_price: function() {
        var total = 0;

        total += this.bandwidth.price();
        total += this.additional_ips.price();
        total += this.additional_vlans.price();
        return total;
      },
      _update_bandwidth: function() {
        if (this.have_free_bandwidth())
          this.bandwidth.chosen(0);
      },
      serialize: function() {
        return [
          this.bandwidth.chosen(),
          this.additional_ips.chosen(),
          this.additional_vlans.chosen()
        ];
      },
      resources: resources.account_detail
    });

    return AccountDetails;
  }
);
