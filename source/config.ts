/// <reference path="tools.ts" />

class MatchGameJson
{
	static default: MatchGameJson = {
		"styles":
		{
			"marginH": 16,
			"marginV": 16,
			
			"cardHeight": 96,
			"cardSpacingH": 16,
			"cardSpacingV": 16,
			
			"leftCard":
			{
				"width": 192,
				"color": "#ffffcc",
				
				"text":
				{
					"fontSize": 18,
					"fontWeight": "normal",
					"align": "center",
					"wordWrap": true,
					"boundsAlignH": "center",
					"boundsAlignV": "middle"
				}
			},
			
			"rightCard":
			{
				"width": 96,
				"color": "#ffffff",
				
				"text":
				{
					"fontSize": 18,
					"fontWeight": "normal",
					"align": "center",
					"wordWrap": true,
					"boundsAlignH": "center",
					"boundsAlignV": "middle"
				}
			}
		},
		
		"settings":
		{
			"shuffleLeftCards": false,
			"shuffleRightCards": true
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
	marginH: number;
	marginV: number;
	
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
	text: TextStyleJson;
}

class TextStyleJson
{
	fontSize: number;
	fontWeight: string;
	align: string;
	wordWrap: boolean;
	boundsAlignH: string;
	boundsAlignV: string;
}

class SettingsJson
{
	shuffleLeftCards: boolean;
	shuffleRightCards: boolean;
}

class CardPairJson
{
	left: string;
	right: string;
}
