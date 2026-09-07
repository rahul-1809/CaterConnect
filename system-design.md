# Catering Planning & Quotation Platform --- System Design

**Document:** `system-design.md`\
**Version:** 1.0\
**Status:** Baseline technical architecture\
**Depends on:** `planning.md`, `requirements.md`, `product-flows.md`\
**Scope:** Single local Indian catering business

------------------------------------------------------------------------

# 1. Purpose

This document converts the product requirements and product flows into a
concrete technical architecture.

The architecture is designed around five principles:

1.  **The normal application is the source of truth.**
2.  **Pricing is deterministic.**
3.  **AI is a controlled application client, not a database
    administrator.**
4.  **Customer and caterer experiences share the same backend domain.**
5.  **The system is implemented incrementally rather than as one large
    build.**

The target architecture is:

``` text
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│                                                              │
│  Customer Web App                  Caterer/Admin Web App      │
│  Next.js + TypeScript              Next.js + TypeScript      │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                         API LAYER                             │
│                                                              │
│                  FastAPI + Python                             │
│                                                              │
│  Auth │ Catalog │ Events │ Pricing │ Quotations │ Booking    │
│  AI   │ Payments │ Notifications │ Admin                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
      PostgreSQL          Redis       Object Storage
      Source of Truth     Optional      Images/Docs
             │
             ├─────────────── External Providers
             │                 OTP / Payment / Messaging
             │
             └─────────────── AI Provider
                               │
                               ├── LLM
                               ├── Speech-to-Text
                               └── Text-to-Speech
```

------------------------------------------------------------------------

# 2. Architecture Goals

## 2.1 Primary Goals

The architecture shall:

-   support the complete customer planning journey;
-   support caterer catalog and quotation operations;
-   maintain strong commercial data integrity;
-   keep pricing deterministic;
-   support future AI integration without redesigning the core domain;
-   support multilingual and voice interaction;
-   be easy to develop and test incrementally;
-   be suitable for a small business initially;
-   allow scaling without requiring an immediate microservice
    architecture.

## 2.2 Secondary Goals

The architecture should:

-   minimize infrastructure cost;
-   minimize operational complexity;
-   support good observability;
-   preserve historical quotations;
-   provide clean boundaries for future integrations.

------------------------------------------------------------------------

# 3. Architecture Decision Summary

  -----------------------------------------------------------------------
  Area                                Decision
  ----------------------------------- -----------------------------------
  Frontend                            Next.js + TypeScript

  UI                                  Tailwind CSS + reusable component
                                      system

  Backend                             Python + FastAPI

  Validation                          Pydantic + domain validation

  Database                            PostgreSQL

  ORM/Data Access                     SQLAlchemy 2.x or equivalent typed
                                      repository layer

  Authentication                      Phone + OTP

  Session                             Secure HTTP-only cookie/session or
                                      equivalent secure token strategy

  Cache/Rate Limiting                 Redis when required

  Object Storage                      S3-compatible storage when required

  AI                                  Provider-agnostic AI service
                                      boundary

  Payments                            Provider-agnostic payment
                                      integration

  Notifications                       Provider-agnostic notification
                                      service

  Deployment                          Containerized

  Architecture style                  Modular monolith initially

  Async jobs                          Background worker/queue when
                                      operationally required

  API                                 REST/JSON initially

  Currency                            INR

  Primary timezone                    IST

  Marketplace                         No

  Fleet/equipment                     No
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Why a Modular Monolith

The application is for one catering business and is not expected to
require dozens of independently deployed services initially.

Therefore V1 should use a **modular monolith**.

Conceptually:

``` text
                    FastAPI Application
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
     Auth               Catalog              Events
       │                   │                    │
       ├─────────────── Domain Services ────────┤
       │                   │                    │
    Pricing            Quotations            Booking
       │                   │                    │
       ├─────────────── Integrations ───────────┤
       │                   │                    │
      AI              Payments            Notifications
                           │
                       PostgreSQL
```

This provides modular boundaries without the deployment and networking
complexity of microservices.

------------------------------------------------------------------------

# 5. Why Not Microservices Initially

Microservices would introduce:

-   service discovery;
-   network failure modes;
-   distributed transactions;
-   independent deployments;
-   duplicated authentication concerns;
-   increased infrastructure;
-   more difficult local development.

Those costs are not justified by the V1 business scale.

The codebase should still maintain strong module boundaries so
individual modules can later be extracted if necessary.

------------------------------------------------------------------------

# 6. High-Level Component Architecture

``` text
                         Internet
                            │
                            ▼
                     CDN / Reverse Proxy
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       Customer Frontend            Admin Frontend
          Next.js                     Next.js
              │                           │
              └─────────────┬─────────────┘
                            │
                           HTTPS
                            │
                            ▼
                       FastAPI API
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
     Auth Module        Catalog Module       Event Module
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
   Pricing Module     Quotation Module     Booking Module
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
     AI Module       Notification Module   Payment Module
                            │
                            ▼
                        PostgreSQL
```

------------------------------------------------------------------------

# 7. Frontend Architecture

## 7.1 Applications

The project should support two frontend experiences:

``` text
frontend/
├── customer/
└── admin/
```

They may initially share a common package for:

-   UI components;
-   API client;
-   types;
-   validation utilities;
-   design tokens.

Potential structure:

``` text
frontend/
├── customer/
├── admin/
└── packages/
    ├── ui/
    ├── api-client/
    ├── types/
    └── config/
```

A single Next.js application with route groups is also viable initially,
but separating customer/admin concerns logically is important.

------------------------------------------------------------------------

# 8. Customer Frontend Structure

Recommended conceptual structure:

``` text
customer/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── events/
│   ├── requests/
│   ├── quotations/
│   ├── bookings/
│   └── assistant/
├── components/
│   ├── catalog/
│   ├── event-planner/
│   ├── pricing/
│   ├── quotation/
│   ├── booking/
│   └── ai/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── state/
│   └── validation/
└── hooks/
```

------------------------------------------------------------------------

# 9. Admin Frontend Structure

