import React from 'react'; //label and text inputs
//touched: user clicked; meta property: an Obj contains properties after submit
const SurveyField = ({input, label, meta: {touched, error}}) => { //input contains callbacks generated auto by redux-form <Field>
	return (
		<div className="field-block">
			<label className="field-label">{label}</label>
	    	<input {...input} className="field-input" placeholder={label} />
	    	<div className="field-error">
	    		{touched && error}
	    	</div>
    	</div>
	);
};
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
//{...input} equals to onBlur={input.onBlur} onChange={input.onChange} ...
export default SurveyField;
