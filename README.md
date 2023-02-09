# Temporary Accommodation

Apply for and manage temporary accommodation

## Prerequisites

* Docker
* NodeJS

## Setup

When running the application for the first time, run the following command:

```bash
script/setup
```

This will tear down and setup the application, create .env files and bootstrap the application.

If you're coming back to the application after a certain amount of time, you can run:

```bash
script/bootstrap
```

## Running the application

To run the server, from the root directory, run:

```bash
script/server
```

This starts the backing services using Docker, and runs the server on `localhost:3000`.

### Authentication in development

- username: `AP_TEST_PROBATION_1`
- password: `password123456`

See development seeding in [HMPPS-Auth](https://github.com/ministryofjustice/hmpps-auth/commit/ae4ea22c4da72725dd6814abc70187dd534d24c8).

## Running the tests

### Unit and Integration Tests

There is a complete suite of unit and integration tests that run as part of CI.

The integration tests are run using [Cypress](https://www.cypress.io/), and API
calls are mocked using [Wiremock](https://wiremock.org/).

To run linting, unit and integration tests, from the root directory, run:

```bash
script/test
```

### End to end tests

As well as unit and integration tests, there are also a [smaller suite of
end-to-end tests](https://github.com/ministryofjustice/hmpps-temporary-accommodation-ui/tree/main/e2e/tests)
that run in [Circle CI](https://circleci.com/) post-deploy to the `dev`
environment.

If you want to run these tests against a local version of the full stack, then
you can run the End to End tests against Docker containers running the full stack with:

```bash
script/local_e2e
```

Note: This requires `ap-tools` to be installed (<https://github.com/ministryofjustice/hmpps-approved-premises-tools>)

## Release process

Our release process aligns with the other CAS teams and as such [lives in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4247847062/Release+process).
The steps are also available in the [PULL_REQUEST_TEMPLATE](/.github/PULL_REQUEST_TEMPLATE.md#release-checklist).

## Manage infrastructure & view logs

This application is hosted on the MoJ Cloud Platform. For further details
head over to [our infrastructure documentation](/doc/how-to/manage-infrastructure.md).
