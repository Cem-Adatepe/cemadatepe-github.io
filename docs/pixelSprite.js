// pixelSprite.js

class PixelSprite {
  /**
   * @param {Object} options
   * @param {number[][]} options.frames - Array of frame arrays (each an array of 1s/0s)
   * @param {number} options.rows      - e.g. 15
   * @param {number} options.cols      - e.g. 15
   * @param {string} options.mountPoint - CSS selector or an actual DOM element where to render
   * @param {number} [options.pixelSize=5] - Width/height for each "pixel" in px
   * @param {string} [options.colorOn='white']  - Color used for bits that are "1"
   * @param {string} [options.colorOff='black'] - Color used for bits that are "0"
   * @param {boolean} [options.toggleFrames=false] - Whether to flip through multiple frames
   * @param {number} [options.frameInterval=300] - How many ms to pause between flips
   * @param {number[][]} [options.clickFrames=null] - Frames to display on click
   * @param {number} [options.clickFrameDuration=2000] - ms to show click animation
   */
  constructor({
    frames,
    rows,
    cols,
    mountPoint,
    pixelSize = 5,
    colorOn = "white",
    colorOff = "black",
    toggleFrames = false,
    frameInterval = 300,
    clickFrames = null,
    clickFrameDuration = 2000,
  }) {
    this.frames = frames; // e.g. [ [0,0,1...], [1,1,0...] ]
    this.rows = rows; // e.g. 15
    this.cols = cols; // e.g. 15
    this.mountPoint = mountPoint; // e.g. '.my-sprite-container'
    this.pixelSize = pixelSize;
    this.colorOn = colorOn;
    this.colorOff = colorOff;
    this.toggleFrames = toggleFrames;
    this.frameInterval = frameInterval;
    this.clickFrames = clickFrames;
    this.clickFrameDuration = clickFrameDuration;

    this.currentFrameIndex = 0;
    this.timer = null; // will hold setInterval or setTimeout ID
    this.pixels = []; // array of pixel DOM elements

    this.init();
  }

  init() {
    // 1) Create a container for this sprite
    this.container = document.createElement("div");
    this.container.classList.add("sprite-container");
    this.container.style.width = this.cols * this.pixelSize + "px";
    this.container.style.height = this.rows * this.pixelSize + "px";

    // Mount it in the given element or selector
    if (typeof this.mountPoint === "string") {
      document.querySelector(this.mountPoint).appendChild(this.container);
    } else {
      // if user gave an actual DOM node
      this.mountPoint.appendChild(this.container);
    }

    // 2) Create the pixel elements
    const totalPixels = this.rows * this.cols;
    for (let i = 0; i < totalPixels; i++) {
      const pixelDiv = document.createElement("div");
      pixelDiv.classList.add("pixel");
      // size each pixel
      pixelDiv.style.width = this.pixelSize + "px";
      pixelDiv.style.height = this.pixelSize + "px";
      this.container.appendChild(pixelDiv);
      this.pixels.push(pixelDiv);
    }

    // 3) Draw the first frame
    this.drawFrame(0);

    // 4) If we have multiple frames and we want to toggle, start animation
    if (this.toggleFrames && this.frames.length > 1) {
      this.start();
    }
    if (this.clickFrames) {
      this.container.addEventListener("click", () => {
        this.playClickAnimation();
      });
    }
  }

  drawFrame(frameIndex) {
    // If there's only one frame, clamp the index
    if (frameIndex >= this.frames.length) {
      frameIndex = 0;
    }
    const frameData = this.frames[frameIndex]; // array of 225 bits, etc.
    // Update each pixel
    for (let i = 0; i < frameData.length; i++) {
      const isOn = frameData[i] === 1;
      this.pixels[i].style.background = isOn ? this.colorOn : this.colorOff;
    }
  }

  start() {
    // If already animating, stop first (avoid double intervals)
    this.stop();

    // Switch frames instantly (no scanning) every frameInterval ms
    this.timer = setInterval(() => {
      // flip to next frame
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.frames.length;
      this.drawFrame(this.currentFrameIndex);
    }, this.frameInterval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Temporarily switch to `clickFrames` on click, then revert.
   */
  playClickAnimation() {
    // 1) Stop any ongoing animation
    this.stop();

    // 2) Remember the original frames & index
    const originalFrames = this.frames;
    const originalIndex = this.currentFrameIndex;

    // 3) Switch to clickFrames
    this.frames = this.clickFrames;
    this.currentFrameIndex = 0;
    this.drawFrame(0);

    // 4) If we have more than 1 click frame, start toggling
    if (this.clickFrames.length > 1) {
      this.start();
    }

    // 5) After a set duration, revert back
    setTimeout(() => {
      this.stop();
      this.frames = originalFrames;
      // Reset index or keep the old one, as desired
      this.currentFrameIndex = originalIndex;
      this.drawFrame(this.currentFrameIndex);

      // Resume original animation if needed
      if (this.toggleFrames && this.frames.length > 1) {
        this.start();
      }
    }, this.clickFrameDuration);
  }
}

// Optionally, export it if you're using ES modules or bundlers:
// export default PixelSprite;
