# Catering Planning & Quotation Platform --- Database Design

**Document:** `database-design.md`\
**Version:** 1.0\
**Status:** Baseline PostgreSQL schema design\
**Depends on:** `planning.md`, `requirements.md`, `product-flows.md`,
`system-design.md`\
**Database:** PostgreSQL\
**Currency:** INR\
**Primary timezone:** Asia/Kolkata / IST\
**Architecture:** Modular monolith

------------------------------------------------------------------------

# 1. Purpose

This document defines the implementation-level database architecture for
the catering planning, quotation, booking, and payment application.

It translates the product and system design into:

-   tables;
-   columns;
-   data types;
-   primary keys;
-   foreign keys;
-   unique constraints;
-   indexes;
-   lifecycle states;
-   relationships;
-   versioning;
-   snapshots;
-   auditability;
-   ownership boundaries;
-   data integrity rules.

The database is the **source of truth for persistent business state**.

The database must not depend on the AI system for correctness.

------------------------------------------------------------------------

# 2. Database Design Principles

## DB-PRINCIPLE-001 --- PostgreSQL as Source of Truth

PostgreSQL stores authoritative persistent application state.

## DB-PRINCIPLE-002 --- Relational Integrity

Foreign keys, unique constraints, check constraints, and transactions
should enforce important invariants.

## DB-PRINCIPLE-003 --- Historical Integrity

Commercial records must preserve enough historical data to remain
understandable after catalog changes.

## DB-PRINCIPLE-004 --- Soft Deactivation

Catalog records should generally be deactivated rather than physically
deleted when historical references exist.

## DB-PRINCIPLE-005 --- Exact Money

Money should use `NUMERIC`/`DECIMAL` rather than binary floating-point.

## DB-PRINCIPLE-006 --- Explicit Versions

Event configurations and quotations should use explicit versions where
historical consistency matters.

## DB-PRINCIPLE-007 --- Server Authorization

Database ownership relationships support server-side authorization but
do not replace application authorization.

## DB-PRINCIPLE-008 --- Minimal Personal Data

Only information necessary for planning, quotation, booking, payment,
and legitimate business contact should be stored.

------------------------------------------------------------------------

# 3. Logical Domain Model

``` text
                         users
                           │
                ┌──────────┴──────────┐
                │                     │
         customer_profiles       admin identity
                │
                │
              events
                │
      ┌─────────┼───────────┐
      │         │           │
 function     offering    package
      │                     │
      └──────── menu ───────┘
                │
        event_menu_items
                │
             estimates
                │
       quotation_requests
                │
           quotations
                │
        quotation_versions
                │
            bookings
                │
            payments
```

Supporting domains:

``` text
AI Conversations
Notifications
Audit Logs
OTP Challenges
Pricing Rules
```

------------------------------------------------------------------------

# 4. Identifier Strategy

Use UUIDs for internal entity identifiers.

Recommended PostgreSQL type:

``` sql
UUID
```

Generation can use PostgreSQL `gen_random_uuid()` or
application-generated UUIDs.

Benefits:

-   avoids predictable sequential public identifiers;
-   works well across distributed/background operations;
-   simplifies future service extraction.

Commercial/user-facing identifiers should still have separate
human-readable numbers where useful.

Examples:

``` text
CR-2026-00125
QT-2026-00082
BK-2026-00041
```

------------------------------------------------------------------------

# 5. Timestamp Strategy

Persistent timestamps should use:

``` sql
TIMESTAMPTZ
```

Examples:

-   `created_at`;
-   `updated_at`;
-   `sent_at`;
-   `accepted_at`;
-   `paid_at`.

Event-local date/time values require explicit timezone handling.

For the V1 Indian deployment, default business timezone is:

``` text
Asia/Kolkata
```

------------------------------------------------------------------------

# 6. Base Conventions

Recommended conventions:

-   table names: plural snake_case;
-   columns: snake_case;
-   primary key: `id`;
-   foreign keys: `<entity>_id`;
-   timestamps: `created_at`, `updated_at`;
-   boolean flags: `is_*`;
-   soft deactivation: `is_active`;
-   monetary amounts: `NUMERIC(12,2)` or larger where required;
-   currency: ISO code such as `INR`.

------------------------------------------------------------------------

# 7. User and Identity Tables

# 7.1 `users`

Represents an authenticated application identity.

  Column               Type            Null Notes
  -------------------- ------------- ------ --------------------------
  id                   UUID              No PK
  phone_number         VARCHAR(20)       No Primary login identifier
  phone_country_code   VARCHAR(8)        No Example `+91`
  role                 VARCHAR(30)       No `CUSTOMER`, `ADMIN`
  is_active            BOOLEAN           No Default true
  last_login_at        TIMESTAMPTZ      Yes 
  created_at           TIMESTAMPTZ       No 
  updated_at           TIMESTAMPTZ       No 

### Constraints

``` text
UNIQUE(phone_number)
```

Role should use either a PostgreSQL enum or a constrained application
enum.

For future flexibility, a lookup/validated string can be preferable to a
database enum.

------------------------------------------------------------------------

# 8. `customer_profiles`

Stores customer information beyond authentication.

  Column       Type             Null Notes
  ------------ -------------- ------ --------------------------------------
  id           UUID               No PK
  user_id      UUID               No FK users
  full_name    VARCHAR(150)      Yes 
  email        VARCHAR(255)      Yes 
  notes        TEXT              Yes Non-sensitive operational notes only
  created_at   TIMESTAMPTZ        No 
  updated_at   TIMESTAMPTZ        No 

### Constraints

``` text
UNIQUE(user_id)
```

The phone number remains on `users`.

------------------------------------------------------------------------

# 9. Caterer Business Tables

Although V1 has one caterer, representing the business explicitly keeps
domain relationships clean.

# 9.1 `caterers`

  Column          Type             Null Notes
  --------------- -------------- ------ ------------------------
  id              UUID               No PK
  business_name   VARCHAR(200)       No 
  description     TEXT              Yes 
  phone_number    VARCHAR(20)       Yes 
  email           VARCHAR(255)      Yes 
  address         TEXT              Yes 
  timezone        VARCHAR(64)        No Default `Asia/Kolkata`
  currency        CHAR(3)            No Default `INR`
  is_active       BOOLEAN            No 
  created_at      TIMESTAMPTZ        No 
  updated_at      TIMESTAMPTZ        No 

------------------------------------------------------------------------

# 10. `caterer_admins`

Associates application users with the caterer.

  Column       Type            Null Notes
  ------------ ------------- ------ -------
  id           UUID              No PK
  caterer_id   UUID              No FK
  user_id      UUID              No FK
  created_at   TIMESTAMPTZ       No 

### Constraints

``` text
UNIQUE(caterer_id, user_id)
```

