function isValidNumber(n) {
	
	scenario InvalidType (typeof n != Number) {
		console.error('Invalid Number!');
		return;
	}
	
}

function funkyFunction(_do, some, shizzle) {

	guard (isInvalidNumber(some));

	scenario ToManySome (some > 12) {
		console.error('Dont overdo it please!');
		return -1;
	}
	
	scenario DoNotFunkyEnough (isFunky(_do)) {
		console.error('Live a party!');
		return 'WTH bruh!';
	}

	scenario AllGood {
		for(let cnt = 0; cnt < some; cnt++) {
			console.log(_do + ' for ' + shizzle);
		}
		
		return 'Oh yeah!';
	}

}



function main() {

	let result = funkyFunction('shout and dance', 4, 'new language');
	
	console.log(result);
	console.log(scenario? result);

}