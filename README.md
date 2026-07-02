# Lens Event Logger

A GitHub Action to seamlessly log your deployment and CI/CD events directly into your Lens dashboard.

## Usage

Add this action to your workflow to record an event. The repository name and commit SHA are automatically determined by the GitHub Actions runtime environment.

### Basic Example

```yaml
steps:
  - name: Log Deployment to Lens
    uses: your-org/lens-action@v1
    with:
      api_host: 'https://lens.myorg.com'
      api_key: ${{ secrets.LENS_API_KEY }}
      workflow_name: 'Production Deployment'
```

### Advanced Example (with Tags and Metrics)

You can pass optional dictionaries using multi-line YAML syntax. You do not need to use JSON!

```yaml
steps:
  - name: Log Deployment to Lens
    uses: your-org/lens-action@v1
    with:
      api_host: 'https://lens.myorg.com'
      api_key: ${{ secrets.LENS_API_KEY }}
      workflow_name: 'Production Deployment'
      artifact: |
        name: lens-frontend
        version: v1.2.0
      tags: |
        env: production
        region: us-east-1
        team: backend
      metrics: |
        build_time_seconds: 42.5
        bundle_size_mb: 1.2
```

### Automatic DORA Metrics Collection

You can optionally instruct the action to automatically calculate and append pipeline-centric DORA metrics (`deployment_count`, `change_failure_rate`, `lead_time_minutes`) by enabling `track_dora`.

```yaml
steps:
  - name: Log Deployment to Lens
    # Best Practice: Use if: always() so failed deployments are still logged!
    if: always()
    uses: your-org/lens-action@v1
    with:
      api_host: 'https://lens.myorg.com'
      api_key: ${{ secrets.LENS_API_KEY }}
      workflow_name: 'Production Deployment'
      
      # Enable DORA metrics:
      track_dora: 'true'
      github_token: ${{ secrets.GITHUB_TOKEN }}
      job_status: ${{ job.status }}
```

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `api_host` | Yes | The URL of your Lens API (e.g., `https://lens.myorg.com`). |
| `api_key` | Yes | The secure API key to authenticate with Lens. |
| `workflow_name` | Yes | The name of the workflow (e.g., `Deploy to Production`). |
| `artifact` | No | A YAML-style dictionary defining the artifact being deployed (must include `name` and `version`). |
| `tags` | No | A YAML-style list of key-value pairs representing tags. |
| `custom_data` | No | A YAML-style list of key-value pairs representing custom data. |
| `metrics` | No | A YAML-style list of numeric key-value pairs representing metrics. |
| `track_dora` | No | Set to `'true'` to automatically compute and attach DORA metrics (lead time, deployment count, change failure rate). |
| `github_token` | No | The `GITHUB_TOKEN` used to fetch commit data for DORA lead time calculation. Required if `track_dora` is `true`. |
| `job_status` | No | The status of the deployment job (e.g., `${{ job.status }}`). Used to calculate change failure rate. |

## Development

This action is written in TypeScript. 

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Build for distribution: `npm run build`

> **Note**: The `@vercel/ncc` compiler is used to package the TypeScript into a single `dist/index.js` file. Make sure to run `npm run build` and commit the `dist/` directory before pushing changes!
