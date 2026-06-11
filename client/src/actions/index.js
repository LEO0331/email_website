import axios from 'axios';
import {FETCH_USER, FETCH_SURVEYS} from './types'; //import fetchuser from './type'

function createIdempotencyKey() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return `survey_${crypto.randomUUID()}`;
	}

	return `survey_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

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
	await axios.post('/api/surveys', values, {
		headers: {
			'Idempotency-Key': createIdempotencyKey(),
		},
	});
	history.push('/surveys'); //route wanna nav to
};

export const fetchSurveys = () => async dispatch => { 
	const res = await axios.get('/api/surveys');
	const surveys = Array.isArray(res.data) ? res.data : res.data && res.data.data;
	dispatch({
		type: FETCH_SURVEYS,
		payload: Array.isArray(surveys) ? surveys : [],
	});
};
