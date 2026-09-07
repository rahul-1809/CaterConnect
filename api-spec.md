# Catering Planning & Quotation Platform --- API Specification

**Document:** `api-spec.md`\
**Version:** 1.0\
**Status:** Baseline REST API contract\
**Depends on:** `planning.md`, `requirements.md`, `product-flows.md`,
`system-design.md`, `database-design.md`\
**Base URL:** `/api/v1`\
**Transport:** HTTPS\
**Format:** JSON\
**Currency:** INR\
**Timezone:** Asia/Kolkata

------------------------------------------------------------------------

# 1. Purpose

This document defines the application-facing REST API for the catering
planning, quotation, booking, payment, and AI-assisted planning
platform.

The API is designed around the following principles:

1.  The backend is authoritative for business rules.
2.  The frontend never calculates authoritative commercial totals.
3.  AI uses the same APIs/application services as the normal product.
4.  Customer resources are ownership-scoped.
5.  Admin resources are caterer-scoped.
6.  Commercial records are versioned/snapshotted.
7.  Financial and state-changing operations are idempotent where
    required.
8.  API contracts remain independent of the underlying database schema.

------------------------------------------------------------------------

# 2. API Conventions

## 2.1 Base Path

``` text
/api/v1
```

Example:

``` text
POST /api/v1/auth/otp/request
```

## 2.2 Content Type

Requests and responses use:

``` text
application/json
```

unless an endpoint explicitly documents another content type.

## 2.3 Authentication

Authenticated endpoints require the application's secure session
mechanism.

Example:

``` text
Cookie: session=<secure-session>
```

The exact cookie name is an implementation detail.

The frontend should not store long-lived authentication credentials in
insecure browser storage.

------------------------------------------------------------------------

# 3. Roles

``` text
CUSTOMER
ADMIN
```

Future roles may include:

``` text
MANAGER
STAFF
SUPER_ADMIN
```

but they are not required for V1.

------------------------------------------------------------------------

# 4. Common Response Envelope

Successful APIs may use either direct resource responses or a standard
envelope.

Recommended:

``` json
{
  "data": {},
  "meta": {}
}
```

For collections:

