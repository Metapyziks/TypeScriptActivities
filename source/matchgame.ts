/// <reference path="../includes/phaser.d.ts" />
/// <reference path="tools.ts" />
/// <reference path="config.ts" />
/// <reference path="card.ts" />

class MatchGame
{
	game: Phaser.Game;
	config: MatchGameJson;
	
	private dropZones: DropZone[];
	
	constructor(divId: string, config: MatchGameJson)
	{
		this.config = MatchGameJson.clone(MatchGameJson.default);
		MatchGameJson.copyFromTo(config, this.config);
		
		this.game = new Phaser.Game(720, 512, Phaser.AUTO, divId, this, true);
	}
	
	preload()
	{
		Card.preload(this.game.load);
		DropZone.preload(this.game.load);
	}
	
	create()
	{
		var pairs = this.config.pairs;
		
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
		
		this.placeCards(staticCards, 0, this.config.settings.shuffleLeftCards);
		this.placeCards(movableCards, maxStaticWidth * 2, this.config.settings.shuffleRightCards);
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
