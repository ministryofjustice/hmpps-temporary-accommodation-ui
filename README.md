# Temporary Accommodation

Apply for and manage temporary accommodation

## Prerequisites

* Docker
* NodeJS

## Setup

When running the application for the first time, run the [generate-dotenv-files.sh](script/generate-dotenv-files.sh) script by executing this command from root in a Terminal:
```
./script/generate-dotenv-files.sh
```

Running the above script will generate two `.env` files required by the application:
* [.env](.env) - this is blank initially but is required for the application to deploy as we use `dotenv` as an `npm` lib in this repo. This blank file will also enable you to override properties set in the `.env.cas3-ui` file in `AP tools` where we deploy the application (see the `Running the application` section below for more details on this)
* [e2e.env](e2e.env) - this is used to load properties for the `Playwright` e2e suite (see the `E2E tests` section below for more details on this)

## Running the application

### Using AP Tools

In order to spin up a full local stack with the API (integrating with dependent services) use [AP Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

NB. This project is the focus of our development tooling across all CAS services and is likely to receive future updates.

After following the setup the common commands are:

* When running the API as a docker container and deploying everything (inc. this UI):
```
 ap-tools server start --cas3 --local-ui
```

* When running the API locally and deploying everything (inc. this UI):
```
 ap-tools server start --cas3 --local-ui --local-api
```

The service should then be available at <http://localhost:3000>

The same credentials used to login to the dev instance of the CAS3 UI should be used. For more information, see the [Dev & Test Users documentation](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/5624791477/Dev+Test+Users)

For a quick glance at the user logins see the [e2e.env](e2e.env) file (see the `E2E tests` section below for more details on this file)

* To stop the deployment:
```
ap-tools server stop
```

#### End-to-End tests (via Cypress)
The [generate-dotenv-files.sh](script/generate-dotenv-files.sh) script run in the `Setup` section earlier generated a [e2e.env](e2e.env) by:
* copying from the [e2e.env.template](e2e.env.template) file
* swapping out the parameterized values in the template for real `Kubenetes` secrets for you. For more information, see the [Dev & Test Users documentation](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/5624791477/Dev+Test+Users)
* this [e2e.env](e2e.env) loads all of the property values required by the `Cypress` e2e suite

### Running against UI/API hosted in your local dev environment (ap-tools)

First start the ap-tools using

```
ap-tools server stop --clear-databases
ap-tools server start --cas3 --local-ui --local-api
```

#### End-to-End tests (via Playwright)
The [generate-dotenv-files.sh](script/generate-dotenv-files.sh) script run in the `Setup` section earlier generated a [e2e.env](e2e.env) by:
* copying from the [e2e_playwright.env.template](e2e_playwright.env.template) file
* swapping out the parameterized values in the template for real `Kubenetes` secrets for you. For more information, see the [Dev & Test Users documentation](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/5624791477/Dev+Test+Users)
* this [e2e.env](e2e.env) loads all of the property values required by the `Playwright` e2e suite

### Installation steps
* Install Playwright:

```
npm install
npx playwright install
```

Then start the tests using one of the following:

```
npm run test:e2e
npm run test:e2e:ui
```

### Running against UI/API hosted in your local dev environment (ap-tools)

First start the ap-tools using

```
ap-tools server stop --clear-databases
ap-tools server start --cas3 --local-ui --local-api
```

If you also want to test emails, review the 'Testing Emails' section below

Then start the tests using one of the following:

```
npm run test:e2e:local
npm run test:e2e:local:ui
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