``` json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

The implementation should use one convention consistently.

------------------------------------------------------------------------

# 5. Common Error Response

All API errors should follow a predictable structure.

``` json
{
  "error": {
    "code": "EVENT_VERSION_CONFLICT",
    "message": "The event was changed by another request. Refresh and try again.",
    "details": {}
  },
  "request_id": "req_01J..."
}
```

------------------------------------------------------------------------

# 6. Error Code Categories

Recommended codes:

``` text
AUTH_*
VALIDATION_*
RESOURCE_*
FORBIDDEN_*
CONFLICT_*
CATALOG_*
EVENT_*
PRICING_*
QUOTATION_*
BOOKING_*
PAYMENT_*
AI_*
RATE_LIMIT_*
INTEGRATION_*
INTERNAL_*
```

------------------------------------------------------------------------

# 7. HTTP Status Conventions

  Status    Meaning
  --------- --------------------------------------------
  200       Successful read/update/action
  201       Resource created
  202       Accepted for asynchronous processing
  204       Successful operation with no response body
  400       Invalid request
  401       Unauthenticated
  403       Unauthorized
  404       Resource not found
  409       State/version/idempotency conflict
  422       Semantic validation failure
  429       Rate limited
  500       Internal server error
  502/503   External provider/service failure

------------------------------------------------------------------------

# 8. Request IDs

Every request should receive a correlation/request ID.

Example response header:

``` text
X-Request-ID: req_01J...
```

If the client sends one, the server may propagate it after validation.

Request IDs should appear in structured logs.

------------------------------------------------------------------------

# 9. Idempotency

The following operations should support idempotency:

``` text
POST /quotation-requests
POST /quotations/{id}/send
POST /quotations/{id}/accept
POST /quotations/{id}/booking
POST /payments
```

Recommended header:

``` text
Idempotency-Key: <unique-client-generated-key>
```

The backend should retain enough information to return the original
result for a repeated request.

------------------------------------------------------------------------

# 10. Authentication APIs

# 10.1 Request OTP

``` http
POST /auth/otp/request
```

### Authentication

Public.

### Request

``` json
{
  "phone_number": "9876543210",
  "country_code": "+91"
}
```

### Response

``` json
{
  "data": {
    "challenge_id": "uuid",
    "expires_in_seconds": 300,
    "retry_after_seconds": 30
  }
}
```

### Rules

-   normalize phone number;
-   rate-limit by phone/IP/device signals;
-   generate OTP;
-   store only OTP hash;
-   expire challenge;
-   invalidate/limit excessive attempts.

------------------------------------------------------------------------

# 10.2 Verify OTP

``` http
POST /auth/otp/verify
```

### Request

``` json
{
  "challenge_id": "uuid",
  "otp": "123456"
}
```

### Response

``` json
{
  "data": {
    "user": {
      "id": "uuid",
      "role": "CUSTOMER",
      "phone_number": "+919876543210"
    }
  }
}
```

A secure authenticated session is established.

### Errors

``` text
AUTH_OTP_INVALID
AUTH_OTP_EXPIRED
AUTH_OTP_MAX_ATTEMPTS
AUTH_OTP_CHALLENGE_NOT_FOUND
```

------------------------------------------------------------------------

# 10.3 Logout

``` http
POST /auth/logout
```

### Authentication

Authenticated.

### Response

``` text
204 No Content
```

The current session is revoked/invalidated.

------------------------------------------------------------------------

# 10.4 Current User

``` http
GET /auth/me
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "role": "CUSTOMER",
    "phone_number": "+919876543210",
    "customer_profile": {
      "id": "uuid",
      "full_name": "Rahul",
      "email": "rahul@example.com"
    }
  }
}
```

------------------------------------------------------------------------

# 11. Customer Profile APIs

# 11.1 Get Profile

``` http
GET /customers/me
```

### Authentication

Customer.

### Response

``` json
{
  "data": {
    "id": "uuid",
    "full_name": "Rahul",
    "email": "rahul@example.com",
    "phone_number": "+919876543210"
  }
}
```

------------------------------------------------------------------------

# 11.2 Update Profile

``` http
PATCH /customers/me
```

### Request

``` json
{
  "full_name": "Rahul Patnala",
  "email": "rahul@example.com"
}
```

The phone number is not directly edited through this endpoint.

Phone-number changes require a separate OTP verification flow if
introduced later.

------------------------------------------------------------------------

# 12. Function APIs

# 12.1 List Functions

``` http
GET /functions
```

### Authentication

Public or authenticated customer.

### Query Parameters

``` text
active=true
```

### Response

``` json
{
  "data": [
    {
      "id": "uuid",
      "name": "Wedding",
      "slug": "wedding",
      "description": "Wedding catering services",
      "image_url": "...",
      "sort_order": 1
    }
  ]
}
```

------------------------------------------------------------------------

# 13. Offering APIs

# 13.1 List Offerings for Function

``` http
GET /functions/{function_id}/offerings
```

### Response

``` json
{
  "data": [
    {
      "id": "uuid",
      "name": "Dinner",
      "slug": "dinner",
      "description": "Full dinner catering",
      "image_url": "...",
      "sort_order": 1
    }
  ]
}
```

------------------------------------------------------------------------

# 14. Package APIs

# 14.1 List Packages

``` http
GET /packages
```

### Query Parameters

``` text
function_id
offering_id
guest_count
active
page
page_size
```

Example:

``` text
GET /packages?function_id=...&offering_id=...&guest_count=500
```

The backend filters packages according to supported applicability.

------------------------------------------------------------------------

# 14.2 Get Package

``` http
GET /packages/{package_id}
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "name": "Gold",
    "description": "...",
    "min_guests": 100,
    "max_guests": 1000,
    "included_items": [],
    "selection_groups": [],
    "addons": []
  }
}
```

------------------------------------------------------------------------

# 15. Menu APIs

# 15.1 List Categories

``` http
GET /menu/categories
```

### Query Parameters

``` text
function_id
offering_id
active
```

------------------------------------------------------------------------

# 15.2 List Menu Items

``` http
GET /menu/items
```

### Query Parameters

``` text
category_id
function_id
offering_id
dietary_type
search
active
page
page_size
```

Example:

``` text
GET /menu/items?category_id=...&search=paneer
```

------------------------------------------------------------------------

# 15.3 Get Menu Item

``` http
GET /menu/items/{item_id}
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "name": "Paneer Tikka",
    "description": "...",
    "dietary_type": "VEG",
    "category_id": "uuid",
    "image_url": "..."
  }
}
```

Customer APIs should not expose internal cost/margin data.

------------------------------------------------------------------------

# 16. Customer Event APIs

# 16.1 Create Event

``` http
POST /events
```

### Authentication

Customer.

### Request

``` json
{
  "function_type_id": "uuid",
  "offering_id": "uuid"
}
```

Function/offering may initially be omitted if the UI supports creating a
blank draft.

### Response

``` json
{
  "data": {
    "id": "uuid",
    "status": "DRAFT",
    "configuration_version": 1,
    "function_type_id": "uuid",
    "offering_id": "uuid"
  }
}
```

------------------------------------------------------------------------

# 16.2 List Customer Events

``` http
GET /events
```

### Query Parameters

``` text
status
page
page_size
```

Only events owned by the authenticated customer are returned.

------------------------------------------------------------------------

# 16.3 Get Event

``` http
GET /events/{event_id}
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "status": "DRAFT",
    "configuration_version": 5,
    "function": {},
    "offering": {},
    "package": {},
    "guest_count": 500,
    "budget": {
      "min": 80000,
      "max": 100000,
      "currency": "INR"
    },
    "event_date": "2026-10-18",
    "event_time": "19:00:00",
    "timezone": "Asia/Kolkata",
    "venue": {
      "name": "ABC Convention Hall",
      "address": "..."
    },
    "menu_items": []
  }
}
```

------------------------------------------------------------------------

# 17. Update Event

``` http
PATCH /events/{event_id}
```

### Request

``` json
{
  "function_type_id": "uuid",
  "offering_id": "uuid",
  "package_id": "uuid",
  "guest_count": 500,
  "budget_min": 80000,
  "budget_max": 100000,
  "event_date": "2026-10-18",
  "event_time": "19:00:00",
  "timezone": "Asia/Kolkata",
  "venue_name": "ABC Convention Hall",
  "venue_address": "...",
  "venue_notes": "..."
}
```

### Concurrency

Client should send:

``` text
If-Match-Version: 5
```

or an equivalent body/header representation.

If the current version differs:

``` text
409 CONFLICT
```

with:

``` text
EVENT_VERSION_CONFLICT
```

------------------------------------------------------------------------

# 18. Event Configuration APIs

# 18.1 Get Configuration

``` http
GET /events/{event_id}/configuration
```

### Response

``` json
{
  "data": {
    "event_id": "uuid",
    "version": 5,
    "package_id": "uuid",
    "menu_items": [],
    "guest_count": 500,
    "budget": {
      "min": 80000,
      "max": 100000,
      "currency": "INR"
    }
  }
}
```

------------------------------------------------------------------------

# 19. Update Configuration

``` http
PATCH /events/{event_id}/configuration
```

### Request

``` json
{
  "base_version": 5,
  "package_id": "uuid",
  "menu_items": [
    {
      "menu_item_id": "uuid",
      "source_type": "PACKAGE"
    },
    {
      "menu_item_id": "uuid",
      "source_type": "ADDON"
    }
  ]
}
```

### Response

``` json
{
  "data": {
    "event_id": "uuid",
    "version": 6,
    "menu_items": []
  }
}
```

The update must be validated against:

-   package rules;
-   menu eligibility;
-   active catalog state;
-   guest limits;
-   selection constraints.

------------------------------------------------------------------------

# 20. Add Menu Item

``` http
POST /events/{event_id}/menu-items
```

### Request

``` json
{
  "menu_item_id": "uuid",
  "source_type": "CUSTOM",
  "base_version": 6
}
```

### Response

``` json
{
  "data": {
    "event_id": "uuid",
    "configuration_version": 7,
    "menu_item": {}
  }
}
```

------------------------------------------------------------------------

# 21. Remove Menu Item

``` http
DELETE /events/{event_id}/menu-items/{event_menu_item_id}
```

### Query/Header

Requires the current configuration version.

### Response

``` text
204 No Content
```

------------------------------------------------------------------------

# 22. Event Version History

``` http
GET /events/{event_id}/versions
```

### Authentication

Customer owner or authorized admin.

### Response

``` json
{
  "data": [
    {
      "version": 7,
      "changed_by": "CUSTOMER",
      "change_reason": "Added dessert",
      "created_at": "..."
    }
  ]
}
```

Full historical snapshots should not necessarily be exposed to customers
by default.

------------------------------------------------------------------------

# 23. Estimate APIs

# 23.1 Calculate Estimate

``` http
POST /events/{event_id}/estimate
```

### Request

``` json
{
  "configuration_version": 7
}
```

### Response

``` json
{
  "data": {
    "estimate_id": "uuid",
    "event_version": 7,
    "currency": "INR",
    "lower_amount": 95000,
    "upper_amount": 108000,
    "budget": {
      "min": 80000,
      "max": 100000,
      "status": "SLIGHTLY_ABOVE"
    },
    "breakdown": [
      {
        "type": "PACKAGE",
        "description": "Gold package",
        "amount": 90000
      },
      {
        "type": "ADDON",
        "description": "Additional dessert",
        "amount": 6000
      }
    ],
    "disclaimer": "Estimated price only. Final quotation is subject to caterer confirmation."
  }
}
```

------------------------------------------------------------------------

# 24. Estimate Rules

The estimate API must:

-   use the server-side pricing engine;
-   validate event configuration;
-   use current applicable pricing;
-   return a range;
-   compare against the customer budget;
-   never treat the estimate as a final quotation.

------------------------------------------------------------------------

# 25. Get Current Estimate

``` http
GET /events/{event_id}/estimate
```

If the estimate is stale:

``` json
{
  "data": null,
  "meta": {
    "status": "STALE",
    "current_event_version": 8,
    "estimate_event_version": 7
  }
}
```

Alternatively, the API may return the stale estimate with explicit
status.

------------------------------------------------------------------------

# 26. Budget Optimization API

``` http
POST /events/{event_id}/optimize-budget
```

### Request

``` json
{
  "configuration_version": 7,
  "target_budget": 100000,
  "max_suggestions": 3
}
```

### Response

``` json
{
  "data": {
    "base_configuration_version": 7,
    "target_budget": 100000,
    "recommendations": [
      {
        "id": "uuid",
        "title": "Replace premium dessert",
        "explanation": "This keeps the rest of your menu unchanged while reducing the estimate.",
        "changes": [
          {
            "operation": "REMOVE",
            "menu_item_id": "uuid"
          }
        ],
        "estimated_range": {
          "lower": 89000,
          "upper": 99000,
          "currency": "INR"
        },
        "budget_status": "WITHIN_BUDGET"
      }
    ]
  }
}
```

------------------------------------------------------------------------

# 27. Apply Recommendation

``` http
POST /events/{event_id}/recommendations/{recommendation_id}/apply
```

### Request

``` json
{
  "base_version": 7
}
```

### Response

``` json
{
  "data": {
    "event_id": "uuid",
    "configuration_version": 8,
    "applied_changes": []
  }
}
```

The backend must revalidate the recommendation before applying it.

------------------------------------------------------------------------

# 28. Quotation Request APIs

# 28.1 Submit Final Quotation Request

``` http
POST /events/{event_id}/quotation-request
```

### Headers

``` text
Idempotency-Key: <unique-key>
```

### Request

``` json
{
  "configuration_version": 8,
  "customer_message": "Please confirm availability and final pricing."
}
```

### Validation

The backend verifies:

-   customer owns event;
-   event is valid;
-   required details exist;
-   guest count is valid;
-   menu configuration is valid;
-   event date is valid;
-   quotation request is not already active.

### Response

``` json
{
  "data": {
    "id": "uuid",
    "request_number": "CR-2026-00125",
    "status": "REQUESTED",
    "submitted_event_version": 8,
    "submitted_at": "..."
  }
}
```

------------------------------------------------------------------------

# 29. List Customer Quotation Requests

``` http
GET /quotation-requests
```

Customer receives only their own requests.

Query:

``` text
status
page
page_size
```

------------------------------------------------------------------------

# 30. Get Quotation Request

``` http
GET /quotation-requests/{request_id}
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "request_number": "CR-2026-00125",
    "status": "UNDER_REVIEW",
    "event": {},
    "submitted_at": "..."
  }
}
```

Customer-facing response should not expose internal caterer notes.

------------------------------------------------------------------------

# 31. Admin Quotation Request APIs

# 31.1 List Requests

``` http
GET /admin/quotation-requests
```

### Query Parameters

``` text
status
date_from
date_to
search
page
page_size
sort
```

### Authentication

Admin.

------------------------------------------------------------------------

# 32. Get Admin Request Detail

``` http
GET /admin/quotation-requests/{request_id}
```

The admin response may include:

-   customer name;
-   customer phone;
-   customer email;
-   event details;
-   menu;
-   budget;
-   estimate;
-   notes;
-   request history;
-   internal operational metadata permitted to the admin.

------------------------------------------------------------------------

# 33. Mark Request Under Review

``` http
POST /admin/quotation-requests/{request_id}/review
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "status": "UNDER_REVIEW",
    "reviewed_at": "..."
  }
}
```

------------------------------------------------------------------------

# 34. Quotation APIs

# 34.1 Create Quotation

``` http
POST /admin/quotation-requests/{request_id}/quotation
```

### Request

``` json
{
  "items": [
    {
      "line_type": "PACKAGE",
      "description": "Gold Catering Package",
      "quantity": 500,
      "unit": "GUEST",
      "unit_price": 180,
      "amount": 90000
    },
    {
      "line_type": "ADDON",
      "description": "Additional Dessert",
      "quantity": 500,
      "unit": "GUEST",
      "unit_price": 12,
      "amount": 6000
    }
  ],
  "discount_amount": 2000,
  "tax_amount": 9400,
  "advance_amount": 30000,
  "valid_until": "2026-09-30T23:59:59+05:30",
  "terms": "..."
}
```

### Response

``` json
{
  "data": {
    "quotation_id": "uuid",
    "quotation_number": "QT-2026-00082",
    "version": 1,
    "status": "DRAFT",
    "subtotal": 96000,
    "discount_amount": 2000,
    "tax_amount": 9400,
    "total_amount": 103400,
    "advance_amount": 30000
  }
}
```

The server should validate/recalculate line totals rather than trusting
client-provided totals.

------------------------------------------------------------------------

# 35. Get Admin Quotation

``` http
GET /admin/quotations/{quotation_id}
```

Admin may see internal fields appropriate to their role.

------------------------------------------------------------------------

# 36. Update Draft Quotation

``` http
PATCH /admin/quotations/{quotation_id}
```

Only editable draft versions can be changed.

If a quotation is already sent:

``` text
QUOTATION_VERSION_IMMUTABLE
```

should be returned.

A revised commercial quotation should create a new version.

------------------------------------------------------------------------

# 37. Send Quotation

``` http
POST /admin/quotations/{quotation_id}/send
```

### Headers

``` text
Idempotency-Key: <unique-key>
```

### Preconditions

-   quotation has a valid draft;
-   totals are valid;
-   terms are present if required;
-   validity date is valid;
-   quotation request is still eligible.

### Response

``` json
{
  "data": {
    "quotation_id": "uuid",
    "version": 1,
    "status": "SENT",
    "sent_at": "..."
  }
}
```

Notification delivery is asynchronous and must not be treated as the
quotation state transition itself.

------------------------------------------------------------------------

# 38. Customer Quotation List

``` http
GET /quotations
```

Returns quotations belonging to the authenticated customer.

------------------------------------------------------------------------

# 39. Get Customer Quotation

``` http
GET /quotations/{quotation_id}
```

Customer sees:

-   quotation number;
-   event details;
-   menu;
-   line items;
-   totals;
-   discount;
-   tax;
-   advance;
-   balance;
-   terms;
-   validity;
-   status.

Internal caterer cost/margin data must never be included.

------------------------------------------------------------------------

# 40. Get Quotation Version

``` http
GET /quotations/{quotation_id}/versions/{version}
```

Customers may access versions that were customer-visible.

Internal drafts should not be exposed unless intentionally allowed.

------------------------------------------------------------------------

# 41. Accept Quotation

``` http
POST /quotations/{quotation_id}/accept
```

### Headers

``` text
Idempotency-Key: <unique-key>
```

### Request

``` json
{
  "version": 2
}
```

### Preconditions

-   customer owns quotation;
-   requested version is active;
-   status is `SENT`;
-   quotation is not expired.

### Response

``` json
{
  "data": {
    "quotation_id": "uuid",
    "version": 2,
    "status": "ACCEPTED",
    "accepted_at": "..."
  }
}
```

Acceptance is a consequential action and should require explicit UI
confirmation.

------------------------------------------------------------------------

# 42. Reject Quotation

``` http
POST /quotations/{quotation_id}/reject
```

### Request

``` json
{
  "version": 2,
  "reason": "Budget is higher than expected."
}
```

### Response

``` json
{
  "data": {
    "quotation_id": "uuid",
    "status": "REJECTED"
  }
}
```

------------------------------------------------------------------------

# 43. Booking APIs

# 43.1 Create Booking from Accepted Quotation

``` http
POST /quotations/{quotation_id}/booking
```

### Headers

``` text
Idempotency-Key: <unique-key>
```

### Request

``` json
{
  "quotation_version": 2
}
```

### Response

If advance is required:

``` json
{
  "data": {
    "booking_id": "uuid",
    "booking_number": "BK-2026-00041",
    "status": "PENDING_ADVANCE",
    "total_amount": 103400,
    "advance_required": 30000,
    "advance_paid": 0,
    "balance_amount": 103400
  }
}
```

If no advance is required:

``` text
CONFIRMED
```

may be returned according to caterer policy.

------------------------------------------------------------------------

# 44. Customer Booking List

``` http
GET /bookings
```

Query:

``` text
status
page
page_size
```

------------------------------------------------------------------------

# 45. Get Booking

``` http
GET /bookings/{booking_id}
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "booking_number": "BK-2026-00041",
    "status": "PENDING_ADVANCE",
    "event": {},
    "total_amount": 103400,
    "advance_required": 30000,
    "advance_paid": 0,
    "balance_amount": 103400
  }
}
```

------------------------------------------------------------------------

# 46. Admin Booking APIs

``` http
GET /admin/bookings
GET /admin/bookings/{booking_id}
```

Admin can filter by:

``` text
status
event_date
customer
booking_number
```

Admin sees customer contact information necessary for business
operations.

------------------------------------------------------------------------

# 47. Payment APIs

# 47.1 Create Payment

``` http
POST /payments
```

### Authentication

Customer.

### Headers

``` text
Idempotency-Key: <unique-key>
```

### Request

``` json
{
  "booking_id": "uuid",
  "amount": 30000,
  "currency": "INR",
  "payment_type": "ADVANCE"
}
```

### Response

Provider-dependent:

``` json
{
  "data": {
    "payment_id": "uuid",
    "status": "PENDING",
    "amount": 30000,
    "currency": "INR",
    "provider": "..."
  }
}
```

If a redirect/checkout URL is required, the response may include:

``` json
{
  "checkout_url": "..."
}
```

------------------------------------------------------------------------

# 48. Payment Status

``` http
GET /payments/{payment_id}
```

### Response

``` json
{
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "amount": 30000,
    "currency": "INR",
    "status": "SUCCESS",
    "paid_at": "..."
  }
}
```

------------------------------------------------------------------------

# 49. Payment Provider Callback

``` http
POST /payments/webhooks/{provider}
```

### Authentication

Provider signature verification, not customer session.

The endpoint must:

1.  validate signature;
2.  identify provider event;
3.  enforce idempotency;
4.  verify payment state;
5.  record payment event;
6.  update payment;
7.  update booking if conditions are satisfied.

Response should be provider-compatible and minimal.

------------------------------------------------------------------------

# 50. Payment Security

Never trust:

``` text
amount
status
customer
booking
```

from an unverified browser callback.

The server verifies the payment against provider information.

------------------------------------------------------------------------

# 51. Notification APIs

Customer-facing notification list:

``` http
GET /notifications
```

### Query

``` text
unread_only
page
page_size
```

------------------------------------------------------------------------

# 52. Mark Notification Read

``` http
POST /notifications/{notification_id}/read
```

### Response

``` text
204 No Content
```

------------------------------------------------------------------------

# 53. Admin Catalog APIs

Admin CRUD endpoints:

``` text
POST   /admin/functions
PATCH  /admin/functions/{id}
POST   /admin/offerings
PATCH  /admin/offerings/{id}

