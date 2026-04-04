import { combineReducers } from 'redux';
import authReducer from './authReducer';
import surveyReducer from './surveyReducer';
import { FETCH_USER, FETCH_SURVEYS } from '../actions/types';

describe('Reducers', () => {
  describe('authReducer', () => {
    test('returns initial state', () => {
      const state = authReducer(undefined, {});
      expect(state).toEqual(null);
    });

    test('handles FETCH_USER action', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const state = authReducer(undefined, {
        type: FETCH_USER,
        payload
      });
      expect(state).toEqual(payload);
    });
  });

  describe('surveyReducer', () => {
    test('returns initial state', () => {
      const state = surveyReducer(undefined, {});
      expect(state).toEqual([]);
    });

    test('handles FETCH_SURVEYS action', () => {
      const payload = [
        { id: 1, title: 'Survey 1' },
        { id: 2, title: 'Survey 2' }
      ];
      const state = surveyReducer(undefined, {
        type: FETCH_SURVEYS,
        payload
      });
      expect(state).toEqual(payload);
    });

    test('replaces surveys data', () => {
      const initialState = [{ id: 1, title: 'Old Survey' }];
      const payload = [{ id: 2, title: 'New Survey' }];
      
      const state = surveyReducer(initialState, {
        type: FETCH_SURVEYS,
        payload
      });
      
      expect(state).toEqual(payload);
      expect(state).not.toContain(initialState[0]);
    });
  });

  describe('combined reducers', () => {
    test('combines auth and survey reducers', () => {
      const rootReducer = combineReducers({
        auth: authReducer,
        surveys: surveyReducer
      });

      const state = rootReducer(undefined, {});
      
      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty('surveys');
      expect(state.auth).toEqual(null);
      expect(state.surveys).toEqual([]);
    });
  });
});
