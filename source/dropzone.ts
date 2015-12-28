/// <reference path="../includes/phaser.d.ts" />
/// <reference path="card.ts" />

class DropZone extends Phaser.Sprite
{
	private currentCard: Card;
	
	static preload(load: Phaser.Loader)
	{
		load.image("dropzone-image", "assets/dropzone.png");
	}
		
	constructor(game: Phaser.Game, matchingCard: Card)
	{
		super(game, 0, 0, "dropzone-image");
	}
	
	setCurrentCard(card: Card)
	{
		if (this.currentCard != null && card != null) {
			this.currentCard.resetPosition();
		}
		
		this.currentCard = card;
		
		if (this.currentCard != null) {
			this.currentCard.position.copyFrom(this.position);
		}
	}
}