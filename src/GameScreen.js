/*
 * The title screen consists of a background image and a
 * start button. When this button is pressed, and event is
 * emitted to itself, which is listened for in the top-level
 * application. When that happens, the title screen is removed,
 * and the game screen shown.
 */
import device;
import animate;
import ui.View;
import ui.TextView;
import ui.resource.Image as Image;
import ui.ImageView;
import src.GemsHolder as GemsHolder;

var headerImage = new Image({url: "resources/images/ui/header.png", sourceW: 249, sourceH: 166}),
	score = 0;
	highScore = 0;

/* The title screen is added to the scene graph when it becomes
 * a child of the main application. When this class is instantiated,
 * it adds the start button as a child.
 */
exports = Class(ui.ImageView, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			image: "resources/images/ui/background.png"
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.build = function() {

		var gemsHolder = new GemsHolder({gameController:this});
		this.addSubview(gemsHolder);

		this.headerView = new ui.ImageView({
			superview: this,
			image: headerImage,
			x: 70,
			y: -20,
			width: headerImage.getWidth(),
			height: headerImage.getHeight(),
			scale: 1.75
		});

		var startText = new ui.TextView({
			superview: this.headerView,
			x: 0,
			y: 85,
			width: this.headerView.style.width,
			height: 50,
			autoSize: false,
			size: 45,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			color: '#FFFFFF'
		});
		startText.setText("START");

		this._scoreBoard = new ui.TextView({
			superview: this,
			x: 20,
			y: 882,
			width: 320,
			height: 50,
			autoSize: false,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'left',
			wrap: false,
			color: '#FFFFFF'
		});
		this._scoreBoard.setText("Gems Broken: ");

		this._highScore = new ui.TextView({
			superview: this._scoreBoard,
			x: 0,
			y: 50,
			width: 320,
			height: 50,
			autoSize: false,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'left',
			wrap: false,
			color: '#FFFFFF'
		});
		this._highScore.setText("High Score: " + highScore);

		this._animator = animate(this.headerView);

		/* Listening for a touch or click event, and will dispatch a
		 * custom event to the title screen, which is listened for in
		 * the top-level application file.
		 */
		this.headerView.on('InputSelect', bind(this, function () {
			console.log("start the game");
			this._animator.clear()
			.now({y:0}, 250)
			.then({y:-300}, 300);
			gemsHolder.waitForInput();
			this.emit('titlescreen:start');
		}));
	};

	this.incrementScore = function(){
		score++;
		this._scoreBoard.setText("Gems Broken: " + score);
	}
});
