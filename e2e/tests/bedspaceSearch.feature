Feature: Manage Temporary Accommodation - Bedspace Search
    Background:
        Given I am logged in as an assessor

    Scenario: Searching for a bedspace
        Given I'm creating a premises
        And I create an active premises with all necessary details
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I return to the dashboard
        And I'm searching for a bedspace
        And I search for a bedspace
        Then I should see the bedspace search results
