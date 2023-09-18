debug = ( fn ) => setTimeout( fn, 1000 );

// helper functions for debugging
////////////////////////////////////////////////////////////////////////////////
// runtime

function runtime( tasks, processes = [] ) {	
	
	// console.warn( 'RT:', tasks, processes );

	if ( processes.length > 0 && processes[0].is_ready() ) {
		runtime( [processes[0], ...tasks], [...processes].splice( 1 ) );
	}
	else if ( tasks.length > 0 ) {
		const task = tasks[0];
		
		if ( task instanceof Process ) {
			console.log( 
				`[DELAY #${task.tid} ${task.name} BY ${task.delay}ms]` 
			);
			
			runtime( [...tasks].splice(1), [task, ...processes] )
		}
		else if ( task.process instanceof Component ) {
			console.log( `[#${task.tid} ${task.process.name}]` );
			
			const result = task.process.fn( task.input );
			const remaining_tasks = [...tasks].splice(1);
			
			debug( 
				() => runtime( [...result, ...remaining_tasks], processes ) 
			);
		}
		else if ( typeof task.process == 'function' ) {
			console.log( `[#${task.tid} function]` );
			
			task.process( task.input );
			
			debug(
				() => runtime( [...tasks].splice(1), processes )
			);
		}
	}
}

// runtime
////////////////////////////////////////////////////////////////////////////////
// runtime data structures
function Component( name, fn ) {
	this.name = name;
	this.fn = fn;
}

let tid = 1000;

function Task( process, input ) {
	this.tid = tid++;
	this.process = process;
	this.input = input;
}

function Process( name, process, input, delay ) {
	this.tid = tid++;
	this.name = name;
	this.process = process;
	this.input = input;
	
	this.delay = delay;
	this.delayed_at = Date.now( );
	this.ready_at = this.delayed_at + this.delay;

	this.is_ready = () => Date.now( ) > this.ready_at;
}

// runtime data structures
////////////////////////////////////////////////////////////////////////////////
// example

const print = new Component( 'print', ( x ) => {
	return [new Process( 'printed', console.log, x, 10000 )];
} );

const inc = new Component( 'inc', ( n ) => {
	const r = n + 1;
	return [new Task( print, r ), new Task( inc, r )];
} );

runtime( [new Task( inc, 0 )] );
