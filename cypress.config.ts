import { defineConfig } from 'cypress'
import applications from './integration_tests/mockApis/applications'
import assessments from './integration_tests/mockApis/assessments'
import arrival from './integration_tests/mockApis/arrival'
import auth from './integration_tests/mockApis/auth'
import bedspaceSearch from './integration_tests/mockApis/bedspaceSearch'
import booking from './integration_tests/mockApis/booking'
import bookingSearch from './integration_tests/mockApis/bookingSearch'
import cancellation from './integration_tests/mockApis/cancellation'
import confirmation from './integration_tests/mockApis/confirmation'
import departure from './integration_tests/mockApis/departure'
import extension from './integration_tests/mockApis/extension'
import lostBed from './integration_tests/mockApis/lostBed'
import nonArrival from './integration_tests/mockApis/nonArrival'
import person from './integration_tests/mockApis/person'
import premises from './integration_tests/mockApis/premises'
import report from './integration_tests/mockApis/report'
import room from './integration_tests/mockApis/room'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import turnaround from './integration_tests/mockApis/turnaround'
import user from './integration_tests/mockApis/user'
import schemaValidator from './integration_tests/tasks/schemaValidator'
import accessibilityViolations from './integration_tests/tasks/accessibilityViolations'
import { resetStubs } from './wiremock'

export default defineConfig({
  chromeWebSecurity: false,
  video: true,
  fixturesFolder: 'cypress_shared/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 70000,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...arrival,
        ...nonArrival,
        ...auth,
        ...tokenVerification,
        ...premises,
        ...booking,
        ...extension,
        ...departure,
        ...cancellation,
        ...confirmation,
        ...turnaround,
        ...lostBed,
        ...person,
        ...applications,
        ...assessments,
        ...room,
        ...report,
        ...user,
        ...bookingSearch,
        ...schemaValidator,
        ...bookingSearch,
        ...bedspaceSearch,
        ...accessibilityViolations,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/tests/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    numTestsKeptInMemory: 1,
  },
})
