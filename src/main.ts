import * as core from '@actions/core';
import * as github from '@actions/github';
import { sendLensEvent, LensEventPayload } from './api';
import { parseMultilineDictionary, parseNumericDictionary } from './utils';

export async function run(): Promise<void> {
  try {
    const apiHost: string = core.getInput('api_host', { required: true });
    const apiKey: string = core.getInput('api_key', { required: true });
    const workflowName: string = core.getInput('workflow_name', {
      required: true,
    });

    const artifactInput: string = core.getInput('artifact');
    const tagsInput: string = core.getInput('tags');
    const customDataInput: string = core.getInput('custom_data');
    const metricsInput: string = core.getInput('metrics');

    const repository =
      process.env.GITHUB_REPOSITORY ||
      `${github.context.repo.owner}/${github.context.repo.repo}`;
    const commitSha = process.env.GITHUB_SHA || github.context.sha;

    const payload: LensEventPayload = {
      repository,
      commit_sha: commitSha,
      workflow_name: workflowName,
    };

    if (artifactInput) {
      const parsedArtifact = parseMultilineDictionary(artifactInput);
      if (parsedArtifact.name && parsedArtifact.version) {
        payload.artifact = {
          name: parsedArtifact.name,
          version: parsedArtifact.version,
        };
      } else {
        core.warning(
          "Artifact input must contain both 'name' and 'version' fields. Ignoring artifact context."
        );
      }
    }

    const parsedTags = parseMultilineDictionary(tagsInput);
    if (Object.keys(parsedTags).length > 0) {
      payload.tags = parsedTags;
    }

    const parsedCustomData = parseMultilineDictionary(customDataInput);
    if (Object.keys(parsedCustomData).length > 0) {
      payload.custom_data = parsedCustomData;
    }

    const parsedMetrics = parseNumericDictionary(metricsInput);
    if (Object.keys(parsedMetrics).length > 0) {
      payload.metrics = parsedMetrics;
    }

    core.debug(`Sending payload to Lens: ${JSON.stringify(payload)}`);
    await sendLensEvent(apiHost, apiKey, payload);

    core.info(
      `Successfully logged event to Lens for repository: ${repository}`
    );
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(`Unknown error occurred: ${String(error)}`);
    }
  }
}
