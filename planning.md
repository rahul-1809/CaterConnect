# Catering Planning & Quotation Platform --- Implementation Plan

**Document:** `planning.md`\
**Version:** 1.0\
**Status:** Initial implementation baseline\
**Target:** One established local Indian catering business

------------------------------------------------------------------------

## 1. Product Vision

Build an interactive, customer-facing catering planning and quotation
application that allows a customer to:

1.  Log in using a phone number and OTP.
2.  Select the type of function they are planning.
3.  Explore the catering offerings/packages provided by the caterer.
4.  Select a package or build a custom menu.
5.  Customize the menu.
6.  Enter the expected number of guests.
7.  Specify a budget or budget range.
8.  Provide date, time, and venue details.
9.  Receive a dynamically calculated **estimated price range**.
10. Review and modify the plan.
11. Submit the requirement to the caterer for a final quotation.
12. Receive the caterer's final quotation.
13. Accept the quotation and proceed with booking/advance payment.

The application will additionally provide an **AI Catering Assistant**
as a differentiating feature. The assistant will understand
natural-language requests, recommend menus and budgets, and eventually
support multilingual voice interaction. It will use the same application
catalog and pricing services as the normal UI rather than maintaining a
separate pricing logic.

The application is intentionally designed for **one catering business**,
not as a marketplace.

------------------------------------------------------------------------

# 2. Problem Statement

The current process for a small/local caterer is heavily dependent on
phone calls and the caterer's personal experience.

A typical customer calls and discusses:

-   Function type
-   Number of guests
-   Food/menu requirements
-   Date
-   Time
-   Venue
-   Budget or expected spending

The caterer then internally thinks through:

-   Menu
-   Approximate quantities
-   Ingredient costs
-   Staff requirements
-   Other event-related costs
-   Margin
-   Final quotation

This creates repeated communication and makes it difficult for customers
to get an initial idea of cost without contacting the caterer.

The proposed system moves the **initial planning and estimation
experience online** while keeping the caterer in control of the final
quotation.

------------------------------------------------------------------------

# 3. Product Positioning

The product is:

> **An interactive catering planning, quotation, and booking platform
> for a local catering business, enhanced with an AI and multilingual
> voice assistant.**

It is not:

-   A restaurant POS.
-   A generic ERP.
-   A marketplace for multiple caterers.
-   A fleet/transport management system.
-   An equipment management system.
-   A complete accounting/payroll product.

------------------------------------------------------------------------

# 4. Goals

## Primary goals

-   Make catering discovery and planning easy for customers.
-   Reduce repetitive phone conversations for initial requirements.
-   Let customers visually build and customize a catering plan.
-   Provide useful estimated price ranges.
-   Allow customers to work within a target budget.
-   Give the caterer structured customer requirements.
-   Allow the caterer to review and issue the final quotation.
-   Maintain customer, quotation, booking, and payment history.
-   Create a strong foundation for AI-assisted catering planning.

## Secondary goals

-   Make menu/package management easy for the caterer.
-   Make pricing configurable without code changes.
-   Provide a consistent pricing engine for both normal UI and AI.
-   Create historical data that can improve future recommendations.

------------------------------------------------------------------------

# 5. Non-Goals for V1

The following are explicitly outside V1:

-   Multiple caterers/marketplace.
-   Equipment inventory management.
-   Fleet/transport management.
-   Driver management.
-   Full accounting software.
-   Payroll management.
-   Complex warehouse management.
-   Customer-to-customer features.
-   Public reviews/ratings marketplace.
-   Delivery tracking.
-   Advanced procurement automation.
-   Fully autonomous AI quotation generation.
-   Fully automated final booking approval without caterer confirmation.

Transport or other incidental costs can still be represented as
configurable quotation/expense components if the caterer requires them.
This does not constitute a transportation-management module.

------------------------------------------------------------------------

# 6. Users

## 6.1 Customer

A person planning a function and looking for catering.

Typical characteristics:

-   May not understand catering pricing.
-   May know the desired menu or may want recommendations.
-   May use mobile devices.
-   May prefer regional Indian languages.
-   Needs a quick estimate before contacting the caterer.
-   Needs an easy way to revise requirements.

## 6.2 Caterer/Admin

The owner or authorized staff of the single catering business.

Responsibilities:

-   Manage catalog.
-   Manage packages.
-   Manage menus.
-   Configure pricing.
-   Review requests.
-   Contact customers.
-   Prepare final quotations.
-   Confirm bookings.
-   Track advances and payments.

------------------------------------------------------------------------

# 7. Product Principles

1.  **Customer-first interaction:** the customer should browse and
    configure rather than fill a long form.
2.  **Caterer-controlled pricing:** the system estimates; the caterer
    confirms the final price.
3.  **One source of truth:** UI, AI, and future voice interfaces use the
    same application services.
4.  **Configurable catalog:** menu and package data must not be
    hardcoded into the frontend.
5.  **AI assists; deterministic services calculate:** LLMs should not be
    the authoritative source for monetary calculations.
6.  **Mobile-first customer experience:** most customer interactions
    should work comfortably on a phone.
7.  **Incremental implementation:** each phase produces a usable,
    testable result.
