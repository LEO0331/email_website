import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchSurveys} from '../actions';

class SurveyList extends Component{
	componentDidMount(){ 
    	this.props.fetchSurveys();
  	}

  	renderSurvey(){ //from db, id in mongoose should be _id; Date().toString()
  		return this.props.surveys.reverse().map(survey => { //newest on the top
  			return(
  				<div key={survey._id} className="card blue-grey">
        			<div className="card-content white-text">
          				<span className="card-title">{survey.title}</span>
          				<p>{survey.body}</p>
          				<p className="right">Sent On: {new Date(survey.dateSent).toLocaleDateString()}</p>
			        </div>
			        <div className="card-action grey-text text-lighten-3">
			         	<p>Yes: {survey.yes} No: {survey.no}</p>
			        </div>
			    </div>
  			);
  		});
  	}

	render(){
		return (
			<div>
	    		{this.renderSurvey()}		
    		</div>
		);
	}
}

function mapStateToProps(state){ //function mapStateToProps({surveys}){return {surveys}}
	return {surveys: state.surveys};
}

export default connect(mapStateToProps, {fetchSurveys})(SurveyList);