import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

class Header extends Component{
	renderContent(){
		switch (this.props.auth){
			case null:
				return;
			case false:
				return (
					<li>
						<Link className="nav-link nav-cta" to="/signin">Sign in</Link>
					</li>
				);
			default:
				return (
					<li>
						<Link className="nav-link" to="/logout">Logout</Link>
					</li>
				);
		}
	}

	render(){
		return(
			<nav className="site-nav">
    			<div className="nav-wrapper">
	      			<Link to={this.props.auth ? '/surveys' : '/'} className="brand-logo brand-mark">
	      				<span className="brand-pulse" aria-hidden="true"></span>
	      				<span>Emaily</span>
	      			</Link>
	      			<ul className="nav-menu">
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
