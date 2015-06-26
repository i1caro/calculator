define(['lib/knockout', 'lib/underscore', '../pricing', '../limiting',  '../utils', './resources', './components', './licenses'],
  function(ko, _, pricing, limiting, utils, resources, Components, Licenses) {
    var prices = pricing.prices,
        limits = limiting.limits;

    function HddFolder(value) {
      Components.Slider.call(this, {
        name: 'HDD',
        min: limits.instance.disk_min,
        max: limits.instance.disk_max,
        value: value,
        price: prices.disk,
        step: utils.returns(1),
        unit: 'GB'
      });
    }
    _.extend(HddFolder.prototype, Components.Slider.prototype, {
      template: 'hdd-folder-template',
      type: 'hdd',
      resources: resources.hdd_folder
    });


    function SsdFolder(value) {
      Components.Slider.call(this, {
        name: 'SSD',
        min: limits.instance.disk_min,
        max: limits.instance.disk_max,
        value: value,
        price: prices.ssd,
        step: utils.returns(1),
        unit: 'GB'
      });
    }
    _.extend(SsdFolder.prototype, Components.Slider.prototype, {
      template: 'ssd-folder-template',
      type: 'ssd',
      resources: resources.ssd_folder
    });

    function SsdDrive(value) {
      Components.Slider.call(this, {
        name: 'SSD',
        min: limits.instance.disk_min,
        max: limits.instance.disk_max,
        value: value,
        price: prices.ssd,
        step: utils.returns(1),
        unit: 'GB'
      });
    }
    _.extend(SsdDrive.prototype, Components.Slider.prototype, {
      template: 'ssd-drive-template',
      type: 'ssd',
    });

    function HddDrive(value) {
      Components.Slider.call(this, {
        name: 'HDD',
        min: limits.instance.disk_min,
        max: limits.instance.disk_max,
        value: value,
        price: prices.disk,
        step: utils.returns(1),
        unit: 'GB'
      });
    }
    _.extend(HddDrive.prototype, Components.Slider.prototype, {
      template: 'hdd-drive-template',
      type: 'hdd'
    });

    function BaseDisconnected(options) {
      this.licenses = new Licenses(options);
      this.price = ko.pureComputed(this._calc_price, this);
    }
    _.extend(BaseDisconnected.prototype, {
      _calc_price: function() {
        return this.drive.price() + this.licenses.price();
      }
    });

    function DisconnectedSsdDrive(options) {
      /**
      Disconnected Drive

      Options:
        * size:                   Initial numeric value
        * windows_server_license: Index of windows server licenses
        * additional_license:     Index of other server
        * remote_desktops:        Number of remote desktops
      */
      this.drive = new SsdDrive(options.size);
      BaseDisconnected.call(this, options);
    }
    _.extend(DisconnectedSsdDrive.prototype, BaseDisconnected.prototype, {
        template: 'disconnected-ssd-drive-template',
        resources: resources.disconnected_ssd_drive
    });

    function DisconnectedHddDrive(options) {
      /**
      Disconnected Drive

      Options:
        * size:                   Initial numeric value
        * windows_server_license: Index of windows server licenses
        * additional_license:     Index of other server
        * remote_desktops:        Number of remote desktops
      */
      this.drive = new HddDrive(options.size);
      BaseDisconnected.call(this, options);
    }
    _.extend(DisconnectedHddDrive.prototype, BaseDisconnected.prototype, {
        template: 'disconnected-hdd-drive-template',
        resources: resources.disconnected_hdd_drive
    });

    return {
      SsdFolder: SsdFolder,
      HddFolder: HddFolder,
      HddDrive: HddDrive,
      SsdDrive: SsdDrive,
      DisconnectedSsdDrive: DisconnectedSsdDrive,
      DisconnectedHddDrive: DisconnectedHddDrive
    };
  }
);