``` text
admin/
├── app/
│   ├── dashboard/
│   ├── requests/
│   ├── quotations/
│   ├── bookings/
│   ├── catalog/
│   └── pricing/
├── components/
│   ├── requests/
│   ├── quotations/
│   ├── bookings/
│   └── catalog/
└── lib/
    ├── api/
    ├── auth/
    └── state/
```

------------------------------------------------------------------------

# 10. Frontend State Architecture

The frontend should separate three categories.

## 10.1 Server State

Examples:

-   catalog;
-   event;
-   estimate;
-   quotation;
-   booking;
-   payment status.

Recommended handling:

-   TanStack Query or equivalent server-state library;
-   API responses as source of truth.

## 10.2 Local UI State

Examples:

-   selected category tab;
-   modal open/closed;
-   expanded package section;
-   AI panel visibility.

## 10.3 Event Draft State

The event planner needs a coordinated state representation.

Example:

``` text
EventDraft
├── function
├── offering
├── package
├── menuSelections
├── guestCount
├── budget
├── eventDate
├── eventTime
├── venue
└── notes
```

This state should synchronize with backend event state.

------------------------------------------------------------------------

# 11. Backend Layering

The backend should follow:

``` text
HTTP Route
    ↓
Request Schema
    ↓
Application Service
    ↓
Domain Logic
    ↓
Repository
    ↓
Database
```

External integrations should be isolated:

``` text
Application Service
       ↓
Integration Interface
       ↓
Provider Adapter
       ↓
External Provider
```

------------------------------------------------------------------------

# 12. Backend Repository Structure

Recommended:

``` text
backend/
└── app/
    ├── main.py
    ├── api/
    │   ├── auth.py
    │   ├── catalog.py
    │   ├── events.py
    │   ├── estimates.py
    │   ├── quotations.py
    │   ├── bookings.py
    │   ├── payments.py
    │   ├── notifications.py
    │   └── ai.py
    │
    ├── domain/
    │   ├── auth/
    │   ├── catalog/
    │   ├── events/
    │   ├── pricing/
    │   ├── quotations/
    │   ├── bookings/
    │   └── payments/
    │
    ├── services/
    │   ├── event_service.py
    │   ├── pricing_service.py
    │   ├── quotation_service.py
    │   ├── booking_service.py
    │   └── recommendation_service.py
    │
    ├── repositories/
    ├── models/
    ├── schemas/
    ├── pricing/
    ├── ai/
    ├── auth/
    ├── integrations/
    │   ├── otp/
    │   ├── payments/
    │   ├── notifications/
    │   └── ai/
    ├── core/
    │   ├── config.py
    │   ├── security.py
    │   ├── database.py
    │   └── logging.py
    └── workers/
```

------------------------------------------------------------------------

# 13. API Layer Responsibilities

The API layer should:

-   authenticate requests;
-   validate request schemas;
-   resolve user identity;
-   enforce authorization;
-   invoke application services;
-   return stable response schemas;
-   avoid embedding complex business logic.

Bad:

``` text
POST /estimate
    calculate everything directly inside route handler
```

Better:

``` text
POST /estimate
    ↓
EstimateRequest
    ↓
PricingApplicationService
    ↓
PricingEngine
    ↓
EstimateResponse
```

------------------------------------------------------------------------

# 14. Domain Layer

The domain layer contains business rules that should remain independent
of HTTP.

Examples:

-   package selection;
-   menu eligibility;
-   quotation state transitions;
-   booking state transitions;
-   pricing rules;
-   budget comparison.

This allows the same behavior to be invoked by:

-   customer UI;
-   admin UI;
-   AI assistant;
-   background jobs;
-   automated tests.

------------------------------------------------------------------------

# 15. Application Service Layer

Application services coordinate domain operations.

Examples:

``` text
EventService
PricingService
RecommendationService
QuotationService
BookingService
PaymentService
NotificationService
AIOrchestrationService
```

An application service may coordinate multiple repositories and
integrations within a transaction.

------------------------------------------------------------------------

# 16. Repository Layer

Repositories isolate persistence.

Examples:

``` text
CustomerRepository
EventRepository
MenuItemRepository
PackageRepository
QuotationRepository
BookingRepository
PaymentRepository
AuditLogRepository
```

Business logic should not depend directly on SQL queries scattered
throughout the application.

------------------------------------------------------------------------

# 17. Database Architecture

PostgreSQL is the primary source of truth.

Conceptual domains:

``` text
Identity
  Users
  Customer Profiles

Catalog
  Function Types
  Offerings
  Menu Categories
  Menu Items
  Packages
  Package Rules

Planning
  Events
  Event Menu Items
  Event Versions

Commercial
  Pricing Rules
  Estimates
  Quotation Requests
  Quotations
  Quotation Items

Booking
  Bookings
  Payments

AI
  Conversations
  Messages
  Tool Calls

Platform
  Notifications
  Audit Logs
```

The exact schema is defined in `database-design.md`.

------------------------------------------------------------------------

# 18. Database Transaction Boundaries

Transactions are especially important for:

## Event Configuration

Changing multiple related menu selections should preserve a consistent
state.

## Quotation Submission

Creating the quotation request and its snapshot should be atomic.

## Quotation Acceptance

Acceptance and the resulting state transition must be consistent.

## Booking Creation

Creating booking records from an accepted quotation must be
transactional.

## Payment Processing

Provider callback processing and payment recording must be idempotent
and transactional.

------------------------------------------------------------------------

# 19. Authentication Architecture

The flow:

``` text
Customer
   ↓
POST /auth/otp/request
   ↓
OTP Provider
   ↓
OTP
   ↓
POST /auth/otp/verify
   ↓
Verify OTP
   ↓
Create / retrieve User
   ↓
Create secure session
   ↓
Authenticated application
```

------------------------------------------------------------------------

# 20. OTP Design

OTP records should contain concepts such as:

``` text
OTP Challenge
├── phone_number
├── challenge_id
├── code_hash
├── expires_at
├── attempt_count
├── max_attempts
├── consumed_at
└── created_at
```

Raw OTP values should not be persisted unnecessarily.

The implementation should protect against:

-   brute force;
-   replay;
-   OTP enumeration;
-   excessive SMS requests.

