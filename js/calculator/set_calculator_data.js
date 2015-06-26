define(['lib/underscore', './utils', './clean_calculator_data', './models/servers', './models/storages'], function(_, utils, clean, Servers, Storages) {
    function SetCalculatorData(data) {
      if (data)
        this.set_data(data);
    }
    _.extend(SetCalculatorData.prototype, {
      add_virtual_machine: function(data) {
        var clean_data = clean.virtual_machine(data);
        this.servers.unshift(new Servers.VirtualMachine(clean_data));
      },
      add_container: function(data) {
        var clean_data = clean.container(data);
        this.servers.unshift(new Servers.Container(clean_data));
      },
      set_servers: function(data) {
        this.servers.removeAll();
        _.map(data['containers'], this.add_container, this);
        _.map(data['virtual_machines'], this.add_virtual_machine, this);
      },
      set_disconnected_drives: function(data) {
        this.disconnected_drives.removeAll();
        _.each(data['disconnected_drives']['ssd'], function(ssd) {
          this.disconnected_drives.push(new Storages.DisconnectedSsdDrive(ssd));
        }, this);
        _.each(data['disconnected_drives']['hdd'], function(hdd) {
          this.disconnected_drives.push(new Storages.DisconnectedHddDrive(hdd));
        }, this);
      },
      set_disconnected_folders: function(data) {
        this.disconnected_folders.removeAll();
        _.each(data['disconnected_folders']['ssd'], function(folder) {
          this.disconnected_folders.push(new Storages.SsdFolder(folder));
        }, this);
        _.each(data['disconnected_folders']['hdd'], function(folder) {
          this.disconnected_folders.push(new Storages.HddFolder(folder));
        }, this);
      },
      set_account_details: function(data) {
        this.account_details().bandwidth.chosen(data['bandwidth']);
        this.account_details().additional_vlans.value(data['vlans']);
        this.account_details().additional_ips.value(data['ips']);
      },
      set_data: function(data) {
        var clean_data = clean.full(data);

        this.set_servers(clean_data);
        this.set_account_details(clean_data['account_details']);

        if (clean_data['disconnected_folders'])
          this.set_disconnected_folders(clean_data);

        if (clean_data['disconnected_drives'])
          this.set_disconnected_drives(clean_data);
      }
    });
    return SetCalculatorData;
});
