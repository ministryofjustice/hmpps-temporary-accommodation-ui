# Approved Premises

Apply for and manage approved premises

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

To run linting, unit and end-to-end tests, from the root directory, run:

script/test
