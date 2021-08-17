import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import Payments from './Payments';

class Header extends Component{
	renderContent(){
		switch (this.props.auth){
			case null:
				return;
			case false:
				return <li><a href="/auth/google">Login with Google</a></li>;
			default:
				return [ //https://flaviocopes.com/jsx-return-multiple-elements/
					<li key="1"><Payments /></li>,
					<li key="2" style={{margin: '0 8px'}}>Credits: {this.props.auth.credits}</li>,
					<li key="3"><a href="/api/logout">Logout</a></li>
				];
		}
	}

	render(){
		return(
			<nav>
    			<div className="nav-wrapper">
	      			<Link to={this.props.auth ? '/surveys' : '/'} className="left brand-logo">
	      			Emaily
	      			</Link>
	      			<ul className="right hide-on-med-and-down">
	        			{this.renderContent()}
	      			</ul>
    			</div>
  			</nav>
		);
	}
}
//https://react-redux.js.org/using-react-redux/connect-mapstate
function mapStateToProps(state){ //the entire Redux store state: the "state value", not the "store instance"
	return {auth: state.auth};
}
//function mapStateToProps({auth}) return {auth}
export default connect(mapStateToProps)(Header);