8.  **Privacy by design:** customer contact information is exposed only
    to authorized caterer/admin users for legitimate booking/quotation
    operations.

------------------------------------------------------------------------

# 8. Core Customer Journey

``` text
Landing Page
    ↓
Phone Number
    ↓
OTP Verification
    ↓
Home / Start Planning
    ↓
Select Function Type
    ↓
Select Catering Offering / Package
    ↓
Select or Customize Menu
    ↓
Enter Guest Count
    ↓
Set Budget
    ↓
Enter Date / Time / Venue
    ↓
Live Estimated Price Range
    ↓
Review & Modify
    ↓
Request Final Quotation
    ↓
Caterer Review
    ↓
Final Quotation
    ↓
Customer Accepts / Rejects
    ↓
Advance Payment
    ↓
Booking Confirmed
```

------------------------------------------------------------------------

# 9. Customer Application Screens

## Phase 1 screens

### 9.1 Landing/Home

Purpose:

-   Explain the service.
-   Let the customer start planning.
-   Provide access to the AI assistant.

Primary actions:

-   Start Planning
-   Explore Catering
-   Ask AI Assistant

------------------------------------------------------------------------

### 9.2 Phone Login

Fields:

-   Phone number
-   Country code

Actions:

-   Send OTP

No password is required.

------------------------------------------------------------------------

### 9.3 OTP Verification

Fields:

-   OTP

Actions:

-   Verify
-   Resend OTP
-   Change phone number

After successful verification, the customer is authenticated.

------------------------------------------------------------------------

### 9.4 Function Selection

Examples:

-   Wedding
-   Reception
-   Engagement
-   Birthday
-   House Function
-   Pooja
-   Corporate Function
-   Other

The exact function catalog is controlled by the caterer.

------------------------------------------------------------------------

### 9.5 Catering Offering / Package Selection

Display available offerings relevant to the selected function.

Each package may contain:

-   Package name
-   Description
-   Indicative price/person
-   Included menu categories
-   Number of selectable items
-   Highlights
-   Optional additions

Customer can:

-   Select package.
-   Start a custom menu.

------------------------------------------------------------------------

### 9.6 Menu Builder

Categories may include:

-   Starters
-   Rice
-   Biryani
-   Curries
-   Dal
-   Sambar
-   Rasam
-   Breads
-   Desserts
-   Beverages
-   Live Counters
-   Other configured categories

Each item can contain:

-   Name
-   Description
-   Image (optional)
-   Dietary type
-   Included in package?
-   Additional price
-   Availability status

------------------------------------------------------------------------

### 9.7 Menu Customization

Support both:

1.  Selecting allowed/included items.
2.  Adding additional paid items.

Example:

``` text
Package includes:
3 starters

Selected:
✓ Paneer 65
✓ Chicken 65
✓ Gobi 65

Add another:
+ Chicken Lollipop
Additional: ₹X/person
```

The exact package constraints are configurable.

------------------------------------------------------------------------

### 9.8 Guest Count

Customer enters expected guests.

The system should support:

-   Manual entry.
-   Increment/decrement controls.
-   Reasonable validation limits.

The guest count becomes an input to the pricing engine.

------------------------------------------------------------------------

### 9.9 Budget

Customer can enter either:

-   Exact target budget.
-   Budget range.

The budget is a **soft constraint**.

The system should not simply reject a configuration that exceeds the
target.

Example:

``` text
Estimated: ₹95,000 – ₹1,08,000
Budget:     ₹1,00,000

Status: Close to budget
```

Possible action:

> Optimize for my budget

------------------------------------------------------------------------

### 9.10 Event Details

Fields:

-   Event/function date.
-   Start time.
-   Optional end time.
-   Venue name.
-   Venue address/location.
-   Additional notes.

------------------------------------------------------------------------

### 9.11 Estimate Screen

Display:

-   Function.
-   Guest count.
-   Selected package/menu.
-   Budget.
-   Estimated price range.
-   Approximate per-person range.
-   Important assumptions.
-   Clear disclaimer.

Required disclaimer:

> **Estimated price only. Final quotation is subject to caterer
> confirmation.**

------------------------------------------------------------------------

### 9.12 Review

Customer can review all selected details before submission.

Sections:

-   Function.
-   Date/time.
-   Venue.
-   Guests.
-   Package.
-   Menu.
-   Budget.
-   Estimated range.

Actions:

-   Edit.
-   Save.
-   Request Final Quotation.

------------------------------------------------------------------------

### 9.13 My Requests / Quotations

Customer can see:

-   Drafts.
-   Submitted requests.
-   Under review.
-   Quotation received.
-   Accepted.
-   Rejected/cancelled.
-   Booked.

------------------------------------------------------------------------

### 9.14 Final Quotation

Display:

-   Caterer name.
-   Event details.
-   Final menu.
-   Final amount.
-   Any additional charges.
-   Discount if applicable.
-   Advance required.
-   Remaining amount.
-   Terms/notes.
-   Validity if configured.

Actions:

-   Accept.
-   Reject.
-   Request modification/contact caterer.

------------------------------------------------------------------------

### 9.15 Booking / Payment

For V1, maintain a payment abstraction that supports:

-   Advance amount.
-   Payment status.
-   Transaction/reference information.
-   Remaining balance.

