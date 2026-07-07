import { sendLensEvent } from '../src/api';

describe('API', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should send a payload correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 202,
    });

    await sendLensEvent('https://api.lens.com/', {
      repository: 'test-repo',
      commit_sha: 'abcdef',
      workflow_name: 'test-workflow',
    }, 'mock-oidc-token');

    expect(mockFetch).toHaveBeenCalledWith('https://api.lens.com/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-oidc-token',
      },
      body: JSON.stringify({
        repository: 'test-repo',
        commit_sha: 'abcdef',
        workflow_name: 'test-workflow',
      }),
    });
  });

  it('should throw an error if the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: jest.fn().mockResolvedValue('Invalid OIDC Token'),
    });

    await expect(
      sendLensEvent('https://api.lens.com', {
        repository: 'test-repo',
        commit_sha: 'abcdef',
        workflow_name: 'test-workflow',
      }, 'bad-token')
    ).rejects.toThrow('Failed to send event to Lens: 401 Unauthorized. Invalid OIDC Token');
  });
});
