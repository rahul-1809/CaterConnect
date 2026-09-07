# Catering Planning & Quotation Platform --- Requirements Specification

**Document:** `requirements.md`\
**Version:** 1.0\
**Status:** Baseline requirements for implementation\
**Related document:** `planning.md`\
**Target:** Single local Indian catering business\
**Requirement notation:** `FR` = Functional Requirement, `BR` = Business
Rule, `NFR` = Non-Functional Requirement, `AC` = Acceptance Criterion

------------------------------------------------------------------------

# 1. Purpose

This document converts the product direction defined in `planning.md`
into implementation-ready requirements.

It defines:

-   product scope;
-   actors and permissions;
-   customer and caterer workflows;
-   functional requirements;
-   business rules;
-   validation rules;
-   pricing and quotation requirements;
-   booking and payment requirements;
-   AI assistant requirements;
-   multilingual and voice requirements;
-   security and privacy requirements;
-   non-functional requirements;
-   edge cases;
-   acceptance criteria;
-   implementation-phase traceability.

The goal is to remove ambiguity before detailed system design and
implementation.

------------------------------------------------------------------------

# 2. Product Summary

The system is a customer-facing catering planning, quotation, and
booking application for **one catering business**.

Customers must be able to independently plan an event through an
interactive application instead of depending entirely on phone calls.

A customer can:

1.  authenticate using phone number and OTP;
2.  choose a function/event type;
3.  browse available catering offerings;
4.  choose a predefined package or build a custom menu;
5.  customize menu selections;
6.  provide guest count;
7.  optionally provide a budget or budget range;
8.  provide event date, time, and venue;
9.  receive an estimated price range;
10. modify the event configuration;
11. submit a request for a final quotation;
12. receive the caterer's quotation;
13. accept or reject the quotation;
14. pay an advance when required;
15. receive booking confirmation.

The caterer remains the authority for the final commercial quotation.

An AI Catering Assistant will later operate on top of the same catalog,
event configuration, recommendation, and pricing services used by the
normal UI.

------------------------------------------------------------------------

# 3. Scope

## 3.1 In Scope

The initial product scope includes:

-   customer phone OTP authentication;
-   catering function/event catalog;
-   package catalog;
-   menu category and menu item catalog;
-   package and custom-menu planning;
-   menu customization;
-   guest-count-based planning;
-   customer budget input;
-   estimated price-range calculation;
-   budget-aware recommendations;
-   event date, time, and venue capture;
-   event plan review and editing;
-   quotation request submission;
-   caterer quotation preparation;
-   quotation delivery;
-   customer quotation acceptance/rejection;
-   advance payment recording/integration;
-   booking confirmation;
-   customer request/quotation/booking history;
-   caterer operational dashboard;
-   customer contact visibility to the caterer;
-   notifications;
-   auditability of important commercial actions;
-   text AI assistant;
-   multilingual AI capability;
-   voice AI capability in later phases.

## 3.2 Explicitly Out of Scope for V1

The following are not part of V1:

-   multi-caterer marketplace;
-   caterer discovery/comparison marketplace;
-   delivery fleet management;
-   vehicle tracking;
-   transportation management;
-   equipment asset management;
-   warehouse management;
-   complex inventory management;
-   employee payroll;
-   full accounting/ERP;
-   tax filing;
-   procurement automation;
-   supplier marketplace;
-   complex kitchen production scheduling;
-   internal team chat;
-   customer-to-caterer real-time chat as a core module;
-   AI-generated authoritative pricing;
-   fully autonomous quotation approval;
-   fully autonomous booking changes after quotation acceptance.

Incidental travel, transport, labor, service, or other event costs may
still be represented as configurable pricing components without creating
separate management modules.

------------------------------------------------------------------------

# 4. Actors

## 4.1 Customer

A customer is a person planning or booking catering for an event.

Primary capabilities:

-   authenticate;
-   browse offerings;
-   create and modify event plans;
-   obtain estimates;
-   request quotations;
-   view quotations;
-   accept/reject quotations;
-   make advance payments;
-   view bookings;
-   interact with the AI assistant.

## 4.2 Caterer/Admin

The caterer/admin manages the business side of the application.

Primary capabilities:

-   manage catalog;
-   manage packages;
-   manage menu items;
-   manage pricing rules;
-   review customer requirements;
-   inspect customer contact details;
-   prepare quotations;
-   send quotations;
-   manage booking state;
-   record/verify payments;
-   view operational dashboards.

## 4.3 AI Assistant

The AI assistant is a controlled application actor.

It may:

-   interpret customer requests;
-   ask for missing information;
-   retrieve catalog information;
-   recommend packages/menu items;
-   request deterministic estimates;
-   suggest budget adjustments;
-   explain estimates;
-   propose configuration changes;
-   apply approved changes through application services.

It must not independently determine authoritative prices, alter
protected business data, or bypass application permissions.

------------------------------------------------------------------------

# 5. Core Domain Terminology

## 5.1 Function Type

The type of event for which catering is required.

Examples:

-   wedding;
-   reception;
-   engagement;
-   birthday;
-   housewarming;
-   corporate event;
-   religious function;
-   other/custom event.

The actual list is caterer-configurable.

## 5.2 Catering Offering

A broad offering available for a function, such as breakfast, lunch,
dinner, snacks, full-day catering, or another caterer-defined service.

## 5.3 Package

A predefined collection of menu items and commercial rules.

A package may contain:

-   mandatory items;
-   selectable included items;
-   category-level selection limits;
-   optional paid additions;
-   guest-count restrictions;
-   base/per-person pricing rules.

## 5.4 Custom Menu

A customer-created menu assembled from eligible menu items without
requiring a predefined package.

## 5.5 Event Plan

The customer's editable planning object containing event details, menu
configuration, guest count, budget, and estimate.

## 5.6 Estimate

A system-generated indicative price range based on the current event
configuration.

An estimate is not the caterer's final quotation.

## 5.7 Quotation Request

A submitted event plan asking the caterer to review the requirements and
provide a final quotation.

## 5.8 Quotation

The caterer's commercial offer for a submitted requirement.

## 5.9 Booking

A confirmed commercial engagement created after quotation acceptance and
any required booking conditions.

------------------------------------------------------------------------

# 6. Product-Wide Business Rules

### BR-001 --- Single Caterer

The application shall represent exactly one catering business in V1.

### BR-002 --- Final Price Authority

The caterer's final quotation is the authoritative commercial price.

Customer-facing estimates shall never be represented as final prices.

### BR-003 --- Deterministic Pricing

All authoritative estimates produced by the application shall be
calculated by deterministic application pricing services.

The LLM shall not calculate or invent authoritative prices.

### BR-004 --- Estimate Presentation

Customer-facing estimates shall be displayed as a price range whenever
sufficient data exists.

Example:

`₹95,000 – ₹1,08,000`

The interface shall clearly communicate that the amount is an estimate
and the final quotation is subject to caterer confirmation.

### BR-005 --- Budget Is Soft

A customer's budget shall be treated as a planning and recommendation
constraint, not an automatic rejection condition.

The system may show:

-   within budget;
-   near budget;
-   above budget;
-   approximate difference;
-   recommended modifications.

### BR-006 --- Historical Commercial Integrity

Once a quotation is created, commercial data required to interpret that
quotation shall be snapshotted.

Later changes to catalog items, package definitions, or prices shall not
silently modify historical quotations.

### BR-007 --- Customer Identity

The customer's verified phone number is the primary customer
authentication identifier.

### BR-008 --- Caterer Contact Access

The caterer may view customer contact information associated with
submitted quotation requests and bookings.

