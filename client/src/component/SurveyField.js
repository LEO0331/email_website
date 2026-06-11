import React from 'react';

const SurveyField = ({input, label, meta: {touched, error}}) => {
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

export default SurveyField;