POST   /admin/menu/categories
PATCH  /admin/menu/categories/{id}

POST   /admin/menu/items
PATCH  /admin/menu/items/{id}

POST   /admin/packages
PATCH  /admin/packages/{id}

POST   /admin/pricing-rules
PATCH  /admin/pricing-rules/{id}
```

Catalog records should be deactivated rather than casually deleted.

------------------------------------------------------------------------

# 54. Admin Package Configuration

A package editor needs APIs to manage:

``` text
included items
selection groups
selection group items
paid addons
guest limits
function applicability
offering applicability
pricing
```

Potential endpoints:

``` text
POST /admin/packages/{id}/items
DELETE /admin/packages/{id}/items/{item_id}

POST /admin/packages/{id}/selection-groups
PATCH /admin/packages/{id}/selection-groups/{group_id}

POST /admin/packages/{id}/selection-groups/{group_id}/items
DELETE /admin/packages/{id}/selection-groups/{group_id}/items/{item_id}

POST /admin/packages/{id}/addons
DELETE /admin/packages/{id}/addons/{addon_id}
```

------------------------------------------------------------------------

# 55. Admin Pricing APIs

``` http
GET /admin/pricing-rules
POST /admin/pricing-rules
PATCH /admin/pricing-rules/{id}
```

Pricing rules should expose configuration relevant to admins without
exposing implementation secrets.

------------------------------------------------------------------------

# 56. AI API Architecture

AI endpoints should be thin adapters over the AI orchestration service.

Primary endpoints:

``` text
POST /ai/chat
POST /ai/recommend
POST /ai/configure
```

------------------------------------------------------------------------

# 57. AI Chat

``` http
POST /ai/chat
```

### Authentication

Customer.

### Request

``` json
{
  "conversation_id": "uuid",
  "event_id": "uuid",
  "message": "I want food for 500 people under one lakh. Suggest a good menu.",
  "language": "en"
}
```

`conversation_id` and `event_id` may be omitted for a new planning
conversation.

### Response

``` json
{
  "data": {
    "conversation_id": "uuid",
    "message": {
      "role": "ASSISTANT",
      "content": "For 500 guests with a ₹1 lakh target, I can suggest a balanced menu..."
    },
    "event": {},
    "actions": []
  }
}
```

The response may include structured actions/proposals.

------------------------------------------------------------------------

# 58. AI Recommendation

``` http
POST /ai/recommend
```

### Request

``` json
{
  "event_id": "uuid",
  "goal": "Stay close to ₹100000 while keeping a premium dinner feel.",
  "language": "en"
}
```

### Response

``` json
{
  "data": {
    "recommendations": [
      {
        "id": "uuid",
        "title": "Balanced premium menu",
        "reason": "...",
        "proposed_changes": [],
        "estimate": {
          "lower_amount": 95000,
          "upper_amount": 101000,
          "currency": "INR"
        }
      }
    ]
  }
}
```

------------------------------------------------------------------------

# 59. AI Configure Event

``` http
POST /ai/configure
```

This endpoint handles a structured natural-language request that may
result in event changes.

### Request

``` json
{
  "event_id": "uuid",
  "base_version": 8,
  "instruction": "Remove the premium dessert and add fruit salad instead.",
  "language": "en"
}
```

### Response

The AI should generally return a proposal first:

``` json
{
  "data": {
    "proposal_id": "uuid",
    "status": "PROPOSED",
    "base_version": 8,
    "changes": [
      {
        "operation": "REMOVE",
        "menu_item_id": "uuid"
      },
      {
        "operation": "ADD",
        "menu_item_id": "uuid"
      }
    ],
    "explanation": "...",
    "estimated_impact": {
      "before": {
        "lower": 95000,
        "upper": 108000
      },
      "after": {
        "lower": 90000,
        "upper": 101000
      }
    }
  }
}
```

------------------------------------------------------------------------

# 60. Apply AI Proposal

``` http
POST /ai/proposals/{proposal_id}/apply
```

### Request

``` json
{
  "base_version": 8
}
```

### Response

``` json
{
  "data": {
    "proposal_id": "uuid",
    "status": "APPLIED",
    "event_id": "uuid",
    "new_event_version": 9
  }
}
```

The backend revalidates everything before applying.

------------------------------------------------------------------------

# 61. AI Tool Contract

The LLM should not invoke arbitrary HTTP APIs.

Internally, tools should map to application services.

Recommended tool contracts:

``` text
search_menu_items
get_menu_item
get_package
get_available_packages
get_event
calculate_event_estimate
recommend_menu
optimize_budget
propose_event_changes
apply_event_changes
```

------------------------------------------------------------------------

# 62. AI Tool Authorization

Each tool checks:

``` text
authenticated user
+
role
+
event ownership
+
tool policy
```

For example:

``` text
apply_event_changes(event_id)
```

must verify:

``` text
event.customer_id == current_customer_id
```

------------------------------------------------------------------------

# 63. AI Tool Side-Effect Classification

Each tool should declare:

``` text
READ_ONLY
PROPOSAL
MUTATION
CONSEQUENTIAL
```

Example:

  Tool                       Type
  -------------------------- --------------
  search_menu_items          READ_ONLY
  get_package                READ_ONLY
  calculate_event_estimate   READ_ONLY
  recommend_menu             READ_ONLY
  optimize_budget            PROPOSAL
  propose_event_changes      PROPOSAL
  apply_event_changes        MUTATION
  accept_quotation           CONSEQUENTAL
  make_payment               CONSEQUENTAL

Consequential tools should not be available to autonomous AI execution.

------------------------------------------------------------------------

# 64. AI Version Conflict

If an AI proposal is based on event version 8 and current event version
is 9:

``` text
409 CONFLICT
```

Example:

``` json
{
  "error": {
    "code": "EVENT_VERSION_CONFLICT",
    "message": "The event changed after this suggestion was created.",
    "details": {
      "proposal_version": 8,
      "current_version": 9
    }
  }
}
```

The AI can then refresh context and generate a new proposal.

------------------------------------------------------------------------

# 65. Multilingual API

Language should be an optional request field:

``` json
{
  "language": "te"
}
```

Supported language identifiers should use a documented standard such as
BCP-47.

Examples:

``` text
en
te
hi
ta
kn
```

The actual initial language set is a product decision.

------------------------------------------------------------------------

# 66. Language-Neutral Domain

Natural-language values must be normalized before business operations.

Example:

``` text
"ఐదు వందల మందికి"
        ↓
