import { defineConfig } from 'cypress'
import { resetStubs } from './wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import premises from './integration_tests/mockApis/premises'
import booking from './integration_tests/mockApis/booking'
import bookingExtension from './integration_tests/mockApis/bookingExtension'
import arrival from './integration_tests/mockApis/arrival'
import nonArrival from './integration_tests/mockApis/nonArrival'
import departure from './integration_tests/mockApis/departure'
import cancellation from './integration_tests/mockApis/cancellation'
import lostBed from './integration_tests/mockApis/lostBed'
import person from './integration_tests/mockApis/person'
import applications from './integration_tests/mockApis/applications'
import localAuthority from './integration_tests/mockApis/localAuthority'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
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
        ...bookingExtension,
        ...departure,
        ...cancellation,
        ...lostBed,
        ...person,
        ...applications,
        ...localAuthority,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/tests/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
