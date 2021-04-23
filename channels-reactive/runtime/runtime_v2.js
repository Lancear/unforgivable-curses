////////////////////////////////////////////////////////////////////////////////
// helper functions

const debug_speed = ( fn ) => setTimeout( fn, 1000 );
const is_ready = ( p ) => Date.now( ) > p.ready_at;
const is_empty = ( coll ) => coll.length == 0;
const first = ( coll ) => coll[0];
const prepend = ( coll, x ) => [x, ...coll];
const merge = ( coll1, coll2 ) => [...coll1, ...coll2];
const remove_first = ( coll ) => [...coll].splice( 1 );
const insert_sorted = ( coll, x ) => [...coll, x]; // TODO

// helper functions
////////////////////////////////////////////////////////////////////////////////
// runtime

function runtime( tasks, processes = [] ) {
	
	// console.warn( 'RT:', tasks, processes );
	
	if ( !is_empty( processes ) && is_ready( first( processes ) ) ) {
		const process = first( processes );
		
		runtime( 
			prepend( tasks, new Task( process.code, process.input ) ),
			remove_first( processes )			
		);
	}
	else if ( !is_empty( tasks ) ) {
		const item = first( tasks );
		
		if (item instanceof Process) {
			runtime( remove_first( tasks ), insert_sorted( processes, item )  );
		}
		else if (item instanceof Task) {
			const new_tasks = execute_task( item );
			
			//debug_speed( () => {
				runtime( merge( new_tasks, remove_first( tasks ) ), processes );
			//} );
		}
	}
}

function execute_task( task ) {
	if ( task.code instanceof Component ) {
		console.log( `[#${task.id} ${task.code.name}]` );
		
		return task.code.fn( task.input );
	}
	else if ( typeof task.code == 'function' ) {
		console.log( `[#${task.id} function]` );
		
		task.code( task.input );
		return [];
	}
}

// runtime
////////////////////////////////////////////////////////////////////////////////
// runtime data structures

function Component( name, fn ) {
	this.name = name;
	this.fn = fn;
}

function Process( code, input, delay = 0 ) {
	this.code = code;
	this.input = input;
	this.delay = delay;
	this.delayed_at = Date.now( );
	this.ready_at = this.delayed_at + this.delay;
}

function Task( code, input ) {
	this.id = task_id++;
	this.code = code;
	this.input = input;
}

let task_id = 1000;

// runtime data structures
////////////////////////////////////////////////////////////////////////////////
// example

const print = new Component( 'print', ( x ) => {
	return [new Task( console.log, x )];
} );

const twice = new Component( 'double', ( n ) => {
	const r = n * 2;
	return [new Task( twice2, r )];
} );

const twice2 = new Component( 'double again', ( n ) => {
	const r = n * 2;
	return [new Task( print, r )];
} );

const inc = new Component( 'inc', ( n ) => {
	const r = n + 1;
	return [new Task( twice, r ), new Task( inc, r )];
} );

runtime( [new Task( inc, 0 )] );

// example
////////////////////////////////////////////////////////////////////////////////
