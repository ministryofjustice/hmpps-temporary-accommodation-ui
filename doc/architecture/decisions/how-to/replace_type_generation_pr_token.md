# Replace Type Generation PR Token

The `Generate Types` Workflow is triggered by `hmpps-approved-premises-api` whenever its OpenAPI specification file changes.

The default `GITHUB_TOKEN` token that Actions run with cannot create pull requests that run subsequent
Workflows (i.e. tests will not run on PRs created with it.)  We therefore need to provide a GitHub Personal Access Token (PAT)
as a repository secret.  These expire so need to be changed every 90 days.

1. Go to <https://github.com/settings/personal-access-tokens/new>
2. Name the token, e.g. `Open PR for updated OpenAPI types`
3. Set 90 day expiration
4. Select `ministryofjustice` as the Resource Owner
5. Enter the following as the justification:

   ```
   To create a Pull Request where the test suite will run against updated TS models when the OpenAPI specification changes in `hmpps-approved-premises-api`
   ```

6. For Repository Access, select `Only select repositories`, then select `hmpps-temporary-accommodation-ui` as the repository
7. Under Permissions->Repository Permissions, select `Access: Read and Write` on the `Contents` and `Pull Requests` options
8. Click `Generate token and request access`
9. Copy the token
10. Go to `https://github.com/ministryofjustice/hmpps-approved-premises-api/settings/secrets/actions`
11. Under the Repository secrets section, click the edit pencil next to `OPEN_PR_ACCESS_TOKEN`
12. Paste the PAT and click `Update Secret`
13. An Administrator for the ministryofjustice GitHub Organisation will need to approve the token before it starts to work (you will receive an email from GitHub once this has been done.)
