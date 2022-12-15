Feature: Manage Temporary Accommodation - Report
    Background:
        Given I am logged in

    Scenario: Downloading a booking report for all probation regions
        Given I'm downloading a booking report
        And I select to download a report for all probation regions
        Then I should download a booking report

    Scenario: Downloading a booking report for a probation region
        Given I'm downloading a booking report
        And I select a probation region to download a report for
        Then I should download a booking report
