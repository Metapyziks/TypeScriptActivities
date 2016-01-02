/// <reference path="tools.ts" />

class MatchGameJson
{
	static default: MatchGameJson = {
		"styles":
		{
			"marginLeft": 16,
			"marginRight": 16,
			"marginTop": 16,
			"marginBottom": 16,
			
			"cardHeight": 72,
			"cardSpacingH": 8,
			"cardSpacingV": 8,
			
			"leftCard":
			{
				"width": 192,
				"color": "#ffffcc",
				
				"shadowOffsetH": 2,
				"shadowOffsetV": 2,
				"shadowAlpha": 0.25,
				
				"marginH": 16,
				"marginV": 8,
				
				"easingFunction": "Sinusoidal",
				"easingType": "InOut",
				"easingTimeScale": 1,
				
				"text":
				{
					"fontSize": 16,
					"fontWeight": "normal",
					"align": "center",
					"wordWrap": true,
					"wordWrapWidth": -1,
					"boundsAlignH": "center",
					"boundsAlignV": "middle",
					"lineSpacing": -8
				}
			},
			
			"rightCard":
			{
				"width": 96,
				"color": "#ffffff",
				
				"shadowOffsetH": 2,
				"shadowOffsetV": 2,
				"shadowAlpha": 0.25,
				
				"marginH": 16,
				"marginV": 8,
				
				"easingFunction": "Sinusoidal",
				"easingType": "InOut",
				"easingTimeScale": 1,
				
				"text":
				{
					"fontSize": 22,
					"fontWeight": "normal",
					"align": "center",
					"wordWrap": true,
					"wordWrapWidth": -1,
					"boundsAlignH": "center",
					"boundsAlignV": "middle",
					"lineSpacing": -8
				}
			}
		},
		
		"settings":
		{
			"shuffleLeftCards": false,
			"shuffleRightCards": true,
			"maximumInitialMatches": 1
		},
		
		"pairs": null
	};

	styles: StylesJson;
	settings: SettingsJson;
	pairs: CardPairJson[];
	
	static clone(config: MatchGameJson): MatchGameJson
	{
		var clone = new MatchGameJson();
		this.copyFromTo(config, clone);
		return clone;
	}
	
	static copyFromTo(from: MatchGameJson, dest: MatchGameJson)
	{
		Tools.deepCopyFromTo(from, dest);
	}
}

class StylesJson
{
	marginLeft: number;
	marginRight: number;
	marginTop: number;
	marginBottom: number;
	
	cardHeight: number;
	cardSpacingH: number;
	cardSpacingV: number;
	
	leftCard: CardStyleJson;
	rightCard: CardStyleJson;
}

class CardStyleJson
{
	width: number;
	color: string;
	easingFunction: string;
	easingType: string;
	easingTimeScale: number;
	shadowOffsetH: number;
	shadowOffsetV: number;
	shadowAlpha: number;
	marginH: number;
	marginV: number;
	text: TextStyleJson;
}

class TextStyleJson
{
	fontSize: number;
	fontWeight: string;
	align: string;
	wordWrap: boolean;
	wordWrapWidth: number;
	boundsAlignH: string;
	boundsAlignV: string;
	lineSpacing: number;
}

class SettingsJson
{
	shuffleLeftCards: boolean;
	shuffleRightCards: boolean;
	maximumInitialMatches: number;
}

class CardPairJson
{
	left: string;
	right: string;
}
