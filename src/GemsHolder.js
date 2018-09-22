//import src.Gem as Gem;
import ui.View;

import src.Gem as Gem;

/*Two dimenstional array for holding all our Gems*/
var gridSize = 544,
	gemSize = 68,
	gemRows = 8,
	gemCols = 8,
	numOfGemTypes = 5;

exports = Class(ui.View, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 19,
			y: 302,
			width: gridSize,
			height: gridSize
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	/*
	 * Layout the scoreboard and molehills.
	 */
	this.build = function () {

		var x_offset = 19;
		var y_offset = 160;

		/*this.style.width = 320;
		this.style.height = 480;*/

		//list of all gems as 1 dimensional array
		this.gemsList = [];
		//gird of gems as 2 dimensional array
		this.gemsGrid = [];
		this.inputState = "noSelection";

		for (var row = 0; row < gemRows; row++) {
			//add a new row of gems
			this.gemsGrid.push([]);

			for (var col = 0; col < gemCols; col++) {

					var gemType = this.randomGemType();
					while(this.gemCausesRowMatch(col, row, gemType) || this.gemCausesColMatch(col, row, gemType))
					{
						gemType = this.randomGemType();
					}
					var gem = new Gem({gemType: gemType, gemHolder:this, xPos:col, yPos:row});
					gem.style.x = col * gem.style.width;
					gem.style.y = row * (gem.style.height);
					gem.recordGemLocation();
					this.addSubview(gem);
					this.gemsGrid[row].push(gem);
					this.gemsList.push(gem);
					//update score on hit event
					/*molehill.on('molehill:hit', bind(this, function () {
						if (game_on) {
							score = score + hit_value;
							this._scoreboard.setText(score.toString());
						}
					}));*/
			}
		}
	};

	this.randomGemType = function(){
		return Math.floor(Math.random() * numOfGemTypes);
	};

	/*we count up and to the left of gem to see if they cause a match*/
	this.gemCausesColMatch = function(xPos, yPos, gemType) {
		//if we are too clase to the wall, we know we dont have a match
		if(yPos < 2){
			return false;
		}
		var yTar = yPos - 1;
		var numMatches = 0;
		while(yTar >= 0 && this.gemsGrid[yTar][xPos].gemType == gemType){
			numMatches ++;
			yTar --;
			if(numMatches >= 2){
				return true;
			}
		}
		return false;
	};

	this.gemCausesRowMatch = function(xPos, yPos, gemType){
		//if we are too clase to the wall, we know we dont have a match
		if(xPos < 2){
			return false;
		}
		var xTar = xPos - 1;
		var numMatches = 0;
		while(xTar >= 0 && this.gemsGrid[yPos][xTar].gemType == gemType){
			numMatches ++;
			xTar --;
			if(numMatches >= 2){
				return true;
			}
		}
		return false;
	}

	this.selectGem = function(gem){
		this.inputState = "gemSelected";
		//move the selected gem to the top of others
		this.removeSubview(gem);
		this.addSubview(gem);
		this.selectedGem = gem;
		gem.selectGem();
		//deactive all gems except one adjacent to selection
		for(var i = 0; i < this.gemsList.length; i ++)
		{
			var targetGem = this.gemsList[i];
			targetGem.activeInput = ((Math.abs(gem.xPos - targetGem.xPos) == 1 && gem.yPos == targetGem.yPos)
				|| (gem.xPos == targetGem.xPos && Math.abs(gem.yPos - targetGem.yPos) == 1));
		}
	};

	this.swapGems = function(gem1, gem2){
		this.inputState = "waitingForSwap";
		this.activateAllGems(false);
		this.selectedGem = null;
		gem1.resetGem();
		gem2.resetGem();
		//swap the gems place in both the model and visually
		this.gemsGrid[gem1.yPos][gem1.xPos] = gem2;
		this.gemsGrid[gem2.yPos][gem2.xPos] = gem1;
		gem1.animateToGemPosition(gem2);
		gem2.animateToGemPosition(gem1);
		var tempGemXPos = gem1.xPos;
		var tempGemYPos = gem1.yPos;
		gem1.xPos = gem2.xPos;
		gem1.yPos = gem2.yPos;
		gem2.xPos = tempGemXPos;
		gem2.yPos = tempGemYPos;
	};

	this.swapComplete = function(){
		if(this.inputState == "waitingForSwap"){
			this.deleteMatches();
		}
	};

	this.activateAllGems = function(toggleOn){
		for(var i = 0; i < this.gemsList.length; i ++){
			this.gemsList[i].activeInput = toggleOn;
		}
	};

	this.deleteMatches = function(){
		var colsToDrop = [0,0,0,0,0,0,0,0];
		var hasDrops = false;
		for (var row = 0; row < gemRows; row++) 
		{
			for (var col = 0; col < gemCols; col++) 
			{
				var targetGem = this.gemsGrid[row][col];
				if(this.gemCausesRowMatch(col, row, targetGem.gemType))
				{
					for(var i = col; i > col - 3; i --)
					{
						this.removeSubview(this.gemsGrid[row][i]);
						colsToDrop[i] += 1;
						hasDrops = true;
					}
				}
				if(this.gemCausesColMatch(col, row, targetGem.gemType))
				{
					for(var i = row; i > row - 3; i --)
					{
						this.removeSubview(this.gemsGrid[i][col]);
						colsToDrop[col] += 1;
						hasDrops = true;
					}
				}
			}
		}
		if(hasDrops){
			this.dropCols(colsToDrop);
			this.inputState = "droppingCols";
		}else{
			this.inputState = "noSelection";
			this.activateAllGems(true);
		}
		
	};

	this.dropCols = function(colsToDrop){
		console.log(colsToDrop);
	}
});