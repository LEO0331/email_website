jest.mock('resend', () => ({
  Resend: jest.fn(),
}));

const { Resend } = require('resend');
const Mailer = require('../services/Mailer');

describe('Mailer service', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns skipped response when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const mailer = new Mailer(
      { subject: 'Hello', recipients: ['a@example.com'] },
      '<p>Test</p>'
    );

    const result = await mailer.send();

    expect(result).toEqual({
      success: false,
      message: 'Email service not configured',
    });
    expect(Resend).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  test('sends email via Resend when API key exists', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.MAIL_FROM = 'Team <team@example.com>';

    const send = jest.fn().mockResolvedValue({ id: 'email_1' });
    Resend.mockImplementation(() => ({ emails: { send } }));

    const mailer = new Mailer(
      { subject: 'Hello', recipients: ['a@example.com'] },
      '<p>Test</p>'
    );

    const result = await mailer.send();

    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(send).toHaveBeenCalledWith({
      from: 'Team <team@example.com>',
      to: ['a@example.com'],
      subject: 'Hello',
      html: '<p>Test</p>',
    });
    expect(result).toEqual({ id: 'email_1' });
  });

  test('rethrows errors from Resend', async () => {
    process.env.RESEND_API_KEY = 're_test';

    const send = jest.fn().mockRejectedValue(new Error('network fail'));
    Resend.mockImplementation(() => ({ emails: { send } }));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mailer = new Mailer(
      { subject: 'Hello', recipients: ['a@example.com'] },
      '<p>Test</p>'
    );

    await expect(mailer.send()).rejects.toThrow('network fail');

    errorSpy.mockRestore();
  });
});
