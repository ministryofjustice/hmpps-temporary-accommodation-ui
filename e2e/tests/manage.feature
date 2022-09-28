Feature: Manage an Approved Premises
        Background:
                Given I am logged in

        Scenario: Creating a booking
                Given I'm managing a premises
                And I create a booking
                Then I should see a confirmation screen for my booking

        Scenario: Creating a lost bed
                Given I'm managing a premises
                And I create a lost bed
                Then I should see a notification that the lost bed has been created

        Scenario: Showing lost bed errors
                Given I'm managing a premises
                And I attempt to create a lost bed without the necessary information
                Then I should see a list of the problems encountered creating the lost bed