V1 may contain only one caterer, but the relationship keeps ownership
explicit.

------------------------------------------------------------------------

# 11. Catalog Domain

The catalog is controlled by the caterer.

------------------------------------------------------------------------

# 11.1 `function_types`

  Column        Type             Null Notes
  ------------- -------------- ------ -------
  id            UUID               No PK
  caterer_id    UUID               No FK
  name          VARCHAR(120)       No 
  slug          VARCHAR(140)       No 
  description   TEXT              Yes 
  image_url     TEXT              Yes 
  is_active     BOOLEAN            No 
  sort_order    INTEGER            No 
  created_at    TIMESTAMPTZ        No 
  updated_at    TIMESTAMPTZ        No 

### Constraints

``` text
UNIQUE(caterer_id, slug)
```

### Indexes

``` text
(caterer_id, is_active, sort_order)
```

------------------------------------------------------------------------

# 12. `catering_offerings`

Represents service types such as lunch, dinner, breakfast, etc.

  Column        Type             Null Notes
  ------------- -------------- ------ -------
  id            UUID               No PK
  caterer_id    UUID               No FK
  name          VARCHAR(150)       No 
  slug          VARCHAR(160)       No 
  description   TEXT              Yes 
  image_url     TEXT              Yes 
  is_active     BOOLEAN            No 
  sort_order    INTEGER            No 
  created_at    TIMESTAMPTZ        No 
  updated_at    TIMESTAMPTZ        No 

------------------------------------------------------------------------

# 13. `function_offerings`

Many-to-many relationship between functions and offerings.

  Column             Type            Null
  ------------------ ------------- ------
  id                 UUID              No
  function_type_id   UUID              No
  offering_id        UUID              No
  created_at         TIMESTAMPTZ       No

### Constraints

``` text
UNIQUE(function_type_id, offering_id)
```

------------------------------------------------------------------------

# 14. `menu_categories`

  Column        Type             Null Notes
  ------------- -------------- ------ -------
  id            UUID               No PK
  caterer_id    UUID               No FK
  name          VARCHAR(120)       No 
  slug          VARCHAR(140)       No 
  description   TEXT              Yes 
  sort_order    INTEGER            No 
  is_active     BOOLEAN            No 
  created_at    TIMESTAMPTZ        No 
  updated_at    TIMESTAMPTZ        No 

### Constraint

``` text
UNIQUE(caterer_id, slug)
```

------------------------------------------------------------------------

# 15. `menu_items`

Represents individual dishes.

  Column         Type             Null Notes
  -------------- -------------- ------ -----------------------
  id             UUID               No PK
  caterer_id     UUID               No FK
  category_id    UUID               No FK
  name           VARCHAR(200)       No 
  slug           VARCHAR(220)       No 
  description    TEXT              Yes 
  dietary_type   VARCHAR(40)       Yes e.g. `VEG`, `NON_VEG`
  image_url      TEXT              Yes 
  is_active      BOOLEAN            No 
  sort_order     INTEGER            No 
  metadata       JSONB             Yes Extensible metadata
  created_at     TIMESTAMPTZ        No 
  updated_at     TIMESTAMPTZ        No 

### Constraints

``` text
UNIQUE(caterer_id, slug)
```

### Notes

`metadata` should not contain authoritative pricing that bypasses
pricing rules.

------------------------------------------------------------------------

# 16. Menu Eligibility

The initial schema should support item applicability to functions and
offerings.

# 16.1 `menu_item_functions`

  Column             Type     Null
  ------------------ ------ ------
  menu_item_id       UUID       No
  function_type_id   UUID       No

Constraint:

``` text
PRIMARY KEY(menu_item_id, function_type_id)
```

# 16.2 `menu_item_offerings`

  Column         Type     Null
  -------------- ------ ------
  menu_item_id   UUID       No
  offering_id    UUID       No

Constraint:

``` text
PRIMARY KEY(menu_item_id, offering_id)
```

------------------------------------------------------------------------

# 17. Package Domain

A package is more complex than a simple list of menu items because it
may contain mandatory items, selection groups, and paid additions.

Recommended structure:

``` text
Package
 ├── Package Items
 ├── Selection Groups
 │      └── Selection Group Items
 └── Package Add-ons
```

------------------------------------------------------------------------

# 18. `packages`

  Column        Type             Null Notes
  ------------- -------------- ------ -------
  id            UUID               No PK
  caterer_id    UUID               No FK
  name          VARCHAR(200)       No 
  slug          VARCHAR(220)       No 
  description   TEXT              Yes 
  image_url     TEXT              Yes 
  min_guests    INTEGER           Yes 
  max_guests    INTEGER           Yes 
  is_active     BOOLEAN            No 
  sort_order    INTEGER            No 
  created_at    TIMESTAMPTZ        No 
  updated_at    TIMESTAMPTZ        No 

### Constraints

If both limits exist:

``` text
min_guests > 0
max_guests >= min_guests
```

------------------------------------------------------------------------

# 19. `package_functions`

Associates packages with function types.

  Column             Type     Null
  ------------------ ------ ------
  package_id         UUID       No
  function_type_id   UUID       No

Primary key:

``` text
(package_id, function_type_id)
```

------------------------------------------------------------------------

# 20. `package_offerings`

Associates packages with catering offerings.

  Column        Type     Null
  ------------- ------ ------
  package_id    UUID       No
  offering_id   UUID       No

Primary key:

``` text
(package_id, offering_id)
```

------------------------------------------------------------------------

# 21. `package_items`

Represents mandatory/included package items.

  Column           Type            Null Notes
  ---------------- ------------- ------ -------------------------
  id               UUID              No PK
  package_id       UUID              No FK
  menu_item_id     UUID              No FK
  inclusion_type   VARCHAR(30)       No `MANDATORY`, `INCLUDED`
  sort_order       INTEGER           No 
  created_at       TIMESTAMPTZ       No 

Constraint:

``` text
UNIQUE(package_id, menu_item_id)
```

------------------------------------------------------------------------

# 22. `package_selection_groups`

Represents rules such as "choose 2 of 5 starters".

  Column           Type             Null Notes
  ---------------- -------------- ------ -------
  id               UUID               No PK
  package_id       UUID               No FK
  name             VARCHAR(150)       No 
  description      TEXT              Yes 
  min_selections   INTEGER            No 
  max_selections   INTEGER            No 
  sort_order       INTEGER            No 
  is_required      BOOLEAN            No 
  created_at       TIMESTAMPTZ        No 
  updated_at       TIMESTAMPTZ        No 

### Constraints

``` text
min_selections >= 0
max_selections >= min_selections
```

------------------------------------------------------------------------