guest_count = 500
```

and:

``` text
"one lakh"
        ↓
budget_max = 100000
```

The pricing/event services receive canonical values.

------------------------------------------------------------------------

# 67. Voice API Boundary

The backend can support voice through either:

### Option A --- Client-managed STT/TTS

``` text
Browser
 ↓
Speech Provider
 ↓
Text
 ↓
/ai/chat
```

### Option B --- Backend-managed voice orchestration

``` text
Browser audio
 ↓
/ai/voice
 ↓
STT
 ↓
AI
 ↓
TTS
 ↓
Audio response
```

For V1, client/browser-managed audio transport may be simpler; the exact
choice belongs in `ai-design.md`.

------------------------------------------------------------------------

# 68. Admin Dashboard APIs

Potential dashboard endpoint:

``` http
GET /admin/dashboard
```

Response can contain:

``` json
{
  "data": {
    "quotation_requests": {
      "pending": 12,
      "under_review": 5
    },
    "quotations": {
      "sent": 8,
      "accepted": 4
    },
    "bookings": {
      "upcoming": 7
    }
  }
}
```

Dashboard data should be optimized for operational use rather than
exposing raw database structure.

------------------------------------------------------------------------

# 69. Search and Pagination

Collection APIs should support:

``` text
page
page_size
```

Example:

``` text
GET /admin/quotation-requests?page=1&page_size=25
```

Maximum page size should be enforced server-side.

Search should be scoped to permitted fields.

------------------------------------------------------------------------

# 70. Sorting

Supported sort fields should be explicitly documented.

Example:

``` text
sort=submitted_at
sort=-submitted_at
```

Never interpolate arbitrary client-provided sort fields into SQL.

------------------------------------------------------------------------

# 71. Filtering

Filtering should use an allowlist.

Example:

``` text
status=REQUESTED
date_from=2026-10-01
date_to=2026-10-31
```

Unknown filters should return validation errors rather than silently
being ignored if strict API behavior is preferred.

------------------------------------------------------------------------

# 72. Validation --- Guest Count

Rules:

``` text
guest_count >= 1
```

A maximum system-level limit may be configured to prevent abuse.

Package-specific guest limits are validated separately.

------------------------------------------------------------------------

# 73. Validation --- Budget

Rules:

``` text
budget_min >= 0
budget_max >= budget_min
```

If a single target budget is supplied:

``` text
budget_min = target
budget_max = target
```

The recommendation engine may use a tolerance around the target, but the
stored customer budget remains explicit.

------------------------------------------------------------------------

# 74. Validation --- Event Date

The API must reject dates that violate configured business rules.

Examples:

-   past date;
-   unsupported booking horizon;
-   unavailable/blocked date if the caterer later adds calendar
    constraints.

The exact availability policy is a future business decision.

------------------------------------------------------------------------

# 75. Validation --- Menu Selection

Backend validates:

``` text
item is active
item belongs to caterer
item applies to function/offering
item is permitted by package
selection group rules satisfied
addon is allowed
```

Frontend validation is only for UX.

------------------------------------------------------------------------

# 76. Validation --- Package Guest Limits

Example:

``` text
package.max_guests = 300
event.guest_count = 500
```

Response:

``` text
422
CATALOG_PACKAGE_GUEST_LIMIT
```

The customer should be offered alternative packages rather than a dead
end.

------------------------------------------------------------------------

# 77. Customer Authorization Rules

Customer may:

``` text
read own profile
update own profile
create own events
read own events
modify own draft events
calculate own estimates
submit own quotation requests
read own quotations
accept/reject own quotations
create/read own bookings
create/read own payments
read own AI conversations
```

Customer may not:

``` text
read another customer's events
modify caterer catalog
modify pricing
create quotations
change quotation totals
read internal caterer costs
```

------------------------------------------------------------------------

# 78. Admin Authorization Rules

Admin may:

``` text
read customer request data needed for business
manage catalog
manage pricing
review quotation requests
create/edit draft quotations
send quotations
read/manage bookings
review payments
read operational dashboards
```

Admin may not:

``` text
impersonate customers without explicit controlled functionality
alter historical sent quotation versions
modify verified payment history arbitrarily
```

------------------------------------------------------------------------

# 79. Commercial Data Visibility

Customer APIs expose:

``` text
customer-safe estimate
quotation total
quotation line items
advance
balance
```

Admin APIs may expose:

``` text
internal pricing details
cost/margin information
operational notes
```

The API schema should have separate customer/admin DTOs rather than
returning one oversized object and filtering fields in the frontend.

------------------------------------------------------------------------

# 80. State Transition API Rules

## Event

``` text
DRAFT → SUBMITTED
DRAFT → CANCELLED
SUBMITTED → CANCELLED
SUBMITTED → COMPLETED
```

## Quotation Request

``` text
REQUESTED → UNDER_REVIEW
UNDER_REVIEW → QUOTATION_SENT
REQUESTED → CANCELLED
UNDER_REVIEW → CANCELLED
```

## Quotation

``` text
DRAFT → SENT
SENT → ACCEPTED
SENT → REJECTED
SENT → EXPIRED
SENT → SUPERSEDED
```

## Booking

``` text
PENDING_ADVANCE → CONFIRMED
PENDING_ADVANCE → CANCELLED
CONFIRMED → COMPLETED
CONFIRMED → CANCELLED
```

Invalid transitions return a `409` or `422` business error.

------------------------------------------------------------------------

# 81. API and Database Separation

The API should not expose database tables directly.

Bad:

``` text
GET /quotation_versions
```

just because the table exists.

Better:

``` text
GET /quotations/{id}
```

which returns a customer-appropriate commercial representation.

------------------------------------------------------------------------

# 82. API and AI Separation

AI can use internal application tools that do not necessarily map
one-to-one to public REST endpoints.

For example:

``` text
AI Tool:
calculate_event_estimate
        ↓
