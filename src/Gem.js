import animate;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import src.soundcontroller as soundcontroller;


var gemPathPrefix = "resources/images/gems/gem_0",
	gleamPathPrefix = "resources/images/particles/gleam_",
	gemSize = 68,
	gleamSize = 57,
	numOfGemTypes = 5,
	gemImages = [],
	gleamImages = [];


exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, {
			width:	gemSize,
			height: gemSize
		});

		supr(this, 'init', [opts]);

		//store all the possible gem images
		for(var i = 0; i < numOfGemTypes; i ++){
			var gemName = i + 1;
			gemImages.push(new Image({url: gemPathPrefix + gemName + ".png", sourceW: gemSize, sourceH: gemSize}));
			gleamImages.push(new Image({url: gleamPathPrefix + gemName + ".png", sourceW: gleamSize, sourceH: gleamSize}));
		}
		this.gemType = opts.gemType;
		this.gemHolder = opts.gemHolder;
		this.xPos = opts.xPos;
		this.yPos = opts.yPos;
		this.activeInput = true;

		this.build();
	};

	//make the gem display a target type
	this.setGemType = function(targetType){
		this.gemType = targetType;
		this.gemView.setImage(gemImages[this.gemType]);
		this.gleamView.setImage(gleamImages[this.gemType]);
	}

	//record the gems location on the board to return
	this.recordGemLocation = function(){
		this.xLoc = this.style.x;
		this.yLoc = this.style.y;
	}

	//stop any animations, and return the gem to its original position and size
	this.resetGem = function(){
		this._animator.clear();
		this.style.x = this.xLoc;
		this.style.y = this.yLoc;
		this.style.scale = 1;
		this.gemView.style.scale = 1;
	}
	
	//loop the selected gem animation
	this.selectGem = function () {
		this._animator.clear()
			.now({scale: 1.15, x: this.style.x-5, y: this.style.y-5}, 400)
			.then({scale: 1, x: this.style.x, y:this.style.y}, 400)
			.then(this.selectGem.bind(this));
	};

	//move the gem to a new position, used for swapping and falling in
	this.animateToPosition = function(tarX, tarY) {
		xDiff = tarX - this.style.x;
		yDiff = tarY - this.style.y;
		this._animator.clear()
			.now({x:this.style.x+xDiff, y:this.style.y+yDiff}, 500)
			.then(bind(this, function () {
				this.recordGemLocation();
				this.gemHolder.gemAnimComplete();
			}));
	};

	//play the sparkle animation of a gem being destroyed
	this.playDestroyAnim = function(){
		this._animator.clear()
			.now(bind(this, function () {
				this.gemView.hide();
				this.gleamView.show();
			}))
			.then({scale: 1.15, x: this.style.x-5, y: this.style.y-5}, 150)
			.then({scale: 1, x: this.style.x, y:this.style.y}, 150)
			.then(bind(this, function () {
				this.resetGem();
			}));
	}

	/*
	 * Layout
	 */
	this.build = function () {

		this.gemView = new ui.ImageView({
			superview: this,
			image: gemImages[this.gemType],
			x: 0,
			y: 0,
			width: gemSize,
			height: gemSize
		});

		this.gleamView = new ui.ImageView({
			superview: this,
			image: gleamImages[this.gemType],
			x: (gemSize - gleamSize) / 2,
			y: (gemSize - gleamSize) / 2,
			width:gleamSize,
			height:gleamSize
		});
		this.gleamView.hide();

		this._inputview = new ui.View({
			superview: this,
			clip: true,
			x: 0,
			y: 0,
			width: gemSize,
			height: gemSize
		});

		/* Create an animator object for gem. 
		*/
		this._animator = animate(this);

		//when you click the gem, if there is a gem selected, swap them, 
		//if there is no gem select it,
		//if you picked the selected gem, deselect it 
		this._inputview.on('InputSelect', bind(this, function () {
			if (this.activeInput) {
				switch(this.gemHolder.inputState){
					case "noSelection":
						this.gemHolder.selectGem(this);
						break;
					case "gemSelected":
						if(this === this.gemHolder.selectedGem)
						{
							this.gemHolder.unselectGem();
						}
						else
						{
							this.gemHolder.swapGems(this, this.gemHolder.selectedGem);
						}
						break;
				}
			}
		}));
	};
});
