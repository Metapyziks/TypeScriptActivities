/// <reference path="../includes/phaser.d.ts" />

class Card extends Phaser.Group
{
	static preload(load: Phaser.Loader)
	{
		load.image("card-image", "assets/card.png");
	}
	
	private sprite: Phaser.Sprite;
	private text: Phaser.Text;
	private movable: boolean;
	
	matchingCard: Card;
	
	constructor(game: Phaser.Game, text: string, movable: boolean)
	{
		super(game);
		
		var style = {
			fontSize: 20,
			align: "center",
			boundsAlignH: "center",
			boundsAlignV: "middle"
		};
		
		this.movable = movable;
		
		this.sprite = this.add(new Phaser.Sprite(game, 0, 0, "card-image"));
		this.sprite.scale.set(1, 0.75);
		this.text = this.add(new Phaser.Text(game, 0, 0, text, style));
		
		this.text.setTextBounds(8, 8, this.sprite.width - 16, this.sprite.height - 16);
		this.text.smoothed = false;
	}
	
	getSize(): Phaser.Point
	{
		return new Phaser.Point(this.sprite.width, this.sprite.height);
	}
}
