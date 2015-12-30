/// <reference path="../includes/phaser.d.ts" />
/// <reference path="card.ts" />

class DropZone extends Phaser.Sprite
{
	private staticCard: Card;
	private currentCard: Card;
	private graphics: Phaser.Graphics;
	
	constructor(staticCard: Card, matchingCard: Card)
	{
		var width = matchingCard.width;
		var height = matchingCard.height;
		var texture = matchingCard.matchGame.getBlankTexture(width, height);
		
		super(matchingCard.game, 0, 0, texture);
		
		this.staticCard = staticCard;
		
		this.graphics = new Phaser.Graphics(this.game, 0, 0);
		this.addChild(this.graphics);
		
		this.updateGraphics();
	}
	
	private updateGraphics()
	{
		this.graphics.clear();
		this.graphics.lineStyle(1, 0x000000, 0.125);
		this.graphics.drawRect(-2, -2, this.width + 4, this.height + 4);
	}
	
	checkCurrentCard(): boolean
	{
		if (this.currentCard == null) return false;
		
		var correct = this.staticCard.matchGame.isMatch(this.staticCard.value, this.currentCard.value);
		
		this.currentCard.setMarkState(correct ? MarkState.Correct : MarkState.Incorrect);
		return correct;
	}
	
	setCurrentCard(card: Card)
	{
		if (this.currentCard != null && card != null) {
			this.currentCard.resetPosition();
		}
		
		this.currentCard = card;
		
		if (this.currentCard != null) {
			this.currentCard.tweenTo(this.position, 0.125);
		}
	}
}