------------------------------------------------------------------------

# 21. Session Architecture

For the web application, a secure cookie-based session is recommended.

Important properties:

-   HTTP-only;
-   Secure in production;
-   SameSite configured appropriately;
-   short/controlled lifetime;
-   server-side revocation strategy where appropriate.

The exact implementation can use signed tokens or a session store
depending on deployment requirements.

------------------------------------------------------------------------

# 22. Authorization Architecture

Every protected request should establish:

``` text
Request
  ↓
Authenticated Identity
  ↓
Role
  ↓
Resource Ownership / Admin Permission
  ↓
Application Service
```

For customer event access:

``` text
event.customer_id == current_user.customer_id
```

must be validated server-side.

------------------------------------------------------------------------

# 23. Catalog Architecture

Catalog is managed by the caterer.

Relationships:

``` text
Function
   │
   ├── Offerings
   │
   └── Packages
          │
          ├── Package Items
          ├── Selection Groups
          └── Paid Additions

Menu Category
   │
   └── Menu Items
```

The catalog must support active/inactive states rather than destructive
deletion.

------------------------------------------------------------------------

# 24. Event Architecture

An event is the central customer planning aggregate.

Conceptually:

``` text
Event
├── Customer
├── Function
├── Offering
├── Package (optional)
├── Menu Configuration
├── Guest Count
├── Budget
├── Date
├── Time
├── Venue
├── Notes
├── Estimate
└── Quotation Request
```

The event should have a version or revision mechanism.

------------------------------------------------------------------------

# 25. Why Event Is the Core Aggregate

Most customer actions modify the event:

``` text
Choose function
        ↓
Choose offering
        ↓
Choose package
        ↓
Modify menu
        ↓
Change guests
        ↓
Change budget
        ↓
Change venue
        ↓
Calculate estimate
```

Therefore the event should be the canonical planning context.

------------------------------------------------------------------------

# 26. Event Configuration Versioning

The system should maintain a configuration version.

Example:

``` text
Event
version = 7

Customer modifies menu
        ↓
version = 8
```

An estimate references version 8.

A quotation request creates a stable snapshot of version 8.

This prevents ambiguity around which configuration was submitted.

------------------------------------------------------------------------

# 27. Pricing Architecture

Pricing must be isolated from:

-   HTTP;
-   frontend;
-   AI;
-   database-specific concerns.

Recommended structure:

``` text
PricingService
      ↓
PricingContext
      ↓
PricingRules
      ↓
PricingEngine
      ↓
EstimateResult
```

------------------------------------------------------------------------

# 28. Pricing Context

The pricing engine receives a structured context.

Example:

``` text
PricingContext
├── event
├── guest_count
├── package
├── selected_items
├── paid_additions
├── pricing_rules
├── applicable_charges
├── discounts
└── taxes
```

------------------------------------------------------------------------

# 29. Pricing Engine Output

Conceptually:

``` text
EstimateResult
├── currency
├── lower_bound
├── upper_bound
├── line_items
├── budget_comparison
├── pricing_version
├── configuration_version
└── generated_at
```

The exact formula for the range is a separate product/business decision.

------------------------------------------------------------------------

# 30. Estimate Range Architecture

The architecture should allow different uncertainty sources without
embedding uncertainty into the LLM.

For example:

``` text
Deterministic Base Price
        +
Configurable Uncertainty Factors
        ↓
Estimated Lower Bound
Estimated Upper Bound
```

Potential factors could include:

-   final quantity adjustment;
-   event-specific charges;
-   travel variation;
-   tax configuration;
-   caterer-defined uncertainty.

These factors must be explicit and deterministic.

------------------------------------------------------------------------

# 31. Pricing Versioning

Each estimate should identify the pricing configuration/version used.

Conceptually:

``` text
pricing_version = 12
event_version = 7
```

This provides traceability.

Historical quotations should snapshot the final commercial values
independently.

------------------------------------------------------------------------

# 32. Recommendation Architecture

Recommendations are separate from pricing.

``` text
Event Configuration
       ↓
Recommendation Service
       ├── Rules
       ├── Catalog Data
       ├── Budget
       └── Pricing Service
              ↓
       Candidate Plans
              ↓
       Ranked Recommendations
```

AI may help explain or generate candidate strategies, but the
application validates the final configuration.

------------------------------------------------------------------------

# 33. Recommendation Candidate Model

A recommendation can conceptually contain:

``` text
Recommendation
├── id
├── type
├── title
├── explanation
├── proposed_changes
├── estimated_impact
├── constraints_satisfied
└── confidence/score
```

`proposed_changes` should be structured rather than free-form.

------------------------------------------------------------------------

# 34. Quotation Architecture

The quotation system separates:

``` text
Customer Estimate
        ≠
Final Quotation
```

The final quotation is created by the caterer.

Flow:

``` text
Quotation Request
       ↓
Caterer Review
       ↓
Quotation Draft
       ↓
Validation
       ↓
Quotation Version
       ↓
Send
```

------------------------------------------------------------------------

# 35. Quotation Snapshot

A sent quotation should preserve:

-   menu descriptions relevant to the quote;
-   quantities/guest count;
-   commercial line items;
-   prices;
-   discounts;
-   taxes;
-   final total;
-   terms;
-   validity;
-   customer-visible event details.

This prevents later catalog edits from changing history.

------------------------------------------------------------------------

# 36. Quotation Versioning Architecture

Conceptually:

``` text
Quotation
├── quotation_number
├── request_id
└── versions
      ├── v1
      ├── v2
      └── v3
```

Only one version should be the currently active customer-facing version.

A superseded version remains historical.

------------------------------------------------------------------------

# 37. Booking Architecture

Booking is created from an accepted quotation.

``` text
Quotation
   ↓
Accepted
   ↓
Booking
   ↓
Payment Condition
   ↓
Confirmed
```

Booking should reference the accepted quotation version.

------------------------------------------------------------------------

# 38. Payment Architecture

Use an adapter interface:

``` text
PaymentService
      ↓
PaymentProvider Interface
      ↓
Provider Adapter
```

This prevents business logic from depending directly on a specific
payment vendor.

