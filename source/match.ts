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
	private jsonPath: string;
	private game: Phaser.Game;
	
	constructor(divId: string, jsonPath: string)
	{
		this.jsonPath = jsonPath;
		this.game = new Phaser.Game(720, 512, Phaser.AUTO, divId, this, true);
	}
	
	preload()
	{		
		this.game.load.json("pairs-data", this.jsonPath);
		
		Card.preload(this.game.load);
	}
	
	create()
	{
		var data: MatchGameJson = this.game.cache.getJSON("pairs-data");
		var pairs = data.pairs;
		
		var staticCards = new Array<Card>();
		var movableCards = new Array<Card>();
		
		var maxStaticWidth = 0;
		
		for (var i = 0; i < pairs.length; ++i) {
			var staticCard = new Card(this.game, pairs[i].left, false);
			var movableCard = new Card(this.game, pairs[i].right, true);
			
			var size = staticCard.getSize();
			
			if (size.x > maxStaticWidth) {
				maxStaticWidth = size.x;
			}
			
			staticCard.matchingCard = movableCard;
			movableCard.matchingCard = staticCard;
			
			staticCards.push(staticCard);
			movableCards.push(movableCard);
		}
		
		this.placeCards(staticCards, 0, data.shuffleLeftCards);
		this.placeCards(movableCards, maxStaticWidth * 2, data.shuffleRightCards);
	}
	
	private placeCards(cards: Card[], horzPos: number, shuffle: boolean)
	{
		if (shuffle) {
			Tools.shuffle(cards);
		}
		
		var nextY = 0;
		for (var i = 0; i < cards.length; ++i) {
			var card = cards[i];
			
			card.position.set(horzPos, nextY);
			this.game.stage.addChild(card);
			
			nextY += card.getSize().y;
		}
	}
}
