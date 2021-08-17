//https://www.redux.org.cn/docs/basics/Reducers.html
import {FETCH_USER} from '../actions/types';

const authReducer = (state = null, action) => {
	switch (action.type) {
		case FETCH_USER: 
			return action.payload || false; //'' falsy
    	default:
      		return state;
  	};
};

export default authReducer;
/* 
Situation || AuthReducers Returns 
Make request to backend to get current user || null: Do not know whats going on
Request complete, user login || User model: Object containing user ID
Request done, user NOT login || false: Sure that user not login
*/