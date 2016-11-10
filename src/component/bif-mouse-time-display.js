/* global videojs */

/* eslint-disable no-underscore-dangle */

import { BIFParser } from '../parser';
import { getPointerPosition } from '../util/dom';

const defaults = {
  createBIFImage: Function.prototype,
  createBIFTime: Function.prototype,
  template: Function.prototype,
};

const VjsMouseTimeDisplay = videojs.getComponent('MouseTimeDisplay');

/**
 * Extends the `MouseTimeDisplay` component with an image preview based on a the time
 * at which the user hovers over the `SeekBar`.
 *
 * @example
 * videojs('player').ready(function () {
 *   this.bif({
 *     src: '/path/to/bif.bif',
 *   });
 * });
 *
 * videojs('player').ready(function () {
 *   this.bif({
 *     data: event.target.response,
 *   });
 * });
 *
 * @param {Object} [options]
 * @param {ArrayBuffer} options.data
 * @param {function} [options.createBIFImage]
 * @param {function} [options.createBIFTime]
 * @param {function} [options.template]
 */
export default class BIFMouseTimeDisplay extends VjsMouseTimeDisplay {
  /**
   * Create BIF element.
   *
   * @param {HTMLElement} root
   * @returns {HTMLElement} BIFElement
   */
  static createBIFElement(root) {
    const BIFElement = document.createElement('div');

    BIFElement.className = 'bif-container';

    root.appendChild(BIFElement);

    return BIFElement;
  }

  /**
   * Create BIF image element.
   *
   * @returns {HTMLElement} BIFImage
   */
  static createBIFImage() {
    const BIFImage = document.createElement('img');

    BIFImage.className = 'bif-image';

    return BIFImage;
  }

  /**
   * Create BIF time element.
   *
   * @returns {HTMLElement} BIFTime
   */
  static createBIFTime() {
    const BIFTime = document.createElement('span');

    BIFTime.className = 'bif-time';

    return BIFTime;
  }

  constructor(player, options = {}) {
    super(player, options);

    this.BIFElement = BIFMouseTimeDisplay.createBIFElement(this.el());

    this.render(options);
  }

  /**
   * Configures the component with new options. If one of those options is data,
   * then the component attempts to convert that data into usable BIF image previews.
   *
   * @param {Object} [options]
   * @param {ArrayBuffer} options.data
   * @param {function} [options.createBIFImage]
   * @param {function} [options.createBIFTime]
   * @param {function} [options.template]
   */
  configure(options) {
    this.options_ = videojs.mergeOptions(defaults, this.options_, options);

    const { data } = options;

    if (data instanceof ArrayBuffer) {
      this.BIFParser = new BIFParser(data);
    } else if (data != null) {
      throw new Error('Invalid BIF data.');
    }
  }

  /**
   * Gets the current BIF image at a specific time in seconds.
   *
   * @param {number} time in seconds
   * @returns {string} image base64 encoded image
   */
  getCurrentImageAtTime(time) {
    let image;

    if (this.hasImages()) {
      image = this.BIFParser.getImageDataAtSecond(time);
    }

    return image;
  }

  /**
   * Gets the current time in seconds based on the mouse position over the `SeekBar`.
   *
   * @param {Event} event
   * @returns {number} time
   */
  getCurrentTimeAtEvent(event) {
    const { seekBar } = this.player_.controlBar.progressControl;

    const position = getPointerPosition(
      event,
      seekBar.el()
    );

    return position.x * this.player_.duration();
  }

  /**
   * Event that fires every time the mouse is moved, throttled, over the `ProgressControl`.
   *
   * @param {Event} event
   */
  handleMouseMove(event) {
    super.handleMouseMove(event);

    // gets the time in seconds
    const time = this.getCurrentTimeAtEvent(event);

    // gets the image
    const image = this.getCurrentImageAtTime(time);

    // updates the template with new information
    this.updateTemplate({
      image,
    });
  }

  /**
   * Determines the existence of the `BIFParser` which manages the index and all
   * associated images.
   *
   * @returns {boolean}
   */
  hasImages() {
    return !!this.BIFParser;
  }

  /**
   * Renders and rerenders the BIF component. It manages the three main elements
   * of the component—`BIFImage`, `BIFTime`, and the `template`.
   *
   * @param {Object} [options]
   * @param {ArrayBuffer} options.data
   * @param {function} [options.createBIFImage]
   * @param {function} [options.createBIFTime]
   * @param {function} [options.template]
   */
  render(options) {
    this.configure(options);

    // create BIF image element

    const BIFImage = this.options_.createBIFImage.apply(this);

    if (BIFImage instanceof HTMLElement) {
      this.BIFImage = BIFImage;
    } else {
      this.BIFImage = BIFMouseTimeDisplay.createBIFImage();
    }

    // create BIF time element

    const BIFTime = this.options_.createBIFTime.apply(this);

    if (BIFTime instanceof HTMLElement) {
      this.BIFTime = BIFTime;
    } else {
      this.BIFTime = BIFMouseTimeDisplay.createBIFTime();
    }

    // create BIF template element

    let template = this.options_.template.apply(this);

    if (!(template instanceof HTMLElement)) {
      template = this.template();
    }

    // replace template contents every render

    this.BIFElement.innerHTML = '';

    this.BIFElement.appendChild(template);
  }

  /**
   * The primary template for the component. Typically houses the `BIFImage` and
   * `BIFTime` elements to be styled or altered.
   *
   * @returns {HTMLElement} template
   */
  template() {
    const template = document.createElement('div');

    template.className = 'bif';

    // append image element only if the images are ready
    if (this.hasImages()) {
      template.appendChild(this.BIFImage);
    }

    template.appendChild(this.BIFTime);

    return template;
  }

  /**
   * Update template elements with new content generated on mouse move.
   *
   * @param {Object} options.image
   */
  updateTemplate({ image }) {
    if (image) {
      this.BIFImage.src = image;
    }

    this.BIFTime.innerHTML = this.el().getAttribute('data-current-time');
  }
}
