/*
 The game screen consists of a background, a header at the top that
 contains the start, game over, replay, and game timer text, 
 text fields for the gems broken and high score,
 and finally a gem holder that contains all teh gems and logic for moving them.
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
	gameLength = 30000,
	countdownSecs = gameLength / 1000,
	canStartNewGame = true;


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

		//Gems holder contains all the gems and logic for how they move
		this.gemsHolder = new GemsHolder({gameController:this});
		this.addSubview(this.gemsHolder);

		//Header view contains top text, so that they animate together
		this.headerView = new ui.ImageView({
			superview: this,
			image: headerImage,
			x: 70,
			y: -20,
			width: headerImage.getWidth(),
			height: headerImage.getHeight(),
			scale: 1.75
		});
		this.topText = new ui.TextView({
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
		this.topText.setText("START");

		//scoreboard contains high score so they can be moved as a single unit
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

		/*point the animator to the top text, 
		the only thing that the game screen animates */
		this._animator = animate(this.headerView);

		/* When the user taps the header, begina a new game
		 */
		this.headerView.on('InputSelect', bind(this, function () {
			if(canStartNewGame){

				canStartNewGame = false;
				this.gemsHolder.randomizeGemsGrid();
				score = 0;
				this._scoreBoard.setText("Gems Broken: " + score);

				//animate the header up. Switch to timer. And drop back down again
				this._animator.clear()
				.now({y:0}, 250)
				.then({y:-300}, 300)
				.then(bind(this, function () {
					this.topText.setText(countdownSecs);
				}))
				.then({y:-0}, 300)
				.then({y:-20}, 250)
				.then(bind(this, function () {
					this.playGame();
				}));
			}
		}));
	};

	//called when a gem is broken
	this.incrementScore = function(){
		score++;
		this._scoreBoard.setText("Gems Broken: " + score);
	};

	//see if the high score should be updated
	this.updateHighScore = function(){
		highScore = Math.max(score, highScore);
		this._highScore.setText("High Score: " + highScore);
	};

	//begin the gameplay
	this.playGame = function(){
		this.gameActive = true;
		this.gemsHolder.waitForInput();

		//increment the timer every second
		var i = setInterval(this.updateCountdown.bind(this), 1000);

		//end the game after 30 seconds
		setTimeout(bind(this, function () {
			clearInterval(i);
			this.topText.setText("0");
			this.gameActive = false;
			/* end the game if waiting for input. otherwise, the gemHolder will tell the game to
			end when it's animations complete.*/
			if(this.gemsHolder.inputState == "noSelection" || this.gemsHolder.inputState == "gemSelected"){
				this.endGame();
				if(this.gemsHolder.inputState == "gemSelected"){
					this.gemsHolder.unselectGem();
				}
			}
		}), gameLength);
	};

	//end the gameplay
	this.endGame = function(){
		this.topText.setText("GAME OVER");
		this.updateHighScore();
		countdownSecs = gameLength / 1000;

		setTimeout(bind(this, function () {
			canStartNewGame = true;
			this.topText.setText("REPLAY");
		}), 2000);
	};

	//increment the timer
	this.updateCountdown = function(){
		countdownSecs -= 1;
		this.topText.setText(countdownSecs);
	};
});