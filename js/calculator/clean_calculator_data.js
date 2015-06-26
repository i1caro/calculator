define(['lib/underscore', './availability'], function(_, availability) {
  function remove_disconnected_storages(storages, available_storages) {
    _.each(storages, function(storage, key) {
      if (!available_storages[key])
        storages[key] = [];
    });
  }

  function clean_virtual_machine(data) {
    if (!availability.flag.drives.ssd)
      data.ssd = [];
    if (!availability.flag.drives.hdd)
      data.hdd = [];
    if (!availability.flag.drives.hdd && !availability.flag.drives.ssd)
      data.licenses = [];
    return data;
  }

  function clean_container(data) {
    if (!availability.flag.folders.ssd)
      data.ssd = [];
    if (!availability.flag.folders.hdd)
      data.hdd = [];
    return data;
  }

  function clean_data(data) {
    if (!availability.flag.virtual_machine)
      data.virtual_machines = [];
    if (!availability.flag.container)
      data.containers = [];

    remove_disconnected_storages(
      data.disconnected_drives, availability.flag.drives
    );
    remove_disconnected_storages(
      data.disconnected_folders, availability.flag.folders
    );

    return data;
  }

  return {
    full: clean_data,
    virtual_machine: clean_virtual_machine,
    container: clean_container
  };
});
