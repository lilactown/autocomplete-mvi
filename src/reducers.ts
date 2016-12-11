import * as Rx from 'rx';
import { getResults } from './libs/getResults';
import { Intents } from './intent';
import { Model } from './model';

/*
	# Reducer pattern
	
	Intents are mapped to new states:
		Intent<Delta>.map(ReducerFactory)
	
	ReducerFactory have the following signature:
		ReducerFactory :: delta -> (state -> newState)

	Thus reducing the intents from a stream of UI changes, to a stream of
	functions with the signature:
		reducer :: state -> newState

	This means that the model can then transform the intent like so:
		model = reducers(intents)
			// reducer :: state -> newState
			.scan((state, reducer) => reducer(state));
*/

export type Reducer = (state: Model) => Model

function createReducer(arg: Partial<Model>): Reducer {
	const newState = arg;
	return (oldState: Model) =>
		Object.assign({}, oldState, newState);
}

// reducers :: Map<Observable<Delta>> -> Observable<Reducer>
export function reducers(intents: Intents): Rx.Observable<Reducer> {
	const value$ = intents.inputChange$
		.map((value) => createReducer({ value }));

	const hideResults$ = Rx.Observable
		.merge(<Rx.Observable<any>>intents.inputBlur$, intents.inputChange$.filter((v) => v === ""))
		.map(() => createReducer({
			showResults: false,
			results: [],
			highlighted: null,
		}));

	const results$ = intents.responses$
		.map((body: any[]) => {
			const results = body[1];
			return createReducer({
				results,
				showResults: true,
			});
		});
	
	const highlight$ =
		Rx.Observable.merge(
			intents.resultsHighlighted$,
			intents.resultsUnhighlighted$
		)
		.map((highlighted) => createReducer({ highlighted }));

	const highlightMoved$ = intents;

	const highlightSelected$ = intents.enterPressed$
		.map(() => (oldState: Model): Model => {
			const value = oldState.results[oldState.highlighted];
			if (oldState.highlighted === null) {
				return oldState;
			}
			return Object.assign({}, oldState, {
				value,
				showResults: false,
				results: [],
				highlighted: null,
			});
		});

	const autoComplete$ = intents.resultsClicks$
		.map((value) => createReducer({
			value,
			showResults: false,
			highlighted: null,
			results: [],
		}));

	return Rx.Observable.merge(value$, results$, autoComplete$, hideResults$, highlight$, highlightSelected$);
}
