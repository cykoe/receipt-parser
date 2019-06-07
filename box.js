/**
 * Class representing a box, an area of texts from the receipt image
 */
class Box {
  /**
   * Create a box
   * @param parent_coordinates - parent bounding box
   * @param coordinates - current bounding box
   * @param text - texts within the bounding box
   */
  constructor(parent_coordinates, coordinates, text) {
    this.parent_coordinates = parent_coordinates;
    this.coordinates = coordinates;
    this.text = text;
  }

  /**
   * Sort two Box objects based on their y-axis
   * @param x - first object
   * @param y - second object
   * @returns {number} 1 if x has greater value in
   * y-axis, -1 if y has greater value, 0 if they
   * have the same y-value
   */
  static yAxisSort(x, y) {
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

  /**
   * Sort two Box objects based on their x-axis
   * @param x - first object
   * @param y - second object
   * @returns {number} 1 if x has greater value in
   * x-axis, -1 if y has greater value, 0 if they
   * have the same x-value
   */
  static xAxisSort(x, y) {
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

  /**
   * Determine if they Box have the same parent
   * @param x - first object
   * @param y - second object
   * @returns {boolean} true if x and y have the
   * same parent, false otherwise
   */
  static hasSameParent(x, y) {
    return x.parent_coordinates === y.parent_coordinates;
  }

  /**
   * Determines if two boxes should be separated (by a space)
   * or they should be merged together
   * Based on width of each boxes and characters count of each
   * element, find each character's width. Then take the average
   * of the two widths and compare it with the distance between
   * the x-axis of the two boxes. If the distance is larger than
   * the width, then the two boxes are regarded as separated; if
   * the distance is smaller, then it is regarded as
   * one element
   * @param x - first object
   * @param y - second object
   * @returns {boolean} true if two objects should be merged, false
   * if two objects should be separated
   */
  static isXAxisNear(x, y) {
    // get the widths to elements
    const xWidth = x.coordinates[2] / x.text.length;
    const yWidth = y.coordinates[2] / y.text.length;
    // take the average and compare with the distance
    const average = (xWidth + yWidth) / 2;
    const distance = (parseInt(y.coordinates[0]) - (parseInt(x.coordinates[0]) + parseInt(x.coordinates[2])));

    return distance < average;
  }
}

module.exports = Box;
