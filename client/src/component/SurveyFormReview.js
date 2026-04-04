import React from 'react';
import {connect} from 'react-redux'; //pull values from redux store
import FIELDS from './formFields';
import _ from 'lodash';
import { withRouter } from "react-router"; //https://reactrouter.com/web/api/withRouter
import * as actions from '../actions';

const SurveyFormReview = ({onCancel, formValues, submitSurvey, history}) => { //this.props.onCancel
	const reviewFields = _.map(FIELDS, field => {
		return(
			<div key={field.name} className="review-row"> 
				<label>{field.label}</label>
				<div> 
					{formValues[field.name]}
				</div> 
			</div> 
		);
	});

	return(
		<div className="survey-review"> 
			<h4>Please confirm your entries</h4>
			{reviewFields}
			<div className="form-actions">
				<button className="btn-flat action-cancel" onClick={onCancel}>Back
	    			<i className="material-icons right">backspace</i>
	    		</button>
	    		<button className="btn action-send" onClick={() => submitSurvey(formValues, history)}>Send Survey
	    			<i className="material-icons right">email</i>
	    		</button>
			</div>
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