Example interface concepts:

``` text
create_payment()
verify_payment()
handle_callback()
refund_payment()
```

Exact provider capabilities determine implementation.

------------------------------------------------------------------------

# 39. Payment Idempotency

Every payment attempt/callback should have a unique provider reference
or idempotency key.

Flow:

``` text
Provider Callback
      ↓
Validate Signature
      ↓
Find Existing Transaction
      ↓
Already Processed?
   ┌──┴──┐
  Yes   No
   │     │
Return  Process
         ↓
      Record Payment
         ↓
      Update Booking
```

Duplicate callbacks must not create duplicate payment records.

------------------------------------------------------------------------

# 40. Notification Architecture

Notifications should be event-driven at the application level.

Example:

``` text
Quotation Sent
      ↓
Notification Event
      ↓
Notification Service
      ├── In-App
      ├── SMS
      ├── WhatsApp
      └── Email
```

Channels should be replaceable.

------------------------------------------------------------------------

# 41. Notification Reliability

Notifications should not control business state.

Bad:

``` text
Send SMS
  ↓
Assume quotation was sent
```

Correct:

``` text
Quotation state = SENT
        ↓
Notification event generated
        ↓
Notification delivery attempted
```

If notification fails, quotation remains sent.

------------------------------------------------------------------------

# 42. AI Architecture

The AI system should be an orchestration layer over application
capabilities.

``` text
Customer
   ↓
AI Interface
   ↓
AI Orchestrator
   ↓
LLM
   ↓
Tool Selection
   ↓
Application Tools
   ├── Catalog
   ├── Event
   ├── Pricing
   ├── Recommendation
   └── Quotation Information
   ↓
Validated Application Services
   ↓
PostgreSQL
```

The LLM must not have direct database access.

------------------------------------------------------------------------

# 43. AI Module Boundaries

Recommended:

``` text
ai/
├── orchestrator.py
├── conversation.py
├── prompts/
├── tools/
│   ├── catalog_tools.py
│   ├── event_tools.py
│   ├── pricing_tools.py
│   └── recommendation_tools.py
├── schemas/
├── policies/
└── evaluation/
```

------------------------------------------------------------------------

# 44. AI Tool Architecture

Tools should expose narrow business capabilities.

Examples:

``` text
search_menu_items
get_package_details
get_available_offerings
get_event_state
calculate_estimate
recommend_menu
optimize_budget
propose_event_changes
apply_event_changes
```

Tools should return structured data.

------------------------------------------------------------------------

# 45. AI Tool Safety

Every tool should have:

-   input schema;
-   authorization check;
-   validation;
-   explicit side-effect classification;
-   error handling;
-   audit behavior where relevant.

Tools can be classified as:

``` text
READ_ONLY
PROPOSE_CHANGE
MUTATE
CONSEQUENTIAL
```

------------------------------------------------------------------------

# 46. AI Read-Only Tools

Examples:

``` text
search_menu_items
get_package_details
get_event_state
calculate_estimate
```

These can normally execute without user confirmation, subject to
authorization.

------------------------------------------------------------------------

# 47. AI Proposed-Change Tools

Examples:

``` text
propose_event_changes
optimize_budget
```

These produce a proposed plan rather than immediately changing the
event.

------------------------------------------------------------------------

# 48. AI Mutation Tools

Example:

``` text
apply_event_changes
```

This should:

1.  receive structured changes;
2.  validate against current event version;
3.  validate authorization;
4.  validate business rules;
5.  apply changes transactionally;
6.  return the new event version.

------------------------------------------------------------------------

# 49. AI Consequential Actions

The AI should not autonomously perform:

-   final quotation acceptance;
-   payment;
-   booking cancellation;
-   other financially consequential actions.

The normal explicit application UI remains authoritative.

------------------------------------------------------------------------

# 50. AI Optimistic Concurrency

AI may reason over an event version that becomes stale.

Example:

``` text
AI reads event version 7

Customer changes menu manually

Event version becomes 8

AI attempts mutation against version 7
```

The backend should reject or require reconciliation.

This prevents AI from overwriting newer customer changes.

------------------------------------------------------------------------

# 51. AI Conversation Persistence

Conversation records should conceptually contain:

``` text
AIConversation
├── customer
├── event_id (optional)
├── language
├── created_at
└── messages

AIMessage
├── role
├── content
├── structured metadata
├── tool calls
└── timestamps
```

The conversation should not become the authoritative event state.

------------------------------------------------------------------------

# 52. AI Context Construction

The AI context should be built intentionally.

Possible context:

``` text
User Intent
+
Current Event Summary
+
Relevant Catalog Data
+
Current Estimate
+
Allowed Tools
+
Business Policies
```

Do not send the entire database or unnecessary customer history to the
LLM.

------------------------------------------------------------------------

# 53. AI Context Hierarchy

Use:

``` text
System / Safety Rules
        ↓
Business Policies
        ↓
Current Event State
        ↓
Relevant Catalog Data
        ↓
Conversation History
        ↓
Current User Message
```

The exact prompt strategy belongs in `ai-design.md`.

------------------------------------------------------------------------

# 54. AI Failure Handling

If AI fails:

``` text
AI request
   ↓
Provider failure
   ↓
Friendly error
   ↓
Normal UI remains available
```

The customer should never be trapped inside the AI flow.

------------------------------------------------------------------------

# 55. Multilingual Architecture

Language should be a presentation/conversation concern.

Canonical domain data remains:

``` text
menu_item_id = UUID
guest_count = 500
budget = 100000
```

rather than:

``` text
"500 people"
"one lakh"
"500 మంది"
```

Natural language is converted into canonical structured values before
application services are invoked.

------------------------------------------------------------------------

# 56. Voice Architecture

Recommended:

``` text
Microphone
   ↓
Speech-to-Text
   ↓
Language Detection / Normalization
   ↓
AI Orchestrator
   ↓
Application Tools
   ↓
Response Text
   ↓
Text-to-Speech
   ↓
Audio
```

The voice provider should be replaceable.

------------------------------------------------------------------------

# 57. Voice Critical-Value Confirmation

For ambiguous recognition:

``` text
Speech:
"500 members"

Interpreted:
guest_count = 500

Assistant:
"I understood 500 guests. Is that correct?"
```

Only after confirmation should consequential mutation occur.

------------------------------------------------------------------------

# 58. API Architecture

REST/JSON is recommended for V1.

Major resource groups:

``` text
/auth
/functions
/offerings
/packages
/menu
/events
/estimates
/quotation-requests
/quotations
/bookings
/payments
/notifications
/ai
```

The exact API contracts are defined in `api-spec.md`.

------------------------------------------------------------------------

# 59. API Versioning

Use a stable prefix:

``` text
/api/v1/...
```

This allows future breaking API changes without immediately breaking
clients.

------------------------------------------------------------------------

# 60. API Error Model

All APIs should return a consistent error structure.

Conceptually:

``` json
{
  "code": "PACKAGE_GUEST_LIMIT_EXCEEDED",
  "message": "This package supports up to 300 guests.",
  "details": {}
}
```

The exact schema belongs in `api-spec.md`.

Client UI should map known business errors to useful messages.

------------------------------------------------------------------------

# 61. Request Idempotency

Idempotency should be considered for:

-   quotation request submission;
-   quotation acceptance;
-   booking creation;
-   payment initiation;
-   provider callbacks.

For example:

``` text
Idempotency-Key: <unique-request-key>
```

The backend can safely return the existing result for repeated requests.

------------------------------------------------------------------------

# 62. Caching Strategy

Initially, caching should remain simple.

Good candidates:

-   active catalog;
-   menu categories;
-   relatively static package data;
-   read-heavy public content.

Do not cache mutable commercial state aggressively.

Estimate and quotation responses require stronger freshness guarantees.

Redis can be introduced when profiling demonstrates value.

------------------------------------------------------------------------

# 63. Background Jobs

A background worker can later handle:

-   notifications;
-   email;
-   WhatsApp;
-   PDF quotation generation;
-   analytics processing;
-   AI evaluation;
-   cleanup tasks.

Core financial/state transitions should not depend on an unreliable
asynchronous worker.

------------------------------------------------------------------------

# 64. Object Storage

Object storage may hold:

-   menu item images;
-   package images;
-   caterer branding;
-   generated quotation PDFs;
-   other customer-visible documents.

Database should store metadata/reference, not large binary objects.

------------------------------------------------------------------------

# 65. File Upload Security

Uploaded files should be:

-   type validated;
-   size limited;
-   scanned where appropriate;
-   stored outside executable application paths;
-   referenced by controlled object keys.

------------------------------------------------------------------------

# 66. Security Boundary

``` text
                 Internet
                    │
                  HTTPS
                    │
             Frontend / API
                    │
          Authentication
                    │
          Authorization Layer
                    │
        ┌───────────┴───────────┐
        │                       │
   Customer Data          Admin Operations
        │                       │
        └───────────┬───────────┘
                    │
                PostgreSQL
```

The database should never be directly reachable by browser clients.

------------------------------------------------------------------------

# 67. Secret Management

Secrets include:

-   OTP credentials;
-   payment credentials;
-   AI provider keys;
-   database credentials;
-   session/signing keys;
-   storage credentials.

Use environment/secret management facilities.

Never commit secrets to Git.

------------------------------------------------------------------------

# 68. Audit Architecture

Commercial actions should produce audit events.

Conceptually:

``` text
Application Service
      ↓
Business Mutation
      ↓
Audit Event
      ↓
AuditLog
```

Audit records should include:

-   actor;
-   action;
-   entity;
-   entity ID;
-   timestamp;
-   request/correlation ID;
-   version information;
-   relevant metadata.

------------------------------------------------------------------------

# 69. Observability Architecture

Production should have:

``` text
Application
   ├── Structured Logs
   ├── Metrics
   ├── Error Tracking
   └── Request Tracing/Correlation
```

Important metrics:

-   OTP success/failure;
-   API latency;
-   estimate latency;
-   quotation conversion;
-   booking conversion;
-   payment success/failure;
-   AI tool errors;
-   notification failures.

------------------------------------------------------------------------

# 70. Logging Rules

Logs should contain enough context to debug operations but must not
expose:

-   OTP codes;
-   payment credentials;
-   API keys;
-   unnecessary personal information.

Sensitive fields should be redacted.

------------------------------------------------------------------------

# 71. Deployment Architecture

A simple production deployment can be:

``` text
                    DNS
                     │
                     ▼
               Reverse Proxy/CDN
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Next.js Customer       Next.js Admin
          │                     │
          └──────────┬──────────┘
                     ▼
                FastAPI App
                     │
              ┌──────┴──────┐
              ▼             ▼
         PostgreSQL       Redis
              │
       ┌──────┼───────────┐
       ▼      ▼           ▼
     OTP    Payment      AI
   Provider Provider    Provider
```

Exact cloud provider is intentionally not fixed in this document.

------------------------------------------------------------------------

# 72. Environment Strategy

At minimum:

``` text
development
staging
production
```

Development:

-   local PostgreSQL;
-   local Redis when required;
-   sandbox providers.

Staging:

-   production-like infrastructure;
-   provider sandbox accounts.

Production:

-   live providers;
-   backups;
-   monitoring;
-   secrets management.

------------------------------------------------------------------------

# 73. Containerization

Recommended containers:

``` text
customer-web
admin-web
api
worker (when required)
```

PostgreSQL and Redis may be managed services in production.

For local development, Docker Compose can provide the supporting
infrastructure.

------------------------------------------------------------------------

# 74. CI/CD Architecture

Pipeline:

``` text
Git Push
   ↓
Lint
   ↓
Type Check
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Build
   ↓
Security Checks
   ↓
Deploy Staging
   ↓
E2E Tests
   ↓
Production Approval
   ↓
Deploy
```

The exact CI provider is not a core architectural decision.

------------------------------------------------------------------------

# 75. Database Migration Strategy

Use versioned migrations.

Rules:

-   every schema change has a migration;
-   migrations are committed to source control;
-   production migrations are reviewed;
-   destructive migrations require special handling;
-   historical quotation/booking data must be protected.

