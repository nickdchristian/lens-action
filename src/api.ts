export interface LensEventPayload {
  repository: string;
  commit_sha: string;
  workflow_name: string;
  artifact?: {
    name: string;
    version: string;
  };
  tags?: Record<string, string>;
  custom_data?: Record<string, string>;
  metrics?: Record<string, number>;
}

export async function sendLensEvent(
  apiHost: string,
  payload: LensEventPayload,
  oidcToken: string
): Promise<void> {
  const baseUrl = apiHost.replace(/\/$/, '');
  const url = `${baseUrl}/api/v1/events`;


  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${oidcToken}`
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
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
