//import src.Gem as Gem;
import ui.View;

import src.Gem as Gem;

/*Two dimenstional array for holding all our Gems*/
var gridSize = 544,
	gemSize = 68,
	gemRows = 8,
	gemCols = 8

exports = Class(ui.View, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
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

		var x_offset = 5;
		var y_offset = 160;
		var y_pad = 25;

		/*this.style.width = 320;
		this.style.height = 480;*/

		this._gems = [];

		for (var row = 0; row < gemRows; row++) {
			//add a new row of gems
			this._gems.push([]);

			for (var col = 0; col < gemCols; col++) {

					var gem = new Gem();
					gem.style.x = x_offset + col * gem.style.width;
					gem.style.y = y_offset + row * (gem.style.height + y_pad);
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
});