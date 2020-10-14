'use strict';

const e = React.createElement;

function Controls (props)
{
	const addChr = e('div', {},
		e('button', {onClick: props.addChr}, 'Add Character'),
		e('input', {id: 'addChrTurnNo', placeholder: 'Turn No'}),
		e('input', {id: 'addChrName', placeholder: 'Name'}),
		e('input', {id: 'addChrAC', placeholder: 'AC'}),
		e('input', {id: 'addChrHP', placeholder: 'HP'}),
		);
		
	return e('div', {},
		e('div', {}, `Current Turn: ${props.currentTurn}`),
		e('button', {onClick: props.nextTurn}, 'Next Turn'),
		addChr);
}

function CurrentTurnChr(props)
{
	return e('li', {className: 'CurrentTurnChr'},
		e('div', {}, `${props.chr.name}`),
		e('div', {}, `HP: ${props.chr.hp}`),
		e('div', {}, `AC: ${props.chr.ac}`),)
}

class CurrentTurn extends React.Component
{
	render(){
		const chrs = this.props.turn.chrs.map((chr) =>
			e(CurrentTurnChr, {chr: chr, key: 'curchr_'+chr.name}));
			
		return e('div', {},
			//e('div', {}, `Current Turn: ${this.props.turn.turnNo}`),
			e('ul', {}, chrs));
	}
}

class ListTurnChr extends React.Component
{
	render(){
		const name = e('div', {}, `${this.props.chr.name}`);
		const info = e('div', {}, `AC: ${this.props.chr.ac} / HP: ${this.props.chr.hp}`);
		const remove = e('div', {},
			e('button', {onClick: () => this.props.removeChr(this.props.chr)}, 'Remove'));
			
		return e('div', {className: 'ListTurnChr'},
			name,
			info,
			remove
		);
	}
}

class InitiativeListTurn extends React.Component
{
	render(){
		const chrs = this.props.turn.chrs.map((chr) =>
			e(ListTurnChr, {
				chr: chr,
				removeChr: (chr) => this.props.removeChr(this.props.turn, chr),
				key: 'listchr_'+chr.name}));
				
		// Decorate the current turn
		const currentTurnClass = this.props.isCurrent ? 'InitiativeListCurrentTurn' : '';
		
		return e('li', {className: `InitiativeListTurn ${currentTurnClass}`},
			e('span', {}, `${this.props.turn.turnNo}`),
			e('span', {}, chrs),
		);
	}
}

class InitiativeList extends React.Component
{
	render(){
		const turns = this.props.turns.map((turn) => {
//			if (turn.turnNo == this.props.currentTurn)
//				return null;
//			else
				return e(InitiativeListTurn, {
					turn: turn,
					isCurrent: turn.turnNo == this.props.currentTurn,
					removeChr: this.props.removeChr,
					key: 'initTurn_'+turn.turnNo})
		});
			
		return e('div', {},
			e('ul', {style: {listStyleType: 'none'}}, turns)
		);
	}
}

class IniTrack extends React.Component
{
	constructor(props) {
		super(props);
		this.state = {
			currentTurn: 20,
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
  
	// Move to the next turn
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
	
	addChr() {
		const turnNo = document.getElementById('addChrTurnNo').value;
		const chrName = document.getElementById('addChrName').value;
		const ac = document.getElementById('addChrAC').value;
		const hp = document.getElementById('addChrHP').value;
		// Validate inputs
		if (!turnNo || turnNo <= 0) {
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
		
		// Find the specified turn or add a new one
		const turns = this.state.turns.slice();
		let turn = turns.find((turn) => turn.turnNo == turnNo);
		if (!turn) {
			turn = { turnNo: turnNo, chrs: [] };
			turns.push(turn);
			
			// Keep turns sorted descending by turn no
			turns.sort((a, b) => b.turnNo - a.turnNo);
		}

		// Add the new character to its turn
		turn.chrs.push({ name: chrName, ac: ac, hp: hp });
		this.setState({turns: turns});
	}

	render() {
		const currentTurnData = this.state.turns.find((turn) => turn.turnNo == this.state.currentTurn);
		const currentTurn = e(CurrentTurn, {turn: currentTurnData});
		
		const controls = e(Controls, {
			currentTurn: this.state.currentTurn,
			nextTurn: this.nextTurn.bind(this),
			addChr: this.addChr.bind(this),
			});
			  
		const initiativeList = e(InitiativeList, {
			currentTurn: this.state.currentTurn,
			turns: this.state.turns,
			removeChr: this.removeChr.bind(this),
			});
			  
		return e('div', {},
			currentTurn,
			controls,
			initiativeList);
	}
}

const domContainer = document.querySelector('#initrack_container');
ReactDOM.render(e(IniTrack), domContainer);