A real payment gateway can be integrated in the appropriate
implementation phase.

------------------------------------------------------------------------

# 10. Caterer/Admin Application

## 10.1 Dashboard

Show:

-   New requests.
-   Pending quotations.
-   Upcoming confirmed events.
-   Pending advances.
-   Recent customers.
-   Basic revenue/booking metrics.

------------------------------------------------------------------------

## 10.2 Request Management

Each request contains:

-   Customer name.
-   Customer phone number.
-   Customer email if available.
-   Function.
-   Date/time.
-   Venue.
-   Guest count.
-   Budget.
-   Selected package.
-   Customized menu.
-   Estimated price range.
-   Customer notes.

The caterer may:

-   Review.
-   Contact customer.
-   Modify.
-   Reject.
-   Prepare final quotation.

------------------------------------------------------------------------

## 10.3 Customer Information

The caterer can view relevant customer information associated with a
request/booking, including:

-   Name.
-   Phone number.
-   Email where available.
-   Event history.
-   Previous quotations/bookings where appropriate.

Customer personal information must not be exposed to unauthorized users.

------------------------------------------------------------------------

## 10.4 Function Management

Caterer can:

-   Create function type.
-   Edit function type.
-   Enable/disable function type.
-   Configure display order.
-   Associate packages/offerings.

------------------------------------------------------------------------

## 10.5 Package Management

Caterer can:

-   Create package.
-   Edit package.
-   Enable/disable package.
-   Configure indicative price.
-   Define included categories/items.
-   Define selection limits.
-   Configure additional items.

------------------------------------------------------------------------

## 10.6 Menu Management

Caterer can:

-   Create category.
-   Create item.
-   Edit item.
-   Disable item.
-   Configure dietary classification.
-   Configure price.
-   Add description/image where supported.
-   Control package availability.

------------------------------------------------------------------------

## 10.7 Pricing Configuration

Pricing should be configurable rather than embedded in frontend code.

Potential components:

-   Per-person base price.
-   Package price.
-   Item-level additional price.
-   Fixed event charges.
-   Percentage adjustments.
-   Discount.
-   Optional cost components.
-   Configurable price buffers/ranges.

------------------------------------------------------------------------

## 10.8 Quotation Management

Caterer can:

-   Open customer request.
-   Modify menu.
-   Modify applicable charges.
-   Apply discount.
-   Add notes.
-   Set final amount.
-   Set advance amount.
-   Send quotation.
-   Cancel/revise quotation.

------------------------------------------------------------------------

## 10.9 Booking Management

Booking lifecycle:

``` text
DRAFT
  ↓
REQUESTED
  ↓
UNDER_REVIEW
  ↓
QUOTED
  ↓
CUSTOMER_ACCEPTED
  ↓
ADVANCE_PENDING
  ↓
CONFIRMED
  ↓
COMPLETED
```

Cancellation/rejection states should be modeled explicitly rather than
inferred.

------------------------------------------------------------------------

# 11. Domain Model

Initial core entities:

``` text
User
CustomerProfile
Caterer
FunctionType
CateringOffering
Package
MenuCategory
MenuItem
PackageItem
Event
EventMenuItem
PricingRule
Quotation
QuotationItem
Booking
Payment
AIConversation
AIMessage
Notification
```

Potential relationships:

``` text
Customer
   └── Event
         ├── FunctionType
         ├── CateringOffering
         ├── Package
         ├── EventMenuItem
         ├── Quotation
         │      └── QuotationItem
         └── Booking
                └── Payment
```

A customer can have multiple events over time.

A package contains configurable menu items.

An event contains the customer's actual selected menu, rather than
merely referencing a package, because customers can customize packages.

------------------------------------------------------------------------

# 12. Pricing and Quotation Engine

This should be a dedicated backend service/module.

## Inputs

``` text
Function
Guest Count
Selected Package
Selected Menu Items
Additional Items
Budget
Date
Location
Configurable pricing rules
```

## Output

``` text
Estimated Lower Bound
Estimated Upper Bound
Approximate Per-Person Range
Budget Difference
Pricing Breakdown
Assumptions
```

The exact formula should be configured after collecting the caterer's
actual pricing rules.

A conceptual model:

``` text
Base Package Cost
+
Included/Selected Item Adjustments
+
Additional Item Cost
+
Fixed Charges
+
Configurable Adjustments
-
Discounts
=
Estimated Base Amount
```

Then an estimation range can be applied where appropriate.

Important:

> The LLM must not independently calculate the authoritative monetary
> result.

The AI should call the pricing service.

------------------------------------------------------------------------

# 13. Budget Recommendation / Optimization

Initially use deterministic rules.

Example:

``` text
Target = ₹1,00,000
Estimate = ₹1,18,000
Difference = ₹18,000
```

The system can rank possible modifications based on configured item
prices.

Possible recommendation:

``` text
Remove one premium starter       - ₹7,500
Replace premium dessert           - ₹4,000
Remove optional live counter      - ₹6,500

Potential revised estimate        ≈ ₹1,00,000
```

Later, AI can explain these recommendations naturally.

The recommendation engine should preserve customer-selected constraints
and never silently modify the menu.

------------------------------------------------------------------------

