Feature: Manage Temporary Accommodation - Bedspace Search
    Background:
        Given I am logged in

    Scenario: Searching for a bedspace
        Given I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I return to the dashboard
        And I'm searching for a bedspace
        And I search for a bedspace
        Then I should see the bedspace search results

    Scenario: Showing bedspace search errors
        Given I'm searching for a bedspace
        And I attempt to search for a bedspace with required details missing
        Then I should see a list of the problems encountered searching for a bedspace
