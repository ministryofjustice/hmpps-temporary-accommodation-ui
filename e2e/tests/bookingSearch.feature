Feature: Manage Temporary Accommodation - Booking search
    Background:
        Given I am logged in as an assessor

    Scenario: Showing bookings of all statuses
        Given I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details
        And I'm creating a booking
        And I create a booking with all necessary details
        When I'm searching bookings
        Then I should see a summary of the booking on the provisional bookings page
        And I confirm the booking
        And I'm searching bookings
        Then I should see a summary of the booking on the confirmed bookings page
        And I mark the booking as arrived
        And I'm searching bookings
        Then I should see a summary of the booking on the active bookings page
        And I mark the booking as departed
        And I'm searching bookings
        Then I should see a summary of the booking on the departed bookings page

    Scenario: Searching for a booking by CRN
        Given I'm searching bookings
        When I search for a CRN that does not exist in provisional bookings
        Then I should see a message that the provisional booking is not found
        When I click on the Departed bookings tab
        Then I should see a message that the departed booking is not found
        When I click on the Provisional bookings tab
        And I search for a valid CRN in provisional bookings
        Then I see the provisional booking I was searching for

    Scenario: Show paginated results with sorting functionality
        Given enough provisional bookings exists for several pages of results
        When I'm searching bookings
        Then I should see pagination functionality
        And I see results for the first page
        When I navigate to the second page
        Then I should see different results
        When I navigate to the first page
        Then I should see the original results
        And the results are ordered by end date in descending order
        When I navigate to order by end date
        Then the results are ordered by end date in ascending order
        When I navigate to order by start date
        Then the results order by start date in descending order
        When I navigate to order by start date
        Then the results order by start date in ascending order