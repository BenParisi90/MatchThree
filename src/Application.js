/*
 * The main application file, your game code begins here.
 */

//sdk imports
import device;
import ui.StackView as StackView;
//user imports
import src.GameScreen as GameScreen;
import src.soundcontroller as soundcontroller;

/* Your application inherits from GC.Application, which is
 * exported and instantiated when the game is run.
 */
exports = Class(GC.Application, function () {

	/* Run after the engine is created and the scene graph is in
	 * place, but before the resources have been loaded.
	 */
	this.initUI = function () {
		//game screen contains logic for the game loop
		var gameScreen = new GameScreen();

		this.view.style.backgroundColor = '#000000';


		/*Our UI background image is 576 x 1024 we will design to this aspect ratio*/
		var rootView = new StackView({
			superview: this,
			x: 0,
			y: 0,
			width: 576,
			height: 1024,
			clip: true,
			scale: device.width / 576
		});

		rootView.push(gameScreen);

		//play the bacground music
		var sound = soundcontroller.getSound();
		sound.play('music');
	};

	/* Executed after the asset resources have been loaded.
	 * If there is a splash screen, it's removed.
	 */
	this.launchUI = function () {};
});
