/* eslint-disable */
import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form'; //helper, similar as connect helper in react-redux library
import {Link} from 'react-router-dom';
import SurveyField from './SurveyField';
import _ from 'lodash';
import FIELDS from './formFields';
// /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//https://redux-form.com/8.3.0/examples/wizard/
class SurveyForm extends Component { //a form for user to input
	renderFields(){
		return _.map(FIELDS, ({name, label}) => {
			return <Field key={name} label={label} type="text" name={name} component={SurveyField} />
		});
	}
	//https://zh-hant.reactjs.org/docs/forms.html
	render(){
		return (
			<div> 
				<form onSubmit={this.props.handleSubmit(this.props.onSurveySubmit)}>
	    			{this.renderFields()}
	    			<Link to="/surveys" className="red waves-effect waves-teal btn">Cancel
	    				<i className="material-icons right">cancel</i>
	    			</Link>
	    			<button type="submit" className="btn waves-effect waves-light right">Next
	    				<i className="material-icons right">done</i>
	    			</button>
	    		</form>	
    		</div>
		);
	}
}
//https://emailregex.com/
function validateMails(emails){
	const invalid = emails.split(',').map(email => email.trim()).filter(email => re.test(email) === false)
	if(invalid.length){
		if (invalid.includes("")) {
   			return 'Please remove the comma or add another email address';
 		}
		return `These emails are invalid: ${invalid}`
	}
	return;
}

function validate(values){
	const errors = {};
  	errors.recipients = validateMails(values.recipients || '');
	_.each(FIELDS, ({name}) => {
		if (!values[name]){
			errors[name] = 'Required';
		}
	});
	return errors;
}

export default reduxForm({
	validate,
	form: 'surveyForm',
	destroyOnUnmount: false
	//forceUnregisterOnUnmount: true
})(SurveyForm);

/*
props.handleSubmit(call another func)/onSurveySubmit/onCancel provided auto by reduxForm
destroyOnUnmount: true -> delete form once form is Unmounted or no longer show on the screen
<Field type="text" name="surveyTitle" component="input" />:
under name(surveyTitle; key of the Obj) will record input text as value in onSubmit after click the submit btn
renderFields() {
    return FIELDS.map(({ name, label }, i) => {
      <Field key={i} type="text" name={name} label={label} component={SurveyField} />
    });
}
renderFields(){
	return(
		<div>
			<Field label="Survey Title" type="text" name="title" component={SurveyField} />
			<Field label="Subject Line" type="text" name="subject" component={SurveyField} />
			<Field label="Email body" type="text" name="body" component={SurveyField} />
			<Field label="Recipient List" type="text" name="emails" component={SurveyField} />
		</div>
	);
}
renderFields() {
 	return (
     	FIELDS.map(field=><Field label={field.label} type={field.type} name={field.name} component={SurveyField} />)
 	);
}

function validate(values){
	const errors = {};
	if (!values.title) {
    	errors.title = 'Required'
  	}
  	if (!values.subject) {
    	errors.subject = 'Required'
  	}
  	if (!values.body) {
    	errors.body = 'Required'
  	}
  	if (!values.emails) {
    	errors.emails = 'Required'
  	} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    	errors.email = 'Invalid email address'
  	}
	return errors;
}
*/