------------------------------------------------------------------------

# 76. Backup Strategy

Production PostgreSQL should have:

-   automated backups;
-   point-in-time recovery where supported;
-   documented restore process;
-   periodic restore verification.

A backup that has never been restored/tested should not be treated as
sufficient disaster recovery.

------------------------------------------------------------------------

# 77. Disaster Recovery Baseline

For V1:

-   database backups;
-   reproducible application deployment;
-   documented provider credentials/configuration recovery;
-   object-storage backup/versioning where important;
-   recovery procedure.

Exact RPO/RTO targets should be defined once expected business volume is
known.

------------------------------------------------------------------------

# 78. Scalability Strategy

The system should scale in this order:

``` text
1. Optimize application/database
2. Add caching
3. Add background workers
4. Horizontally scale API
5. Scale frontend separately
6. Optimize database/read patterns
7. Extract services only when justified
```

Do not introduce microservices merely for theoretical scalability.

------------------------------------------------------------------------

# 79. Database Scaling Considerations

Initially:

``` text
One PostgreSQL primary
```

Later possibilities:

-   read replicas;
-   connection pooling;
-   query optimization;
-   partitioning for large audit/event tables.

These are future concerns.

------------------------------------------------------------------------

# 80. Sequence --- Customer Creates Event

``` text
Customer
   │
   │ POST /events
   ▼
FastAPI
   │
   │ authenticate
   ▼
EventService
   │
   │ create event
   ▼
EventRepository
   │
   ▼
PostgreSQL
   │
   ▼
EventResponse
   │
   ▼
Customer UI
```

------------------------------------------------------------------------

# 81. Sequence --- Customer Selects Menu Item

``` text
Customer UI
    │
    │ add item
    ▼
PATCH /events/{id}/configuration
    │
    ▼
EventService
    │
    ├── validate item
    ├── validate eligibility
    ├── update configuration
    └── increment version
    │
    ▼
PostgreSQL
    │
    ▼
Updated Event
```

------------------------------------------------------------------------

# 82. Sequence --- Calculate Estimate

``` text
Customer UI
    │
    │ POST /events/{id}/estimate
    ▼
Estimate API
    │
    ▼
PricingService
    │
    ▼
Load Event + Catalog + Pricing Rules
    │
    ▼
PricingEngine
    │
    ▼
EstimateResult
    │
    ├── lower bound
    ├── upper bound
    ├── breakdown
    └── budget status
    │
    ▼
Customer UI
```

------------------------------------------------------------------------

# 83. Sequence --- Budget Optimization

``` text
Customer
   │
   │ Optimize for Budget
   ▼
Recommendation API
   │
   ▼
RecommendationService
   │
   ├── inspect event
   ├── generate candidates
   ├── validate candidates
   ├── price candidates
   └── rank candidates
   │
   ▼
RecommendationResponse
   │
   ▼
Customer
   │
   │ Approves candidate
   ▼
EventService
   │
   ▼
Updated Event
```

------------------------------------------------------------------------

# 84. Sequence --- AI Recommendation

``` text
Customer
   │
   │ Natural language
   ▼
AI API
   │
   ▼
AI Orchestrator
   │
   ▼
LLM
   │
   │ tool call
   ▼
Catalog / Recommendation Tool
   │
   ▼
Application Service
   │
   ▼
Validated Data
   │
   ▼
AI Orchestrator
   │
   ▼
Customer
```

------------------------------------------------------------------------

# 85. Sequence --- AI Mutation

``` text
Customer
   │
   │ "Remove premium dessert"
   ▼
AI
   │
   ▼
Proposed Change
   │
   ▼
Customer Confirmation
   │
   ▼
apply_event_changes
   │
   ▼
EventService
   │
   ├── authorization
   ├── version check
   ├── business validation
   └── transaction
   │
   ▼
PostgreSQL
   │
   ▼
New Event Version
   │
   ▼
UI Refresh
```

------------------------------------------------------------------------

# 86. Sequence --- Quotation Request

``` text
Customer
   │
   │ Request Final Quotation
   ▼
QuotationRequest API
   │
   ▼
EventService
   │
   ├── validate event
   ├── validate menu
   ├── validate required details
   └── freeze submission snapshot
   │
   ▼
QuotationRequestService
   │
   ▼
PostgreSQL
   │
   ▼
Notification Event
   │
   ▼
Customer + Caterer
```

------------------------------------------------------------------------

# 87. Sequence --- Caterer Sends Quotation

``` text
Caterer
   │
   │ Create quotation
   ▼
QuotationService
   │
   ├── load request snapshot
   ├── create draft
   ├── calculate commercial values
   └── validate
   │
   ▼
PostgreSQL
   │
   ▼
Send Quotation
   │
   ▼
Quotation state = SENT
   │
   ▼
Notification Event
   │
   ▼
Customer
```

------------------------------------------------------------------------

# 88. Sequence --- Accept and Book

``` text
Customer
   │
   │ Accept quotation
   ▼
QuotationService
   │
   ├── verify active version
   ├── verify not expired
   └── transition ACCEPTED
   │
   ▼
BookingService
   │
   ├── create booking
   └── determine advance requirement
   │
   ▼
PostgreSQL
   │
   ▼
PENDING_ADVANCE
   │
   ▼
Payment Provider
   │
   ▼
Payment Callback
   │
   ▼
PaymentService
   │
   ├── verify
   ├── idempotency
   └── record payment
   │
   ▼
BookingService
   │
   ▼
CONFIRMED
```

------------------------------------------------------------------------

# 89. Core Data Flow

The most important data relationship is:

``` text
Catalog
   ↓
Event Configuration
   ↓
Pricing
   ↓
Estimate
   ↓
Quotation Request Snapshot
   ↓
Final Quotation Snapshot
   ↓
Booking
   ↓
Payments
```

The flow is intentionally directional.

Historical downstream records should not depend on mutable upstream
catalog data.

------------------------------------------------------------------------

