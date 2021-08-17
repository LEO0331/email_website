import React from 'react'; //label and text inputs
//touched: user clicked; meta property: an Obj contains properties after submit
const SurveyField = ({input, label, meta: {touched, error}}) => { //input contains callbacks generated auto by redux-form <Field>
	return (
		<div>
			<label>{label}</label>
	    	<input {...input} placeholder={label} style={{marginBottom: '2px'}} />
	    	<div className="red-text" style={{marginBottom: '15px'}}>
	    		{touched && error}
	    	</div>
    	</div>
	);
};
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
//{...input} equals to onBlur={input.onBlur} onChange={input.onChange} ...
export default SurveyField;