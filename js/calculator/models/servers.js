define(['lib/knockout', 'lib/underscore', '../utils', '../parser', './licenses', '../availability', './resources', './server_attributes', './storages'],
  function(ko, _, utils, parser, Licenses, availability, resources, ServerAttributes, Storages) {

    function BaseServer(options, build_data) {
      this.unique_id = utils.unique_id.build();

      this.name = this.set_name(options.name, build_data.name);

      this.ip = new ServerAttributes.SaticIP(options.ip);
      this.firewall = new ServerAttributes.Firewall(options.firewall);

      this.storages = ko.observableArray();

      this.cpu = new build_data.CpuConstructor(options.cpu);
      this.ram = new build_data.RamConstructor(options.ram);

      this.price = ko.pureComputed(this._compute_price, this);
      this.formatted_price = ko.pureComputed(this._formatted_price, this);

      // Init
      this.add_storages(options.ssd, build_data.SsdConstructor);
      this.add_storages(options.hdd, build_data.HddConstructor);

      if (this.available_storages.ssd)
        this.Storage = build_data.SsdConstructor;
      else if (this.available_storages.hdd)
        this.Storage = build_data.HddConstructor;
    }
    _.extend(BaseServer.prototype, {
      _compute_price: function() {
        var total = 0;
        total += this.cpu.price();
        total += this.ram.price();
        total += this.ip.price();
        total += this.firewall.price();
        total += _.reduce(this.storages(), utils.sum_function, 0);

        return total;
      },
      _formatted_price: function() {
        return utils.format_price(this.price());
      },
      set_name: function(name, class_name) {
        return name || class_name + ' ' + this.unique_id;
      },
      remove_storage: function(data) {
        this.storages.remove(data);
      },
      add_storages: function(storages, builder) {
        _.each(storages, function(storage) {
          this.storages.push(new builder(storage));
        }, this);
      },
      add_storage: function() {
        this.storages.push(new this.Storage(5));
      },
      has_storage: function() {
        return _.any(this.available_storages);
      }
    });

    function Container(options) {
      /**
      Server model

      Options:
        * name:           Name of server
        * ip:             Boolean if it has an ip
        * firewall:       Boolean if it has a firewall
        * cpu:            Value for cpu
        * ram:            Value for ram
        * ssd:            List of values for ssd
        * hdd:            List of values for hdd
      */
      BaseServer.call(this, options, {
        name: 'Linux Container',
        CpuConstructor: ServerAttributes.CpuContainer,
        RamConstructor: ServerAttributes.RamContainer,
        SsdConstructor: Storages.SsdFolder,
        HddConstructor: Storages.HddFolder
      });
    }
    _.extend(Container.prototype, BaseServer.prototype, {
      available_storages: availability.flag.folders,
      type: 'container',
      template: 'container-template',
      serialize: parser.serialize_base_server,
      resources: resources.container
    });

    function VirtualMachine(options) {
      /**
      Server model

      Options:
        * name:           Name of server
        * ip:             Boolean if it has an ip
        * firewall:       Boolean if it has a firewall
        * cpu:            Value for cpu
        * ram:            Value for ram
        * ssd:            List of values for ssd
        * hdd:            List of values for hdd

        * windows_server_license: Index for windows server licenses
        * additional_license:     Index for other licenses
        * remote_desktops:        Number of remote desktop licenses
      */

      BaseServer.call(this, options, {
        name: 'Virtual Machine',
        CpuConstructor: ServerAttributes.CpuVirtualMachine,
        RamConstructor: ServerAttributes.RamVirtualMachine,
        SsdConstructor: Storages.SsdDrive,
        HddConstructor: Storages.HddDrive,
      });
      this.licenses = new Licenses(options);

      // Computed
      this.price = ko.pureComputed(this._compute_virtual_machine_price, this);

      // The Switch is done at the drive but who can do something about it is
      // the parent of the drive this is the reason for this bind
      _.bindAll(this, 'switch_to_hdd_drive', 'switch_to_ssd_drive');

    }
    _.extend(VirtualMachine.prototype, BaseServer.prototype, {
      _compute_virtual_machine_price: function() {
        return this._compute_price() + this.licenses.price();
      },
      available_storages: availability.flag.drives,
      type: 'virtual_machine',
      template: 'virtual-machine-template',
      serialize: parser.serialize_virtual_machine,
      switch_to_hdd_drive: function(data, event) {
        this.switch_disk_type(data.data, Storages.HddDrive);
      },
      switch_to_ssd_drive: function(data, event) {
        this.switch_disk_type(data.data, Storages.SsdDrive);
      },
      switch_disk_type: function(data, Constructor) {
        var index = this.storages.indexOf(data);
        if (index > -1) {
          var new_drive = new Constructor(data.chosen());
          this.storages.remove(data);
          this.storages.splice(index, 0, new_drive);
        }
      },
      resources: resources.virtual_machine
    });

    return {
      Container: Container,
      VirtualMachine: VirtualMachine
    };
  }
);
