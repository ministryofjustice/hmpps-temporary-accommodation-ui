Feature: Manage Temporary Accommodation - Lost beds
    Background:
        Given I am logged in
        And I view an existing active premises
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
    
    Scenario: Editing a void booking
        Given I'm marking a bedspace as void
        And I create a void booking with all necessary details
        And I edit the void booking
        Then I should see confirmation for my updated void booking

    Scenario: Showing void booking editing errors
        Given I'm marking a bedspace as void
        And I create a void booking with all necessary details
        And I attempt to edit the void booking with required details missing
        Then I should see a list of the problems encountered voiding the bedspace

    Scenario: Cancelling a void booking
        Given I'm marking a bedspace as void
        And I create a void booking with all necessary details
        And I cancel the void booking
        Then I should see confirmation that the void is cancelled
