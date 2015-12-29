class Tools
{
	static shuffle<T>(array: T[])
	{
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
	}
	
	static isArray(val: any): boolean
	{
		return Object.prototype.toString.call(val) === '[object Array]';
	}
	
	static deepCopyFromTo(from: any, dest: any)
	{
		for (var key in from) {
			if (!from.hasOwnProperty(key)) continue;
			
			var element = from[key];
			if (element == null) continue;
			
			if (typeof(element) !== "object") {
				dest[key] = element;
				continue;
			}
			
			if (dest[key] == null || typeof(dest[key]) !== "object") {
				dest[key] = this.isArray(element) ? [] : {};
			}
			
			this.deepCopyFromTo(element, dest[key]);
		}
	}
}
