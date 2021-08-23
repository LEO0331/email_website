import 'materialize-css/dist/css/materialize.min.css'; //import materializeCSS from 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import './index.css';
import App from './component/App';
import reducer from './reducers';
import reduxThunk from 'redux-thunk';
import axios from 'axios'; 
window.axios = axios;
//https://www.redux.org.cn/docs/introduction/ThreePrinciples.html
//const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//const store = createStore(reducer, {}, composeEnhancer(applyMiddleware(reduxThunk)));
const store = createStore(reducer, {}, applyMiddleware(reduxThunk));
//The <Provider> component makes the Redux store available to any nested components that need to access the Redux store
ReactDOM.render(
	<Provider store={store}><App /></Provider>, 
	document.getElementById('root')
);
/*
ReactDOM.render(<App />, document.getElementById('root')); (component instance, document.querySelector('#root'))
https://create-react-app.dev/docs/adding-custom-environment-variables/

Testing sendGrid in developer console -> mails in spam folder
import axios from 'axios'; 
window.axios = axios;
const survey = {
	title: "my survey",
	subject: "this is important!",
	recipients: "a840331a840331@gmail.com",
	body: "this is the body."
}
axios.post("/api/surveys", survey)
*/
