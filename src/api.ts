export interface LensEventPayload {
  repository: string;
  commit_sha: string;
  workflow_name: string;
  artifact_version?: string;
  tags?: Record<string, string>;
  custom_data?: Record<string, string>;
  metrics?: Record<string, number>;
}

export async function sendLensEvent(
  apiHost: string,
  apiKey: string,
  payload: LensEventPayload
): Promise<void> {
  const baseUrl = apiHost.replace(/\/$/, '');
  const url = `${baseUrl}/api/v1/events`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {
      // Ignore text extraction errors
    }
    throw new Error(
      `Failed to send event to Lens: ${response.status} ${response.statusText}. ${errorText}`
    );
  }
}
