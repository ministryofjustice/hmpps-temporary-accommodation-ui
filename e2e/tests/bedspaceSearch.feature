Feature: Manage Temporary Accommodation - Bedspace Search
    Background:
        Given I am logged in as an assessor

    Scenario: Searching for a bedspace
        Given I view an existing active bedspace
        And I return to the dashboard
        And I'm searching for a bedspace
        And I search for a bedspace
        Then I should see the bedspace search results
