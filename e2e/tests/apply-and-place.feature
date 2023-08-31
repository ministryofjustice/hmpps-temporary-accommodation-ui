Feature: Apply for and book a Temporary Accommodation bedspace
  Scenario: Creating an application
    Given I am logged in as an assessor who visits the referrer landing page
    When I start a new application
    And I fill in and complete an application
    Then I should see a confirmation of the application
  Scenario: Booking a bedspace from an assessment
    Given I am logged in as an assessor
    When I view an existing active premises
    And I'm creating a bedspace
    And I create a bedspace with all necessary details
    And I return to the dashboard
    And I view the list of assessments
    And I view the assessment
    And I mark the assessment as ready to place
    Then I can place the assessment
