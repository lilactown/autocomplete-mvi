import * as React from 'react';
import { observeComponent, fromComponent } from 'observe-component/rx';
import { connectedView } from './libs/drivers/ReactDriver';

export interface ViewProps {
	value: string,
	results: Object[],
	showResults: boolean,
	highlighted: number,
};

interface ResultsListProps {
	results: Object[],
	highlighted: number,
	onClick?: Function,
	onMouseEnter?: Function,
	onMouseLeave?: Function,
};

const SearchInput = observeComponent<React.HTMLProps<any>>(
	'onChange',
	'onBlur',
	'onKeyPress',
	'onKeyDown',
)('input');

// View :: state -> DOM
function View({ value, results = [], showResults = false, highlighted = null }: ViewProps) {
	console.log(value, results, showResults);
	return (
		<div style={styles.comboBox}>
			<SearchInput style={styles.search} type="text" value={value} />
			{showResults ?
				<ResultsList
					results={results}
					highlighted={highlighted}
				/> :
				null
			}
		</div>
	);
}

const ResultsList = 
	observeComponent<ResultsListProps>(
		'onClick',
		'onMouseEnter',
		'onMouseLeave',
	)(({ results, onClick, onMouseEnter, onMouseLeave, highlighted }: ResultsListProps) => (
		<div style={styles.resultsBox}>
			<ul style={styles.resultsList}>
				{results.map((title: string, i: number) => 
					<li
						key={i}
						onClick={() => onClick(title)}
						onMouseEnter={() => onMouseEnter(i)}
						style={Object.assign(
							{},
							styles.result,
							i === highlighted ? styles.highlighted : {},
						)}
						onMouseLeave={() => onMouseLeave()}
					>
						{title}
					</li>
				)}
			</ul>
		</div>
	));

const styles = {
	comboBox: {
		position: 'relative',
	},
	search: {
		fontSize: 15,
		width: "100%",
		fontFamily: "sans-serif",
		height: 30,
	},
	resultsBox: {
		position: 'absolute',
		top: 30,
		left: 0,
		right: 0,
		zIndex: 999,
		backgroundColor: '#fff',
		boxShadow: "0px 4px 4px rgb(220,220,220)",
	},
	resultsList: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		border: "1px solid #ccc",
	},
	result: {
		fontFamily: "sans-serif",
		fontSize: 16,
		borderBottom: "1px solid #ccc",
		padding: 5,
	},
	highlighted: {
		backgroundColor: 'rgba(16, 127, 242, .2)',
	},
};

export const events = {
	input$: fromComponent(SearchInput),
	resultsList$: fromComponent(ResultsList),
};
export const view = connectedView<ViewProps, any>(View, events);
