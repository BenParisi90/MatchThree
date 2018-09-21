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

		this._gems = [];

		for (var row = 0; row < gemRows; row++) {
			//add a new row of gems
			this._gems.push([]);

			for (var col = 0; col < gemCols; col++) {

					var gemType = this.randomGemType();
					while(this.gemCausesMatch(col, row, gemType))
					{
						gemType = this.randomGemType();
					}
					var gem = new Gem({gemType: gemType});
					gem.style.x = col * gem.style.width;
					gem.style.y = row * (gem.style.height);
					this.addSubview(gem);
					this._gems[row].push(gem);
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
	this.gemCausesMatch = function(xPos, yPos, gemType) {
		//if we are too clase to the wall, we know we dont have a match
		if(xPos < 2 && yPos < 2){
			return false;
		}
		var xTar = xPos - 1;
		var yTar = yPos - 1;
		var numMatches = 0;

		while(xTar >= 0 && this._gems[yPos][xTar].gemType == gemType){
			numMatches ++;
			xTar --;
			if(numMatches >= 2){
				return true;
			}
		}
		
		numMatches = 0;
		while(yTar >= 0 && this._gems[yTar][xPos].gemType == gemType){
			numMatches ++;
			yTar --;
			if(numMatches >= 2){
				return true;
			}
		}
		return false;
	};
});