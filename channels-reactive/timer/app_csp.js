const { go, chan, take, put, timeout } = require('js-csp');

go(function *( ) {
	const seconds = chan( 2 );
	const seconds_to_minutes = chan( );
	const seconds_to_timer = chan( );
	const minutes = chan( 2 );
	const minutes_to_timer = chan( );
	const time = chan( );
	
	go(
		count_seconds, 
		[seconds, [seconds_to_minutes, seconds_to_timer, seconds]]
	);
	
	go(
		count_minutes, 
		[minutes, seconds_to_minutes, [minutes_to_timer, minutes]] 
	);
	
	go(
		build_time, 
		[minutes_to_timer, seconds_to_timer, [time]] 
	);
	
	go(
		print_time, 
		[time] 
	);

	yield put( seconds, 0 );
	console.log( 'start' );
	yield put( minutes, 0 );
} );

function *count_seconds( input, outputs ) {
	while (true) {
		const seconds = yield take( input );

		yield timeout( 1000 );
		const new_seconds = 
			(seconds === 59)
			? 0
			: seconds + 1;
		
		for( channel of outputs ) {
			yield put( channel, new_seconds );
		}
	}
}

function *count_minutes( input, enable, outputs ) {
	while (true) {
		const seconds = yield take( enable );
		const minutes = yield take( input );

		const new_minutes = 
			(seconds === 0)
			? minutes + 1
			: minutes;
		
		for( channel of outputs ) {
			yield put( channel, new_minutes );
		}
	}
}

function *build_time( input, enable, outputs ) {
	while (true) {
		const seconds = yield take( enable );
		const minutes = yield take( input );

		const time = `${minutes}:${seconds}`;
		
		for( channel of outputs) {
			yield put( channel, time );
		}
	}
}

function *print_time( input ) {
	while (true) {
		const time = yield take( input );
		console.log( time );
	}
}