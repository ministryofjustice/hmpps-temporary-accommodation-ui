import { defineConfig } from 'cypress'
import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild'
import NodeModulesPolyfillPlugin from '@esbuild-plugins/node-modules-polyfill'

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config)

  on(
    'file:preprocessor',
    createBundler({
      plugins: [NodeModulesPolyfillPlugin(), createEsbuildPlugin(config)],
    }),
  )

  on('task', {
    log(...args) {
      // eslint-disable-next-line
      console.log(...args)
      return null
    },
  })

  // Make sure to return the config object as it might have been modified by the plugin.
  return config
}

export default defineConfig({
  chromeWebSecurity: false,
  video: true,
  fixturesFolder: 'e2e/fixtures',
  screenshotsFolder: 'e2e/screenshots',
  videosFolder: 'e2e/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 70000,
  e2e: {
    specPattern: 'e2e/tests/**/*.feature',
    setupNodeEvents,
    supportFile: false,
  },
  env: {
    // Probation region for user temporary-accommodation-training-1
    acting_user_probation_region_id: 'ca979718-b15d-4318-9944-69aaff281cad',
    acting_user_probation_region_name: 'East of England',
  },
  numTestsKeptInMemory: 0,
  retries: 1,
})