# 90. Source-of-Truth Matrix

  Data                           Source of Truth
  ------------------------------ ---------------------------------------------
  Customer identity              PostgreSQL
  Catalog                        PostgreSQL
  Event configuration            PostgreSQL
  Current estimate calculation   Pricing service + current rules
  Final quotation                Quotation snapshot in PostgreSQL
  Booking                        PostgreSQL
  Payment state                  Payment provider + verified backend record
  AI conversation                AI conversation persistence
  AI recommendation              AI output + application validation
  Notification delivery          Notification provider + notification record

------------------------------------------------------------------------

# 91. Important Architectural Invariants

## INV-001

The LLM cannot directly access PostgreSQL.

## INV-002

The LLM cannot define authoritative final prices.

## INV-003

The frontend cannot bypass server-side business validation.

## INV-004

A sent quotation cannot silently change.

## INV-005

An accepted quotation references a specific quotation version.

## INV-006

A booking references the accepted commercial snapshot.

## INV-007

Duplicate payment callbacks cannot duplicate financial records.

## INV-008

Customer authorization is enforced on every protected resource.

## INV-009

AI changes use the same application services as normal UI changes.

## INV-010

Core application functionality does not depend on AI availability.

------------------------------------------------------------------------

# 92. Failure Boundary Matrix

  -----------------------------------------------------------------------
  Component               Failure Impact          Required Behavior
  ----------------------- ----------------------- -----------------------
  OTP Provider            Login unavailable       Retry/error message

  AI Provider             AI unavailable          Normal UI remains
                                                  usable

  Notification Provider   Notification delayed    Business state remains
                                                  correct

  Payment Provider        Payment                 Booking remains pending
                          unavailable/pending     

  Redis                   Cache/rate limit        Core DB-backed
                          degradation             operation remains safe
                                                  where possible

  Object Storage          Image/document          Core booking state
                          unavailable             unaffected

  Database                Major outage            Application
                                                  unavailable;
                                                  restore/recovery
                                                  required
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 93. Security Threat Model Baseline

Threats to consider:

-   OTP brute force;
-   session theft;
-   unauthorized event access;
-   ID enumeration;
-   malicious menu/catalog input;
-   admin privilege abuse;
-   payment callback forgery;
-   duplicate payment callbacks;
-   AI prompt injection;
-   AI tool misuse;
-   sensitive data leakage;
-   file upload abuse;
-   denial-of-service/rate abuse.

Security controls should be validated during implementation and testing.

------------------------------------------------------------------------

# 94. AI Prompt Injection Boundary

Catalog content and customer text must not be trusted as system
instructions.

Example:

A malicious menu description must not be allowed to cause the AI to:

-   reveal secrets;
-   bypass authorization;
-   call unauthorized tools;
-   expose internal pricing.

Tool authorization and business validation remain outside the model.

------------------------------------------------------------------------

# 95. Internal vs Customer Data Boundary

AI/customer-facing responses must distinguish:

### Customer-visible

-   menu price;
-   estimate;
-   package details;
-   quotation total;
-   booking information.

### Internal

-   food ingredient cost;
-   supplier price;
-   internal margin;
-   confidential business notes;
-   administrative credentials.

AI must not expose internal data merely because it has access to a tool
response.

------------------------------------------------------------------------

# 96. Commercial Integrity Model

The architecture intentionally separates:

``` text
Catalog Pricing
       ↓
Indicative Estimate
       ↓
Caterer Review
       ↓
Final Quotation
       ↓
Customer Acceptance
       ↓
Booking
```

This protects the caterer from the system accidentally turning a
preliminary estimate into a binding commercial promise.

------------------------------------------------------------------------

# 97. Development Architecture

Development should proceed vertically by usable slices.

Instead of:

``` text
Build entire backend
then entire frontend
then AI
```

prefer:

``` text
Phase
 ├── Backend
 ├── Database
 ├── Frontend
 ├── Tests
 └── Working user flow
```

Example:

``` text
Authentication
    ↓
Working OTP login
    ↓
Catalog
    ↓
Working catalog browsing
    ↓
Event Planner
    ↓
Working menu builder
```

------------------------------------------------------------------------

# 98. Phase-by-Phase Technical Architecture

## Phase 1 --- Foundation

Build:

-   repository;
-   frontend;
-   backend;
-   PostgreSQL;
-   configuration;
-   migrations;
-   linting;
-   testing;
-   CI. 

## Phase 2 --- Authentication

Build:

-   User;
-   Customer;
-   OTP;
-   session;
-   authorization middleware.

Deliverable:

> Customer can log in with phone + OTP.

## Phase 3 --- Catalog

Build:

-   function types;
-   offerings;
-   menu categories;
-   menu items;
-   packages;
-   admin CRUD.

Deliverable:

> Caterer can manage catalog and customer can read it.

## Phase 4 --- Customer Browsing

Build:

-   function page;
-   offering page;
-   package browsing;
-   package details;
-   custom-menu entry.

Deliverable:

> Customer can browse real catering options.

## Phase 5 --- Event Planner

Build:

-   event;
-   menu configuration;
-   package rules;
-   guest count;
-   budget;
-   event details;
-   draft persistence.

Deliverable:

> Customer can construct a complete event plan.

## Phase 6 --- Pricing

Build:

-   pricing domain;
-   pricing rules;
-   estimate service;
-   estimate UI;
-   range display.

Deliverable:

> Customer receives a deterministic estimate.

## Phase 7 --- Recommendations

Build:

-   recommendation service;
-   budget optimization;
-   candidate comparison;
-   apply recommendation.

Deliverable:

> Customer can optimize a plan toward a budget.

## Phase 8 --- Quotation Request

Build:

-   request snapshot;
-   admin queue;
-   request detail;
-   lifecycle states.

Deliverable:

> Customer can submit a requirement and caterer can review it.

## Phase 9 --- Final Quotation

Build:

-   quotation builder;
-   versioning;
-   send;
-   customer quotation page;
-   accept/reject.

Deliverable:

> Caterer can send a final commercial quotation.

## Phase 10 --- Booking/Payment

Build:

-   booking;
-   payment adapter;
-   payment callback;
-   advance;
-   confirmation.

Deliverable:

> Customer can accept, pay advance, and obtain a confirmed booking.

## Phase 11 --- Operational Polish

Build:

-   dashboards;
-   notifications;
-   audit;
-   analytics;
-   error handling;
-   UX refinement.

## Phase 12 --- AI

Build:

-   AI orchestration;
-   catalog tools;
-   event tools;
-   pricing tools;
-   recommendation tools;
-   approval workflow.

## Phase 13 --- Multilingual

Build:

-   language handling;
-   multilingual evaluation;
-   code-switching support.

## Phase 14 --- Voice

Build:

-   STT;
-   TTS;
-   voice UX;
-   critical-value confirmation.

------------------------------------------------------------------------

# 99. Testing Architecture

Testing should mirror architecture.

``` text
Domain
  ↓
Unit Tests

Application Services
  ↓
Service Tests

Repositories
  ↓
Integration Tests

API
  ↓
API Tests

Frontend
  ↓
Component + Interaction Tests

Full System
  ↓
E2E Tests
```

Critical flows should be covered at multiple levels.

------------------------------------------------------------------------

# 100. Test Pyramid

``` text
                 E2E
                /   \
             API/Integration
            /           \
        Unit / Domain / Service
```

Most tests should remain fast unit/service tests.

E2E tests should focus on important user journeys.

------------------------------------------------------------------------

# 101. Critical Automated E2E Flow

The first end-to-end test should cover:

``` text
Login
 ↓
Function
 ↓
Offering
 ↓
Package
 ↓
Customize
 ↓
Guests
 ↓
Budget
 ↓
Event Details
 ↓
Estimate
 ↓
Review
 ↓
Quotation Request
```

Later extend:

``` text
Admin Review
 ↓
Quotation
 ↓
Accept
 ↓
Payment
 ↓
Booking
```

------------------------------------------------------------------------

# 102. Security Testing

Include tests for:

-   unauthorized event access;
-   unauthorized quotation access;
-   admin/customer role separation;
-   OTP abuse;
-   expired sessions;
-   duplicate submissions;
-   payment callback verification;
-   AI tool authorization.

------------------------------------------------------------------------

# 103. Performance Testing

Priority scenarios:

1.  catalog browsing;
2.  event configuration update;
3.  estimate calculation;
4.  quotation request;
5.  admin request queue;
6.  payment callback.

AI performance should be evaluated separately because external model
latency is variable.

------------------------------------------------------------------------

# 104. Deployment Evolution

Initial:

``` text
One API deployment
One frontend deployment
Managed PostgreSQL
Optional Redis
```

Later:

``` text
Multiple API instances
Background workers
CDN
Managed Redis
Read replicas
```

Only introduce complexity when operational requirements justify it.

------------------------------------------------------------------------

# 105. Architectural Decision Records

Important decisions should be captured as ADRs.

Initial ADR candidates:

``` text
ADR-001 Modular Monolith
ADR-002 Next.js + TypeScript
ADR-003 FastAPI + Python
ADR-004 PostgreSQL
ADR-005 Phone OTP Authentication
ADR-006 Deterministic Pricing Engine
ADR-007 Estimate Range Instead of Exact Estimate
ADR-008 AI as Tool-Using Application Layer
ADR-009 Quotation Snapshotting
ADR-010 Payment Provider Adapter
```

This prevents architecture reasoning from being lost during
implementation.

------------------------------------------------------------------------

# 106. Technical Risks

## Risk 1 --- Pricing Complexity

Different package/menu pricing rules may become complicated.

Mitigation:

-   isolate pricing engine;
-   use explicit pricing rules;
-   test heavily;
-   avoid embedding pricing logic in UI/AI.

## Risk 2 --- AI Overreach

AI could produce incorrect actions.

Mitigation:

-   structured tools;
-   validation;
-   authorization;
-   confirmation;
-   deterministic services.

## Risk 3 --- Catalog Mutation

Catalog changes could break historical data.

Mitigation:

-   soft deactivation;
-   snapshots;
-   versioning.

## Risk 4 --- Payment Edge Cases

Provider callbacks can be duplicated or delayed.

Mitigation:

-   idempotency;
-   provider verification;
-   reconciliation.

## Risk 5 --- UX Complexity

Too many planning steps could create friction.

Mitigation:

-   progressive disclosure;
-   persistent progress;
-   AI assistance;
-   mobile-first design.

------------------------------------------------------------------------

# 107. Architecture Quality Gates

Before moving to implementation of a module, confirm:

### Domain

-   business rules are explicit;
-   state transitions are defined;
-   source of truth is clear.

### Backend

-   service boundary exists;
-   validation exists;
-   authorization exists;
-   transaction boundary is defined.

### Database

-   ownership relationships are defined;
-   indexes are planned;
-   historical data behavior is defined.

### Frontend

-   route exists;
-   loading state exists;
-   error state exists;
-   empty state exists;
-   mobile behavior exists.

### AI

Where applicable:

-   tool schema exists;
-   tool authorization exists;
-   mutation approval exists;
-   fallback behavior exists.

### Testing

-   unit tests planned;
-   integration tests planned;
-   E2E impact identified.

------------------------------------------------------------------------

# 108. Definition of Done --- System Architecture

The architecture is ready for implementation when:

1.  domain boundaries are clear;
2.  frontend/backend responsibilities are clear;
3.  database ownership is clear;
4.  pricing is isolated;
5.  quotation and booking states are explicit;
6.  payment integration has an abstraction boundary;
7.  AI has a controlled tool boundary;
8.  security boundaries are defined;
9.  failure behavior is defined;
10. incremental implementation phases are defined.

------------------------------------------------------------------------

# 109. Next Design Artifact

The next document should be:

**`database-design.md`**

It should define the implementation-level PostgreSQL schema, including:

-   every table;
-   columns and data types;
-   primary/foreign keys;
-   unique constraints;
-   indexes;
-   enum/state strategy;
-   relationships;
-   package selection structures;
-   event configuration/versioning;
-   pricing structures;
-   estimate snapshots;
-   quotation snapshots/versioning;
-   booking/payment records;
-   AI conversations/tool calls;
-   notifications;
-   audit logs;
-   migration strategy.

After that, create **`api-spec.md`** with concrete request/response
contracts.
