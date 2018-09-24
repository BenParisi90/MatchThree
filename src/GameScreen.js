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
	highScore = 0,
	gameLength = 5000,
	countdownSecs = gameLength / 1000,
	canStartNewGame = true;

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

		this.gameActive = false;

		this.gemsHolder = new GemsHolder({gameController:this});
		this.addSubview(this.gemsHolder);

		this.headerView = new ui.ImageView({
			superview: this,
			image: headerImage,
			x: 70,
			y: -20,
			width: headerImage.getWidth(),
			height: headerImage.getHeight(),
			scale: 1.75
		});

		this.startText = new ui.TextView({
			superview: this.headerView,
			x: 0,
			y: 85,
			width: this.headerView.style.width,
			height: 50,
			autoSize: false,
			size: 35,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			color: '#FFFFFF'
		});
		this.startText.setText("START");

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
			if(canStartNewGame){
				console.log("start the game");
				canStartNewGame = false;

				score = 0;
				this._scoreBoard.setText("Gems Broken: " + score);

				this._animator.clear()
				.now({y:0}, 250)
				.then({y:-300}, 300)
				.then(bind(this, function () {
					this.startText.setText(countdownSecs);
				}))
				.then({y:-0}, 300)
				.then({y:-20}, 250)
				.then(bind(this, function () {
					this.playGame();
				}));
			}
		}));
	};

	this.incrementScore = function(){
		score++;
		this._scoreBoard.setText("Gems Broken: " + score);
	};

	this.updateHighScore = function(){
		highScore = Math.max(score, highScore);
		this._highScore.setText("High Score: " + highScore);
	};

	this.playGame = function(){
		this.gameActive = true;
		this.gemsHolder.waitForInput();


		var i = setInterval(this.updateCountdown.bind(this), 1000);

		setTimeout(bind(this, function () {
			clearInterval(i);
			this.startText.setText("0");
			this.gameActive = false;
			/* end the game if waiting for input. otherwise, the gemHolder will tell the game to
			end when it's animations complete.*/
			if(this.gemsHolder.inputState == "noSelection" || this.gemsHolder.inputState == "gemSelected"){
				this.endGame();
				if(this.gemsHolder.inputState == "gemSelected"){
					this.gemHolder.unselectGem();
				}
			}
		}), gameLength);
	};

	this.endGame = function(){
		this.startText.setText("GAME OVER");
		this.updateHighScore();
		countdownSecs = gameLength / 1000;

		setTimeout(bind(this, function () {
			canStartNewGame = true;
			this.startText.setText("REPLAY");
		}), 2000);
	};

	this.updateCountdown = function(){
		countdownSecs -= 1;
		this.startText.setText(countdownSecs);
	};
});