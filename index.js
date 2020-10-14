'use strict';

const e = React.createElement;

// Render controls
function Controls (props)
{
	// Conditionally show these based on whether we've started
	let startButton = null;
	let currentTurn = null;
	let nextTurn = null;
	if (props.currentTurn == undefined) {
		startButton = e('button', {onClick: props.start}, 'Start');
	} else {
		currentTurn = e('div', {}, `Current Turn: ${props.currentTurn}`);
		nextTurn = e('button', {onClick: props.nextTurn}, 'Next Turn');
	}
		
	const clear = e('button', {onClick: props.clear}, 'Reset');
	
	const mainControls = e('div', {},
		startButton,
		currentTurn,
		nextTurn,
		clear);
	
	// Add Character button
	const addChr = e('div', {},
		e('button', {onClick: props.addChr}, 'Add Character'),
		e('input', {id: 'addChrTurnNo', placeholder: 'Turn No', type: 'number'}),
		e('input', {id: 'addChrName', placeholder: 'Name'}),
		e('input', {id: 'addChrAC', placeholder: 'AC', type: 'number'}),
		e('input', {id: 'addChrHP', placeholder: 'HP', type: 'number'}),
		);
		
	return e('div', {className: 'Controls'},
		mainControls,
		addChr);
}

// Render a single character's info in the current turn panel
function CurrentTurnChr(props)
{
	const chrName = e('td', {width: '30%'}, `${props.chr.name}`);
	const chrInfo = e('td', {width: '70%'},
		e('div', {}, `HP: ${props.chr.hp}`),
		e('div', {}, `AC: ${props.chr.ac}`));
		
	return e('tr', {},
		chrName,
		chrInfo);
}

// Render the current turn panel
class CurrentTurn extends React.Component
{
	render(){
		const chrs = this.props.turn.chrs.map((chr) =>
			e(CurrentTurnChr, {chr: chr, key: 'curchr_'+chr.name}));
			
		return e('div', {},
			e('h3', {}, "Who's Up:"),
			e('table', {className: 'CurrentTurn'}, chrs));
	}
}

// Render a character's info in the initiative list
class ListTurnChr extends React.Component
{
	render(){
		const name = e('td', {width: '30%'}, `${this.props.chr.name}`);
		const info = e('td', {width: '50%'}, `AC: ${this.props.chr.ac} / HP: ${this.props.chr.hp}`);
		const remove = e('td', {},
			e('button', {onClick: () => this.props.removeChr(this.props.chr)}, 'Remove'));
			
		return e('tr', {className: 'ListTurnChr'},
			name,
			info,
			remove
		);
	}
}

// Render a single turn in the initiative list
class InitiativeListTurn extends React.Component
{
	render(){
		// Map given characters to their own components
		const chrs = this.props.turn.chrs.map((chr) =>
			e(ListTurnChr, {
				chr: chr,
				removeChr: (chr) => this.props.removeChr(this.props.turn, chr),
				key: 'listchr_'+chr.name}));
				
		// Decorate the current turn in the initiative list
		const currentTurnClass = this.props.isCurrent ? 'InitiativeListCurrentTurn' : '';
		
		return e('tr', {className: `InitiativeListTurn ${currentTurnClass}`},
			e('td', {}, `${this.props.turn.turnNo}`),
			e('td', {}, e('table', {className: 'InitiativeListTurnChars'}, chrs)),
		);
	}
}

// Render the initiative list component
class InitiativeList extends React.Component
{
	render(){
		const turns = this.props.turns.map((turn) =>
			e(InitiativeListTurn, {
				turn: turn,
				isCurrent: this.props.currentTurn != undefined && turn.turnNo == this.props.currentTurn,
				removeChr: this.props.removeChr,
				key: 'initTurn_'+turn.turnNo})
		);
			
		return e('div', {},
			e('h3', {}, 'Initiative List'),
			e('table', {className: 'InitiativeList'}, turns)
		);
	}
}

// Main app root
class IniTrack extends React.Component
{
	constructor(props) {
		super(props);
		this.state = {
			// Mock data to start with
			turns: [
				{	turnNo: 20,
					chrs: [
						{ name: 'Mirko Youngspear', ac: 16, hp: 31 },
					]
				},
				{	turnNo: 15,
					chrs: [
						{ name: 'Goblin Boss', ac: 14, hp: 18 },
					]
				},
				{	turnNo: 7, 
					chrs: [
						{ name: 'Goblin A', ac: 12, hp: 7 },
						{ name: 'Goblin B', ac: 12, hp: 8 },
					],
				},
			],
		};
	}
  
