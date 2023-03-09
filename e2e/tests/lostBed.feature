Feature: Manage Temporary Accommodation - Lost beds
    Background:
        Given I am logged in
        And I'm viewing an existing premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details

    Scenario: Marking a bedspace as void
        Given I'm marking a bedspace as void
        And I create a void booking with all necessary details
        Then I should see a confirmation for my new void booking

    Scenario: Showing void booking creation errors
        Given I'm marking a bedspace as void
        And I attempt to mark a bedspace as void with required details missing
        Then I should see a list of the problems encountered voiding the bedspace