PricingService
```

It does not need to make an HTTP call back into the public API.

This avoids unnecessary internal network hops.

------------------------------------------------------------------------

# 83. API Security Controls

Implement:

-   HTTPS;
-   secure sessions;
-   CSRF protection where cookie-based auth requires it;
-   rate limiting;
-   request validation;
-   authorization;
-   output filtering;
-   provider signature validation;
-   structured audit logging.

------------------------------------------------------------------------

# 84. Rate Limits

Initial conceptual limits:

``` text
OTP request: strict
OTP verify: strict
AI chat: moderate
AI voice: moderate
Catalog reads: generous
Estimate: moderate
Quotation submission: strict
Payment creation: strict
```

Exact numbers should be configured after deployment characteristics are
known.

------------------------------------------------------------------------

# 85. API Caching

Good cache candidates:

``` text
GET /functions
GET /functions/{id}/offerings
GET /packages
GET /packages/{id}
GET /menu/categories
GET /menu/items
```

Avoid long-lived caching for:

``` text
events
estimates
quotations
bookings
payments
```

unless cache invalidation is explicit.

------------------------------------------------------------------------

# 86. API Observability

Every API request should ideally record:

``` text
request_id
route
method
status
latency
authenticated user ID where safe
error code
```

Do not log:

``` text
OTP
session token
payment credentials
AI secrets
```

------------------------------------------------------------------------

# 87. API Audit Events

The following should generate audit records:

``` text
EVENT_CREATED
EVENT_UPDATED
EVENT_CONFIGURATION_CHANGED
QUOTATION_REQUEST_SUBMITTED
QUOTATION_REVIEWED
QUOTATION_CREATED
QUOTATION_SENT
QUOTATION_ACCEPTED
QUOTATION_REJECTED
BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_CANCELLED
PAYMENT_VERIFIED
AI_EVENT_CHANGE_APPLIED
```

------------------------------------------------------------------------

# 88. API Error Catalog --- Authentication

``` text
AUTH_UNAUTHENTICATED
AUTH_FORBIDDEN
AUTH_OTP_INVALID
AUTH_OTP_EXPIRED
AUTH_OTP_MAX_ATTEMPTS
AUTH_OTP_RATE_LIMITED
AUTH_SESSION_EXPIRED
AUTH_SESSION_REVOKED
```

------------------------------------------------------------------------

# 89. API Error Catalog --- Event

``` text
EVENT_NOT_FOUND
EVENT_ACCESS_DENIED
EVENT_INVALID_STATE
EVENT_VERSION_CONFLICT
EVENT_GUEST_COUNT_INVALID
EVENT_BUDGET_INVALID
EVENT_DATE_INVALID
EVENT_REQUIRED_DETAILS_MISSING
```

------------------------------------------------------------------------

# 90. API Error Catalog --- Catalog

``` text
CATALOG_ITEM_NOT_FOUND
CATALOG_ITEM_INACTIVE
CATALOG_ITEM_NOT_APPLICABLE
CATALOG_PACKAGE_NOT_FOUND
CATALOG_PACKAGE_INACTIVE
CATALOG_PACKAGE_GUEST_LIMIT
CATALOG_SELECTION_GROUP_INVALID
CATALOG_SELECTION_COUNT_INVALID
CATALOG_ADDON_NOT_ALLOWED
```

------------------------------------------------------------------------

# 91. API Error Catalog --- Pricing

``` text
PRICING_CONFIGURATION_INVALID
PRICING_RULE_NOT_FOUND
PRICING_ESTIMATE_FAILED
PRICING_ESTIMATE_STALE
PRICING_UNSUPPORTED_CONFIGURATION
```

------------------------------------------------------------------------

# 92. API Error Catalog --- Quotation

``` text
QUOTATION_REQUEST_NOT_FOUND
QUOTATION_REQUEST_INVALID_STATE
QUOTATION_ALREADY_EXISTS
QUOTATION_NOT_FOUND
QUOTATION_VERSION_NOT_FOUND
QUOTATION_VERSION_IMMUTABLE
QUOTATION_EXPIRED
QUOTATION_NOT_ACTIVE
QUOTATION_ACCEPTANCE_FAILED
```

------------------------------------------------------------------------

# 93. API Error Catalog --- Booking

``` text
BOOKING_NOT_FOUND
BOOKING_ALREADY_EXISTS
BOOKING_INVALID_STATE
BOOKING_QUOTATION_NOT_ACCEPTED
BOOKING_PAYMENT_REQUIRED
BOOKING_CANNOT_CANCEL
```

------------------------------------------------------------------------

# 94. API Error Catalog --- Payment

``` text
PAYMENT_NOT_FOUND
PAYMENT_INVALID_AMOUNT
PAYMENT_PROVIDER_ERROR
PAYMENT_VERIFICATION_FAILED
PAYMENT_ALREADY_PROCESSED
PAYMENT_CALLBACK_DUPLICATE
PAYMENT_SIGNATURE_INVALID
PAYMENT_BOOKING_NOT_ELIGIBLE
```

------------------------------------------------------------------------

# 95. API Error Catalog --- AI

``` text
AI_CONVERSATION_NOT_FOUND
AI_ACCESS_DENIED
AI_PROVIDER_UNAVAILABLE
AI_RESPONSE_INVALID
AI_TOOL_NOT_ALLOWED
AI_TOOL_VALIDATION_FAILED
AI_CHANGE_PROPOSAL_EXPIRED
AI_CHANGE_REQUIRES_CONFIRMATION
AI_CONTEXT_STALE
```

------------------------------------------------------------------------

# 96. Example --- Complete Customer Planning Flow

## Step 1

``` http
POST /auth/otp/request
```

## Step 2

``` http
POST /auth/otp/verify
```

## Step 3

``` http
GET /functions
```

## Step 4

``` http
GET /functions/{id}/offerings
```

## Step 5

``` http
GET /packages?function_id=...&offering_id=...&guest_count=500
```

## Step 6

``` http
GET /packages/{id}
```

## Step 7

``` http
POST /events
```

## Step 8

``` http
PATCH /events/{id}
```

## Step 9

``` http
POST /events/{id}/menu-items
```

## Step 10

``` http
POST /events/{id}/estimate
```

## Step 11

``` http
POST /events/{id}/optimize-budget
```

## Step 12

``` http
POST /events/{id}/quotation-request
```

## Step 13

Admin creates and sends quotation.

## Step 14

``` http
GET /quotations/{id}
```

## Step 15

``` http
POST /quotations/{id}/accept
```

## Step 16

``` http
POST /quotations/{id}/booking
```

## Step 17

``` http
POST /payments
```

## Step 18

Provider callback confirms payment.

## Step 19

``` http
GET /bookings/{id}
```

------------------------------------------------------------------------

# 97. Example --- AI-Assisted Planning Flow

``` text
Customer
   │
   │ "500 guests under ₹1 lakh"
   ▼