### BR-009 --- Customer Approval for AI Changes

The AI assistant shall not silently make material changes to an event
configuration.

It shall present or clearly communicate proposed changes and apply them
only after customer approval, except for explicitly non-material UI
conveniences.

### BR-010 --- Submitted Request Stability

Submitting a quotation request shall create a stable snapshot/version of
the customer requirement for caterer review.

Subsequent customer edits must not silently alter an already submitted
request.

------------------------------------------------------------------------

# 7. Authentication and Customer Identity

## FR-AUTH-001 --- Request OTP

The system shall allow a customer to enter a supported phone number and
request an OTP.

### AC-AUTH-001

-   A valid phone number can request an OTP.
-   Invalid phone numbers are rejected with a clear validation message.
-   OTP requests are rate limited.
-   The UI does not reveal sensitive implementation details.

## FR-AUTH-002 --- Verify OTP

The system shall verify the submitted OTP and establish an authenticated
customer session.

### AC-AUTH-002

-   Correct, unexpired OTP authenticates the customer.
-   Incorrect OTP is rejected.
-   Expired OTP is rejected.
-   Excessive failed attempts trigger temporary protection/rate
    limiting.

## FR-AUTH-003 --- Returning Customer

If a verified phone number already belongs to a customer, the system
shall authenticate the existing customer rather than creating a
duplicate account.

## FR-AUTH-004 --- New Customer

If the verified phone number has no customer record, the system shall
create the minimum customer identity necessary to continue.

The product shall not require a separate mandatory profile-completion
page before event planning.

## FR-AUTH-005 --- Session

The application shall maintain a secure authenticated session across
normal customer navigation.

## FR-AUTH-006 --- Logout

The customer shall be able to log out and invalidate the active session.

## FR-AUTH-007 --- Customer Contact Data

The system shall support storing:

-   verified phone number;
-   customer name when collected;
-   email when optionally collected;
-   other minimal booking contact information if required.

------------------------------------------------------------------------

# 8. Customer Home and Function Selection

## FR-CAT-001 --- Display Function Types

The customer application shall display active function types configured
by the caterer.

## FR-CAT-002 --- Function Details

A function type may include:

-   name;
-   description;
-   image/icon;
-   active/inactive state;
-   associated offerings;
-   applicable packages;
-   optional planning guidance.

## FR-CAT-003 --- Start Event Plan

Selecting a function type shall allow the customer to start or continue
an event plan.

## FR-CAT-004 --- Custom/Other Function

The caterer may enable an "Other" function type allowing the customer to
provide a custom event description.

------------------------------------------------------------------------

# 9. Catering Offering and Package Browsing

## FR-PKG-001 --- Browse Offerings

The customer shall be able to browse active catering offerings
applicable to the selected function.

## FR-PKG-002 --- Browse Packages

The customer shall be able to browse available packages.

A package card/detail should support:

-   package name;
-   short description;
-   indicative price information when configured;
-   included categories/items;
-   customization availability;
-   minimum/maximum guest conditions when applicable.

## FR-PKG-003 --- Package Details

The customer shall be able to open a package and inspect its structure
before selecting it.

## FR-PKG-004 --- Select Package

The customer shall be able to choose an eligible package as the base
configuration for the event.

## FR-PKG-005 --- Custom Menu Entry

The customer shall also be able to choose a custom-menu path when
enabled.

The product shall not force every customer to use a package.

## FR-PKG-006 --- Eligibility

The application shall prevent selection of packages that are unavailable
or invalid for the current event conditions.

When possible, it shall explain why a package is unavailable.

------------------------------------------------------------------------

# 10. Menu Catalog

## FR-MENU-001 --- Menu Categories

Menu items shall be organized into caterer-defined categories.

Examples may include:

-   welcome drinks;
-   starters;
-   soups;
-   breads;
-   rice;
-   curries;
-   dal;
-   sweets;
-   desserts;
-   live counters;
-   snacks.

These examples are not hard-coded requirements.

## FR-MENU-002 --- Menu Item Data

A menu item shall support:

-   name;
-   description;
-   category;
-   active/inactive status;
-   vegetarian/non-vegetarian or other dietary metadata when needed;
-   image where available;
-   pricing attributes;
-   package eligibility;
-   function/offering eligibility;
-   recommendation metadata where useful.

## FR-MENU-003 --- Availability

Inactive or unavailable menu items shall not be selectable by customers.

## FR-MENU-004 --- Search and Filtering

The customer menu interface should support practical discovery through
category browsing and may support search/filtering as the catalog grows.

------------------------------------------------------------------------

# 11. Package Customization

## FR-CUST-001 --- Included Selection

A package may define customer-selectable included items.

Example:

-   choose 2 of 5 starters;
-   choose 1 sweet;
-   choose 2 curries.

The application shall enforce configured selection rules.

## FR-CUST-002 --- Mandatory Items

Mandatory package items shall remain part of the package unless the
caterer explicitly allows removal/substitution.

## FR-CUST-003 --- Paid Additions

The customer shall be able to add eligible paid menu items beyond the
package inclusions.

## FR-CUST-004 --- Remove Optional Additions

The customer shall be able to remove previously selected optional
additions before quotation submission.

## FR-CUST-005 --- Validation

The UI shall identify incomplete package selections before the customer
proceeds to a state requiring a complete menu.

## FR-CUST-006 --- Pricing Recalculation

Any menu modification affecting price shall cause the estimate to be
marked stale and recalculated automatically or on explicit estimate
refresh, depending on the final UX.

------------------------------------------------------------------------

# 12. Custom Menu Builder

## FR-CMENU-001 --- Build Menu

A customer using the custom-menu path shall be able to select eligible
menu items from available categories.

## FR-CMENU-002 --- Add/Remove Items

The customer shall be able to add and remove menu items while the event
remains editable.

## FR-CMENU-003 --- Menu Validation

The system may warn about unusual or incomplete menu composition.

Examples:

-   no main course;
-   no beverage;
-   excessive number of similar items.

Such warnings should guide rather than unnecessarily block the customer
unless the caterer defines a hard rule.

## FR-CMENU-004 --- Recommendations

The system may recommend complementary menu items based on function,
guest count, budget, package/menu composition, or caterer-defined rules.

------------------------------------------------------------------------

# 13. Guest Count

## FR-GUEST-001 --- Capture Guest Count

The customer shall provide expected guest count before receiving a
reliable estimate.

## FR-GUEST-002 --- Validation

Guest count shall:

-   be numeric;
-   be greater than zero;
-   respect any system-wide practical upper bound;
-   respect package-specific constraints when applicable.

## FR-GUEST-003 --- Estimate Dependency

Changing guest count shall invalidate/recalculate the current estimate.

## FR-GUEST-004 --- Package Eligibility Update

If guest count makes the selected package invalid, the application shall
clearly inform the customer and require an eligible configuration.

------------------------------------------------------------------------

# 14. Budget

## FR-BUD-001 --- Optional Budget

The application shall allow the customer to provide either:

-   a target budget; or
-   a budget range,

depending on the final UI.

Budget input shall not be required to calculate an estimate unless a
specific business rule later requires it.

## FR-BUD-002 --- Budget Comparison

After estimate calculation, the system shall compare the estimate with
the customer's budget when budget information exists.

## FR-BUD-003 --- Budget Status

The system shall communicate an understandable budget status.

At minimum:

-   within budget;
-   above budget.

The product may additionally distinguish "near budget".

## FR-BUD-004 --- Over-Budget Guidance

If the event is above budget, the system shall not reject the plan
solely for that reason.

It shall provide useful options such as:

-   lower-cost substitutions;
-   removal of optional items;
-   alternative package;
-   fewer premium additions;
-   other caterer-configured recommendations.

## FR-BUD-005 --- Under-Budget Guidance

If meaningful, the application may suggest enhancements when the
customer's plan is significantly below the stated budget.

------------------------------------------------------------------------

# 15. Event Details

## FR-EVENT-001 --- Event Date

The customer shall provide an event date.

## FR-EVENT-002 --- Event Time

The customer shall provide event time or an appropriate event time slot.

## FR-EVENT-003 --- Venue

The customer shall provide venue information sufficient for the caterer
to understand the event location.

The initial version may use free-text venue/address input.

## FR-EVENT-004 --- Past Dates

The application shall prevent new quotation requests for event dates in
the past.

## FR-EVENT-005 --- Date Availability

The architecture shall support caterer availability rules.

If availability management is not implemented in the first MVP
iteration, the interface must not falsely promise that the caterer is
available merely because a date can be entered.

## FR-EVENT-006 --- Notes

The customer should be able to provide additional event notes or special
requirements.

------------------------------------------------------------------------

# 16. Event Plan State

## FR-PLAN-001 --- Draft Event

An authenticated customer shall be able to maintain an event plan in
`DRAFT` state.

## FR-PLAN-002 --- Save Progress

The system shall persist meaningful event-planning progress so the
customer can navigate between pages without losing selections.

## FR-PLAN-003 --- Resume Draft

A returning authenticated customer should be able to resume an
unfinished draft event.

## FR-PLAN-004 --- Multiple Events

The domain model shall support a customer having multiple events over
time.

## FR-PLAN-005 --- Edit Draft

The customer shall be able to edit all editable planning fields before
submission.

## FR-PLAN-006 --- Review

Before requesting a quotation, the application shall provide a review
step containing the important event and commercial inputs.

At minimum:

-   function;
-   offering/package/custom-menu choice;
-   menu;
-   guest count;
-   budget when provided;
-   date;
-   time;
-   venue;
-   current estimate;
-   customer notes.

------------------------------------------------------------------------

# 17. Pricing and Estimate Engine

## FR-PRICE-001 --- Central Pricing Service

The system shall expose one authoritative application pricing service
for estimates.

Normal UI, admin UI, and AI workflows shall use the same pricing logic.

## FR-PRICE-002 --- Supported Pricing Inputs

The pricing model shall be able to consider applicable combinations of:

-   package pricing;
-   menu item pricing;
-   per-person pricing;
-   guest count;
-   fixed charges;
-   optional additions;
-   labor/service charges;
-   event-related configurable charges;
-   travel/transport cost line when applicable;
-   configurable margin/markup logic;
-   applicable discounts;
-   applicable taxes when configured.

Not every factor must be enabled for every caterer configuration.

## FR-PRICE-003 --- Estimate Range

The pricing service shall return a customer-safe estimated range rather
than exposing internal costing details by default.

## FR-PRICE-004 --- Explainable Breakdown

The system shall support an estimate breakdown sufficient to explain the
major customer-facing components.

Internal cost/margin details must remain admin-only where appropriate.

## FR-PRICE-005 --- Estimate Freshness

An estimate shall be tied to a specific event configuration/version.

If relevant inputs change, the previous estimate shall not be presented
as current.

## FR-PRICE-006 --- Pricing Errors

If an estimate cannot be safely calculated because required pricing data
is missing or inconsistent, the system shall not fabricate a value.

It shall explain that an estimate is currently unavailable and allow the
customer to continue toward caterer review where appropriate.

## FR-PRICE-007 --- Rounding

Currency calculation and display shall use explicit rounding rules
defined in the pricing design.

## FR-PRICE-008 --- Currency

V1 shall support Indian Rupees (`INR`, `₹`) as the primary currency.

------------------------------------------------------------------------

# 18. Estimate Presentation

## FR-EST-001 --- Display Range

The customer shall see the estimated price range prominently after
sufficient planning data is available.

## FR-EST-002 --- Disclaimer

The estimate view shall display a clear disclaimer communicating:

> Estimated price only. Final quotation is subject to caterer
> confirmation.

Exact copy may be refined during UX design without changing the business
meaning.

## FR-EST-003 --- Budget Context

When budget exists, the estimate view shall display how the estimate
relates to that budget.

## FR-EST-004 --- Modify Plan

The customer shall be able to return from the estimate/review experience
and modify the plan.

## FR-EST-005 --- No False Precision

The customer UI shall avoid presenting an estimate with misleading
precision when the underlying calculation contains uncertainty.

------------------------------------------------------------------------

# 19. Budget Recommendation Engine

## FR-REC-001 --- Recommendation Service

The system shall support a recommendation service separate from the
authoritative pricing calculation.

## FR-REC-002 --- Optimize Toward Budget

Given an event configuration and budget, the system shall be able to
propose changes that move the estimate toward the target.

## FR-REC-003 --- Preserve Constraints

Recommendations shall respect:

-   package selection rules;
-   item availability;
-   dietary constraints when supplied;
-   caterer-defined incompatibilities;
-   required menu components;
-   minimum commercial rules.

## FR-REC-004 --- Recommendation Explanation

Each material recommendation should include a customer-understandable
reason.

## FR-REC-005 --- No Automatic Destructive Changes

Recommendations shall not automatically remove or replace customer
selections without approval.

------------------------------------------------------------------------

# 20. Quotation Request

## FR-QREQ-001 --- Submit Request

A customer shall be able to submit a valid event plan as a quotation
request.

## FR-QREQ-002 --- Submission Validation

Before submission, the system shall validate all mandatory information.

## FR-QREQ-003 --- Snapshot

Submission shall create a stable snapshot of:

-   event details;
-   selected package/offerings;
-   menu selections;
-   guest count;
-   budget;
-   customer estimate;
-   notes;
-   relevant customer contact information;
-   relevant catalog/pricing references or snapshots.

## FR-QREQ-004 --- Request Identifier

Each quotation request shall have a unique identifier.

## FR-QREQ-005 --- Confirmation

After successful submission, the customer shall receive an in-app
confirmation.

## FR-QREQ-006 --- Request Status

Quotation request status shall support at least:

-   `REQUESTED`;
-   `UNDER_REVIEW`;
-   `QUOTATION_SENT`;
-   `CANCELLED`;
-   `EXPIRED`.

Exact transition details will be finalized in system design.

## FR-QREQ-007 --- Caterer Visibility

The caterer shall be able to view newly submitted requests and their
full planning details.

## FR-QREQ-008 --- Customer Contact

The caterer shall be able to view the customer's associated phone number
and available contact information.

------------------------------------------------------------------------

# 21. Caterer Request Review

## FR-ADMIN-001 --- Request Queue

The caterer dashboard shall provide a list/queue of quotation requests.

## FR-ADMIN-002 --- Filtering

The caterer should be able to filter requests by useful attributes such
as:

-   status;
-   event date;
-   submission date;
-   function type.

## FR-ADMIN-003 --- Request Detail

The caterer shall be able to open a request and inspect:

-   customer;
-   contact details;
-   event details;
-   menu;
-   guest count;
-   budget;
-   customer estimate;
-   customer notes;
-   submission history/version.

## FR-ADMIN-004 --- Mark Under Review

The caterer shall be able to move an eligible request into review state.

## FR-ADMIN-005 --- Direct Contact

The admin experience may expose convenient phone/WhatsApp contact
actions using stored customer contact information.

Such contact is outside the application's core quotation state machine
unless later integrated.

------------------------------------------------------------------------

# 22. Final Quotation

