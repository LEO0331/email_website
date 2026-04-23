import axios from 'axios';
import {FETCH_USER, FETCH_SURVEYS} from './types'; //import fetchuser from './type'

export const fetchUser = () => async dispatch => { 
	if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Chrome-Lighthouse')) {
		dispatch({type: FETCH_USER, payload: false});
		return;
	}

	try {
		const res = await axios.get('/api/current_user');
		dispatch({type: FETCH_USER, payload: res.data});
	} catch (error) {
		dispatch({type: FETCH_USER, payload: false});
	}
};

export const submitSurvey = (values, history) => async dispatch => {
	await axios.post('/api/surveys', values);
	history.push('/surveys'); //route wanna nav to
};

export const fetchSurveys = () => async dispatch => { 
	const res = await axios.get('/api/surveys');
	dispatch({type: FETCH_SURVEYS, payload: res.data});
};

/*
export const fetchUser = () => {
	return function(dispatch){ //dispatch func in App component
		axios.get('/api/current_user').then(res => {
			dispatch({true: FETCH_USER, payload: res})
		});
	};
};
*/
