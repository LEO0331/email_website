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
						<a className="nav-link nav-cta" href="/auth/google">Login with Google</a>
					</li>
				);
			default:
				return [ //https://flaviocopes.com/jsx-return-multiple-elements/
					<li key="1" className="nav-credits">Signed in</li>,
					<li key="2"><a className="nav-link" href="/api/logout">Logout</a></li>
				];
		}
	}

	render(){
		return(
			<nav className="site-nav">
    			<div className="nav-wrapper">
	      			<Link to={this.props.auth ? '/surveys' : '/'} className="left brand-logo brand-mark">
	      				<span className="brand-pulse" aria-hidden="true"></span>
	      				<span>Emaily</span>
	      			</Link>
	      			<ul className="right nav-menu">
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
