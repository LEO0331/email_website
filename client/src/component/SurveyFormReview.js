import React from 'react';
import {connect} from 'react-redux'; //pull values from redux store
import FIELDS from './formFields';
import _ from 'lodash';
import { withRouter } from "react-router"; //https://reactrouter.com/web/api/withRouter
import * as actions from '../actions';

const SurveyFormReview = ({onCancel, formValues, submitSurvey, history}) => { //this.props.onCancel
	const reviewFields = _.map(FIELDS, field => {
		return(
			<div key={field.name}> 
				<label>{field.label}</label>
				<div style={{marginBottom: '10px'}}> 
					{formValues[field.name]}
				</div> 
			</div> 
		);
	});

	return(
		<div> 
			<h4>Please confirm your entries</h4>
			{reviewFields}
			<button className="btn red" onClick={onCancel} style={{marginTop: '10px'}}>Back
	    		<i className="material-icons right">backspace</i>
	    	</button>
	    	<button className="btn green right" onClick={() => submitSurvey(formValues, history)} style={{marginTop: '10px'}}>Send Survey
	    		<i className="material-icons right">email</i>
	    	</button>
	    </div> 
	);
};

function mapStateToProps(state){ 
	return {formValues: state.form.surveyForm.values};
}

export default connect(mapStateToProps, actions)(withRouter(SurveyFormReview));
/*
const reviewFields = _.map(FIELDS, ({name, label}) => {
		return(
			<div key={name}> 
				<label>{label}</label>
				<div> 
					{formValues[name]}
				</div> 
			</div> 
		);
	});
*/