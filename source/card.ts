/// <reference path="../includes/phaser.d.ts" />
/// <reference path="matchgame.ts" />
/// <reference path="dropzone.ts" />

enum MarkState
{
	Unmarked,
	Incorrect,
	Correct
}

class Card extends Phaser.Sprite
{
	static preload(load: Phaser.Loader)
	{
		load.script('filterX', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/BlurX.js');
    	load.script('filterY', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/BlurY.js');
		
		load.image("tick", "assets/tick.png");
		load.image("cross", "assets/cross.png");
	}
	
	matchGame: MatchGame;
	style: CardStyleJson;
	
	value: string;
	
	private cardGraphics: Phaser.Graphics;
	private shadowGraphics: Phaser.Graphics;
	private text: Phaser.Text;
	private movable: boolean;
	private dropZone: DropZone;
	private dragStartPos: Phaser.Point;
	private markState: MarkState;
	private markSprite: Phaser.Sprite;
	private tween: Phaser.Tween;
	
	constructor(matchGame: MatchGame, style: CardStyleJson, value: string, movable: boolean)
	{
		var width = style.width;
		var height = matchGame.config.styles.cardHeight;
		
		super(matchGame.game, 0, 0, matchGame.getBlankTexture(width, height));
		
		this.matchGame = matchGame;
		this.style = style;
		this.value = value;
		this.movable = movable;
		this.markState = MarkState.Unmarked;
		
		var blurX = this.game.add.filter("BlurX");
		var blurY = this.game.add.filter("BlurY");
		
		this.shadowGraphics = new Phaser.Graphics(this.game, 0, 0);
		this.shadowGraphics.filters = [blurX, blurY];
		this.addChild(this.shadowGraphics);
		
		this.cardGraphics = new Phaser.Graphics(this.game, 0, 0);
		this.addChild(this.cardGraphics);
		
		this.updateGraphics();
		
		this.text = new Phaser.Text(this.game, 0, 0, value, style.text);
		this.text.setTextBounds(0, 0, this.width, this.height);
		this.text.smoothed = false;
		this.text.lineSpacing = -8;
		
		this.addChild(this.text);
				
		if (this.movable) this.makeMovable();		
	}
	
	private updateGraphics()
	{
		this.shadowGraphics.clear();
		this.shadowGraphics.beginFill(0x000000, 0);
		this.shadowGraphics.drawRect(this.style.shadowOffsetH - 4, this.style.shadowOffsetV - 4, this.width + 8, this.height + 8);
		this.shadowGraphics.endFill();
		this.shadowGraphics.beginFill(0x000000, this.style.shadowAlpha);
		this.shadowGraphics.drawRect(this.style.shadowOffsetH, this.style.shadowOffsetV, this.width, this.height);
		this.shadowGraphics.endFill();
		
		var color = Phaser.Color.hexToRGB(this.style.color);
		
		this.cardGraphics.clear();
		this.cardGraphics.beginFill(color, 1);
		this.cardGraphics.drawRect(0, 0, this.width, this.height);
		this.cardGraphics.endFill();
	}
	
	private makeMovable()
	{
		this.inputEnabled = true;
		this.input.enableDrag();
				
		this.events.onDragStart.add(this.onDragStart, this);
		this.events.onDragStop.add(this.onDragStop, this);
	}
	
	setInitialPosition(x: number, y: number)
	{
		this.dragStartPos = new Phaser.Point(x, y);
	}

	stopTween()
	{
		if (this.tween == null) return;
		this.game.tweens.remove(this.tween);
		this.tween = null;
	}
	
	tweenTo(dest: Phaser.Point, duration: number)
	{
		this.stopTween();
		this.tween = this.game.add.tween(this);
		this.tween.to({ x: dest.x, y: dest.y }, duration * 1000, Phaser.Easing.Sinusoidal.InOut, true);
	}
	
	resetPosition()
	{
		if (this.movable) this.dropZone = null;
		this.setMarkState(MarkState.Unmarked);
		this.tweenTo(this.dragStartPos, 0.25);
	}
	
	setMarkState(markState: MarkState)
	{
		if (this.markState == markState) return;
		this.markState = markState;		
		
		if (this.markSprite != null) {
			this.removeChild(this.markSprite);
			this.markSprite = null;
		}
		
		if (this.markState == MarkState.Unmarked) return;
		
		this.markSprite = new Phaser.Sprite(this.game, this.width - 20, this.height - 20,
			this.markState == MarkState.Correct ? "tick" : "cross");
		this.addChild(this.markSprite);
	}
	
	private onDragStart()
	{
		this.stopTween();
		this.bringToTop();
		
		if (this.dropZone != null) {
			this.dropZone.setCurrentCard(null);
			this.setMarkState(MarkState.Unmarked);
			this.dropZone = null;
		}
	}
	
	private onDragStop()
	{		
		var dropZones = this.matchGame.getDropZones();
		for (var i = dropZones.length - 1; i >= 0; --i) {
			var dropZone = dropZones[i];
			var area = this.getIntersectionArea(dropZone);
			
			if (area >= this.width * this.height * 0.5) {
				this.dropZone = dropZone;
				dropZone.setCurrentCard(this);
				return;
			}
		}
		
		this.resetPosition();
	}
	
	private getIntersectionArea(other: Phaser.Sprite): number
	{
		var minX = Math.max(this.position.x, other.position.x);
		var minY = Math.max(this.position.y, other.position.y);
		var maxX = Math.min(this.position.x + this.width, other.position.x + other.width);
		var maxY = Math.min(this.position.y + this.height, other.position.y + other.height);
		
		if (minX >= maxX || minY >= maxY) return 0;
		return (maxX - minX) * (maxY - minY);
	}
	
	createDropZone(matchingCard: Card)
	{
		this.dropZone = new DropZone(this, matchingCard);
		return this.dropZone;
	}
	
	hasDropZone(): boolean
	{
		return this.dropZone != null;
	}
	
	getDropZone(): DropZone
	{
		return this.dropZone;
	}
}