# 23. `package_selection_group_items`

  Column               Type            Null
  -------------------- ------------- ------
  id                   UUID              No
  selection_group_id   UUID              No
  menu_item_id         UUID              No
  created_at           TIMESTAMPTZ       No

Constraint:

``` text
UNIQUE(selection_group_id, menu_item_id)
```

------------------------------------------------------------------------

# 24. Package Additions

A package can expose optional paid additions.

# 24.1 `package_addons`

  Column            Type             Null Notes
  ----------------- -------------- ------ -------------------
  id                UUID               No PK
  package_id        UUID               No FK
  menu_item_id      UUID               No FK
  pricing_rule_id   UUID              Yes FK
  display_name      VARCHAR(200)      Yes Optional override
  is_active         BOOLEAN            No 
  sort_order        INTEGER            No 
  created_at        TIMESTAMPTZ        No 

------------------------------------------------------------------------

# 25. Pricing Domain

Pricing should be flexible enough for:

-   package base price;
-   per-person price;
-   menu item additions;
-   fixed charges;
-   service charges;
-   travel cost;
-   discounts;
-   taxes.

The exact commercial formula remains configurable.

------------------------------------------------------------------------

# 26. `pricing_rules`

Generic pricing rule table.

  Column           Type              Null Notes
  ---------------- --------------- ------ ----------------------
  id               UUID                No PK
  caterer_id       UUID                No FK
  name             VARCHAR(200)        No 
  rule_type        VARCHAR(50)         No 
  scope_type       VARCHAR(50)         No 
  amount           NUMERIC(12,2)      Yes 
  percentage       NUMERIC(7,4)       Yes 
  currency         CHAR(3)             No 
  configuration    JSONB              Yes Rule-specific config
  priority         INTEGER             No 
  effective_from   TIMESTAMPTZ        Yes 
  effective_to     TIMESTAMPTZ        Yes 
  is_active        BOOLEAN             No 
  created_at       TIMESTAMPTZ         No 
  updated_at       TIMESTAMPTZ         No 

### Examples of `rule_type`

``` text
PACKAGE_BASE
PER_PERSON
ITEM_ADDON
FIXED_CHARGE
SERVICE_CHARGE
TRAVEL_CHARGE
DISCOUNT
TAX
```

The exact rule vocabulary should be finalized before implementation.

------------------------------------------------------------------------

# 27. Pricing Rule Scope

`scope_type` may identify the target:

``` text
CATERER
PACKAGE
MENU_ITEM
OFFERING
FUNCTION
EVENT
```

Relationships can be represented through dedicated mapping tables or a
validated configuration object.

For strong relational integrity, dedicated mappings are preferable for
core rules.

------------------------------------------------------------------------

# 28. `package_pricing_rules`

  Column            Type     Null
  ----------------- ------ ------
  package_id        UUID       No
  pricing_rule_id   UUID       No

Primary key:

``` text
(package_id, pricing_rule_id)
```

------------------------------------------------------------------------

# 29. `menu_item_pricing_rules`

  Column            Type     Null
  ----------------- ------ ------
  menu_item_id      UUID       No
  pricing_rule_id   UUID       No

Primary key:

``` text
(menu_item_id, pricing_rule_id)
```

------------------------------------------------------------------------

# 30. Pricing Version

Pricing configurations should be traceable.

A practical approach is to introduce:

# 30.1 `pricing_versions`

  Column           Type            Null
  ---------------- ------------- ------
  id               UUID              No
  caterer_id       UUID              No
  version_number   INTEGER           No
  effective_from   TIMESTAMPTZ       No
  effective_to     TIMESTAMPTZ      Yes
  is_active        BOOLEAN           No
  created_at       TIMESTAMPTZ       No

Constraint:

``` text
UNIQUE(caterer_id, version_number)
```

Pricing rules can reference a pricing version.

------------------------------------------------------------------------

# 31. Event Planning Domain

The event is the central planning aggregate.

------------------------------------------------------------------------

# 32. `events`

  Column                  Type              Null Notes
  ----------------------- --------------- ------ ----------------------
  id                      UUID                No PK
  customer_id             UUID                No FK customer_profiles
  caterer_id              UUID                No FK
  function_type_id        UUID               Yes FK
  offering_id             UUID               Yes FK
  package_id              UUID               Yes FK
  status                  VARCHAR(40)         No 
  guest_count             INTEGER            Yes 
  budget_min              NUMERIC(12,2)      Yes 
  budget_max              NUMERIC(12,2)      Yes 
  event_date              DATE               Yes 
  event_time              TIME               Yes 
  timezone                VARCHAR(64)         No 
  venue_name              VARCHAR(250)       Yes 
  venue_address           TEXT               Yes 
  venue_notes             TEXT               Yes 
  customer_notes          TEXT               Yes 
  configuration_version   INTEGER             No 
  created_at              TIMESTAMPTZ         No 
  updated_at              TIMESTAMPTZ         No 

### State

Initial:

``` text
DRAFT
SUBMITTED
CANCELLED
COMPLETED
```

The exact state model may add `ARCHIVED` or similar later.

------------------------------------------------------------------------

# 33. Budget Representation

Using two columns supports a range:

``` text
budget_min
budget_max
```

Examples:

### Target budget ₹1,00,000

``` text
budget_min = 100000
budget_max = 100000
```

### Range ₹80,000--₹1,00,000

``` text
budget_min = 80000
budget_max = 100000
```

The API can alternatively accept a single target budget and normalize it
internally.

------------------------------------------------------------------------

# 34. Event Configuration Versioning

The `configuration_version` integer increments whenever material event
configuration changes.

Example:

``` text
Event
version = 4

Customer adds dessert

version = 5
```

This supports optimistic concurrency and estimate freshness.

------------------------------------------------------------------------

# 35. `event_versions`

For stronger historical traceability, maintain an event version table.

  Column               Type             Null Notes
  -------------------- -------------- ------ -----------------------------
  id                   UUID               No PK
  event_id             UUID               No FK
  version_number       INTEGER            No 
  snapshot             JSONB              No Full configuration snapshot
  changed_by_user_id   UUID              Yes FK
  change_reason        VARCHAR(250)      Yes 
  created_at           TIMESTAMPTZ        No 

Constraint:

``` text
UNIQUE(event_id, version_number)
```

This is especially useful when AI and UI can both modify event
configuration.

------------------------------------------------------------------------

# 36. `event_menu_items`

Represents current event menu selections.

  Column               Type              Null Notes
  -------------------- --------------- ------ ------------------------------------
  id                   UUID                No PK
  event_id             UUID                No FK
  menu_item_id         UUID                No FK
  source_type          VARCHAR(30)         No `PACKAGE`, `CUSTOM`, `ADDON`, `AI`
  selection_group_id   UUID               Yes FK package selection group
  quantity             NUMERIC(10,2)      Yes Optional future quantity model
  is_included          BOOLEAN             No 
  created_at           TIMESTAMPTZ         No 
  updated_at           TIMESTAMPTZ         No 

