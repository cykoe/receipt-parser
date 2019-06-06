class BoxTuple {
  constructor(parent_coordinates, coordinates, text) {
    this.parent_coordinates = parent_coordinates;
    this.coordinates = coordinates;
    this.text = text;
  }

  static y_axis_sort(x, y) {
      const cmp_x = parseInt(x.coordinates[1]);
      const cmp_y = parseInt(y.coordinates[1]);
      if (cmp_x > cmp_y) {
        return 1;
      } else if (cmp_x < cmp_y) {
        return -1;
      } else {
        return 0;
      }
    }

  static x_axis_sort(x, y) {
      const cmp_x = parseInt(x.coordinates[0]);
      const cmp_y = parseInt(y.coordinates[0]);
      if (cmp_x > cmp_y) {
        return 1;
      } else if (cmp_x < cmp_y) {
        return -1;
      } else {
        return 0;
      }
    }

  static has_same_parent(x, y) {
    return x.parent_coordinates == y.parent_coordinates;
  }

  static is_x_axis_near(x, y) {
    return parseInt(y.coordinates[0]) - (parseInt(x.coordinates[0]) + parseInt(x.coordinates[2])) < parseInt(y.coordinates[2])
  }
}

module.exports = BoxTuple;
