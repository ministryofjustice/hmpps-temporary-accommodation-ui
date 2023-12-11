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