A uniqueness strategy should prevent accidental duplicate logical
selections where the product does not support duplicates.

Possible:

``` text
UNIQUE(event_id, menu_item_id, selection_group_id)
```

------------------------------------------------------------------------

# 37. Event Item Metadata

Additional selection context may be stored in:

``` text
metadata JSONB
```

Examples:

-   customer-selected variation;
-   UI source;
-   recommendation ID.

Do not use this to bypass relational business rules.

------------------------------------------------------------------------

# 38. Estimate Domain

Estimates are generated from a specific event configuration.

------------------------------------------------------------------------

# 39. `estimates`

  Column               Type              Null Notes
  -------------------- --------------- ------ -------------------------
  id                   UUID                No PK
  event_id             UUID                No FK
  event_version        INTEGER             No 
  pricing_version_id   UUID               Yes FK
  currency             CHAR(3)             No `INR`
  lower_amount         NUMERIC(12,2)       No 
  upper_amount         NUMERIC(12,2)       No 
  budget_min           NUMERIC(12,2)      Yes Snapshot
  budget_max           NUMERIC(12,2)      Yes Snapshot
  budget_status        VARCHAR(30)        Yes 
  breakdown            JSONB               No Customer-safe breakdown
  generated_at         TIMESTAMPTZ         No 
  expires_at           TIMESTAMPTZ        Yes Optional
  created_at           TIMESTAMPTZ         No 

### Constraints

``` text
lower_amount >= 0
upper_amount >= lower_amount
```

The estimate references the configuration version used.

------------------------------------------------------------------------

# 40. Estimate Breakdown

`breakdown` should contain customer-safe information.

Example:

``` json
{
  "base_package": 90000,
  "additions": 6000,
  "service_charges": 3000,
  "tax": 4000
}
```

The exact structure belongs in the API/schema design.

Internal costs and margins must not be exposed through this field.

------------------------------------------------------------------------

# 41. Estimate Freshness

An estimate is current only when:

``` text
estimate.event_version == events.configuration_version
```

and its pricing configuration remains valid under the applicable pricing
rules.

If the event changes:

``` text
estimate becomes stale
```

The UI should trigger recalculation or show that a refresh is required.

------------------------------------------------------------------------

# 42. Quotation Request Domain

------------------------------------------------------------------------

# 43. `quotation_requests`

  Column                    Type            Null Notes
  ------------------------- ------------- ------ -----------------------------
  id                        UUID              No PK
  request_number            VARCHAR(40)       No Public identifier
  event_id                  UUID              No FK
  customer_id               UUID              No FK
  caterer_id                UUID              No FK
  status                    VARCHAR(40)       No 
  submitted_event_version   INTEGER           No 
  snapshot                  JSONB             No Stable customer requirement
  submitted_at              TIMESTAMPTZ       No 
  reviewed_at               TIMESTAMPTZ      Yes 
  created_at                TIMESTAMPTZ       No 
  updated_at                TIMESTAMPTZ       No 

### Constraint

``` text
UNIQUE(request_number)
```

------------------------------------------------------------------------

# 44. Quotation Request Snapshot

The snapshot should preserve:

``` text
customer contact
function
offering
package
menu
guest count
budget
event date
event time
venue
notes
customer-visible estimate
catalog references/snapshots
```

This prevents later customer edits from changing the submitted request.

------------------------------------------------------------------------

# 45. Quotation Domain

Quotation should be separated into header/version/line items.

------------------------------------------------------------------------

# 46. `quotations`

Represents the logical quotation.

  Column                 Type            Null
  ---------------------- ------------- ------
  id                     UUID              No
  quotation_number       VARCHAR(40)       No
  quotation_request_id   UUID              No
  customer_id            UUID              No
  caterer_id             UUID              No
  status                 VARCHAR(40)       No
  active_version_id      UUID             Yes
  created_at             TIMESTAMPTZ       No
  updated_at             TIMESTAMPTZ       No

### Constraint

``` text
UNIQUE(quotation_number)
```

------------------------------------------------------------------------

# 47. `quotation_versions`

Represents a commercial version.

  Column               Type              Null Notes
  -------------------- --------------- ------ -----------------------
  id                   UUID                No PK
  quotation_id         UUID                No FK
  version_number       INTEGER             No 
  status               VARCHAR(30)         No `DRAFT`, `SENT`, etc.
  currency             CHAR(3)             No 
  subtotal             NUMERIC(12,2)       No 
  discount_amount      NUMERIC(12,2)       No 
  tax_amount           NUMERIC(12,2)       No 
  total_amount         NUMERIC(12,2)       No 
  advance_amount       NUMERIC(12,2)      Yes 
  advance_percentage   NUMERIC(7,4)       Yes 
  valid_until          TIMESTAMPTZ        Yes 
  terms                TEXT               Yes 
  notes                TEXT               Yes 
  event_snapshot       JSONB               No 
  created_by_user_id   UUID                No 
  sent_at              TIMESTAMPTZ        Yes 
  accepted_at          TIMESTAMPTZ        Yes 
  rejected_at          TIMESTAMPTZ        Yes 
  created_at           TIMESTAMPTZ         No 

Constraint:

``` text
UNIQUE(quotation_id, version_number)
```

------------------------------------------------------------------------

# 48. `quotation_items`

Commercial line items for a quotation version.

  Column                 Type              Null Notes
  ---------------------- --------------- ------ ----------------------
  id                     UUID                No PK
  quotation_version_id   UUID                No FK
  line_type              VARCHAR(40)         No 
  description            VARCHAR(300)        No Snapshot description
  quantity               NUMERIC(12,2)      Yes 
  unit                   VARCHAR(50)        Yes 
  unit_price             NUMERIC(12,2)      Yes 
  amount                 NUMERIC(12,2)       No 
  source_menu_item_id    UUID               Yes Historical reference
  source_package_id      UUID               Yes Historical reference
  metadata               JSONB              Yes 
  sort_order             INTEGER             No 
  created_at             TIMESTAMPTZ         No 

The description and price are snapshotted because catalog values can
later change.

------------------------------------------------------------------------

# 49. Quotation Version Integrity

When quotation version becomes `SENT`:

-   its commercial fields become immutable;
-   line items are immutable;
-   active version can be replaced only through a new version;
-   the previous version becomes `SUPERSEDED` if appropriate.

------------------------------------------------------------------------

# 50. Booking Domain

------------------------------------------------------------------------

