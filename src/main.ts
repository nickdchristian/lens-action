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

    const trackDoraInput: string = core.getInput('track_dora');
    const trackDora: boolean = trackDoraInput.toLowerCase() === 'true';
    const githubToken: string = core.getInput('github_token');
    const jobStatus: string = core.getInput('job_status');

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

    const chartConfigsInput: string = core.getInput('chart_configs');
    const parsedChartConfigs = parseMultilineDictionary(chartConfigsInput);
    if (Object.keys(parsedChartConfigs).length > 0) {
      if (!payload.custom_data) payload.custom_data = {};
      payload.custom_data._lens_chart_configs = JSON.stringify(parsedChartConfigs);
    }

    if (trackDora) {
      if (!payload.metrics) payload.metrics = {};
      
      // Deployment count
      payload.metrics.deployment_count = 1;
      
      // Change Failure Rate
      if (jobStatus) {
        const status = jobStatus.toLowerCase();
        if (status === 'success') {
          payload.metrics.change_failure_rate = 0;
        } else if (status === 'failure' || status === 'cancelled') {
          payload.metrics.change_failure_rate = 1;
        }
      }

      // Lead Time for Changes
      if (githubToken && commitSha && repository && repository.includes('/')) {
        try {
          const octokit = github.getOctokit(githubToken);
          const [owner, repo] = repository.split('/');
          const response = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commitSha,
          });
          const commitDateStr = response.data.commit.committer?.date || response.data.commit.author?.date;
          if (commitDateStr) {
            const commitDate = new Date(commitDateStr).getTime();
            const leadTimeMinutes = (Date.now() - commitDate) / 60000;
            payload.metrics.lead_time_minutes = Math.round(leadTimeMinutes * 100) / 100;
          }
        } catch (err) {
          core.warning(`Failed to fetch commit for DORA lead time calculation: ${err}`);
        }
      } else {
        core.warning('track_dora is true but github_token is missing (or repository is malformed). Cannot calculate lead_time_minutes.');
      }
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