# 14. AI Assistant

The AI assistant is an additional interface, not the primary
application.

## Example

Customer:

> I want a wedding for 500 people under one lakh. Suggest a good menu.

AI:

1.  Extracts requirements.
2.  Retrieves available function/menu/package data.
3.  Uses application rules.
4.  Calls pricing/recommendation services.
5.  Returns recommendations.
6.  Offers to apply a selected recommendation.

------------------------------------------------------------------------

## AI responsibilities

The assistant can:

-   Understand natural-language requirements.
-   Extract function type.
-   Extract guest count.
-   Extract budget.
-   Extract date/time/location.
-   Understand dietary preferences.
-   Recommend packages.
-   Recommend menu combinations.
-   Explain price ranges.
-   Suggest budget adjustments.
-   Modify the current configuration after confirmation.
-   Answer catalog questions.
-   Explain quotation details.

------------------------------------------------------------------------

## AI should not

-   Invent menu items unavailable in the catalog.
-   Invent prices.
-   Make unauthorized booking changes.
-   Modify the customer's menu without clear approval where a material
    change is involved.
-   Bypass caterer confirmation for final quotations.

------------------------------------------------------------------------

# 15. AI Architecture

``` text
Customer
   │
   ├── Text
   └── Voice
        │
        ▼
AI Interaction Layer
        │
        ▼
Language / Intent Understanding
        │
        ▼
Structured Event Context
        │
        ▼
Application Service Layer
   ├── Catalog Service
   ├── Menu Service
   ├── Pricing Service
   ├── Recommendation Service
   └── Quotation Service
        │
        ▼
Database
```

The AI should use tools/functions to interact with application services.

Potential tool operations:

``` text
get_function_types()
get_packages(function_type)
get_menu_categories()
search_menu_items()
get_package_details()
calculate_estimate(event_configuration)
get_budget_recommendations(configuration)
update_draft_configuration(changes)
```

------------------------------------------------------------------------

# 16. Multilingual AI

The underlying event representation must be language-neutral.

For example, these should produce the same structured state:

``` text
English:
I want a wedding for 500 people under one lakh.

Telugu:
500 members ki wedding, one lakh budget lo kavali.

Hindi:
500 लोगों की शादी के लिए एक लाख के अंदर मेन्यू चाहिए.
```

Internal representation:

``` text
function = wedding
guest_count = 500
budget = 100000
```

Start with a limited set of languages and design the interfaces so
additional languages can be added later.

------------------------------------------------------------------------

# 17. Voice Assistant

Voice is a later implementation layer over the same AI assistant.

Conceptually:

``` text
Voice Input
   ↓
Speech-to-Text
   ↓
AI Assistant
   ↓
Application Tools
   ↓
AI Response
   ↓
Text-to-Speech
   ↓
Voice Output
```

The voice layer should not have its own business logic.

The same application services should be used whether the customer
interacts through:

-   Buttons.
-   Text.
-   Voice.

------------------------------------------------------------------------

# 18. Recommended Technology Stack

The stack should prioritize reliability, fast iteration, type safety,
and strong AI ecosystem support.

## Frontend

**Next.js + TypeScript**

Recommended because:

-   Strong React ecosystem.
-   Good routing and server/client architecture.
-   Excellent support for responsive web applications.
-   TypeScript provides safer contracts.
-   Suitable for customer and admin interfaces.

UI:

-   Tailwind CSS.
-   A reusable component system.
-   Responsive/mobile-first design.

------------------------------------------------------------------------

## Backend

**Python + FastAPI**

Recommended because:

-   Excellent fit for AI/ML integration.
-   Strong API performance.
-   Type hints.
-   Pydantic validation.
-   Easy integration with LLM, speech, and data-processing libraries.
-   Clean separation between API and domain services.

------------------------------------------------------------------------

## Database

**PostgreSQL**

Recommended because:

-   Strong relational modeling.
-   Transactions.
-   Constraints.
-   Excellent support for structured business data.
-   Suitable for quotation/payment state management.

Potential future use:

-   PostgreSQL JSONB for selected flexible configuration data.
-   PostgreSQL full-text search initially.
-   Vector search only if/when semantic retrieval becomes necessary.

------------------------------------------------------------------------

## Authentication

**Phone number + OTP**

Flow:

``` text
Phone Number
    ↓
OTP Provider
    ↓
Verify OTP
    ↓
Create / Retrieve User
    ↓
Session / Access Token
```

The exact OTP provider should be selected based on deployment location,
pricing, reliability, and regulatory requirements.

Customer profile completion is not required.

The phone number is the primary customer identity/contact identifier.

------------------------------------------------------------------------

## Cache / Rate Limiting

**Redis** when operationally justified.

Use initially for:

-   OTP attempt/rate limiting.
-   Temporary state.
-   Caching frequently requested catalog/pricing data if necessary.

Avoid introducing Redis everywhere without a real need.

------------------------------------------------------------------------

## Object/File Storage

Use object storage only if the product needs:

-   Menu images.
-   Package images.
-   Quotation PDFs.
-   Other uploaded assets.

The storage provider can be selected during deployment planning.

------------------------------------------------------------------------

## Notifications

Initially:

-   In-app notifications.
-   SMS/OTP provider for authentication.
-   Email where useful.
-   WhatsApp integration can be evaluated later.

------------------------------------------------------------------------

## AI

Use a provider-agnostic application service boundary.

The application should define an internal AI interface so the business
logic is not tightly coupled to one model provider.

Example conceptual interface:

``` text
AIService
 ├── understand_request()
 ├── generate_recommendation()
 ├── explain_estimate()
 └── update_configuration()
```

------------------------------------------------------------------------

# 19. Suggested Repository Structure

A monorepo is recommended for this project.

``` text
catering-platform/
│
├── frontend/
│   ├── customer/
│   └── admin/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── domain/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── pricing/
│   │   ├── ai/
│   │   ├── auth/
│   │   └── core/
│   └── tests/
│
├── docs/
│
├── infrastructure/
│
├── scripts/
│
└── planning.md
```

The exact structure can be refined during HLD/LLD.

------------------------------------------------------------------------

# 20. API Planning

Initial API groups:

## Authentication

``` text
POST /auth/otp/request
POST /auth/otp/verify
POST /auth/logout
GET  /auth/me
```

## Catalog

``` text
GET /functions
GET /functions/{id}/offerings
GET /packages
GET /packages/{id}
GET /menu/categories
GET /menu/items
GET /menu/items/{id}
```

## Event planning

``` text
POST /events
GET /events
GET /events/{id}
PATCH /events/{id}
```

## Configuration

``` text
GET   /events/{id}/configuration
PATCH /events/{id}/configuration
POST  /events/{id}/menu-items
DELETE /events/{id}/menu-items/{item_id}
```

## Estimate

``` text
POST /events/{id}/estimate
POST /events/{id}/optimize-budget
```

## Requests / quotations

``` text
POST /events/{id}/quotation-request
GET  /quotation-requests
GET  /quotation-requests/{id}

POST /quotation-requests/{id}/quotation
PATCH /quotations/{id}
POST /quotations/{id}/send
POST /quotations/{id}/accept
POST /quotations/{id}/reject
```

## Booking/payment

``` text
POST /quotations/{id}/booking
GET  /bookings
GET  /bookings/{id}
GET  /bookings/{id}/payments
```

## AI

``` text
POST /ai/chat
POST /ai/configure
POST /ai/recommend
```

These are initial conceptual endpoints. Exact contracts will be frozen
during LLD.

------------------------------------------------------------------------

# 21. Database Planning

Initial tables:

``` text
users
customers
caterers
function_types
catering_offerings
packages
menu_categories
menu_items
package_items
events
event_menu_items
pricing_rules
quotations
quotation_items
bookings
payments
ai_conversations
ai_messages
notifications
audit_logs
```

Important database principles:

-   Use UUIDs or equivalent non-sequential public identifiers.
-   Store money using fixed-precision numeric/decimal types, never
    floating-point.
-   Store timestamps consistently.
-   Use foreign keys.
-   Use explicit status fields.
-   Maintain created/updated timestamps.
-   Preserve quotation snapshots so later menu-price changes do not
    silently alter historical quotations.

------------------------------------------------------------------------

# 22. Important Historical Data Rule

This is critical.

Suppose a customer receives:

``` text
Quotation:
₹1,05,000
```

Later the caterer changes:

``` text
Chicken Biryani:
₹150 → ₹180
```

The old quotation must remain:

``` text
₹1,05,000
```

It must not dynamically recalculate to a new amount.

Therefore, quotations should contain a **snapshot of the relevant
pricing/menu information at quotation creation time**.

------------------------------------------------------------------------

# 23. State Management

The system should explicitly model states.

## Event

``` text
DRAFT
SUBMITTED
CANCELLED
COMPLETED
```

## Quotation Request

``` text
REQUESTED
UNDER_REVIEW
QUOTATION_SENT
CANCELLED
EXPIRED
```

## Quotation

``` text
DRAFT
SENT
ACCEPTED
REJECTED
EXPIRED
SUPERSEDED
```

## Booking

``` text
PENDING_ADVANCE
CONFIRMED
CANCELLED
COMPLETED
```

These transitions should be validated by backend business rules.

------------------------------------------------------------------------

# 24. Security and Privacy

## Authentication

-   OTP expiration.
-   OTP attempt limits.
-   Request rate limiting.
-   Abuse protection.
-   Secure session/token handling.

## Customer data

Customer phone numbers and other personal information are sensitive
business data.

Access should be restricted to:

-   The authenticated customer.
-   Authorized caterer/admin users.

## Authorization

Implement role-based access:

``` text
CUSTOMER
CATERER_ADMIN
```

Avoid trusting frontend roles.

Every protected API must validate authorization server-side.

## Audit

Important actions should be auditable:

-   Quotation created.
-   Quotation modified.
-   Quotation sent.
-   Quotation accepted.
-   Booking confirmed.
-   Payment recorded.
-   Menu/pricing changed.

------------------------------------------------------------------------

# 25. Testing Strategy

Testing will be implemented continuously rather than postponed until the
end.

## Unit tests

Focus on deterministic business logic:

-   Guest count validation.
-   Menu selection rules.
-   Package constraints.
-   Additional item pricing.
-   Budget difference.
-   Price range calculation.
-   Discount calculation.
-   Quotation state transitions.

