define(['lib/underscore', './utils'], function(_, utils) {
  var availability = {
    flag: {
      virtual_machine: false,
      container: false,
      folders: {
        ssd: false,
        hdd: false
      },
      drives: {
        ssd: false,
        hdd: false
      }
    },
    set: function(data) {
      utils.updateObject(availability.flag, data);
    }
  };

  return availability;
});
