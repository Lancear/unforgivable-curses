function main( ) {
	const p = new Producer( (x) => x + 1 );
	const r = new Receiver( (x) => {
		const start = Date.now();
		while (Date.now() < start + 1000) {}
		console.log( 'r1 says', x )
	}	);
	
	p.add_receiver( p );
	p.add_receiver( r );
	  
	p.send( 0 );
}

main();

/*
 * Creates a receiver which performs an action on the received input.
 * action( input )
 */
function Receiver( action ) {		
	this.send = (input) => {
		action(input);
	}
}

/*
 * Creates a producer which performs a transformation on the received input.
 * The result of the transformer is sent to all receivers.
 * transformer( input )
 */
function Producer( transformer ) {
	this.receivers = [];
	
	this.add_receiver = ( receiver ) => this.receivers.push( receiver );
	
	this.send = (input) => {
		const result = transformer( input );
		this.receivers.forEach( (receiver) => 
			call( receiver, result ) 
		);
	}
}

function call( receiver, value ) {
	setTimeout( () => receiver.send( value ), 0 );
}