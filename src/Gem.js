import animate;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import src.soundcontroller as soundcontroller;

/*var mole_normal_img = new Image({url: "resources/images/mole_normal.png", sourceW: 46, sourceH: 54}),
		mole_hit_img = new Image({url: "resources/images/mole_hit.png", sourceW: 46, sourceH: 54}),
		hole_back_img = new Image({url: "resources/images/hole_back.png", sourceW: 103, sourceH: 28}),
		hole_front_img = new Image({url: "resources/images/hole_front.png", sourceW: 103, sourceH: 28}),
		mole_up = 5,
		mole_down = 35;*/
var gemPathPrefix = "resources/images/gems/gem_0",
	gemSize = 68;


exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, {
			width:	gemSize,
			height: gemSize
		});

		supr(this, 'init', [opts]);

		//this.activeMole = false;
		this.gemType = opts.gemType;
		this.gemHolder = opts.gemHolder;
		this.xPos = opts.xPos;
		this.yPos = opts.yPos;
		this.activeInput = true;

		this.build();
	};

	this.recordGemLocation = function(){
		this.xLoc = this.style.x;
		this.yLoc = this.style.y;
	}

	this.resetGem = function(){
		this._animator.clear();
		this.style.x = this.xLoc;
		this.style.y = this.yLoc;
		this.style.scale = 1;
		this.gemView.style.scale = 1;
	}
	/* Set mole as inactive and animate it down.
	 */
	this.selectGem = function () {
		this._animator.clear()
			.now({scale: 1.15, x: this.style.x-5, y: this.style.y-5}, 400)
			.then({scale: 1, x: this.style.x, y:this.style.y}, 400)
			.then(this.selectGem.bind(this));
	};

	this.animateToPosition = function(tarX, tarY) {
		xDiff = tarX - this.style.x;
		yDiff = tarY - this.style.y;
		this._animator.clear()
			.now({x:this.style.x+xDiff, y:this.style.y+yDiff}, 500)
			.then(bind(this, function () {
				this.recordGemLocation();
				this.gemHolder.swapComplete();
			}));
	};

	/*
	 * Layout
	 */
	this.build = function () {
		var gemName = this.gemType + 1;
		this.gemImg = new Image({url: gemPathPrefix + gemName + ".png", sourceW: gemSize, sourceH: gemSize});

		this.gemView = new ui.ImageView({
			superview: this,
			image: this.gemImg,
			x: 0,
			y: 0,
			width: this.gemImg.getWidth(),
			height: this.gemImg.getHeight()
		});

		this._inputview = new ui.View({
			superview: this,
			clip: true,
			x: 0,
			y: 0,
			width: this.gemImg.getWidth(),
			height: this.gemImg.getHeight()
		});

		/* Create an animator object for gem. 
		*/
		this._animator = animate(this);
		//this._interval = null;

		//var sound = soundcontroller.getSound();

		this._inputview.on('InputSelect', bind(this, function () {
			if (this.activeInput) {
				switch(this.gemHolder.inputState){
					case "noSelection":
						this.gemHolder.selectGem(this);
						break;
					case "gemSelected":
						this.gemHolder.swapGems(this, this.gemHolder.selectedGem);
						break;
				}
			}
		}));
	};
});