Example:

``` text
500 guests
+
Package X
+
3 included starters
+
1 paid additional item
=
Expected estimate range
```

------------------------------------------------------------------------

## API tests

Test:

-   Authentication.
-   Authorization.
-   Catalog APIs.
-   Event creation.
-   Configuration updates.
-   Estimate generation.
-   Quotation workflow.
-   Booking workflow.
-   Payment recording.

------------------------------------------------------------------------

## Integration tests

Examples:

``` text
Event
 → Menu Configuration
 → Pricing Engine
 → Estimate
```

and:

``` text
Customer Request
 → Caterer Review
 → Final Quotation
 → Customer Acceptance
 → Booking
```

------------------------------------------------------------------------

## End-to-End tests

Primary happy path:

``` text
Customer
 → OTP login
 → Wedding
 → Package
 → Customize menu
 → 500 guests
 → ₹1L budget
 → Event details
 → Estimate
 → Request quotation
 → Caterer reviews
 → Final quote
 → Customer accepts
 → Booking
```

Also test:

-   Customer changes menu.
-   Customer exceeds budget.
-   Caterer changes quotation.
-   Customer rejects quotation.
-   Quotation expires.
-   Item becomes unavailable.
-   Pricing changes after quotation.
-   Unauthorized customer attempts to access another customer's event.

------------------------------------------------------------------------

# 26. AI Evaluation

AI should have a dedicated evaluation dataset.

Test categories:

### Requirement extraction

Input:

> I need a wedding for 500 people under one lakh.

Expected:

``` text
function = wedding
guests = 500
budget = 100000
```

### Menu recommendation

Input:

> Suggest a menu for 500 people under ₹1 lakh.

Expected:

-   Uses only available catalog items.
-   Respects guest count.
-   Respects budget target as a soft constraint.
-   Produces a recommendation rather than an invented quotation.

### Modification

Input:

> Remove one starter and add ice cream.

Expected structured actions:

``` text
remove starter
add ice cream
recalculate estimate
```

### Multilingual

Create equivalent test cases for supported languages and mixed-language
input.

### Safety/business rules

Verify that AI cannot:

-   Change final quotation without authorization.
-   Confirm booking without required customer action.
-   Invent unavailable items.
-   Invent prices.

------------------------------------------------------------------------

# 27. Voice Evaluation

Once voice is implemented, test:

-   Speech recognition accuracy.
-   Indian accents.
-   Supported languages.
-   Mixed-language speech.
-   Background noise.
-   Numeric recognition.
-   Currency recognition.
-   Guest-count recognition.
-   Menu item recognition.
-   Confirmation handling.

Important numeric examples:

``` text
500 people
₹1 lakh
₹1.5 lakh
₹2.25 lakh
```

These should be normalized correctly before entering business logic.

------------------------------------------------------------------------

# 28. Observability

Production system should eventually provide:

-   Structured application logs.
-   Request IDs.
-   Error tracking.
-   API latency metrics.
-   Database performance monitoring.
-   Authentication/OTP failure metrics.
-   Pricing-engine errors.
-   AI tool-call errors.
-   Voice pipeline errors.

AI-specific metrics:

-   Token usage/cost.
-   Tool-call success rate.
-   Structured extraction accuracy.
-   Recommendation acceptance rate.
-   User correction rate.

------------------------------------------------------------------------

# 29. Deployment Strategy

Recommended progression:

## Development

``` text
Local frontend
Local FastAPI
Local PostgreSQL
Optional local Redis
```

## Staging

Separate environment with:

-   Managed PostgreSQL.
-   Production-like API.
-   Test authentication provider.
-   Test payment integration.
-   Test AI credentials.

## Production

Use:

``` text
Frontend
   ↓
Backend API
   ↓
PostgreSQL
   ↓
External services
   ├── OTP
   ├── Payment
   ├── AI
   └── Notifications
```

Containerization should be considered from the beginning so
local/staging/production environments remain consistent.

------------------------------------------------------------------------

# 30. Implementation Phases

The project must be implemented incrementally.

------------------------------------------------------------------------

## Phase 0 --- Requirements & Product Foundation

### Deliverables

-   Product requirements.
-   User journeys.
-   Screen map.
-   Business rules.
-   Initial domain model.
-   Initial pricing rules.
-   Technical architecture decision.

### Exit criteria

The product workflow is sufficiently stable to begin implementation.

------------------------------------------------------------------------

## Phase 1 --- Project Foundation

Build:

-   Repository structure.
-   Frontend application.
-   Backend application.
-   PostgreSQL connection.
-   Configuration management.
-   Basic CI.
-   Basic testing setup.
-   Development environment.

### Tests

-   Backend starts successfully.
-   Database connectivity.
-   Frontend build.
-   Basic API health check.

### Exit criteria

A clean empty application can be run locally.

------------------------------------------------------------------------

## Phase 2 --- Authentication

Implement:

-   Phone number entry.
-   OTP request.
-   OTP verification.
-   Customer account creation.
-   Login/session handling.
-   Logout.
-   Rate limiting.

### Tests