# 51. `bookings`

  Column                 Type              Null Notes
  ---------------------- --------------- ------ -----------------------------
  id                     UUID                No PK
  booking_number         VARCHAR(40)         No 
  quotation_id           UUID                No FK
  quotation_version_id   UUID                No Accepted commercial version
  customer_id            UUID                No FK
  caterer_id             UUID                No FK
  status                 VARCHAR(40)         No 
  event_snapshot         JSONB               No Accepted event data
  total_amount           NUMERIC(12,2)       No 
  advance_required       NUMERIC(12,2)      Yes 
  advance_paid           NUMERIC(12,2)       No Default 0
  balance_amount         NUMERIC(12,2)       No 
  confirmed_at           TIMESTAMPTZ        Yes 
  completed_at           TIMESTAMPTZ        Yes 
  cancelled_at           TIMESTAMPTZ        Yes 
  cancellation_reason    TEXT               Yes 
  created_at             TIMESTAMPTZ         No 
  updated_at             TIMESTAMPTZ         No 

### Constraint

``` text
UNIQUE(booking_number)
```

------------------------------------------------------------------------

# 52. Booking Snapshot

The booking should preserve enough data to remain understandable even
if:

-   customer profile changes;
-   catalog changes;
-   package changes;
-   pricing changes.

This may include:

``` text
event details
menu summary
guest count
accepted quotation amount
quotation version
terms
```

------------------------------------------------------------------------

# 53. Payments

------------------------------------------------------------------------

# 54. `payments`

  Column                Type              Null Notes
  --------------------- --------------- ------ -------
  id                    UUID                No PK
  booking_id            UUID                No FK
  customer_id           UUID                No FK
  amount                NUMERIC(12,2)       No 
  currency              CHAR(3)             No 
  payment_method        VARCHAR(40)         No 
  status                VARCHAR(40)         No 
  provider              VARCHAR(60)        Yes 
  provider_payment_id   VARCHAR(150)       Yes 
  provider_order_id     VARCHAR(150)       Yes 
  idempotency_key       VARCHAR(150)       Yes 
  paid_at               TIMESTAMPTZ        Yes 
  verified_at           TIMESTAMPTZ        Yes 
  metadata              JSONB              Yes 
  created_at            TIMESTAMPTZ         No 
  updated_at            TIMESTAMPTZ         No 

### Constraints

Provider identifiers should be unique when present.

Example:

``` text
UNIQUE(provider, provider_payment_id)
```

------------------------------------------------------------------------

# 55. Payment Status

Baseline:

``` text
CREATED
PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED
```

The exact provider lifecycle may require additional states.

------------------------------------------------------------------------

# 56. Payment Events

For robust reconciliation, introduce:

# 56.1 `payment_events`

  Column               Type             Null
  -------------------- -------------- ------
  id                   UUID               No
  payment_id           UUID              Yes
  provider             VARCHAR(60)        No
  external_event_id    VARCHAR(200)       No
  event_type           VARCHAR(100)       No
  payload              JSONB              No
  signature_verified   BOOLEAN            No
  processed_at         TIMESTAMPTZ       Yes
  created_at           TIMESTAMPTZ        No

Constraint:

``` text
UNIQUE(provider, external_event_id)
```

This provides callback idempotency.

------------------------------------------------------------------------

# 57. OTP Tables

------------------------------------------------------------------------

# 58. `otp_challenges`

  Column               Type             Null
  -------------------- -------------- ------
  id                   UUID               No
  phone_number         VARCHAR(20)        No
  country_code         VARCHAR(8)         No
  code_hash            VARCHAR(255)       No
  expires_at           TIMESTAMPTZ        No
  attempt_count        INTEGER            No
  max_attempts         INTEGER            No
  consumed_at          TIMESTAMPTZ       Yes
  provider             VARCHAR(60)       Yes
  provider_reference   VARCHAR(200)      Yes
  created_at           TIMESTAMPTZ        No

Indexes:

``` text
(phone_number, created_at)
(expires_at)
```

OTP code itself should not be stored.

------------------------------------------------------------------------

# 59. Session Storage

If sessions are server-side, introduce:

# 59.1 `sessions`

  Column         Type             Null
  -------------- -------------- ------
  id             UUID               No
  user_id        UUID               No
  token_hash     VARCHAR(255)       No
  expires_at     TIMESTAMPTZ        No
  revoked_at     TIMESTAMPTZ       Yes
  created_at     TIMESTAMPTZ        No
  last_seen_at   TIMESTAMPTZ       Yes

A Redis-backed session implementation is also possible. The database
design should not require both.

------------------------------------------------------------------------

# 60. AI Domain

AI persistence should support conversations without making conversations
authoritative.

------------------------------------------------------------------------

# 61. `ai_conversations`

  Column        Type            Null
  ------------- ------------- ------
  id            UUID              No
  customer_id   UUID              No
  event_id      UUID             Yes
  language      VARCHAR(40)      Yes
  status        VARCHAR(30)       No
  created_at    TIMESTAMPTZ       No
  updated_at    TIMESTAMPTZ       No

A conversation may be linked to an event but does not own the event.

------------------------------------------------------------------------

# 62. `ai_messages`

  Column               Type             Null
  -------------------- -------------- ------
  id                   UUID               No
  conversation_id      UUID               No
  role                 VARCHAR(30)        No
  content              TEXT              Yes
  structured_content   JSONB             Yes
  model_provider       VARCHAR(60)       Yes
  model_name           VARCHAR(100)      Yes
  token_usage          JSONB             Yes
  created_at           TIMESTAMPTZ        No

Roles:

``` text
SYSTEM
USER
ASSISTANT
TOOL
```

------------------------------------------------------------------------

# 63. `ai_tool_calls`

Store tool invocation metadata separately where detailed
auditing/evaluation is useful.

  Column                 Type             Null
  ---------------------- -------------- ------
  id                     UUID               No
  conversation_id        UUID               No
  message_id             UUID              Yes
  tool_name              VARCHAR(120)       No
  action_type            VARCHAR(30)        No
  input_payload          JSONB              No
  output_payload         JSONB             Yes
  authorization_result   VARCHAR(30)        No
  execution_status       VARCHAR(30)        No
  event_version_before   INTEGER           Yes
  event_version_after    INTEGER           Yes
  error_code             VARCHAR(100)      Yes
  created_at             TIMESTAMPTZ        No
  completed_at           TIMESTAMPTZ       Yes

Sensitive information should be redacted before persistence where
appropriate.

------------------------------------------------------------------------

# 64. AI Proposed Changes

A structured proposal table can make approval explicit.

# 64.1 `ai_change_proposals`

  Column                  Type            Null
  ----------------------- ------------- ------
  id                      UUID              No
  conversation_id         UUID              No
  event_id                UUID              No
  base_event_version      INTEGER           No
  proposed_changes        JSONB             No
  explanation             TEXT             Yes
  status                  VARCHAR(30)       No
  approved_at             TIMESTAMPTZ      Yes
  rejected_at             TIMESTAMPTZ      Yes
  applied_event_version   INTEGER          Yes
  created_at              TIMESTAMPTZ       No
  updated_at              TIMESTAMPTZ       No

