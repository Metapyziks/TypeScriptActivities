/// <reference path="../includes/phaser.d.ts" />
/// <reference path="tools.ts" />
/// <reference path="card.ts" />

class MatchGameJson
{
	shuffleLeftCards: boolean;
	shuffleRightCards: boolean;
	
	pairs: CardPairJson[];
}

class CardPairJson
{
	left: string;
	right: string;
}

class MatchGame
{
	game: Phaser.Game;
	
	private jsonPath: string;
	private dropZones: DropZone[];
	
	constructor(divId: string, jsonPath: string)
	{
		this.jsonPath = jsonPath;
		this.game = new Phaser.Game(720, 512, Phaser.AUTO, divId, this, true);
	}
	
	preload()
	{
		this.game.load.json("pairs-data", this.jsonPath);
		
		Card.preload(this.game.load);
		DropZone.preload(this.game.load);
	}
	
	create()
	{
		var data: MatchGameJson = this.game.cache.getJSON("pairs-data");
		var pairs = data.pairs;
		
		var staticCards = new Array<Card>();
		var movableCards = new Array<Card>();
		
		this.dropZones = new Array<DropZone>();
		
		var maxStaticWidth = 0;
		
		for (var i = 0; i < pairs.length; ++i) {
			var staticCard = new Card(this, pairs[i].left, false);
			var movableCard = new Card(this, pairs[i].right, true);
			
			this.dropZones.push(staticCard.createDropZone(movableCard));
			
			if (staticCard.width > maxStaticWidth) {
				maxStaticWidth = staticCard.width;
			}
			
			staticCards.push(staticCard);
			movableCards.push(movableCard);
		}
		
		this.placeCards(staticCards, 0, data.shuffleLeftCards);
		this.placeCards(movableCards, maxStaticWidth * 2, data.shuffleRightCards);
	}
	
	getDropZones(): DropZone[]
	{
		return this.dropZones;	
	}
	
	private placeCards(cards: Card[], horzPos: number, shuffle: boolean)
	{
		if (shuffle) {
			Tools.shuffle(cards);
		}
		
		var nextY = 0;
		for (var i = 0; i < cards.length; ++i) {
			var card = cards[i];
			
			card.setInitialPosition(horzPos, nextY);
			
			this.game.stage.addChild(card);
			
			if (card.hasDropZone()) {
				var dropZone = card.getDropZone();
				
				dropZone.position.set(card.position.x + card.width, nextY);
				this.game.stage.addChild(dropZone);
			}
			
			nextY += card.height;
		}
	}
}
