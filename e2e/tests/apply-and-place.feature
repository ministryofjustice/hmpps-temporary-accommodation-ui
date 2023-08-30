Feature: Apply for and book a Temporary Accommodation bedspace
  Scenario: Creating an application
    Given I am logged in as a referrer
    When I start a new application
    And I fill in and complete an application
    Then I should see a confirmation of the application
