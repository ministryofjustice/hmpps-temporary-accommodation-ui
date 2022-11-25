Feature: Manage Temporary Accommodation
    Background:
        Given I am logged in

    Scenario: Creating a premises
        Given I'm creating a premises
        And I create a premises with all necessary details
        Then I should see a confirmation for my new premises

    Scenario: Showing premises creation errors
        Given I'm creating a premises
        And I attempt to create a premises with required details missing
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
        And I attempt to edit the premise to remove required details
        Then I should see a list of the problems encountered updating the premises

    Scenario: Creating a bedspace
        Given I'm viewing an existing premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        Then I should see a confirmation for my new bedspace

    Scenario: Editing a bedspace
        Given I'm viewing an existing premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I'm editing the bedspace
        And I edit the bedspace details
        Then I should see a confirmation for my updated bedspace

    Scenario: Creating a booking
        Given I'm viewing an existing premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I'm creating a booking
        And I create a booking with all necessary details
        Then I should see a confirmation for my new booking

    Scenario: Showing booking creation errors
        Given I'm viewing an existing premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I'm creating a booking
        And I attempt to create a booking with required details missing
        Then I should see a list of the problems encountered creating the booking

     Scenario: Confirming a booking
        Given I'm viewing an existing premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        Then I should see the booking with the confirmed status
