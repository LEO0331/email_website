const demoStore = require('../services/demoStore');

describe('demoStore', () => {
  beforeEach(() => {
    demoStore.clearDemoStore();
  });

  test('starts with logged-out user', () => {
    expect(demoStore.getCurrentUser()).toBe(false);
  });

  test('loginDemoUser creates and returns the same user on repeated calls', () => {
    const firstLogin = demoStore.loginDemoUser();
    const secondLogin = demoStore.loginDemoUser();

    expect(firstLogin).toEqual({
      id: 'demo-user',
      name: 'Demo User',
      credits: 5,
    });
    expect(secondLogin).toBe(firstLogin);
    expect(demoStore.getCurrentUser()).toBe(firstLogin);
  });

  test('createSurvey appends survey with generated metadata', () => {
    const created = demoStore.createSurvey({
      title: 'T1',
      subject: 'S1',
      body: 'B1',
      recipients: ['a@example.com'],
    });

    expect(created._id).toBe('survey-1');
    expect(created.yes).toBe(0);
    expect(created.no).toBe(0);
    expect(new Date(created.dateSent).toString()).not.toBe('Invalid Date');
    expect(demoStore.listSurveys()).toHaveLength(1);
  });

  test('logoutDemoUser clears current user and clearDemoStore resets counters', () => {
    demoStore.loginDemoUser();
    demoStore.createSurvey({
      title: 'T1',
      subject: 'S1',
      body: 'B1',
      recipients: ['a@example.com'],
    });

    demoStore.logoutDemoUser();
    expect(demoStore.getCurrentUser()).toBe(false);

    demoStore.clearDemoStore();
    const created = demoStore.createSurvey({
      title: 'T2',
      subject: 'S2',
      body: 'B2',
      recipients: ['b@example.com'],
    });
    expect(created._id).toBe('survey-1');
  });
});