-   Valid OTP.
-   Invalid OTP.
-   Expired OTP.
-   Resend.
-   Rate limits.
-   New customer.
-   Existing customer.

### Exit criteria

Customer can securely log in using phone + OTP.

------------------------------------------------------------------------

## Phase 3 --- Caterer Catalog Management

Implement admin CRUD for:

-   Function types.
-   Catering offerings.
-   Packages.
-   Menu categories.
-   Menu items.
-   Package-item relationships.

### Tests

-   Create/update/delete.
-   Enable/disable.
-   Package-item constraints.
-   Authorization.

### Exit criteria

The caterer can fully configure what customers see.

------------------------------------------------------------------------

## Phase 4 --- Customer Browsing Experience

Implement:

-   Home.
-   Function selection.
-   Offering/package selection.
-   Menu browsing.
-   Menu details.
-   Responsive navigation.

### Exit criteria

Customer can browse the catering catalog without creating an event.

------------------------------------------------------------------------

## Phase 5 --- Event Planner & Menu Builder

Implement:

-   Event creation.
-   Guest count.
-   Menu selection.
-   Package customization.
-   Additional items.
-   Date/time/venue.
-   Draft saving.

### Tests

-   Package constraints.
-   Menu additions/removals.
-   Draft persistence.
-   Validation.

### Exit criteria

Customer can create and save a complete catering plan.

------------------------------------------------------------------------

## Phase 6 --- Pricing & Estimate Engine

Implement:

-   Hybrid pricing.
-   Package pricing.
-   Per-person pricing.
-   Additional item pricing.
-   Fixed charges.
-   Configurable rules.
-   Estimated range.
-   Budget comparison.

### Tests

Build a large deterministic pricing test suite.

### Exit criteria

Customer can receive a trustworthy estimated price range from the
selected configuration.

------------------------------------------------------------------------

## Phase 7 --- Budget Recommendation

Implement initial rule-based recommendations.

Features:

-   Detect budget overrun.
-   Identify removable/additional items.
-   Rank possible modifications.
-   Preview revised estimate.
-   Require customer approval before applying changes.

### Exit criteria

Customer can use the application to work toward a target budget.

------------------------------------------------------------------------

## Phase 8 --- Quotation Request Workflow

Implement:

-   Submit request.
-   Caterer dashboard.
-   Customer details.
-   Request status.
-   Caterer review.
-   Contact customer.
-   Request modification/review notes.

### Exit criteria

A customer can submit a structured request that the caterer can review.

------------------------------------------------------------------------

## Phase 9 --- Final Quotation

Implement:

-   Caterer quotation editor.
-   Quotation snapshot.
-   Discounts.
-   Additional charges.
-   Final amount.
-   Advance amount.
-   Send quotation.
-   Customer quotation view.
-   Accept/reject.

### Exit criteria

Customer and caterer can complete the quotation lifecycle.

------------------------------------------------------------------------

## Phase 10 --- Booking & Payments

Implement:

-   Booking creation.
-   Advance amount.
-   Payment status.
-   Payment history.
-   Remaining amount.
-   Booking state.

Payment gateway integration can be introduced after the internal payment
model is stable.

### Exit criteria

A quotation can become a confirmed booking.

------------------------------------------------------------------------

## Phase 11 --- Customer & Caterer Dashboards

Improve:

Customer:

-   My events.
-   My requests.
-   My quotations.
-   My bookings.
-   Payment history.

Caterer:

-   New requests.
-   Pending quotations.
-   Upcoming bookings.
-   Customer history.
-   Basic business metrics.

### Exit criteria

Both sides have a usable ongoing workflow.

------------------------------------------------------------------------

## Phase 12 --- AI Text Assistant

Implement:

-   Natural-language requirement extraction.
-   Catalog-aware recommendations.
-   Budget recommendations.
-   Estimate explanation.
-   Configuration modification.
-   Tool/function calling.
-   Conversation context.

Critical requirement:

> AI must interact with application services instead of duplicating
> business logic.

### Exit criteria

Customer can accomplish meaningful planning actions through natural
language.

------------------------------------------------------------------------

## Phase 13 --- Multilingual AI

Implement:

-   Language detection.
-   Supported-language responses.
-   Multilingual requirement extraction.
-   Mixed-language handling.
-   Language preference persistence within a conversation.

### Exit criteria

Equivalent catering requests work across the initial supported
languages.

------------------------------------------------------------------------

## Phase 14 --- Voice Assistant

Implement:

``` text
Speech
 → STT
 → AI
 → Application Tools
 → Response
 → TTS
```

Start with a small number of supported languages.

### Exit criteria

Customer can complete meaningful planning interactions using voice.

------------------------------------------------------------------------

## Phase 15 --- Advanced Intelligence

Potential features:

-   Historical event similarity.
-   Better cost estimation.
-   Menu recommendations.
-   Personalized recommendations.
-   Price prediction.
-   Demand/seasonality insights.
-   Caterer-side planning assistance.

These should only be implemented after sufficient real historical data
exists.

------------------------------------------------------------------------

# 31. Recommended MVP

The first production-capable MVP should end around Phase 10 or 11.

MVP:

``` text
Phone OTP
   ↓
Function
   ↓
Package
   ↓
Menu
   ↓
Customization
   ↓
Guest Count
   ↓
Budget
   ↓
Date / Time / Venue
   ↓
Estimated Range
   ↓
Request Quotation
   ↓
Caterer Dashboard
   ↓
Final Quotation
   ↓
Customer Acceptance
   ↓
Advance / Booking
```

Do not wait for AI/voice to launch the core workflow.

------------------------------------------------------------------------

# 32. Business Rules to Freeze During Detailed Design

The following rules need concrete values from the actual caterer before
production implementation:

1.  Available function types.
2.  Package definitions.
3.  Menu categories.
4.  Menu items.
5.  Package item limits.
6.  Per-person prices.
7.  Additional item prices.
8.  Fixed charges.
9.  Estimation range/buffer logic.
10. Discount rules.
11. Minimum guest counts.
12. Maximum practical guest counts.
13. Advance-payment percentage or amount.
14. Quotation validity.
15. Cancellation rules.
16. Event availability rules.
17. Whether date/venue affects pricing.
18. Whether different functions have different pricing.
19. Whether vegetarian/non-vegetarian combinations affect pricing.
20. Whether taxes are included in displayed estimates/final quotations.

These should be configuration rather than hardcoded assumptions wherever
possible.

------------------------------------------------------------------------

# 33. Open Product Decisions Before LLD

The high-level product is now fixed, but the following details should be
gathered from the actual caterer before final database/API design:

### Catalog

-   Exact function categories.
-   Exact package structure.
-   Exact menu categories.
-   Example real menus.

### Pricing

-   How the caterer currently calculates prices.
-   Whether each package has a fixed per-person price.
-   How custom menu additions are priced.
-   How price ranges should be produced.
-   How discounts are normally handled.

### Quotation

-   What the final quotation currently contains.
-   Whether the caterer commonly changes customer-selected menus.
-   How negotiation works.
-   Advance-payment rules.

### Availability

-   Whether the caterer can handle multiple events on the same date.
-   Whether availability needs to be shown to customers.
-   Whether the owner must manually approve every request.

These are business-specific and should not be guessed.

------------------------------------------------------------------------

# 34. Quality Gates

Each implementation phase must satisfy:

``` text
Requirements
   ↓
Implementation
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Manual Verification
   ↓
Acceptance Criteria
   ↓
Commit / Tag
   ↓
Next Phase
```

No phase should depend on unfinished work from a later phase.

------------------------------------------------------------------------

# 35. Definition of Done

A feature is considered complete only when:

-   Requirements are documented.
-   Backend logic is implemented.
-   API validation is implemented.
-   Authorization is implemented where required.
-   Frontend flow is implemented.
-   Error states are handled.
-   Unit tests exist.
-   Integration/API tests exist where applicable.
-   UI has loading/empty/error states.
-   Data persistence works.
-   Relevant audit information exists.
-   Acceptance criteria pass.

------------------------------------------------------------------------

# 36. Long-Term Product Direction

After the core system is stable:

``` text
Customer Interaction
        ↓
Structured Catering Plan
        ↓
Pricing Engine
        ↓
Final Quotation
        ↓
Actual Event
        ↓
Actual Business Data
        ↓
Historical Dataset
        ↓
Better Recommendations
        ↓
Better Estimates
        ↓
Better AI Assistant
```

The long-term goal is not to replace the caterer's expertise.

It is to **digitize and amplify the caterer's existing expertise**.

------------------------------------------------------------------------

# 37. Final Architecture Direction

The conceptual architecture should converge toward:

``` text
                        CUSTOMER WEB APP
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  Normal UI              AI
                    │                     │
                    │                  Text/Voice
                    │                     │
                    └──────────┬──────────┘
                               ▼
                       APPLICATION API
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
      Catalog Service     Event Service       Quotation Service
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                         Pricing Engine
                               │
                               ▼
                          PostgreSQL
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             Caterer Dashboard       Payment/OTP/etc.
```

The most important architectural boundary is:

``` text
AI
 │
 ▼
Application Services
 │
 ├── Catalog
 ├── Pricing
 ├── Events
 ├── Quotations
 └── Booking
```

rather than:

``` text
AI → Database directly
```

or:

``` text
AI → invent its own price
```

------------------------------------------------------------------------

# 38. Next Implementation Documents

After `planning.md`, the project should produce these documents in
order:

``` text
planning.md
    ↓
requirements.md
    ↓
product-flows.md
    ↓
system-design.md
    ↓
database-design.md
    ↓
api-spec.md
    ↓
ai-design.md
    ↓
testing-strategy.md
    ↓
implementation
```

The next major design artifact should be **`requirements.md`**, where
each functional requirement receives a unique ID and acceptance
criteria.

After that, **`system-design.md`** can be created from the frozen
requirements rather than assumptions.

------------------------------------------------------------------------

# 39. Guiding Principle

The application should feel simple to the customer:

> **Choose your function → build your menu → tell us your guests and
> budget → see your estimate → request the final quotation.**

But underneath, it should have a robust foundation:

> **Catalog → Configuration → Pricing Engine → Quotation → Booking →
> Historical Data → AI Assistance.**

This separation allows the product to start as a practical catering
application and evolve into an intelligent catering planning platform
without rebuilding its core architecture.