Statuses:

``` text
PROPOSED
APPROVED
REJECTED
APPLIED
EXPIRED
FAILED
```

This is useful for traceability.

------------------------------------------------------------------------

# 65. Notifications

------------------------------------------------------------------------

# 66. `notifications`

  Column               Type             Null
  -------------------- -------------- ------
  id                   UUID               No
  recipient_user_id    UUID               No
  type                 VARCHAR(80)        No
  channel              VARCHAR(30)        No
  title                VARCHAR(250)      Yes
  body                 TEXT              Yes
  entity_type          VARCHAR(50)       Yes
  entity_id            UUID              Yes
  status               VARCHAR(30)        No
  provider             VARCHAR(60)       Yes
  provider_reference   VARCHAR(200)      Yes
  sent_at              TIMESTAMPTZ       Yes
  delivered_at         TIMESTAMPTZ       Yes
  read_at              TIMESTAMPTZ       Yes
  failure_reason       TEXT              Yes
  created_at           TIMESTAMPTZ        No
  updated_at           TIMESTAMPTZ        No

Channels:

``` text
IN_APP
SMS
WHATSAPP
EMAIL
```

Not all need to be enabled in MVP.

------------------------------------------------------------------------

# 67. Notification Idempotency

For important lifecycle events, notifications should have a
deduplication strategy.

For example:

``` text
quotation_sent + quotation_version_id + channel
```

should not accidentally create repeated notifications during retries.

------------------------------------------------------------------------

# 68. Audit Logs

------------------------------------------------------------------------

# 69. `audit_logs`

  Column          Type             Null
  --------------- -------------- ------
  id              UUID               No
  actor_user_id   UUID              Yes
  actor_type      VARCHAR(30)        No
  action          VARCHAR(100)       No
  entity_type     VARCHAR(60)        No
  entity_id       UUID              Yes
  request_id      VARCHAR(100)      Yes
  before_state    JSONB             Yes
  after_state     JSONB             Yes
  metadata        JSONB             Yes
  created_at      TIMESTAMPTZ        No

Audit records should be append-only from the application's perspective.

------------------------------------------------------------------------

# 70. Audit Retention

Audit retention should be aligned with business/legal requirements.

Do not delete audit records merely because a catalog item was
deactivated.

------------------------------------------------------------------------

# 71. Optional Analytics Events

For product analytics, use:

# 71.1 `analytics_events`

  Column        Type             Null
  ------------- -------------- ------
  id            UUID               No
  user_id       UUID              Yes
  session_id    UUID              Yes
  event_name    VARCHAR(120)       No
  entity_type   VARCHAR(60)       Yes
  entity_id     UUID              Yes
  properties    JSONB             Yes
  occurred_at   TIMESTAMPTZ        No

Analytics data should avoid unnecessary personal information.

This table can later be replaced by an external analytics platform.

------------------------------------------------------------------------

# 72. Relationships

Core relationships:

``` text
users
 ├── customer_profiles
 └── caterer_admins

caterers
 ├── function_types
 ├── catering_offerings
 ├── menu_categories
 ├── menu_items
 ├── packages
 ├── pricing_rules
 └── events

function_types
 └── function_offerings
       └── catering_offerings

menu_categories
 └── menu_items

packages
 ├── package_functions
 ├── package_offerings
 ├── package_items
 ├── package_selection_groups
 │      └── package_selection_group_items
 └── package_addons

customer_profiles
 └── events
       ├── event_versions
       ├── event_menu_items
       ├── estimates
       └── quotation_requests
              └── quotations
                    └── quotation_versions
                          └── quotation_items
                                │
                                ▼
                             bookings
                                │
                                ▼
                             payments
```

------------------------------------------------------------------------

# 73. Foreign Key Delete Strategy

Default recommendation:

### Catalog → historical records

Use:

``` text
ON DELETE RESTRICT
```

or soft deactivation.

### Customer → events

Do not cascade-delete commercial records casually.

### Quotation → versions

Cascade may be acceptable only for draft-only internal records, but
historical commercial data should be preserved.

### Booking → payments

Never cascade-delete payment history.

------------------------------------------------------------------------

# 74. Soft Deletion Strategy

For catalog:

``` text
is_active = false
```

rather than deletion.

For customers:

Avoid simple deletion where financial/commercial history must remain.

Use a documented anonymization/deactivation process if required.

------------------------------------------------------------------------

# 75. Unique Constraints

Important unique constraints include:

``` text
users.phone_number

function_types(caterer_id, slug)

catering_offerings(caterer_id, slug)

menu_categories(caterer_id, slug)

menu_items(caterer_id, slug)

packages(caterer_id, slug)

quotation_requests.request_number

quotations.quotation_number

quotation_versions(quotation_id, version_number)

bookings.booking_number

payment(provider, provider_payment_id)

payment_events(provider, external_event_id)

pricing_versions(caterer_id, version_number)
```

------------------------------------------------------------------------

# 76. Index Strategy

Indexes should prioritize actual query patterns.

## Customer

``` text
customer_profiles.user_id
events.customer_id
events(customer_id, status)
quotation_requests.customer_id
quotations.customer_id
bookings.customer_id
```

## Caterer/Admin

``` text
quotation_requests(caterer_id, status)
quotation_requests(caterer_id, submitted_at)
bookings(caterer_id, status)
bookings(caterer_id, event_date)
```

## Catalog

``` text
function_types(caterer_id, is_active)
catering_offerings(caterer_id, is_active)
menu_items(caterer_id, category_id, is_active)
packages(caterer_id, is_active)
```

## Payments

``` text
payments.booking_id
payments(provider, provider_payment_id)
payment_events(provider, external_event_id)
```

## AI

``` text
ai_conversations.customer_id
ai_conversations.event_id
ai_messages.conversation_id
ai_tool_calls.conversation_id
```

------------------------------------------------------------------------

# 77. Full-Text/Search Considerations

For a growing menu catalog, PostgreSQL can support search using:

-   `pg_trgm`;
-   full-text search;
-   normalized search columns.

Initially, simple indexed search may be sufficient.

Do not introduce Elasticsearch/OpenSearch unless catalog/search
requirements justify it.

------------------------------------------------------------------------

# 78. JSONB Usage Rules

JSONB is useful for:

-   provider payloads;
-   extensible metadata;
-   snapshots;
-   AI structured outputs;
-   estimate breakdown;
-   recommendation proposals.

JSONB should not replace relational modeling for frequently queried core
business entities.

Bad:

``` text
event.menu = giant JSON blob
```

