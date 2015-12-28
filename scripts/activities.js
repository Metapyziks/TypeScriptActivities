var Tools = (function () {
    function Tools() {
    }
    Tools.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };
    return Tools;
})();
/// <reference path="../includes/phaser.d.ts" />
/// <reference path="tools.ts" />
/// <reference path="card.ts" />
var MatchGameJson = (function () {
    function MatchGameJson() {
    }
    return MatchGameJson;
})();
var CardPairJson = (function () {
    function CardPairJson() {
    }
    return CardPairJson;
})();
var MatchGame = (function () {
    function MatchGame(divId, jsonPath) {
        this.jsonPath = jsonPath;
        this.game = new Phaser.Game(720, 512, Phaser.AUTO, divId, this, true);
    }
    MatchGame.prototype.preload = function () {
        this.game.load.json("pairs-data", this.jsonPath);
        Card.preload(this.game.load);
        DropZone.preload(this.game.load);
    };
    MatchGame.prototype.create = function () {
        var data = this.game.cache.getJSON("pairs-data");
        var pairs = data.pairs;
        var staticCards = new Array();
        var movableCards = new Array();
        this.dropZones = new Array();
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
    };
    MatchGame.prototype.getDropZones = function () {
        return this.dropZones;
    };
    MatchGame.prototype.placeCards = function (cards, horzPos, shuffle) {
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
    };
    return MatchGame;
})();
/// <reference path="../includes/phaser.d.ts" />
/// <reference path="card.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DropZone = (function (_super) {
    __extends(DropZone, _super);
    function DropZone(game, matchingCard) {
        _super.call(this, game, 0, 0, "dropzone-image");
    }
    DropZone.preload = function (load) {
        load.image("dropzone-image", "assets/dropzone.png");
    };
    DropZone.prototype.setCurrentCard = function (card) {
        if (this.currentCard != null && card != null) {
            this.currentCard.resetPosition();
        }
        this.currentCard = card;
        if (this.currentCard != null) {
            this.currentCard.position.copyFrom(this.position);
        }
    };
    return DropZone;
})(Phaser.Sprite);
/// <reference path="../includes/phaser.d.ts" />
/// <reference path="match.ts" />
/// <reference path="dropzone.ts" />
var Card = (function (_super) {
    __extends(Card, _super);
    function Card(matchGame, text, movable) {
        _super.call(this, matchGame.game, 0, 0, "card-image");
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
    Card.preload = function (load) {
        load.image("card-image", "assets/card.png");
    };
    Card.prototype.setInitialPosition = function (x, y) {
        this.dragStartPos = new Phaser.Point(x, y);
        this.position.set(x, y);
    };
    Card.prototype.resetPosition = function () {
        this.position.copyFrom(this.dragStartPos);
        this.dropZone = null;
    };
    Card.prototype.onDragStart = function () {
        if (this.dropZone != null) {
            this.dropZone.setCurrentCard(null);
            this.dropZone = null;
        }
    };
    Card.prototype.onDragStop = function () {
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
    };
    Card.prototype.getIntersectionArea = function (other) {
        var minX = Math.max(this.position.x, other.position.x);
        var minY = Math.max(this.position.y, other.position.y);
        var maxX = Math.min(this.position.x + this.width, other.position.x + other.width);
        var maxY = Math.min(this.position.y + this.height, other.position.y + other.height);
        if (minX >= maxX || minY >= maxY)
            return 0;
        return (maxX - minX) * (maxY - minY);
    };
    Card.prototype.createDropZone = function (matchingCard) {
        this.dropZone = new DropZone(this.game, matchingCard);
        return this.dropZone;
    };
    Card.prototype.hasDropZone = function () {
        return this.dropZone != null;
    };
    Card.prototype.getDropZone = function () {
        return this.dropZone;
    };
    return Card;
})(Phaser.Sprite);
//# sourceMappingURL=activities.js.map