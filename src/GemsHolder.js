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

		this.gameController = opts.gameController;
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
		this.gemsGrid = [];
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
		this.updateGemsGrid();
		this.inputState = "waitingForStart";
	};

	this.updateGemsGrid = function(){
		//grid of gems as 2 dimensional array
		this.gemsGrid = [[],[],[],[],[],[],[],[]];

		for(var i = 0; i < this.gemsList.length; i ++){
			var targetGem = this.gemsList[i];
			this.gemsGrid[targetGem.yPos][targetGem.xPos] = targetGem;
		}
	}

	this.waitForInput = function(){
		if(this.gameController.gameActive){
			this.inputState = "noSelection";
			this.activateAllGems(true);
		}
		else
		{
			this.gameController.endGame();
		}
	}

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

	this.unselectGem = function(){
		this.inputState = "noSelection";
		this.selectedGem.resetGem();
		this.selectedGem = null;
	}

	this.swapGems = function(gem1, gem2){
		if(this.inputState == "gemSelected"){
			this.inputState = "waitingForSwap";
		}
		this.activateAllGems(false);
		this.selectedGem = null;
		gem1.resetGem();
		gem2.resetGem();
		//swap the gems place in both the model and visually
		gem1.animateToPosition(gem2.style.x, gem2.style.y);
		gem2.animateToPosition(gem1.style.x, gem1.style.y);
		var tempGemXPos = gem1.xPos;
		var tempGemYPos = gem1.yPos;
		gem1.xPos = gem2.xPos;
		gem1.yPos = gem2.yPos;
		gem2.xPos = tempGemXPos;
		gem2.yPos = tempGemYPos;
		this.updateGemsGrid();
		this.lastGemsSwapped = [gem1, gem2];
	};

	this.swapBack = function(){
		this.inputState = "swappingBack";
		//this.activateAllGems(true);
		this.swapGems(this.lastGemsSwapped[0], this.lastGemsSwapped[1]);
	}

	this.gemAnimComplete = function(){
		//both gems will call swap complete. make sure it only runs once
		if(this.inputState == "waitingForSwap"){
			this.inputState = "firstAnimComplete";
		}
		else if(this.inputState == "firstAnimComplete")
		{
			if(this.shouldDeleteMatches()){
				this.destroyGems();
			}else{
				this.swapBack();
			}
		}
		else if(this.inputState == "swappingBack"){
			this.waitForInput();
		}
		else if(this.inputState == "droppingCols"){
			this.animsToComplete --;
			if(this.animsToComplete == 0){
				if(this.shouldDeleteMatches()){
					this.destroyGems();
				}else{
					this.waitForInput();
				}
			}
		}
	};

	this.activateAllGems = function(toggleOn){
		for(var i = 0; i < this.gemsList.length; i ++){
			this.gemsList[i].activeInput = toggleOn;
		}
	};

	this.shouldDeleteMatches = function(){
		this.gemsToRemove = [];
		var hasDrops = false;
		for (var row = 0; row < gemRows; row++) 
		{
			this.gemsToRemove.push([]);
			for (var col = 0; col < gemCols; col++) 
			{
				var targetGem = this.gemsGrid[row][col];
				this.gemsToRemove[row].push(false);
				if(this.gemCausesRowMatch(col, row, targetGem.gemType))
				{
					for(var i = col; i > col - 3; i --)
					{
						hasDrops = true;
						this.gemsToRemove[row][i] = true;
					}
				}
				if(this.gemCausesColMatch(col, row, targetGem.gemType))
				{
					for(var i = row; i > row - 3; i --)
					{
						this.gemsToRemove[i][col] = true;
						hasDrops = true;
					}
				}
			}
		}
		return hasDrops;
	};

	this.destroyGems = function(){
		setTimeout(bind(this, function () {
			for (var row = 0; row < gemRows; row++) 
			{
				for (var col = 0; col < gemCols; col++) 
				{
					if(this.gemsToRemove[row][col] == true){
						this.gemsGrid[row][col].playDestroyAnim();
					}
				}
			}
			
		}), 100);
		this.dropCols();
	}

	this.dropCols = function(){
		setTimeout(bind(this, function () {
			this.inputState = "droppingCols";
			this.animsToComplete = 0;
			for (var col = 0; col < gemCols; col++) 
			{
				var dropDistance = 0;
				for (var row = gemRows - 1; row >= 0; row--) 
				{
					/*
					If the gem should be removed move it to the top, randomize it,
					and drop it down by the number of false above it.
					If the gem is above a gem that should not be removed, drop it by the number of true below it
					*/
					if(this.gemsToRemove[row][col] == true)
					{
						var gemToRedrop = this.gemsGrid[row][col];
						var removedGemsAbove = 0;
						var i = row - 1;
						while(i >= 0){
							if(this.gemsToRemove[i][col] == true){
								removedGemsAbove++;
							}
							i--;
						}
						gemToRedrop.style.y = -this.style.y - gemSize * (dropDistance + 1);
						gemToRedrop.gemView.show();
						gemToRedrop.gleamView.hide();
						gemToRedrop.setGemType(this.randomGemType());
						gemToRedrop.animateToPosition(gemToRedrop.xLoc, gemSize * (removedGemsAbove));
						gemToRedrop.yPos = removedGemsAbove;
						dropDistance++;
						this.animsToComplete ++;
						this.gameController.incrementScore();
					}
					else if(dropDistance > 0)
					{
						var gemToDrop = this.gemsGrid[row][col];
						gemToDrop.animateToPosition(gemToDrop.xLoc, gemToDrop.yLoc + (gemSize * dropDistance));
						gemToDrop.yPos += dropDistance;
						this.animsToComplete ++;
					}
				}
			}
			clearInterval(this._interval);
			this.updateGemsGrid();

		}), 400);
	};
});