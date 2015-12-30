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
    Tools.isArray = function (val) {
        return Object.prototype.toString.call(val) === '[object Array]';
    };
    Tools.deepCopyFromTo = function (from, dest) {
        for (var key in from) {
            if (!from.hasOwnProperty(key))
                continue;
            var element = from[key];
            if (element == null)
                continue;
            if (typeof (element) !== "object") {
                dest[key] = element;
                continue;
            }
            if (dest[key] == null || typeof (dest[key]) !== "object") {
                dest[key] = this.isArray(element) ? [] : {};
            }
            this.deepCopyFromTo(element, dest[key]);
        }
    };
    return Tools;
})();
/// <reference path="tools.ts" />
var MatchGameJson = (function () {
    function MatchGameJson() {
    }
    MatchGameJson.clone = function (config) {
        var clone = new MatchGameJson();
        this.copyFromTo(config, clone);
        return clone;
    };
    MatchGameJson.copyFromTo = function (from, dest) {
        Tools.deepCopyFromTo(from, dest);
    };
    MatchGameJson.default = {
        "styles": {
            "marginLeft": 16,
            "marginRight": 16,
            "marginTop": 16,
            "marginBottom": 16,
            "cardHeight": 72,
            "cardSpacingH": 8,
            "cardSpacingV": 8,
            "leftCard": {
                "width": 192,
                "color": "#ffffcc",
                "shadowOffsetH": 2,
                "shadowOffsetV": 2,
                "shadowAlpha": 0.25,
                "text": {
                    "fontSize": 16,
                    "fontWeight": "normal",
                    "align": "center",
                    "wordWrap": true,
                    "boundsAlignH": "center",
                    "boundsAlignV": "middle",
                    "lineSpacing": -8
                }
            },
            "rightCard": {
                "width": 96,
                "color": "#ffffff",
                "shadowOffsetH": 2,
                "shadowOffsetV": 2,
                "shadowAlpha": 0.25,
                "text": {
                    "fontSize": 22,
                    "fontWeight": "normal",
                    "align": "center",
                    "wordWrap": true,
                    "boundsAlignH": "center",
                    "boundsAlignV": "middle",
                    "lineSpacing": -8
                }
            }
        },
        "settings": {
            "shuffleLeftCards": false,
            "shuffleRightCards": true,
            "maximumInitialMatches": 1
        },
        "pairs": null
    };
    return MatchGameJson;
})();
var StylesJson = (function () {
    function StylesJson() {
    }
    return StylesJson;
})();
var CardStyleJson = (function () {
    function CardStyleJson() {
    }
    return CardStyleJson;
})();
var TextStyleJson = (function () {
    function TextStyleJson() {
    }
    return TextStyleJson;
})();
var SettingsJson = (function () {
    function SettingsJson() {
    }
    return SettingsJson;
})();
var CardPairJson = (function () {
    function CardPairJson() {
    }
    return CardPairJson;
})();
/// <reference path="../includes/phaser.d.ts" />
/// <reference path="tools.ts" />
/// <reference path="config.ts" />
/// <reference path="card.ts" />
var MatchGame = (function () {
    function MatchGame(divId, config) {
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
    MatchGame.prototype.preload = function () {
        Card.preload(this.game.load);
    };
    MatchGame.prototype.isMatch = function (cardAText, cardBText) {
        for (var i = 0; i < this.config.pairs.length; ++i) {
            var pair = this.config.pairs[i];
            if (pair.left === cardAText && pair.right === cardBText)
                return true;
        }
        return false;
    };
    MatchGame.prototype.create = function () {
        var pairs = this.config.pairs;
        this.staticCards = new Array();
        this.movableCards = new Array();
        this.dropZones = new Array();
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
    };
    MatchGame.prototype.resetCards = function () {
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
                if (this.isMatch(staticCard.value, movableCard.value))
                    ++matches;
            }
            if (matches <= this.config.settings.maximumInitialMatches)
                break;
        }
        this.placeCards(this.staticCards, leftCardHorzPos);
        this.placeCards(this.movableCards, rightCardHorzPos);
    };
    MatchGame.prototype.checkSolution = function () {
        var anyIncorrect = false;
        for (var i = 0; i < this.dropZones.length; ++i) {
            var dropZone = this.dropZones[i];
            if (!dropZone.checkCurrentCard())
                anyIncorrect = true;
        }
        return !anyIncorrect;
    };
    MatchGame.prototype.getBlankTexture = function (width, height) {
        width = Math.floor(width);
        height = Math.floor(height);
        var key = width.toString() + "x" + height.toString();
        if (this.blankRenderTextures[key] != null)
            return this.blankRenderTextures[key];
        this.blankRenderTextures[key] = this.game.make.renderTexture(width, height);
        return this.blankRenderTextures[key];
    };
    MatchGame.prototype.getDropZones = function () {
        return this.dropZones;
    };
    MatchGame.prototype.placeCards = function (cards, horzPos) {
        var dropZoneX = horzPos + this.config.styles.cardSpacingH + this.config.styles.leftCard.width;
        var nextY = this.config.styles.marginTop;
        for (var i = 0; i < cards.length; ++i) {
            var card = cards[i];
            card.setInitialPosition(horzPos, nextY);
            if (this.firstReset)
                card.position.set(horzPos, nextY);
            if (cards == this.staticCards) {
                var dropZone = card.getDropZone();
                if (this.firstReset)
                    this.game.world.addChild(dropZone);
                dropZone.position.set(dropZoneX, nextY);
            }
            if (this.firstReset)
                this.game.world.addChild(card);
            else
                card.resetPosition();
            nextY += this.config.styles.cardHeight + this.config.styles.cardSpacingV;
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
    function DropZone(staticCard, matchingCard) {
        var width = matchingCard.width;
        var height = matchingCard.height;
        var texture = matchingCard.matchGame.getBlankTexture(width, height);
        _super.call(this, matchingCard.game, 0, 0, texture);
        this.staticCard = staticCard;
        this.graphics = new Phaser.Graphics(this.game, 0, 0);
        this.addChild(this.graphics);
        this.updateGraphics();
    }
    DropZone.prototype.updateGraphics = function () {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0x000000, 0.125);
        this.graphics.drawRect(-2, -2, this.width + 4, this.height + 4);
    };
    DropZone.prototype.checkCurrentCard = function () {
        if (this.currentCard == null)
            return false;
        var correct = this.staticCard.matchGame.isMatch(this.staticCard.value, this.currentCard.value);
        this.currentCard.setMarkState(correct ? MarkState.Correct : MarkState.Incorrect);
        return correct;
    };
    DropZone.prototype.setCurrentCard = function (card) {
        if (this.currentCard != null && card != null) {
            this.currentCard.resetPosition();
        }
        this.currentCard = card;
        if (this.currentCard != null) {
            this.currentCard.tweenTo(this.position, 0.125);
        }
    };
    return DropZone;
})(Phaser.Sprite);
/// <reference path="../includes/phaser.d.ts" />
/// <reference path="matchgame.ts" />
/// <reference path="dropzone.ts" />
var MarkState;
(function (MarkState) {
    MarkState[MarkState["Unmarked"] = 0] = "Unmarked";
    MarkState[MarkState["Incorrect"] = 1] = "Incorrect";
    MarkState[MarkState["Correct"] = 2] = "Correct";
})(MarkState || (MarkState = {}));
var Card = (function (_super) {
    __extends(Card, _super);
    function Card(matchGame, style, value, movable) {
        var width = style.width;
        var height = matchGame.config.styles.cardHeight;
        _super.call(this, matchGame.game, 0, 0, matchGame.getBlankTexture(width, height));
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
        if (this.movable)
            this.makeMovable();
    }
    Card.preload = function (load) {
        load.script('filterX', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/BlurX.js');
        load.script('filterY', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/BlurY.js');
        load.image("tick", "assets/tick.png");
        load.image("cross", "assets/cross.png");
    };
    Card.prototype.updateGraphics = function () {
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
    };
    Card.prototype.makeMovable = function () {
        this.inputEnabled = true;
        this.input.enableDrag();
        this.events.onDragStart.add(this.onDragStart, this);
        this.events.onDragStop.add(this.onDragStop, this);
    };
    Card.prototype.setInitialPosition = function (x, y) {
        this.dragStartPos = new Phaser.Point(x, y);
    };
    Card.prototype.stopTween = function () {
        if (this.tween == null)
            return;
        this.game.tweens.remove(this.tween);
        this.tween = null;
    };
    Card.prototype.tweenTo = function (dest, duration) {
        this.stopTween();
        this.tween = this.game.add.tween(this);
        this.tween.to({ x: dest.x, y: dest.y }, duration * 1000, Phaser.Easing.Sinusoidal.InOut, true);
    };
    Card.prototype.resetPosition = function () {
        if (this.movable)
            this.dropZone = null;
        this.setMarkState(MarkState.Unmarked);
        this.tweenTo(this.dragStartPos, 0.25);
    };
    Card.prototype.setMarkState = function (markState) {
        if (this.markState == markState)
            return;
        this.markState = markState;
        if (this.markSprite != null) {
            this.removeChild(this.markSprite);
            this.markSprite = null;
        }
        if (this.markState == MarkState.Unmarked)
            return;
        this.markSprite = new Phaser.Sprite(this.game, this.width - 20, this.height - 20, this.markState == MarkState.Correct ? "tick" : "cross");
        this.addChild(this.markSprite);
    };
    Card.prototype.onDragStart = function () {
        this.stopTween();
        this.bringToTop();
        if (this.dropZone != null) {
            this.dropZone.setCurrentCard(null);
            this.setMarkState(MarkState.Unmarked);
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
        this.dropZone = new DropZone(this, matchingCard);
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