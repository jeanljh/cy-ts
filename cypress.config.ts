import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 20000,
  requestTimeout: 10000,
  viewportHeight: 1080,
  viewportWidth: 1920,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
    },
    baseUrl: 'https://www.drinkies.my',
  },
})
