Feature: Apply for an Approved Premises place
  Background:
    Given I am logged in

  Scenario: Creating an application
    When I start a new application
    And I fill in and complete an application
    Then I should see a confirmation of the application
