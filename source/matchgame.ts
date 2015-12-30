/// <reference path="../includes/phaser.d.ts" />
/// <reference path="tools.ts" />
/// <reference path="config.ts" />
/// <reference path="card.ts" />

class MatchGame
{
	game: Phaser.Game;
	config: MatchGameJson;
	
	private blankRenderTextures: Object;
	private staticCards: Card[];
	private movableCards: Card[];
	private dropZones: DropZone[];
	private firstReset: boolean;
	
	constructor(divId: string, config: MatchGameJson)
	{
		this.config = MatchGameJson.clone(MatchGameJson.default);
		MatchGameJson.copyFromTo(config, this.config);
		
		this.blankRenderTextures = {};
		
		var width = this.config.styles.cardSpacingH * 2
			+ this.config.styles.leftCard.width
			+ this.config.styles.rightCard.width * 2
			+ this.config.styles.marginLeft
			+ this.config.styles.marginRight;
			
		var height = this.config.styles.marginTop
			+ this.config.styles.marginBottom
			+ this.config.pairs.length * (this.config.styles.cardHeight + this.config.styles.cardSpacingV)
			- this.config.styles.cardSpacingV;
		
		this.game = new Phaser.Game(width, height, Phaser.AUTO, divId, this, true);
	}
	
	preload()
	{
		Card.preload(this.game.load);
	}
	
	isMatch(cardAText: string, cardBText: string)
	{
		for (var i = 0; i < this.config.pairs.length; ++i) {
			var pair = this.config.pairs[i];
			if (pair.left === cardAText && pair.right === cardBText) return true;
		}
		
		return false;
	}
	
	create()
	{
		var pairs = this.config.pairs;
		
		this.staticCards = new Array<Card>();
		this.movableCards = new Array<Card>();
		
		this.dropZones = new Array<DropZone>();
		
		for (var i = 0; i < pairs.length; ++i) {
			var staticCard = new Card(this, this.config.styles.leftCard, pairs[i].left, false);
			var movableCard = new Card(this, this.config.styles.rightCard, pairs[i].right, true);
			
			this.dropZones.push(staticCard.createDropZone(movableCard));
			
			this.staticCards.push(staticCard);
			this.movableCards.push(movableCard);
		}
		
		this.firstReset = true;
		this.resetCards();
		this.firstReset = false;
	}
	
	resetCards()
	{
		for (var i = 0; i < this.dropZones.length; ++i) {
			this.dropZones[i].setCurrentCard(null);
		}
		
		var leftCardHorzPos = this.config.styles.marginLeft;
		var rightCardHorzPos = this.config.styles.marginLeft
			+ this.config.styles.leftCard.width
			+ this.config.styles.cardSpacingH * 2
			+ this.config.styles.rightCard.width;
			
		if (this.config.settings.shuffleLeftCards) {
			Tools.shuffle(this.staticCards);
		}
		
		while (this.config.settings.shuffleRightCards) {
			Tools.shuffle(this.movableCards);
			
			var matches = 0;
			
			for (var i = 0; i < this.movableCards.length; ++i) {
				var staticCard = this.staticCards[i];
				var movableCard = this.movableCards[i];
				
				if (this.isMatch(staticCard.value, movableCard.value)) ++matches;
			}
			
			if (matches <= this.config.settings.maximumInitialMatches) break;
		}
		
		this.placeCards(this.staticCards, leftCardHorzPos);
		this.placeCards(this.movableCards, rightCardHorzPos);
	}
	
	checkSolution(): boolean
	{
		var anyIncorrect = false;
		for (var i = 0; i < this.dropZones.length; ++i) {
			var dropZone = this.dropZones[i];
			if (!dropZone.checkCurrentCard()) anyIncorrect = true;
		}
		
		return !anyIncorrect;
	}
	
	getBlankTexture(width: number, height: number): Phaser.RenderTexture
	{
		width = Math.floor(width);
		height = Math.floor(height);
		
		var key = width.toString() + "x" + height.toString();
		
		if (this.blankRenderTextures[key] != null) return this.blankRenderTextures[key];
		this.blankRenderTextures[key] = this.game.make.renderTexture(width, height);
		
		return this.blankRenderTextures[key];
	}
	
	getDropZones(): DropZone[]
	{
		return this.dropZones;	
	}
	
	private placeCards(cards: Card[], horzPos: number)
	{		
		var dropZoneX = horzPos + this.config.styles.cardSpacingH + this.config.styles.leftCard.width;
		var nextY = this.config.styles.marginTop;
		for (var i = 0; i < cards.length; ++i) {
			var card = cards[i];
			
			card.setInitialPosition(horzPos, nextY);
			if (this.firstReset) card.position.set(horzPos, nextY);
			
			if (cards == this.staticCards) {
				var dropZone = card.getDropZone();
				if (this.firstReset) this.game.world.addChild(dropZone);
				
				dropZone.position.set(dropZoneX, nextY);
			}
			
			if (this.firstReset) this.game.world.addChild(card);
			else card.resetPosition();
			
			nextY += this.config.styles.cardHeight + this.config.styles.cardSpacingV;
		}
	}
}