POST /ai/chat
   │
   ▼
AI Orchestrator
   │
   ├── get_event
   ├── search_menu_items
   ├── optimize_budget
   └── calculate_event_estimate
   │
   ▼
AI Recommendation
   │
   ▼
Customer
   │
   │ "Apply this"
   ▼
POST /ai/proposals/{id}/apply
   │
   ▼
EventService
   │
   ▼
New Event Version
```

The AI is assisting the workflow rather than creating a parallel
business system.

------------------------------------------------------------------------

# 98. Example --- Multilingual AI Flow

Customer says in Telugu:

``` text
"ఐదు వందల మందికి లక్ష రూపాయల లోపు మంచి మెనూ కావాలి"
```

The system should normalize:

``` json
{
  "guest_count": 500,
  "budget_max": 100000,
  "goal": "recommend_menu"
}
```

The recommendation service calculates candidates.

The AI generates a response in the customer's selected language.

The pricing engine remains language-independent.

------------------------------------------------------------------------

# 99. Example --- Voice Flow

``` text
Voice Input
   ↓
Speech-to-Text
   ↓
POST /ai/chat
   ↓
Structured AI Tool Calls
   ↓
Application Services
   ↓
Response
   ↓
Text-to-Speech
```

For critical values:

``` text
"500 guests"

