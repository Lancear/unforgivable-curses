function Component(
	transformation, 
	outputs = () => [], 
	delay = null,
	every_cycle = false,
) {
	this.transformation = transformation;
	this.outputs = outputs;
	this.delay = delay;
	this.every_cycle = every_cycle;
}

function Task(
	component,
	input,
) {
	this.component = component;
	this.input = input;
	this.execute_at = (component.delay !== null)
		? Date.now() + component.delay
		: null;
}

function RunTime(
	main,
	time_based = [],
	next_cycle = [],
) {
	this.main = main;
	this.time_based = time_based;
	this.next_cycle = next_cycle;
}

function worker( rt ) {
	while (rt.time_based.length > 0 
		|| rt.main.length > 0 
		|| rt.next_cycle.length > 0
	) {
		let new_rt = null;
		
		if (rt.time_based.length > 0 && Date.now() > rt.time_based[0].execute_at) {
			const task = rt.time_based[0];
			const rt_without_task = new RunTime( 
				rt.main, 
				rt.time_based.splice( 1 ), 
				rt.next_cycle 
			);
			
			new_rt = execute_task( task, rt_without_task );
		}
		else if (rt.main.length > 0) {
			const pick = Math.floor(Math.random() * rt.main.length);
			
			const task = rt.main[pick];
			const rt_without_task = new RunTime( 
				[...rt.main.splice( 0, pick ), ...rt.main.splice( pick + 1 )], 
				rt.time_based, 
				rt.next_cycle 
			);
			
			new_rt = execute_task( task, rt_without_task );
		}
		else if (rt.next_cycle.length > 0) {
			new_rt = new RunTime( 
				rt.next_cycle, 
				rt.time_based,
			);
		}
		else if (rt.time_based.length > 0) {
			new_rt = rt;
		}
		
		rt = new_rt;
	}
}

function execute_task( task, rt ) {
	const output = task.component.transformation( task.input );
	
	const new_next_cycle = (task.component.every_cycle)
		? [new Task( task.component, output ), ...rt.next_cycle]
		: rt.next_cycle;
	
	const runtime = task.component.outputs( task.input ).reduce(( rt, c ) => {
		if (c.delay === null) {
			return new RunTime(
				[new Task( c, output ), ...rt.main],
				rt.time_based,
				rt.next_cycle
			);
		}
		else {
			// TODO: sorted insert
			return new RunTime(
				rt.main,
				[...rt.time_based, new Task( c, output )],
				rt.next_cycle
			);
		}
	}, rt );
	
	return new RunTime(
		runtime.main,
		runtime.time_based,
		new_next_cycle
	);
}

// library
////////////////////////////////////////////////////////////////////////////////
// example 1

/*
const print = new Component( x=>console.log(x), () => [], 3000 );
const twice = new Component( n=>`double: ${n*2}`, () => [print] );
const half = new Component( n=>`half: ${n/2}`, () => [print] );
const inc = new Component( n=>n+1, () => [print, twice, half], null, true );

const runtime = new RunTime( [new Task( inc, 0 )] );
worker( runtime );
*/

// example 1
////////////////////////////////////////////////////////////////////////////////
// example 2

const print = new Component( x=>console.log(x), () => [], 3000 );
const wait = new Component( t=>t.input, t=>[t.component], 1000);

const runtime = new RunTime( [new Task( inc, 0 )] );
worker( runtime );