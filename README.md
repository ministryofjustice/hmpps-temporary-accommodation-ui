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

This will tear down and setup the application, create .env files and bootstrap
the application.

If you're coming back to the application after a certain amount of time, you can
run:

```bash
script/bootstrap
```

## Running the application

To run the application there are two options.

### 1. Using AP Tools

In order to spin up a full stack of a working API and other [dependant
services](./docker-compose.yml) we recommend using the [AP
Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

NB. The approach AP Tools takes solves a critical limitation for working in
development. Due to how the frontend and API authenticate requests they both
require access to _the same_ instance of hmpps-auth. This project is the focus
of our development tooling across all CAS services and is most likely to receive
future updates.

After following the set up the common commands are:

```bash
ap-tools server start --local-ui --local-api
```

```bash
ap-tools server stop
```

The service should then be available at <http://localhost:3000>

[Log in credentials are documented within AP
tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools#start-server).

### 2. Manually

This option has the benefit of a quicker initial startup and enables us to
develop features that aren't yet supported by the API through the use of
Wiremock.

To run the server against a fake API go to the root directory and run:

```bash
script/server
```

This starts the backing services using Docker, and runs the server on
<http://localhost:3000>.

### Authentication in development

* username: `AP_TEST_PROBATION_1`
* password: `password123456`

See development seeding in
[HMPPS-Auth](https://github.com/ministryofjustice/hmpps-auth/commit/ae4ea22c4da72725dd6814abc70187dd534d24c8).

## Running the tests

### Unit and Integration Tests

There is a complete suite of unit and integration tests that run as part of CI.

The integration tests are run using [Cypress](https://www.cypress.io/), and API
calls are mocked using [Wiremock](https://wiremock.org/).

### Run each type of test

#### Units (via Jest)

```bash
npm run test
```

#### Integration (Via Cypress)

These tests will start and run a local frontend app and mock out any request to
the API or other integration.

```bash
npm run test:integration
```

Spin up a real browser that gives you an interface to run individual tests and
view screenshots of what the user sees during each step.

```bash
npm run test:integration:ui
```

#### End-to-End tests (via Cypress)

The end-to-end tests run against an actual API and database. To run them locally, you must ensure a local full stack is
running (for instance, using AP Tools).

Run E2E tests via a headless Chrome browser, with reporting matching that seen on CI:

```bash
npm run test:e2e
```

Spin up a real browser that gives you an interface to run individual E2E features:

```bash
npm run test:e2e:ui
```

#### End-to-End tests (via Cypress) using dev-upstream AP Tools
This enables us to locally simulate the e2e test run in the Circle-CI pipeline

First start the ap-tools using
```
ap-tools server stop --clear-databases
ap-tools server start --local-ui --local-api-dev-upstream
```

* The end-to-end tests run against our local API which then integrates with the dev upstream services and the dev database due to this param `-local-api-dev-upstream`
* Once AP is running successfully, we can run one of the two npm scripts below which both use the `e2e.dev-upstream.env` config file (instead of `e2e.local.env` config file)
* This ensures that when we run the e2e tests we pass the same env vars that the pipeline uses. For example, this ensures we the e2e tests login as the same dev users

Run E2E tests via a headless Chrome browser, with reporting matching that seen on CI:

```bash
npm run test:e2e-dev-upstream
```

Spin up a real browser that gives you an interface to run individual E2E features:

```bash
npm run test:e2e-dev-upstream:ui
```

## Release process

Our release process aligns with the other CAS teams and as such [lives in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4247847062/Release+process).
The steps are also available in the
[PULL_REQUEST_TEMPLATE](/.github/PULL_REQUEST_TEMPLATE.md#release-checklist).

## Manage infrastructure & view logs

This application is hosted on the MoJ Cloud Platform. For further details head
over to [our infrastructure
documentation](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4325244964/Manage+infrastructure).

## Environments

[Details of the different environments and their roles can be found in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4330226204/Environments).
