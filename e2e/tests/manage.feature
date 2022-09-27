Feature: Manage an Approved Premises
        Background:
                Given I am logged in

        Scenario: Creating a booking
                When I access the premises homepage
                And I see a list of premises
                And I choose a premises
                And I create a booking
                Then I should see a confirmation screen for my booking

        Scenario: Creating a lost bed
                When I access the premises homepage
                And I choose a premises
                And I create a lost bed
                Then I should see a notification that the lost bed has been created
