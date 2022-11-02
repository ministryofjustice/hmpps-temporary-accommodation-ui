Feature: Manage Temporary Accommodation
    Background:
        Given I am logged in

    Scenario: Creating a premises
        Given I'm creating a premises
        And I create a premises with all necessary details
        Then I should see a confirmation for my new premises

    Scenario: Showing premises errors
        Given I'm creating a premises
        And I attempt to create a premises with required details missing
        Then I should see a list of the problems encountered creating the premises
