Feature: Manage an Approved Premises
        Scenario: Creating a booking
                Given I am logged in
                And I see a list of premises
                And I choose a premises
                And I create a booking
                Then I should see a confirmation screen
