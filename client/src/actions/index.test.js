import { fetchUser, submitSurvey, fetchSurveys } from './index';
import { FETCH_USER, FETCH_SURVEYS } from './types';
import axios from 'axios';

jest.mock('axios');

describe('Redux Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchUser action', async () => {
    const mockData = { id: 1, email: 'test@example.com' };
    axios.get.mockResolvedValue({ data: mockData });

    const dispatch = jest.fn();
    const action = fetchUser();
    
    await action(dispatch);

    expect(axios.get).toHaveBeenCalledWith('/api/current_user');
    expect(dispatch).toHaveBeenCalledWith({
      type: FETCH_USER,
      payload: mockData
    });
  });

  test('fetchSurveys action', async () => {
    const mockSurveys = [
      { id: 1, title: 'Survey 1' },
      { id: 2, title: 'Survey 2' }
    ];
    axios.get.mockResolvedValue({ data: mockSurveys });

    const dispatch = jest.fn();
    const action = fetchSurveys();
    
    await action(dispatch);

    expect(axios.get).toHaveBeenCalledWith('/api/surveys');
    expect(dispatch).toHaveBeenCalledWith({
      type: FETCH_SURVEYS,
      payload: mockSurveys
    });
  });

  test('submitSurvey action', async () => {
    const mockValues = { title: 'Test', subject: 'Subject' };
    axios.post.mockResolvedValue({ data: { ok: true } });

    const dispatch = jest.fn();
    const history = { push: jest.fn() };
    const action = submitSurvey(mockValues, history);
    
    await action(dispatch);

    expect(axios.post).toHaveBeenCalledWith('/api/surveys', mockValues);
    expect(history.push).toHaveBeenCalledWith('/surveys');
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('handle API errors', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    const dispatch = jest.fn();
    const action = fetchUser();
    
    try {
      await action(dispatch);
    } catch (error) {
      expect(error.message).toBe('API Error');
    }
  });
});
