Feature: Manage Temporary Accommodation - Premises
    Background:
        Given I am logged in

    Scenario: Listing premises
        Given I'm viewing the list of premises
        Then I should see only premises for my region

    Scenario: Creating a premises
        Given I'm creating a premises
        And I create a premises with all necessary details
        Then I should see a confirmation for my new premises

    Scenario: Showing premises creation errors
        Given I'm creating a premises
        And I attempt to create a premises with required details missing
        Then I should see a list of the problems encountered creating the premises
        And I attempt to create a premises with the PDU missing
        Then I should see a list of the problems encountered creating the premises

    Scenario: Editing a premises
        Given I'm creating a premises
        And I create a premises with all necessary details
        And I'm editing the premises
        And I edit the premises details
        Then I should see a confirmation for my updated premises

    Scenario: Showing premises editing errors
        Given I'm creating a premises
        And I create a premises with all necessary details
        And I'm editing the premises
        And I attempt to edit the premises to remove required details
        Then I should see a list of the problems encountered updating the premises
        And I attempt to edit the premises to remove the PDU
        Then I should see a list of the problems encountered updating the premises
