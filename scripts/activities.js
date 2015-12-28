/// <reference path="../includes/phaser.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Card = (function (_super) {
    __extends(Card, _super);
    function Card(game, text, movable) {
        _super.call(this, game);
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
    Card.preload = function (load) {
        load.image("card-image", "assets/card.png");
    };
    Card.prototype.getSize = function () {
        return new Phaser.Point(this.sprite.width, this.sprite.height);
    };
    return Card;
})(Phaser.Group);
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
    };
    MatchGame.prototype.create = function () {
        var data = this.game.cache.getJSON("pairs-data");
        var pairs = data.pairs;
        var staticCards = new Array();
        var movableCards = new Array();
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
    };
    MatchGame.prototype.placeCards = function (cards, horzPos, shuffle) {
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
    };
    return MatchGame;
})();
//# sourceMappingURL=activities.js.map