## FR-QUOTE-001 --- Create Quotation

The caterer shall be able to create a quotation from a quotation
request.

## FR-QUOTE-002 --- Quotation Contents

A quotation shall support:

-   quotation number;
-   linked request;
-   customer;
-   event details;
-   menu/package summary;
-   guest count;
-   item/charge lines as appropriate;
-   subtotal;
-   discount when applicable;
-   tax when applicable;
-   final amount;
-   advance requirement;
-   terms/notes;
-   validity period;
-   status;
-   created/sent timestamps.

## FR-QUOTE-003 --- Caterer Editing

The caterer shall be able to edit a quotation while it is in `DRAFT`.

## FR-QUOTE-004 --- Send Quotation

The caterer shall be able to send a completed quotation to the customer.

## FR-QUOTE-005 --- Customer Notification

The customer shall be notified when a quotation is available.

## FR-QUOTE-006 --- Quotation Status

Quotation status shall support at least:

-   `DRAFT`;
-   `SENT`;
-   `ACCEPTED`;
-   `REJECTED`;
-   `EXPIRED`;
-   `SUPERSEDED`.

## FR-QUOTE-007 --- Immutable Sent Version

A sent quotation version shall not be silently modified.

If commercial changes are required, the system shall preserve history
through versioning, superseding, or an equivalent auditable mechanism.

## FR-QUOTE-008 --- Validity

A quotation may have an expiry/valid-until time.

The customer shall not be allowed to accept an expired quotation unless
the caterer revalidates or replaces it.

------------------------------------------------------------------------

# 23. Customer Quotation Experience

## FR-CQUOTE-001 --- View Quotation

The customer shall be able to view the final quotation associated with
their request.

## FR-CQUOTE-002 --- Understand Differences

Where practical, the UI should make the final quotation understandable
relative to the requested event configuration and earlier estimate.

## FR-CQUOTE-003 --- Accept

The customer shall be able to accept an eligible quotation.

## FR-CQUOTE-004 --- Reject

The customer shall be able to reject an eligible quotation.

The system may optionally collect a rejection reason.

## FR-CQUOTE-005 --- Prevent Duplicate Acceptance

A quotation shall not be accepted more than once.

## FR-CQUOTE-006 --- Confirmation

The customer shall receive a clear confirmation after acceptance.

------------------------------------------------------------------------

# 24. Booking

## FR-BOOK-001 --- Create Booking

A booking shall be created from an accepted quotation according to
configured business rules.

## FR-BOOK-002 --- Booking Status

Booking status shall support at least:

-   `PENDING_ADVANCE`;
-   `CONFIRMED`;
-   `CANCELLED`;
-   `COMPLETED`.

## FR-BOOK-003 --- Commercial Snapshot

The booking shall preserve the accepted quotation/version used to create
it.

## FR-BOOK-004 --- Booking Identifier

Every booking shall have a unique identifier.

## FR-BOOK-005 --- Customer Booking View

The customer shall be able to view:

-   booking status;
-   event summary;
-   accepted amount;
-   advance requirement;
-   recorded payments;
-   remaining amount where applicable;
-   caterer-provided instructions/notes.

## FR-BOOK-006 --- Caterer Booking View

The caterer shall be able to view and manage active bookings.

------------------------------------------------------------------------

# 25. Payments

## FR-PAY-001 --- Advance Requirement

A quotation may specify an advance amount or advance percentage.

## FR-PAY-002 --- Payment Record

The system shall support recording payments against a booking.

## FR-PAY-003 --- Payment Data

A payment record shall support:

-   booking;
-   amount;
-   currency;
-   payment method;
-   payment status;
-   provider/reference identifier where applicable;
-   payment timestamp;
-   notes;
-   created/verified metadata.

## FR-PAY-004 --- Online Payment Integration

The architecture shall allow integration with an Indian payment provider
for customer advance payments.

Provider selection is a later implementation decision.

## FR-PAY-005 --- Manual Payment

The system should support caterer-recorded/manual payment entries for
valid offline payment methods if required by the business.

## FR-PAY-006 --- No Card Storage

The application shall not directly store raw payment card credentials.

## FR-PAY-007 --- Booking Confirmation

If advance payment is required for confirmation, booking status shall
become `CONFIRMED` only after the configured payment condition is
satisfied.

## FR-PAY-008 --- Idempotency

Payment callbacks and confirmation processing shall be idempotent so
duplicate provider events do not create duplicate payments.

------------------------------------------------------------------------

# 26. Customer Dashboard

## FR-CDASH-001 --- Dashboard

An authenticated customer shall have access to a simple
dashboard/history experience.

## FR-CDASH-002 --- Drafts

The customer should be able to view and resume eligible draft events.

## FR-CDASH-003 --- Requests

The customer shall be able to view submitted quotation requests and
their statuses.

## FR-CDASH-004 --- Quotations

The customer shall be able to view quotations sent to them.

## FR-CDASH-005 --- Bookings

The customer shall be able to view current and historical bookings.

## FR-CDASH-006 --- Access Control

A customer shall never be able to access another customer's events,
quotations, payments, or bookings.

------------------------------------------------------------------------

# 27. Caterer Catalog Management

## FR-CATALOG-001 --- Function Management

The caterer shall be able to create, edit, activate, and deactivate
function types.

## FR-CATALOG-002 --- Offering Management

The caterer shall be able to create, edit, activate, and deactivate
catering offerings.

## FR-CATALOG-003 --- Category Management

The caterer shall be able to manage menu categories.

## FR-CATALOG-004 --- Menu Item Management

The caterer shall be able to create and update menu items and their
customer-visible metadata.

## FR-CATALOG-005 --- Pricing Metadata

The caterer shall be able to maintain pricing data required by the
pricing engine.

## FR-CATALOG-006 --- Package Management

The caterer shall be able to create and edit packages.

## FR-CATALOG-007 --- Package Rules

The caterer shall be able to configure package selection rules
including:

-   included items;
-   mandatory items;
-   selectable groups;
-   selection counts;
-   paid additions;
-   guest limits;
-   eligibility.

## FR-CATALOG-008 --- Safe Deactivation

Catalog records referenced by historical commercial documents shall not
be destructively deleted in a way that breaks history.

Deactivation/archival should be preferred.

------------------------------------------------------------------------

# 28. Caterer Pricing Configuration

## FR-APRICING-001 --- Pricing Rules

The caterer/admin shall be able to maintain the business pricing inputs
required by the deterministic pricing service.

## FR-APRICING-002 --- Internal Visibility

Sensitive internal cost, markup, or margin data shall not be exposed to
customers.

## FR-APRICING-003 --- Effective Changes

Pricing changes shall affect new/recalculated estimates according to
their effective configuration but shall not mutate sent quotations or
accepted bookings.

## FR-APRICING-004 --- Validation

The admin system shall reject logically invalid pricing configurations
that would prevent safe estimate calculation.

------------------------------------------------------------------------

# 29. Notifications

## FR-NOTIF-001 --- Notification Events

The system shall support notifications for important lifecycle events.

At minimum candidates include:

-   OTP;
-   quotation request submitted;
-   quotation sent;
-   quotation nearing expiry where desired;
-   quotation accepted;
-   payment received;
-   booking confirmed;
-   booking status changed.

## FR-NOTIF-002 --- Channels

The notification architecture shall support multiple channels.

Initial channels may include:

-   in-app;
-   SMS;
-   WhatsApp where provider/business rules permit;
-   email when available.

Not every channel must be enabled in the first release.

## FR-NOTIF-003 --- No Sensitive Leakage

