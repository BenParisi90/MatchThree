import AudioManager;

exports.sound = null;

/* Initialize the audio files if they haven't been already.
 */
exports.getSound = function () {
  if (!exports.sound) {
    exports.sound = new AudioManager({
      path: 'resources/sounds',
      files: {
        music: {
          path: 'music',
          volume: 0.5,
          background: true,
          loop: true
        },
        gemBreak: {
          path: 'effect',
          background: false
        },
        gemSwap: {
          path: 'effect',
          background: false
        },
        gemSwapBack: {
          path: 'effect',
          background: false
        },
      }
    });
  }
  return exports.sound;
};