→ confirmation

"₹1 lakh"

→ confirmation if recognition is uncertain
```

------------------------------------------------------------------------

# 100. API Contract Testing

The implementation should test:

-   required fields;
-   invalid field types;
-   unauthorized access;
-   ownership;
-   state transitions;
-   version conflicts;
-   idempotency;
-   payment callbacks;
-   AI tool authorization.

OpenAPI should be generated from or synchronized with FastAPI schemas.

------------------------------------------------------------------------

# 101. OpenAPI

FastAPI should expose an OpenAPI specification.

Development endpoint may be:

``` text
/api/v1/openapi.json
```

Documentation UI can be enabled for development/staging and restricted
or protected in production.

The generated OpenAPI document should be treated as a contract artifact.

------------------------------------------------------------------------

# 102. API Schema Versioning

Breaking changes should not silently alter existing contracts.

If required:

``` text
/api/v2
```

can be introduced.

Non-breaking additions should prefer the existing version.

------------------------------------------------------------------------

# 103. API Compatibility Rules

Avoid:

-   renaming fields without migration;
-   changing semantic meaning of fields;
-   changing status values without coordination;
-   removing response fields unexpectedly;
-   changing money units.

For example, if `amount` is INR rupees, do not later silently
reinterpret it as paise.

------------------------------------------------------------------------

# 104. Frontend API Client

The frontend should use a typed API client.

Conceptually:

``` text
api/
├── auth.ts
├── catalog.ts
├── events.ts
├── estimates.ts
├── quotations.ts
├── bookings.ts
├── payments.ts
└── ai.ts
```

Types should derive from the API schema where practical.

------------------------------------------------------------------------

# 105. Backend API Module Structure

Recommended:

``` text
backend/app/api/
├── auth.py
├── customers.py
├── catalog.py
├── events.py
├── estimates.py
├── recommendations.py
├── quotation_requests.py
├── quotations.py
├── bookings.py
├── payments.py
├── notifications.py
├── ai.py
└── admin/
    ├── catalog.py
    ├── quotation_requests.py
    ├── quotations.py
    └── bookings.py
