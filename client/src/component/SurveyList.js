import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchSurveys} from '../actions';

class SurveyList extends Component{
	componentDidMount(){ 
    	this.props.fetchSurveys();
  	}

  	renderSurvey(){ //from db, id in mongoose should be _id; Date().toString()
  		if (!this.props.surveys.length){
  			return (
  				<div className="empty-state">
  					<p>No surveys yet.</p>
  					<span>Create your first campaign with the plus button.</span>
  				</div>
  			);
  		}

  		return [...this.props.surveys].reverse().map(survey => { //newest on the top
  			return(
  				<div key={survey._id} className="card survey-card">
        			<div className="card-content survey-card-content">
          				<span className="card-title">{survey.title}</span>
          				<p>{survey.body}</p>
          				<p className="right survey-date">Sent On: {new Date(survey.dateSent).toLocaleDateString()}</p>
			        </div>
			        <div className="card-action survey-card-action">
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
