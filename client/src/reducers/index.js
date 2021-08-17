import {combineReducers} from 'redux';
import {reducer as reduxForm} from 'redux-form'; //managed by ReduxForm -> auto record all values from the form
import authReducer from './authReducer';
import surveyReducer from './surveyReducer';

export default combineReducers({ //key names are assigned/specified
	auth: authReducer,
	form: reduxForm,
	surveys: surveyReducer
});