import { config } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'
import { TestOptions } from '@temporary-accommodation-ui/e2e'

config({
  path: `e2e_playwright.env`,
  override: true,
})

export default defineConfig<TestOptions>({
  testDir: './',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  maxFailures: process.env.CI ? 3 : 1,
  workers: 2,
  reporter: [['html', { outputFolder: './playwright-report/index.html' }]],
  timeout: process.env.CI ? 5 * 60 * 1000 : 2 * 60 * 1000,
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup-dev',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: process.env.DEV_PLAYWRIGHT_BASE_URL },
    },
    {
      name: 'dev',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.DEV_PLAYWRIGHT_BASE_URL,
      },
      dependencies: ['setup-dev'],
    },
    {
      name: 'setup-local',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: process.env.LOCAL_PLAYWRIGHT_BASE_URL },
    },
    {
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.LOCAL_PLAYWRIGHT_BASE_URL,
      },
      dependencies: ['setup-local'],
    },
  ],
})
