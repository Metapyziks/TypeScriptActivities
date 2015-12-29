/// <reference path="../includes/phaser.d.ts" />
/// <reference path="matchgame.ts" />
/// <reference path="dropzone.ts" />

class Card extends Phaser.Sprite
{
	static preload(load: Phaser.Loader)
	{
		load.image("card-image", "assets/card.png");
	}
	
	private matchGame: MatchGame;
	private text: Phaser.Text;
	private movable: boolean;
	private dropZone: DropZone;
	private dragStartPos: Phaser.Point;
	private tween: Phaser.Tween;
	
	constructor(matchGame: MatchGame, text: string, movable: boolean)
	{
		super(matchGame.game, 0, 0, "card-image");
		
		this.matchGame = matchGame;
		
		var style = {
			fontSize: 18,
			fontWeight: "normal",
			align: "center",
			wordWrap: true,
			boundsAlignH: "center",
			boundsAlignV: "middle"
		};
		
		this.movable = movable;
				
		this.text = new Phaser.Text(this.game, 0, 0, text, style);
		this.text.setTextBounds(8, 8, this.width - 16, this.height - 16);
		this.text.smoothed = false;
		this.text.lineSpacing = -8;
		
		this.addChild(this.text);
		
		if (!movable) {
			this.tint = 0xffffcc;
			return;
		}
		
		this.inputEnabled = true;
		this.input.enableDrag();
				
		this.events.onDragStart.add(this.onDragStart, this);
		this.events.onDragStop.add(this.onDragStop, this);
	}
	
	setInitialPosition(x: number, y: number)
	{
		this.dragStartPos = new Phaser.Point(x, y);
		this.position.set(x, y);
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
		this.dropZone = null;
		this.tweenTo(this.dragStartPos, 0.25);
	}
	
	private onDragStart()
	{
		this.stopTween();
		
		if (this.dropZone != null) {
			this.dropZone.setCurrentCard(null);
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
		this.dropZone = new DropZone(this.game, matchingCard);
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