```

------------------------------------------------------------------------

# 106. Service Mapping

  API Group            Application Service
  -------------------- -------------------------
  Auth                 AuthService
  Catalog              CatalogService
  Events               EventService
  Estimates            PricingService
  Recommendations      RecommendationService
  Quotation Requests   QuotationRequestService
  Quotations           QuotationService
  Bookings             BookingService
  Payments             PaymentService
  Notifications        NotificationService
  AI                   AIOrchestrationService

------------------------------------------------------------------------

# 107. API Transaction Mapping

  Operation                  Transaction Requirement
  -------------------------- --------------------------
  Create Event               Yes
  Update Event               Yes
  Add Menu Item              Yes
  Calculate Estimate         Read-consistent
  Submit Quotation Request   Yes
  Create Quotation           Yes
  Send Quotation             Yes + async notification
  Accept Quotation           Yes
  Create Booking             Yes
  Process Payment Callback   Yes
  Apply AI Event Change      Yes

------------------------------------------------------------------------

# 108. API Security Invariants

1.  No customer ID is trusted from the client for ownership.
2.  No quotation total is trusted from the customer.
3.  No payment success state is trusted from the browser.
4.  No AI mutation bypasses application validation.
5.  No admin endpoint is accessible to customers.
6.  No internal cost/margin data is returned through customer schemas.
7.  Every state-changing endpoint validates current state.
8.  Every version-sensitive endpoint validates the current version.

------------------------------------------------------------------------

# 109. MVP API Scope

The first implementation should prioritize:

``` text
/auth/otp/request
/auth/otp/verify
/auth/logout
/auth/me

/functions
/functions/{id}/offerings
/packages
/packages/{id}
GET /menu/categories
GET /menu/items

/events
/events/{id}
/events/{id}/configuration
/events/{id}/menu-items

/events/{id}/estimate
/events/{id}/optimize-budget

/events/{id}/quotation-request

/admin/quotation-requests
/admin/quotation-requests/{id}
/admin/quotation-requests/{id}/quotation
/admin/quotations/{id}/send

/quotations
/quotations/{id}
/quotations/{id}/accept
/quotations/{id}/reject

/quotations/{id}/booking
/bookings
/bookings/{id}

/payments
/payments/{id}
/payments/webhooks/{provider}
```

AI endpoints are added in the AI implementation phase.

------------------------------------------------------------------------

# 110. API Implementation Order

Recommended sequence:

## Step 1

Auth APIs.

## Step 2

Catalog read APIs.

## Step 3

Admin catalog APIs.

## Step 4

Event APIs.

## Step 5

Menu configuration APIs.

## Step 6

Estimate APIs.

## Step 7

Recommendation APIs.

## Step 8

Quotation request APIs.

## Step 9

Quotation APIs.

## Step 10

Booking APIs.

## Step 11

Payment APIs.

## Step 12

Notification APIs.

## Step 13

AI APIs.

------------------------------------------------------------------------

# 111. Definition of Done

The API implementation is ready when:

-   [ ] every endpoint has a request schema;
-   [ ] every endpoint has a response schema;
-   [ ] authentication is defined;
-   [ ] authorization is defined;
-   [ ] error codes are standardized;
-   [ ] state transitions are validated;
-   [ ] version conflicts are handled;
-   [ ] idempotency is implemented where required;
-   [ ] payment callbacks are verified;
-   [ ] AI mutations use application services;
-   [ ] customer/admin DTOs are separated;
-   [ ] OpenAPI is generated;
-   [ ] integration tests cover critical flows;
-   [ ] E2E flow can execute against the API.

------------------------------------------------------------------------

# 112. Next Artifact

The next document should be:

**`ai-design.md`**

It should define the AI system in implementation detail:

-   AI assistant responsibilities;
-   conversational architecture;
-   intent/structured extraction;
-   tool definitions;
-   tool schemas;
-   recommendation architecture;
-   budget optimization;
-   event mutation;
-   confirmation policy;
-   prompt architecture;
-   context construction;
-   memory strategy;
-   multilingual handling;
-   voice pipeline;
-   model/provider abstraction;
-   prompt injection defense;
-   AI evaluation;
-   observability;
-   cost controls;
-   failure/fallback handling.

After that, create **`testing-strategy.md`** and then begin
implementation phase-by-phase.