Notifications shall avoid unnecessarily exposing sensitive information.

------------------------------------------------------------------------

# 30. AI Catering Assistant --- General

AI features are secondary to the deterministic application and shall be
introduced after the core workflow is stable.

## FR-AI-001 --- Natural Language Planning

The assistant shall understand requests such as:

> "I want to make a function for 500 people under one lakh budget.
> Suggest something for this."

It shall extract relevant structured requirements where possible.

## FR-AI-002 --- Missing Information

The assistant shall identify important missing planning information and
ask focused follow-up questions.

## FR-AI-003 --- Catalog Grounding

Recommendations shall be grounded in the caterer's current application
catalog.

The assistant shall not recommend unavailable menu items as though they
are bookable.

## FR-AI-004 --- Pricing Tool Use

When discussing current event pricing, the assistant shall use the
application's pricing service rather than performing authoritative
free-form arithmetic.

## FR-AI-005 --- Menu Recommendation

The assistant shall be able to recommend packages or menu combinations
based on available inputs such as:

-   function;
-   guest count;
-   budget;
-   dietary preference;
-   customer preferences;
-   existing selections.

## FR-AI-006 --- Budget Optimization

The assistant shall be able to invoke the recommendation/budget
optimization service and explain proposed changes.

## FR-AI-007 --- Configuration Awareness

When the customer is working on an event plan, the assistant should
understand the current event configuration supplied by the application.

## FR-AI-008 --- Proposed Changes

The assistant may propose structured changes to the current
configuration.

Examples:

-   select a package;
-   add menu item;
-   remove optional item;
-   replace item;
-   update guest count;
-   update budget.

## FR-AI-009 --- Customer Approval

Material AI-proposed changes shall require customer confirmation before
mutation.

## FR-AI-010 --- Application-Service Mutation

After approval, changes shall be executed through validated application
services/APIs.

The LLM shall not directly write to the database.

## FR-AI-011 --- Explain Estimate

The assistant shall be able to explain customer-visible estimate
components without exposing confidential internal business data.

## FR-AI-012 --- Failure Handling

If AI is unavailable, the normal application flow shall remain usable.

AI shall not be a hard dependency for core quotation and booking
workflows.

------------------------------------------------------------------------

# 31. AI Safety and Business Integrity

## BR-AI-001 --- No Invented Price

The AI shall not claim an invented price as the system estimate or final
quotation.

## BR-AI-002 --- No Final Quotation Authority

The AI shall not send, approve, or accept a caterer's final quotation
unless a future explicitly authorized workflow is designed.

## BR-AI-003 --- No Unsupported Availability Claims

The AI shall not promise event availability unless confirmed by the
relevant application/business rule.

## BR-AI-004 --- No Hidden Mutations

The AI shall not make material event changes without making the change
understandable to the customer and obtaining required approval.

## BR-AI-005 --- Permission Boundaries

AI tools shall enforce the same customer/admin authorization rules as
non-AI APIs.

## BR-AI-006 --- Structured Tool Inputs

AI tool calls affecting application state shall use validated structured
inputs.

------------------------------------------------------------------------

# 32. Multilingual AI

## FR-LANG-001 --- Language-Neutral Architecture

The AI conversation architecture shall not assume English-only
operation.

## FR-LANG-002 --- Supported Languages

The system shall support adding Indian languages incrementally without
redesigning the core domain model.

## FR-LANG-003 --- Same Business Semantics

Changing conversation language shall not change pricing rules, package
eligibility, or application business logic.

## FR-LANG-004 --- Mixed Language

The assistant should be designed to tolerate mixed-language customer
input, including common Indian code-switching patterns.

## FR-LANG-005 --- Numeric Accuracy

Language handling shall preserve critical numeric entities such as:

-   guest count;
-   dates;
-   times;
-   currency amounts;
-   quantities.

## FR-LANG-006 --- Menu Names

The system shall preserve canonical menu-item identifiers even when the
assistant uses translated/transliterated names in conversation.

------------------------------------------------------------------------

# 33. Voice Assistant

Voice is a later-phase enhancement.

## FR-VOICE-001 --- Speech Input

The system shall support converting customer speech into text/structured
conversational input through a replaceable speech-recognition provider.

## FR-VOICE-002 --- Spoken Response

The system shall support synthesized spoken responses through a
replaceable text-to-speech provider.

## FR-VOICE-003 --- Multilingual Voice

The architecture shall support multiple languages and mixed-language use
where provider capabilities allow.

## FR-VOICE-004 --- Confirmation of Critical Values

The voice experience shall explicitly confirm critical interpreted
values before consequential actions when ambiguity exists.

Examples:

-   "Did you mean 500 guests?"
-   "Your budget is ₹1,00,000, correct?"

## FR-VOICE-005 --- Visual Synchronization

Where voice modifies the event plan, the visual UI shall reflect the
same canonical event state.

## FR-VOICE-006 --- Fallback

Failure of voice services shall not prevent continued text/UI use.

------------------------------------------------------------------------

# 34. Authorization

## FR-AUTHZ-001 --- Customer Ownership

Customers may access only resources they own or are explicitly permitted
to access.

## FR-AUTHZ-002 --- Admin Access

Admin-only catalog, pricing, quotation creation, and booking-management
actions shall require caterer/admin authorization.

## FR-AUTHZ-003 --- Server Enforcement

Authorization shall be enforced server-side.

Client-side hiding alone is insufficient.

## FR-AUTHZ-004 --- AI Authorization

AI-triggered application actions shall execute under the authenticated
user's permission context.

------------------------------------------------------------------------

# 35. Data Validation

## BR-VAL-001 --- Server Validation

All security-sensitive and business-critical validation shall occur
server-side even when also implemented in the client.

## BR-VAL-002 --- Money

Money shall use an exact decimal/integer minor-unit representation
appropriate to the selected implementation.

Binary floating-point shall not be the source of truth for commercial
calculations.

## BR-VAL-003 --- Dates and Times

Event dates/times shall be stored and interpreted with an explicit
timezone strategy.

The primary business timezone for V1 shall be configurable and initially
expected to be India Standard Time.

## BR-VAL-004 --- Text Limits

Free-text fields shall have explicit reasonable maximum lengths.

## BR-VAL-005 --- Enumerations

Lifecycle status values shall be validated against explicit state
definitions.

------------------------------------------------------------------------

# 36. State Transition Requirements

## 36.1 Event

Expected baseline:

`DRAFT -> SUBMITTED -> COMPLETED`

with cancellation paths where permitted.

The detailed state model may evolve, but invalid transitions must be
rejected.

## 36.2 Quotation Request

Expected baseline:

`REQUESTED -> UNDER_REVIEW -> QUOTATION_SENT`

with `CANCELLED` and `EXPIRED` where applicable.

## 36.3 Quotation

Expected baseline:

`DRAFT -> SENT -> ACCEPTED`

Alternative terminal states:

-   `REJECTED`;
-   `EXPIRED`;
-   `SUPERSEDED`.

## 36.4 Booking

Expected baseline:

`PENDING_ADVANCE -> CONFIRMED -> COMPLETED`

with `CANCELLED` according to business policy.

## BR-STATE-001

All lifecycle transitions shall be performed through explicit
application services and validated against permitted transitions.

------------------------------------------------------------------------

# 37. Audit Requirements

## FR-AUDIT-001 --- Commercial Audit Events

The system shall record important commercial actions.

Candidates include:

-   quotation request submitted;
-   quotation created;
-   quotation edited;
-   quotation sent;
-   quotation accepted/rejected;
-   booking created;
-   booking status changed;
-   payment recorded/verified.