Better:

``` text
events
event_menu_items
menu_items
```

with snapshots added where historical preservation is needed.

------------------------------------------------------------------------

# 79. Snapshot Strategy

There are three important snapshots:

## 79.1 Estimate

Snapshot:

-   event version;
-   pricing version;
-   customer-visible breakdown.

## 79.2 Quotation Request

Snapshot:

-   customer requirement;
-   event configuration;
-   estimate context.

## 79.3 Final Quotation

Snapshot:

-   event;
-   commercial line items;
-   terms;
-   totals.

## 79.4 Booking

Snapshot:

-   accepted quotation version;
-   event summary;
-   commercial total.

------------------------------------------------------------------------

# 80. Why Snapshots Are Required

Suppose:

``` text
Menu item price = ₹100
```

Customer requests quotation.

Later:

``` text
Menu item price = ₹130
```

The old quotation must still represent the original commercial
agreement.

Therefore:

``` text
Current Catalog
     │
     ├── changes over time
     │
     ▼
Historical Quotation Snapshot
     │
     └── remains unchanged
```

------------------------------------------------------------------------

# 81. Optimistic Concurrency

Event updates should use the configuration version.

Example:

``` text
Client reads event version 10

Request A updates event
version → 11

Request B still has version 10

Request B
→ conflict
```

Backend can return:

``` text
EVENT_VERSION_CONFLICT
```

The frontend then refreshes/reconciles.

This is especially important when both AI and UI can modify an event.

------------------------------------------------------------------------

# 82. Transaction Requirements

## Event Update

Update:

``` text
events
event_menu_items
event_versions
```

in one transaction where appropriate.

## Quotation Request

Create:

``` text
quotation_requests
snapshot
audit event
```

atomically where appropriate.

## Quotation

Create:

``` text
quotations
quotation_versions
quotation_items
```

within the appropriate transaction.

## Booking

Create booking only after quotation acceptance state is successfully
committed.

## Payment

Record verified payment and update booking financial state
transactionally.

------------------------------------------------------------------------

# 83. Money Integrity

Never calculate:

``` python
float(100.10)
```

as the authoritative commercial value.

Prefer:

``` text
NUMERIC(12,2)
```

or integer minor units.

For INR, integer paise is also viable:

``` text
100000 paise = ₹1,000.00
```

The implementation should choose one strategy consistently.

------------------------------------------------------------------------

# 84. Currency Strategy

Every commercial snapshot should store its currency.

V1:

``` text
INR
```

Even though the application currently supports only INR, storing
currency explicitly prevents future ambiguity.

------------------------------------------------------------------------

# 85. Time Strategy

Store:

-   event date separately;
-   event local time separately;
-   timezone explicitly.

Example:

``` text
event_date = 2026-10-18
event_time = 19:00
timezone = Asia/Kolkata
```

This avoids accidentally converting a local event time through server
UTC handling.

------------------------------------------------------------------------

# 86. Data Ownership

Customer-owned:

``` text
events
event_versions
event_menu_items
quotation_requests
customer-facing conversations
```

Caterer-owned:

``` text
catalog
pricing
packages
quotations
booking operations
```

Shared historical records:

``` text
bookings
payments
audit logs
```

------------------------------------------------------------------------

# 87. Customer Data Access

A customer query should always scope by authenticated ownership.

Example:

``` text
WHERE event.customer_id = current_customer_id
```

Never rely solely on a frontend-provided customer ID.

------------------------------------------------------------------------

# 88. Admin Data Access

Admin queries should scope by caterer:

``` text
WHERE entity.caterer_id = current_admin_caterer_id
```

Even though V1 has one caterer, this prevents accidental cross-business
assumptions.

------------------------------------------------------------------------

# 89. State Modeling

Lifecycle states should be represented consistently.

Recommended application-level enums:

``` text
UserRole
EventStatus
QuotationRequestStatus
QuotationStatus
QuotationVersionStatus
BookingStatus
PaymentStatus
NotificationStatus
AIProposalStatus
```

Whether these are PostgreSQL enums or constrained strings is an
implementation decision.

For a fast-changing product, validated strings are often easier to
migrate.

------------------------------------------------------------------------

# 90. State Transition Integrity

The database alone should not determine all state transitions.

Use application services:

``` text
QuotationService.accept()
BookingService.confirm()
PaymentService.record_success()
```

The service validates:

-   current state;
-   actor;
-   business conditions;
-   version;
-   transaction.

------------------------------------------------------------------------

# 91. Example Event State Constraints

A `SUBMITTED` event should have enough required planning data to support
its quotation request.

Potential requirements:

``` text
function_type_id IS NOT NULL
offering_id IS NOT NULL
guest_count > 0
event_date IS NOT NULL
event_time IS NOT NULL
venue data present
```

Exact mandatory fields should be enforced at the application service
boundary and with database constraints where practical.

------------------------------------------------------------------------

# 92. Example Quotation Acceptance Constraints

Before accepting:

``` text
quotation version = SENT
current time <= valid_until
quotation version = active version
booking conditions satisfied
```

The acceptance transaction must verify these conditions at execution
time.

------------------------------------------------------------------------

# 93. Example Booking Constraints

A booking should reference:

``` text
quotation
accepted quotation version
customer
caterer
```

and preserve:

``` text
total amount
advance requirement
event snapshot
```

This prevents later quotation edits from changing the booking's
commercial meaning.

------------------------------------------------------------------------

# 94. Payment-to-Booking Consistency

Maintain:

``` text
advance_paid <= total_amount
balance_amount = total_amount - advance_paid
```

This can be enforced partly in application logic and validated with
database constraints.

The final amount should never become negative.

------------------------------------------------------------------------

# 95. Payment Reconciliation

Payment provider data should be considered externally authoritative
until verified.

Flow:

``` text
Provider Event
   ↓
Signature Verification
   ↓
Provider Reference Lookup
   ↓
Idempotency Check
   ↓
Payment Record
   ↓
Booking Update
```

------------------------------------------------------------------------

# 96. AI Data Retention

AI conversation retention should be configurable.

Possible categories:

-   active conversations;
-   completed conversations;
-   evaluation samples;
-   audit-related tool calls.

AI logs should not retain unnecessary sensitive personal data
indefinitely.

------------------------------------------------------------------------

# 97. AI Data Isolation

AI conversation records must be scoped to the authenticated customer.

A customer cannot query:

``` text
another customer's ai_conversations
```

even if they know a conversation UUID.

------------------------------------------------------------------------

# 98. AI Tool Auditability

For state-changing AI actions, preserve:

``` text
conversation
tool call
proposal
approval
application mutation
event version
```

This allows reconstruction of what happened.

------------------------------------------------------------------------

# 99. Database Migration Structure

Recommended:

``` text
backend/
└── migrations/
    ├── versions/
    │   ├── 0001_initial.py
    │   ├── 0002_catalog.py
    │   ├── 0003_events.py
    │   ├── 0004_pricing.py
    │   ├── 0005_quotations.py
    │   ├── 0006_bookings.py
    │   ├── 0007_payments.py
    │   └── ...
    └── env.py
```

Use Alembic or an equivalent migration system.

------------------------------------------------------------------------

# 100. Migration Rules

1.  Every schema change has a migration.
2.  Migrations are committed to source control.
3.  Production migrations are reviewed.
4.  Destructive changes require explicit planning.
5.  Historical data must be preserved.
6.  Data backfills should be separate from structural changes where
    practical.
7.  Rollback strategy should be considered for every production
    migration.

------------------------------------------------------------------------

# 101. Seed Data

Development/staging should have deterministic seed data.

Example:

``` text
Caterer
Functions:
  Wedding
  Birthday
  Corporate

Offerings:
  Breakfast
  Lunch
  Dinner

Categories:
  Starters
  Main Course
  Rice
  Breads
  Desserts

Packages:
  Silver
  Gold
  Platinum
```

Production seed data should be controlled rather than blindly copied
from development.

------------------------------------------------------------------------

# 102. Local Development Database

Recommended Docker Compose services:

``` text
postgres
redis (optional)
```

Example conceptual connection:

``` text
FastAPI
   ↓
postgres:5432
```

The database should be initialized through migrations and seed scripts.

------------------------------------------------------------------------

# 103. Backup Considerations

Back up:

-   relational tables;
-   important JSONB snapshots;
-   audit logs;
-   payment records.

If images/documents are stored externally, database backup alone is
insufficient.

Object storage must have its own backup/versioning strategy.

------------------------------------------------------------------------

# 104. Data Integrity Checklist

Before database implementation is considered complete:

-   [ ] every FK is defined;
-   [ ] every important uniqueness rule is defined;
-   [ ] money types are exact;
-   [ ] timestamps use timezone-aware types;
-   [ ] event ownership is enforced;
-   [ ] quotation snapshots exist;
-   [ ] booking references accepted quotation version;
-   [ ] payment callbacks are idempotent;
-   [ ] catalog deletion cannot destroy historical records;
-   [ ] AI mutations are auditable;
-   [ ] indexes cover core query patterns;
-   [ ] migrations are reproducible.

------------------------------------------------------------------------

# 105. Initial Table Inventory

Core tables:

``` text
users
customer_profiles
caterers
caterer_admins

function_types
catering_offerings
function_offerings

menu_categories
menu_items
menu_item_functions
menu_item_offerings

packages
package_functions
package_offerings
package_items
package_selection_groups
package_selection_group_items
package_addons

pricing_versions
pricing_rules
package_pricing_rules
menu_item_pricing_rules

events
event_versions
event_menu_items
estimates

quotation_requests
quotations
quotation_versions
quotation_items

bookings
payments
payment_events

otp_challenges
sessions

ai_conversations
ai_messages
ai_tool_calls
ai_change_proposals

notifications
audit_logs
analytics_events
```

------------------------------------------------------------------------

# 106. Tables That May Be Deferred

To keep MVP implementation manageable, these can be introduced when
their corresponding feature is implemented:

``` text
event_versions
pricing_versions
payment_events
sessions
ai_tool_calls
ai_change_proposals
analytics_events
```

However, quotation/version snapshots and payment idempotency should not
be deferred if those workflows are included.

------------------------------------------------------------------------

# 107. MVP Database Boundary

The first working MVP should prioritize:

``` text
users
customer_profiles
caterers
caterer_admins

function_types
catering_offerings
function_offerings
menu_categories
menu_items
packages
package_* tables

pricing_rules

events
event_menu_items
estimates

quotation_requests
quotations
quotation_versions
quotation_items

bookings
payments
payment_events

otp_challenges
notifications
audit_logs
```

AI tables can be added during the AI phase.

------------------------------------------------------------------------

# 108. Future Expansion

The schema can later support:

-   multiple admin roles;
-   multiple caterer branches;
-   customer addresses;
-   richer venue data;
-   recurring customers;
-   invoice documents;
-   refunds;
-   cancellation policies;
-   supplier/costing modules;
-   inventory;
-   production planning.

These are intentionally not required for the current product.

------------------------------------------------------------------------

# 109. Important Non-Goals

Do not add tables merely because a catering ERP might eventually need
them.

Specifically avoid V1 tables for:

``` text
fleet vehicles
driver schedules
equipment assets
warehouse bins
supplier catalogs
employee payroll
complex accounting ledgers
marketplace vendors
```

unless a new requirement explicitly introduces them.

------------------------------------------------------------------------

# 110. Database Architecture Summary

The database follows this progression:

``` text
CATALOG
   ↓
EVENT CONFIGURATION
   ↓
ESTIMATE
   ↓
QUOTATION REQUEST SNAPSHOT
   ↓
FINAL QUOTATION VERSION
   ↓
BOOKING SNAPSHOT
   ↓
PAYMENTS
```

Supporting systems:

``` text
AUTH
AI
NOTIFICATIONS
AUDIT
ANALYTICS
```

The key architectural principle is:

> Mutable operational data feeds forward into immutable or versioned
> commercial records.

------------------------------------------------------------------------

# 111. Final Database Invariants

The following invariants should be treated as non-negotiable:

1.  A customer cannot access another customer's event.
2.  An admin cannot access another caterer's data if multiple businesses
    are ever enabled.
3.  A sent quotation cannot silently change.
4.  A booking references a specific accepted quotation version.
5.  Payment callbacks are idempotent.
6.  Historical quotations are unaffected by later catalog price changes.
7.  Money uses exact arithmetic.
8.  Event configuration changes are version-aware.
9.  AI does not directly mutate database state.
10. AI state changes use normal application services.
11. Core commercial records are auditable.
12. Catalog deactivation does not destroy historical meaning.

------------------------------------------------------------------------

# 112. Next Artifact

The next document should be:

**`api-spec.md`**

It should translate this database/domain design and the product flows
into concrete REST contracts, including:

-   authentication APIs;
-   catalog APIs;
-   event APIs;
-   menu configuration APIs;
-   estimate APIs;
-   recommendation APIs;
-   quotation request APIs;
-   caterer quotation APIs;
-   quotation acceptance APIs;
-   booking APIs;
-   payment APIs;
-   notification APIs;
-   AI APIs;
-   request/response schemas;
-   error codes;
-   authorization rules;
-   idempotency;
-   pagination/filtering;
-   API versioning;
-   example payloads.

After `api-spec.md`, the next major design artifact should be
**`ai-design.md`**, followed by **`testing-strategy.md`**.
