Feature: Manage Temporary Accommodation - Bedspace
    Background:
        Given I am logged in as an assessor

    Scenario: Creating a bedspace
        Given I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        Then I should see a confirmation for my new bedspace

    Scenario: Editing a bedspace
        Given I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I'm editing the bedspace
        And I edit the bedspace details
        Then I should see a confirmation for my updated bedspace
