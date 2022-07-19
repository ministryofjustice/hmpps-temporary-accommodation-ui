# 2. mock-api-endpoints-in-dev

Date: 2022-07-18

## Status

Accepted

## Context

We currently have no one working on the API backend for this project, and we want to be able to
carry out as much work as possible on the frontend before we onboard a Kotlin developer to
start work on the API.

## Decision

We already use Wiremock for stubbing tests in the test environment. We will extend this to
use Wiremock in development, as well as adding some scripts to stub the API endpoints we
want to use. These will run when we bootstrap the app, and can be run at will.

The API endpoint we use will be configured in the `.env` file, so once we have an API,
we will be able to toggle environment variables to switch between using canned
response fixtures in the UI and connecting to a running API backend application.

## Consequences

This will allow us to make a rapid start on the frontend without having to wait for a Kotlin
dev to start building the endpoints. It will also mean that we can get a head start on designing
the API.
