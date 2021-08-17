import React, {Component} from 'react';
//import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import SurveyNew from './SurveyNew';

class App extends Component {
  componentDidMount(){ //進行實例化網路請求:AJAX
    this.props.fetchUser();
  }

  render(){
    return (
        <BrowserRouter>
          <div className="container">
            <Header />
            <Route exact = {true} path="/" component={Landing} />
            <Route exact path="/surveys" component={Dashboard} />
            <Route path="/surveys/new" component={SurveyNew} />
          </div>
        </BrowserRouter>
    );
  }
}
//connect a React component to a Redux store: actions as props in App
export default connect(null, actions)(App);
/*
exact = {true} or exact: avoid showing both landing and Dashboard page in route /surveys -> /surveys will find all components inside, meaning "/" will also be shown
Only one component is allowed in <BrowserRouter>
Connect: https://react-redux.js.org/api/connect
the wrapper function will be called right away, without being saved in a temporary variable -> 
all connect to generate the wrapper function, and immediately call the wrapper function to generate the final wrapper component
*/