	// Move to the next turn in the initiative list
	nextTurn() {
		// Get the available turn no's in descending list
		const turnNos = this.state.turns
			.map((turn) => turn.turnNo)
			.sort((a, b) => b - a);
		
		// Get the next available turn no, looping back to the first turn
		let nextTurnIndex = turnNos.indexOf(this.state.currentTurn) + 1;
		if (nextTurnIndex >= turnNos.length)
			nextTurnIndex = 0;

		const nextTurnNo = turnNos[nextTurnIndex];
		
		// Update state
		this.setState({currentTurn: nextTurnNo});
	}
	
	// Remove a character from te initiativeList (did somebody die?)
	removeChr(turn, chr) {
		// Find the specified turn/character combo
		const turnIndex = this.state.turns.indexOf(turn);
		const chrIndex = this.state.turns[turnIndex].chrs.indexOf(chr);
		
		// Create a new turn structure without the given character
		const turns = this.state.turns.slice();
		turns[turnIndex].chrs.splice(chrIndex, 1);
		
		// Remove the turn if no characters are left
		if (turns[turnIndex].chrs.length == 0) {
			turns.splice(turnIndex, 1);
			
			// Move to next turn if this one is empty
			if (turn.turnNo == this.state.currentTurn)
				this.nextTurn();
		}
		
		// Update state
		this.setState({turns: turns});
	}
	
	// Add a character to the initiative list (Gandalf joins the battle!)
	addChr() {
		// Grab input values
		const turnNo = document.getElementById('addChrTurnNo').value;
		const chrName = document.getElementById('addChrName').value;
		const ac = document.getElementById('addChrAC').value;
		const hp = document.getElementById('addChrHP').value;
		
		// Validate inputs
		if (!turnNo) {
			alert('Please specify a positive number for turn ordering');
			return;
		}
		
		if (!chrName) {
			alert('Please specify a name for this character');
			return;
		}
		
		if (!ac) {
			alert('Please specify and Armor Class for this character');
			return;
		}
		
		if (!hp) {
			alert('Please specify an amount of Hit Points for this character');
			return;
		}
		
		// Make sure this character doesnt exist yet
		if (this.state.turns.some((turn) => turn.chrs.some((chr) => chr.name == chrName))) {
			alert('This character is already in the initiative list: '+chrName);
			return;
		}
		
		// Validation passed, clear inputs
		document.getElementById('addChrTurnNo').value = '';
		document.getElementById('addChrName').value = '';
		document.getElementById('addChrAC').value = '';
		document.getElementById('addChrHP').value = '';
		
		// Find the specified turn or add a new one
		const turns = this.state.turns.slice();
		let turn = turns.find((turn) => turn.turnNo == turnNo);
		if (!turn) {
			turn = { turnNo: turnNo, chrs: [] };
			turns.push(turn);
			
			// Keep turns sorted, descending by turn no
			turns.sort((a, b) => b.turnNo - a.turnNo);
		}

		// Add the new character to its turn
		turn.chrs.push({ name: chrName, ac: ac, hp: hp });
		this.setState({turns: turns});
	}
	
	// Reset the state of the initiative tracker
	clear(){
		this.setState({turns: [], currentTurn: undefined});
	}
	
	// Kick off combat with the entered combatants
	start(){
		// Dont start if no combatants have been entered
		if (this.state.turns.length == 0) {
			alert('Please enter at least one character first');
			return;
		}

		// Start off with the highest initiative roll in the list
		const startTurnNo = Math.max(...this.state.turns.map((turn) => turn.turnNo));
		
		this.setState({currentTurn: startTurnNo});
	}

	// Render the app
	render() {
		// CurrentTurn component only shows if we're actually running
		let currentTurn = null;
		if (this.state.currentTurn != undefined) {
			const currentTurnData = this.state.turns.find((turn) => turn.turnNo == this.state.currentTurn);
			currentTurn = e(CurrentTurn, {turn: currentTurnData});
		}
		
		// Controls Component
		const controls = e(Controls, {
			start: this.start.bind(this),
			currentTurn: this.state.currentTurn,
			nextTurn: this.nextTurn.bind(this),
			addChr: this.addChr.bind(this),
			clear: this.clear.bind(this),
			});
			
		// InitiativeList component only shows if any characters have been entered
		let initiativeList = null;
		if (this.state.turns.length != 0) {
			initiativeList = e(InitiativeList, {
				currentTurn: this.state.currentTurn,
				turns: this.state.turns,
				removeChr: this.removeChr.bind(this),
			});
		}
		
		// Wrap em all up in a div
		return e('div', {},
			currentTurn,
			controls,
			initiativeList);
	}
}

const domContainer = document.querySelector('#initrack_container');
ReactDOM.render(e(IniTrack), domContainer);