## FR-AUDIT-002 --- Audit Metadata

Audit records should contain:

-   action;
-   actor;
-   entity;
-   entity identifier;
-   timestamp;
-   relevant before/after or version information where appropriate.

## FR-AUDIT-003 --- Audit Protection

Ordinary customer users shall not be able to modify audit history.

------------------------------------------------------------------------

# 38. Security Requirements

## NFR-SEC-001 --- HTTPS

Production traffic shall use HTTPS.

## NFR-SEC-002 --- OTP Protection

OTP values shall be short-lived and protected from replay and
brute-force attempts.

## NFR-SEC-003 --- Rate Limiting

Sensitive endpoints shall use appropriate rate limiting.

Candidates include:

-   OTP request;
-   OTP verification;
-   authentication;
-   AI chat;
-   quotation actions where abuse is possible.

## NFR-SEC-004 --- Secrets

Provider credentials, signing keys, database passwords, and AI keys
shall not be stored in source code.

## NFR-SEC-005 --- Input Safety

Application inputs shall be validated and safely handled to mitigate
common web vulnerabilities.

## NFR-SEC-006 --- Database Access

Database access shall use parameterized ORM/query mechanisms.

## NFR-SEC-007 --- Least Privilege

Infrastructure and application permissions shall follow least-privilege
principles.

## NFR-SEC-008 --- Sensitive Logging

Logs shall not unnecessarily contain OTPs, payment credentials, secrets,
or excessive personal data.

## NFR-SEC-009 --- Dependency Management

Production dependencies shall be versioned and periodically reviewed for
known vulnerabilities.

------------------------------------------------------------------------

# 39. Privacy Requirements

## NFR-PRIV-001 --- Data Minimization

The application shall collect only customer information reasonably
required for planning, quotation, booking, payment, and contact.

## NFR-PRIV-002 --- Purpose-Limited Access

Customer contact information shall be accessible to authorized caterer
users for legitimate business operations.

## NFR-PRIV-003 --- AI Data Exposure

Only data required for a specific AI operation should be provided to the
AI service.

## NFR-PRIV-004 --- Provider Review

External OTP, payment, AI, speech, messaging, and analytics providers
shall be evaluated for appropriate handling of customer data before
production use.

------------------------------------------------------------------------

# 40. Reliability and Data Integrity

## NFR-REL-001 --- Transaction Integrity

Commercial operations that modify multiple related records shall use
transactional integrity where required.

## NFR-REL-002 --- Idempotent External Events

Payment and other external-provider callbacks shall be safely
repeatable.

## NFR-REL-003 --- No Silent Data Loss

User event selections shall not disappear because of normal page
navigation or recoverable network failures.

## NFR-REL-004 --- Backups

Production database backups shall be configured and restoration
procedures documented.

## NFR-REL-005 --- Historical Preservation

Sent quotations, accepted quotations, bookings, and payments shall
preserve sufficient historical data for later interpretation.

------------------------------------------------------------------------

# 41. Performance Requirements

Initial targets are product-level targets and may be refined after
realistic load testing.

## NFR-PERF-001 --- Normal API Responsiveness

Typical non-AI API operations should target sub-second server response
under normal expected load, excluding external provider latency.

## NFR-PERF-002 --- Estimate Responsiveness

Estimate recalculation should feel interactive and should generally
complete within approximately 1--2 seconds under normal conditions.

## NFR-PERF-003 --- Page Experience

Primary customer pages shall be optimized for mobile networks and avoid
unnecessarily large assets.

## NFR-PERF-004 --- AI Latency UX

AI operations may take longer than deterministic APIs, but the UI shall
clearly indicate processing and avoid blocking unrelated normal
application navigation.

------------------------------------------------------------------------

# 42. Availability and Resilience

## NFR-AVL-001 --- Core Without AI

Catalog browsing, event planning, pricing, quotation, and booking shall
remain functional if AI services are unavailable.

## NFR-AVL-002 --- External Provider Failure

Failure of an optional notification channel shall not corrupt quotation
or booking state.

## NFR-AVL-003 --- Graceful Errors

The customer shall receive understandable recovery guidance for
temporary system failures.

## NFR-AVL-004 --- Retry Safety

Retries shall not create duplicate quotation requests, bookings, or
payments.

------------------------------------------------------------------------

# 43. Usability Requirements

## NFR-UX-001 --- Mobile First

The customer application shall be designed mobile-first while remaining
usable on desktop.

## NFR-UX-002 --- Progressive Flow

The planning experience shall guide customers page-to-page rather than
exposing one overwhelming form.

## NFR-UX-003 --- Editable Choices

Customers shall be able to move backward and modify earlier selections
before submission.

## NFR-UX-004 --- Price Clarity

Estimated price, final quotation, advance amount, paid amount, and
balance shall be visually distinguishable.

## NFR-UX-005 --- Status Clarity

Quotation and booking statuses shall be expressed in
customer-understandable language.

## NFR-UX-006 --- Loading/Error/Empty States

Every data-driven page shall define appropriate:

-   loading;
-   empty;
-   error;
-   success states.

## NFR-UX-007 --- Accessibility

The UI should follow practical accessibility standards for keyboard
access, labels, contrast, semantic markup, and screen-reader
compatibility.

------------------------------------------------------------------------

# 44. Compatibility

## NFR-COMP-001 --- Browsers

The customer application shall support current mainstream mobile and
desktop browsers.

## NFR-COMP-002 --- Responsive Layout

Core flows shall work across common phone, tablet, and desktop viewport
sizes.

------------------------------------------------------------------------

# 45. Observability

## NFR-OBS-001 --- Structured Logs

Backend services shall produce structured logs for important operations.

## NFR-OBS-002 --- Error Monitoring

Production errors shall be observable through centralized
monitoring/error tracking.

## NFR-OBS-003 --- Request Correlation

Important distributed requests should have correlation/request
identifiers.

## NFR-OBS-004 --- Business Metrics

The system should support measuring:

-   event plans started;
-   estimate completions;
-   quotation requests;
-   quotations sent;
-   quotation acceptance;
-   bookings;
-   payment completion;
-   AI usage when launched.

------------------------------------------------------------------------

# 46. Testing Requirements

## NFR-TEST-001 --- Unit Tests

Critical domain logic shall have unit tests.

Highest-priority areas:

-   pricing;
-   package selection rules;
-   budget comparison;
-   state transitions;
-   quotation calculations;
-   payment state logic.

## NFR-TEST-002 --- API Integration Tests

Critical backend workflows shall have integration tests against
realistic persistence behavior.

## NFR-TEST-003 --- End-to-End Tests

At minimum, automated end-to-end coverage should exist for the core
happy path:

1.  OTP authentication;
2.  create event;
3.  choose package/custom menu;
4.  enter guest count/details;
5.  calculate estimate;
6.  submit quotation request;
7.  admin creates/sends quotation;
8.  customer accepts;
9.  advance/payment processing;
10. booking confirmation.

## NFR-TEST-004 --- Negative Tests

Tests shall cover invalid and unauthorized actions, not only happy
paths.

## NFR-TEST-005 --- AI Evaluation

Before production AI release, an evaluation set shall cover:

-   requirement extraction;
-   missing-information questions;
-   menu recommendations;
-   budget recommendations;
-   pricing-tool usage;
-   event modifications;
-   multilingual inputs;
-   attempts to bypass business rules;
-   hallucinated catalog items/prices.

## NFR-TEST-006 --- Voice Evaluation

Before production voice release, evaluation shall include:

-   Indian accents;
-   supported Indian languages;
-   mixed-language speech;
-   guest-count recognition;
-   Indian currency expressions;
-   dates/times;
-   menu names;
-   confirmation of ambiguous critical values.

------------------------------------------------------------------------

# 47. Admin Safety Requirements

## BR-ADMIN-001 --- Historical References

An admin shall not be able to destroy catalog/pricing data required by
historical quotations/bookings.

## BR-ADMIN-002 --- Sent Quotation Editing

Sent quotation history shall remain auditable.

## BR-ADMIN-003 --- Payment Modification

Payment correction or reversal actions shall be explicitly controlled
and audited.

## BR-ADMIN-004 --- Dangerous Actions

Destructive or financially consequential admin actions should require
confirmation.

------------------------------------------------------------------------

# 48. Edge Cases

The implementation shall explicitly handle at least the following.

## EC-001 --- OTP Delayed

A customer receives an OTP after it has expired.

Expected: verification fails safely and a new OTP can be requested
subject to rate limits.

## EC-002 --- Double Submission

Customer presses "Request Quotation" multiple times.

Expected: the system prevents accidental duplicate requests.

## EC-003 --- Catalog Changes During Planning

An item selected in a draft becomes unavailable before submission.

Expected: customer is informed and must resolve the invalid selection.

## EC-004 --- Pricing Changes During Planning

Pricing changes after a customer previously viewed an estimate.

Expected: recalculation uses current applicable pricing and clearly
updates the estimate; previous estimate is not treated as a guaranteed
quote.

## EC-005 --- Catalog Changes After Quotation

A menu item price changes after a quotation is sent.

Expected: sent quotation remains unchanged.

## EC-006 --- Guest Count Breaks Package

Customer changes guest count outside package eligibility.

Expected: package is flagged invalid and cannot be submitted until
resolved.

## EC-007 --- Budget Below Feasible Minimum

Customer enters a budget below any realistic configuration.

Expected: application does not fabricate a compliant plan; it explains
the gap and recommends closest feasible options.

## EC-008 --- Estimate Unavailable

Required pricing configuration is missing.

Expected: no fabricated estimate; customer can receive an explanation
and, where allowed, continue to request caterer review.

## EC-009 --- Quotation Expires

Customer opens an expired quotation.

Expected: quotation is visible as expired but cannot be accepted.

## EC-010 --- Duplicate Payment Callback

Payment provider sends the same success callback more than once.

Expected: one payment is recorded.

## EC-011 --- Payment Succeeds but Client Disconnects

Expected: server/provider reconciliation preserves successful payment
and customer can later see correct booking/payment status.

## EC-012 --- AI Suggests Invalid Item

Expected: application service rejects the mutation and AI
receives/communicates the validation result.

## EC-013 --- AI Misunderstands Guest Count

Expected: critical ambiguous values are confirmed before consequential
mutation/quotation request.

## EC-014 --- Network Failure During Planning

Expected: persisted server state remains valid and UI offers
retry/recovery.

## EC-015 --- Unauthorized Resource ID

Customer manually attempts to access another customer's event/quotation
identifier.

Expected: access denied without leaking private data.

------------------------------------------------------------------------

# 49. Customer Journey Acceptance Scenario

The following scenario defines the baseline product acceptance path.

### Scenario CJ-001 --- Package-Based Booking

**Given** a new customer visits the application\
**When** the customer verifies their phone number using OTP\
**And** selects a wedding function\
**And** selects an available catering offering\
**And** selects a package\
**And** completes all required included-item choices\
**And** adds an optional paid item\
**And** enters 500 guests\
**And** enters a target budget of ₹1,00,000\
**And** enters a future date, time, and venue\
**Then** the system calculates and displays an estimated price range\
**And** shows how that range compares with the customer's budget\
**And** clearly states that the estimate is not the final quotation.

**When** the customer reviews and submits the plan\
**Then** a quotation request is created\
**And** the caterer can view the requirement and customer contact
information.

**When** the caterer prepares and sends a final quotation\
**Then** the customer can view the quotation.

**When** the customer accepts the valid quotation\
**And** completes the required advance payment\
**Then** the booking becomes confirmed\
**And** both customer and caterer can view the confirmed booking.

------------------------------------------------------------------------

# 50. Custom Menu Acceptance Scenario

### Scenario CJ-002 --- Custom Menu

**Given** an authenticated customer is creating an event\
**When** the customer chooses "Build Custom Menu"\
**Then** the application displays eligible menu categories/items.

**When** the customer adds/removes menu items and changes guest count\
**Then** the event configuration persists\
**And** the estimate is recalculated or marked for recalculation.

**When** the configuration is valid\
**Then** the customer can review and submit it for final quotation.

------------------------------------------------------------------------

# 51. Over-Budget Acceptance Scenario

### Scenario CJ-003 --- Soft Budget Constraint

**Given** a customer has a valid event plan\
**And** has specified a budget\
**When** the estimated range exceeds that budget\
**Then** the system shall not block the customer solely because of the
budget\
**And** shall clearly show the over-budget condition\
**And** shall provide useful lower-cost recommendations when feasible\
**And** shall still allow the customer to retain the existing plan and
request caterer review.

------------------------------------------------------------------------

# 52. AI Acceptance Scenario

### Scenario AI-001 --- Natural Language Planning

**Given** the AI feature is enabled\
**And** the customer says:

> "I need catering for 500 people for a wedding under one lakh. Suggest
> a menu."

**When** the assistant processes the request\
**Then** it extracts:

-   function = wedding;
-   guest count = 500;
-   budget ≈ ₹1,00,000;

**And** asks only for important missing information when needed\
**And** retrieves eligible catalog/package/menu information\
**And** uses the pricing/recommendation services for commercial
calculations\
**And** presents feasible suggestions.

**When** the customer approves a proposed configuration\
**Then** the assistant applies the configuration through validated
application services\
**And** the normal visual event planner reflects the same state.

------------------------------------------------------------------------

# 53. Permission Matrix

  ----------------------------------------------------------------------------
  Capability                    Customer      Caterer/Admin  AI under Customer
                                                                       Context
  ------------------- ------------------ ------------------ ------------------
  View public catalog                Yes                Yes                Yes

  Create customer                    Yes    No/Support only     Yes, with user
  event                                                                context

  Edit own draft                     Yes    No/Support only         Yes, after
  event                                                      required approval

  View another                        No Yes, operationally                 No
  customer's event                                          

  Calculate customer                 Yes                Yes   Yes, via pricing
  estimate                                                             service

  Change catalog                      No                Yes                 No

  Change pricing                      No                Yes                 No
  rules                                                     

  Submit quotation                   Yes                 No Only with explicit
  request                                                      customer intent

  Create final                        No                Yes                 No
  quotation                                                 

  Send final                          No                Yes                 No
  quotation                                                 

  Accept quotation                   Yes                 No   Not autonomously

  Record/administer           Limited to                Yes                 No
  payment               customer payment                    
                                    flow                    

  View internal                       No                Yes                 No
  cost/margin                                               
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

# 54. Data Retention and Deletion Baseline

Detailed legal retention periods will be finalized before production.

## BR-DATA-001

Operational and commercial records required to support quotations,
bookings, payments, disputes, or accounting shall not be automatically
deleted merely because catalog data changes.

## BR-DATA-002

Draft/abandoned planning data may use a separate retention policy.

## BR-DATA-003

Deletion/anonymization requirements shall preserve legally or
commercially required records while minimizing unnecessary personal
data.

------------------------------------------------------------------------

# 55. Implementation Phase Traceability

## Phase 0 --- Requirements and Product Foundation

Requirements:

-   all `BR-*`;
-   actors;
-   terminology;
-   state definitions;
-   acceptance scenarios.

Exit criteria:

-   requirements reviewed;
-   unresolved product decisions documented;
-   no major contradiction between `planning.md` and `requirements.md`.

## Phase 1 --- Project Foundation

Primary requirements:

-   NFR-SEC-001;
-   NFR-SEC-004;
-   NFR-OBS-001;
-   NFR-TEST-001;
-   NFR-COMP-001;
-   NFR-UX-001.

## Phase 2 --- Authentication

Primary requirements:

-   FR-AUTH-001 through FR-AUTH-007;
-   FR-AUTHZ-001 through FR-AUTHZ-003;
-   NFR-SEC-002;
-   NFR-SEC-003.

## Phase 3 --- Caterer Catalog Management

Primary requirements:

-   FR-CATALOG-001 through FR-CATALOG-008;
-   FR-APRICING-001 through FR-APRICING-004;
-   FR-MENU-001 through FR-MENU-004.

## Phase 4 --- Customer Browsing

Primary requirements:

-   FR-CAT-001 through FR-CAT-004;
-   FR-PKG-001 through FR-PKG-006;
-   customer-facing catalog portions of FR-MENU-\*.

## Phase 5 --- Event Planner and Menu Builder

Primary requirements:

-   FR-CUST-001 through FR-CUST-006;
-   FR-CMENU-001 through FR-CMENU-004;
-   FR-GUEST-001 through FR-GUEST-004;
-   FR-BUD-001;
-   FR-EVENT-001 through FR-EVENT-006;
-   FR-PLAN-001 through FR-PLAN-006.

## Phase 6 --- Pricing and Estimate Engine

Primary requirements:

-   FR-PRICE-001 through FR-PRICE-008;
-   FR-EST-001 through FR-EST-005;
-   BR-002 through BR-006.

## Phase 7 --- Budget Recommendation

Primary requirements:

-   FR-BUD-002 through FR-BUD-005;
-   FR-REC-001 through FR-REC-005.

## Phase 8 --- Quotation Request Workflow

Primary requirements:

-   FR-QREQ-001 through FR-QREQ-008;
-   FR-ADMIN-001 through FR-ADMIN-005.

## Phase 9 --- Final Quotation

Primary requirements:

-   FR-QUOTE-001 through FR-QUOTE-008;
-   FR-CQUOTE-001 through FR-CQUOTE-006;
-   FR-AUDIT-001 through FR-AUDIT-003.

## Phase 10 --- Booking and Payments

Primary requirements:

-   FR-BOOK-001 through FR-BOOK-006;
-   FR-PAY-001 through FR-PAY-008.

## Phase 11 --- Dashboards and Operational Polish

Primary requirements:

-   FR-CDASH-001 through FR-CDASH-006;
-   FR-NOTIF-001 through FR-NOTIF-003;
-   observability and usability requirements.

## Phase 12 --- AI Text Assistant

Primary requirements:

-   FR-AI-001 through FR-AI-012;
-   BR-AI-001 through BR-AI-006;
-   NFR-TEST-005.

## Phase 13 --- Multilingual AI

Primary requirements:

-   FR-LANG-001 through FR-LANG-006.

## Phase 14 --- Voice Assistant

Primary requirements:

-   FR-VOICE-001 through FR-VOICE-006;
-   NFR-TEST-006.

## Phase 15 --- Advanced Intelligence

Potential enhancements:

-   deeper menu optimization;
-   historical recommendation signals;
-   conversion analytics;
-   caterer decision support;
-   improved demand forecasting;
-   smarter quotation assistance.

These enhancements require separate requirements before implementation.

------------------------------------------------------------------------

# 56. MVP Requirement Set

The MVP is considered product-complete when the following are usable
end-to-end:

1.  phone OTP login;
2.  caterer catalog administration;
3.  customer function/offer browsing;
4.  package selection;
5.  custom-menu building;
6.  menu customization;
7.  guest count;
8.  budget input;
9.  event date/time/venue;
10. deterministic estimated price range;
11. budget comparison;
12. event review;
13. quotation request submission;
14. caterer request review;
15. caterer final quotation;
16. customer quotation acceptance/rejection;
17. advance payment handling;
18. booking confirmation;
19. customer history/dashboard;
20. caterer operational view;
21. essential notifications;
22. security, authorization, audit, and tests for the above.

AI, multilingual, and voice functionality are strategically important
but are **not required to block the first core MVP release**.

------------------------------------------------------------------------

# 57. Open Decisions Before Detailed Design

The following decisions remain intentionally open and should be resolved
in subsequent design documents or before their implementation phase:

1.  Exact OTP/SMS provider.
2.  Exact payment provider.
3.  Whether WhatsApp notifications are included in MVP.
4.  Exact event availability/calendar behavior.
5.  Exact tax configuration and invoice requirements.
6.  Exact formula used to construct the customer estimate range.
7.  Whether estimate recalculation is automatic on every change or
    explicitly triggered in some screens.
8.  Exact package pricing models supported in the first release.
9.  Exact custom-menu pricing model for each menu item/category.
10. Whether the caterer can create quotations with multiple optional
    alternatives.
11. Cancellation/refund policies.
12. Quotation revision/version UX.
13. Whether customer email is collected during planning, quotation, or
    only when needed.
14. Initial supported AI languages.
15. Speech-to-text/text-to-speech providers.
16. Whether admin roles need to be split beyond one caterer/admin role
    in V1.
17. Exact retention periods.
18. Exact notification templates and channels.

These are implementation decisions, not reasons to change the core
product direction.

------------------------------------------------------------------------

# 58. Definition of Ready for System Design

The project is ready to move from requirements into system design when:

-   the single-caterer scope remains confirmed;
-   hybrid package + custom-menu pricing remains confirmed;
-   budget remains a soft constraint;
-   customer estimate remains a price range;
-   phone + OTP remains the customer authentication mechanism;
-   caterer-controlled final quotation remains confirmed;
-   equipment/fleet management remains out of scope;
-   the MVP boundary is accepted;
-   major unresolved business rules affecting the database or state
    machine are either decided or explicitly parameterized.

------------------------------------------------------------------------

# 59. Definition of Done for an Individual Requirement

A requirement is considered implemented only when, where applicable:

1.  backend/domain behavior exists;
2.  authorization is enforced;
3.  input validation exists;
4.  customer/admin UI exists;
5.  loading/error/empty states are handled;
6.  tests cover normal and important negative cases;
7.  logs/observability are adequate;
8.  relevant audit events exist;
9.  documentation/API contracts are updated;
10. the stated acceptance criteria pass.

------------------------------------------------------------------------

# 60. Requirements Governance

This document is the baseline product requirements specification.

Changes should follow these rules:

-   New requirements receive new identifiers.
-   Existing identifiers should not be reused for unrelated behavior.
-   Material requirement changes should be documented rather than
    silently editing implementation assumptions.
-   Detailed UI layouts belong in `product-flows.md`.
-   Architecture decisions belong in `system-design.md`.
-   Database tables/constraints belong in `database-design.md`.
-   Exact HTTP contracts belong in `api-spec.md`.
-   AI prompts/tools/evaluations belong in `ai-design.md`.
-   Detailed test cases belong in `testing-strategy.md`.

------------------------------------------------------------------------

# 61. Next Documents

Recommended sequence after this requirements baseline:

1.  `product-flows.md`
2.  `system-design.md`
3.  `database-design.md`
4.  `api-spec.md`
5.  `ai-design.md`
6.  `testing-strategy.md`

Implementation should then proceed phase-by-phase rather than building
the entire application at once.
