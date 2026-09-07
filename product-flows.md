# Catering Planning & Quotation Platform --- Product Flows

**Document:** `product-flows.md`\
**Version:** 1.0\
**Status:** Baseline UX and product-flow specification\
**Depends on:** `planning.md`, `requirements.md`\
**Scope:** Single local Indian catering business

------------------------------------------------------------------------

# 1. Purpose

This document defines the product flows and page-by-page interaction
model for the catering planning, quotation, and booking application.

The purpose is to translate the requirements into a concrete product
experience before system architecture and API implementation.

The application is intentionally designed as an **interactive planning
and booking product**, not a simple enquiry form.

The primary experience is:

``` text
Login
  ↓
Choose Function
  ↓
Choose Catering Offering
  ↓
Choose Package / Custom Menu
  ↓
Customize Menu
  ↓
Guest Count
  ↓
Budget
  ↓
Date / Time / Venue
  ↓
Estimate
  ↓
Review
  ↓
Request Final Quotation
  ↓
Caterer Review
  ↓
Final Quotation
  ↓
Accept
  ↓
Advance Payment
  ↓
Booking Confirmation
```

The AI assistant operates alongside this flow rather than replacing it.

------------------------------------------------------------------------

# 2. Product Experience Principles

## PF-PRINCIPLE-001 --- Progressive Disclosure

Do not ask the customer for every event detail on one page.

Collect information progressively as it becomes relevant.

## PF-PRINCIPLE-002 --- Visible Progress

The customer should always understand:

-   where they are;
-   what has been completed;
-   what remains;
-   how to go back.

## PF-PRINCIPLE-003 --- Persistent Event State

The current event configuration should remain available across the
entire planning journey.

## PF-PRINCIPLE-004 --- Price Visibility

As soon as enough information exists, show the customer how their
selections affect the estimated price.

## PF-PRINCIPLE-005 --- Easy Modification

The customer should be able to change earlier decisions without
restarting the entire plan.

## PF-PRINCIPLE-006 --- Soft Budgeting

Budget should guide recommendations, not make the customer feel
rejected.

## PF-PRINCIPLE-007 --- Human Final Authority

The customer should clearly understand the difference between:

-   system estimate;
-   final caterer quotation;
-   confirmed booking.

## PF-PRINCIPLE-008 --- AI as Copilot

AI should make planning easier but the normal UI must remain fully
usable without AI.

## PF-PRINCIPLE-009 --- Mobile First

The primary customer experience should work comfortably on a phone.

## PF-PRINCIPLE-010 --- Minimize Friction

Every screen should have one obvious primary action.

------------------------------------------------------------------------

# 3. Global Customer Application Structure

The customer application should use a persistent shell.

## 3.1 Desktop Structure

``` text
┌──────────────────────────────────────────────────────────────┐
│ Logo / Caterer Name          My Events   Help   Account      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                   PAGE CONTENT                               │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Back                              Continue / Primary Action  │
└──────────────────────────────────────────────────────────────┘
```

## 3.2 Mobile Structure

``` text
┌──────────────────────────┐
│ ←     Page Title     ☰   │
├──────────────────────────┤
│                          │
│      Page Content        │
│                          │
│                          │
├──────────────────────────┤
│     Primary Action      │
└──────────────────────────┘
```

## 3.3 Planning Progress

During the event-planning journey, a compact progress indicator should
communicate the current stage.

Example:

``` text
Function → Menu → Guests → Budget → Event → Estimate → Review
                  ●
```

The exact number of visible steps can be compressed on mobile.

------------------------------------------------------------------------

# 4. Entry and Authentication Flow

# 4.1 Landing Page

### Route

`/`

### Purpose

Introduce the catering service and start event planning.

### Main content

-   caterer branding;
-   short value proposition;
-   function/event imagery;
-   key benefits;
-   supported event types;
-   primary CTA;
-   optional AI assistant entry point.

### Primary CTA

`Plan Your Event`

### Secondary CTA

`View Catering Options`

### Returning Customer

Provide:

`Continue My Events`

### AI Highlight

A secondary card can say:

> Need help planning? Tell us about your event.

This opens the AI assistant without making AI mandatory.

------------------------------------------------------------------------

# 4.2 Login Page

### Route

`/login`

### Purpose

Authenticate customer using phone number.

### UI

``` text
Plan your catering

Mobile number
[ +91 | __________ ]

[ Continue ]

We’ll send you a one-time verification code.
```

### Actions

-   Continue;
-   change number.

### Validation

-   required;
-   valid supported phone format.

------------------------------------------------------------------------

# 4.3 OTP Verification

### Route

`/login/verify`

### UI

``` text
Verify your number

Code sent to
+91 XXXXX XXXXX

[ _ ][ _ ][ _ ][ _ ][ _ ][ _ ]

[ Verify ]

Resend code
Change number
```

### Behavior

Successful verification:

-   returning customer → dashboard or previously active draft;
-   new customer → customer enters application and can immediately start
    planning.

No mandatory profile-completion step.

------------------------------------------------------------------------

# 4.4 Authentication Failure States

### Invalid OTP

Show:

> That code isn't correct. Please try again.

### Expired OTP

Show:

> This code has expired. Request a new code.

### Rate Limit

Show a user-friendly cooldown without exposing internal rate-limit
implementation.

### Provider Failure

Show:

> We couldn't send a verification code right now. Please try again
> shortly.

------------------------------------------------------------------------

# 5. Customer Dashboard

### Route

`/dashboard`

The dashboard is primarily for returning customers.

## 5.1 Sections

### Active Planning

Show draft events.

Example:

``` text
Wedding Reception
500 guests
Estimated ₹95,000 – ₹1,08,000

[ Continue Planning ]
```

### Quotation Requests

Show:

``` text
Wedding Reception
Quotation requested
Under review
```

### Quotations

Show:

``` text
Wedding Reception
Final quotation: ₹1,04,500
Valid until 20 Sep

[ View Quotation ]
```

### Bookings

Show:

``` text
Wedding Reception
Booking confirmed
₹1,04,500
Advance paid: ₹30,000
Balance: ₹74,500
```

## 5.2 Primary CTA

`Plan a New Event`

------------------------------------------------------------------------

# 6. Main Planning Flow

A new event begins with:

`/events/new`

The event identifier should be created early so the application can
persist the customer's progress.

Example:

`/events/{eventId}/function`

------------------------------------------------------------------------

# 7. Step 1 --- Choose Function

### Route

`/events/{id}/function`

### Question

> What kind of function are you planning?

### Cards

``` text
┌──────────────┐
│   Wedding    │
│              │
│   [image]    │
└──────────────┘

┌──────────────┐
│  Birthday    │
│              │
│   [image]    │
└──────────────┘
```

Other examples:

-   reception;
-   engagement;
-   housewarming;
-   corporate;
-   religious;
-   other.

### Interaction

Selecting a card marks it as selected.

### Primary CTA

`Continue`

### Save Behavior

Selection should persist immediately or on Continue.

### AI Entry

The customer may alternatively open the assistant and say:

> I am planning a wedding.

The AI should update the same event state after confirmation where
required.

------------------------------------------------------------------------

# 8. Step 2 --- Choose Catering Offering

### Route

`/events/{id}/offering`

### Purpose

Allow the customer to choose what type of catering service they need.

Examples:

-   breakfast;
-   lunch;
-   dinner;
-   snacks;
-   full-day;
-   function-specific offering.

### Card Content

``` text
Lunch Catering

Complete lunch service
from ₹XXX/person

[ View Options ]
```

### Filtering

Only offerings applicable to the selected function should appear.

### Empty State

If no offering is available:

> We don't currently have an available catering option for this
> function. Please contact us for a custom requirement.

------------------------------------------------------------------------

# 9. Step 3 --- Choose Package or Custom Menu

### Route

`/events/{id}/menu-type`

### Page heading

> How would you like to plan your menu?

### Two primary choices

``` text
┌─────────────────────────────┐
│ Recommended Packages        │
│                             │
│ Ready-made menus with       │
│ customization options.      │
│                             │
│ [ Browse Packages ]         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Build Custom Menu           │
│                             │
│ Choose individual dishes    │
│ yourself.                   │
│                             │
│ [ Build Custom Menu ]       │
└─────────────────────────────┘
```

### Recommended Default

If a suitable package exists, show packages first.

Do not prevent custom-menu selection.

------------------------------------------------------------------------

# 10. Step 4A --- Package Browsing

### Route

`/events/{id}/packages`

### Package Card

Each package should communicate enough information to compare options.

Example:

``` text
Gold Celebration

₹1,950 / person*

Starter selection
Main course selection
Rice
Bread
Dessert
Beverage

Best for weddings

[ View Package ]
```

### Optional Badges

-   Recommended;
-   Popular;
-   Budget Friendly;
-   Premium.

These badges should be configurable rather than hard-coded marketing
claims.

------------------------------------------------------------------------

# 11. Package Detail Page

### Route

`/events/{id}/packages/{packageId}`

### Sections

1.  package summary;
2.  indicative pricing;
3.  included categories;
4.  mandatory items;
5.  selectable items;
6.  available paid additions;
7.  guest constraints;
8.  customization notes.

### Primary CTA

`Choose This Package`

### Secondary

`Back to Packages`

------------------------------------------------------------------------

# 12. Step 4B --- Custom Menu Builder

### Route

`/events/{id}/custom-menu`

The custom menu builder is one of the core interactive product screens.

## 12.1 Layout

Desktop:

``` text
┌───────────────────┬──────────────────────────┐
│ Categories        │ Selected Menu            │
│                   │                          │
│ Starters          │ 2 Starters               │
│ Main Course       │ 3 Main Course            │
│ Rice              │ 1 Dessert                │
│ Breads            │                          │
│ Desserts          │                          │
│ Beverages         │                          │
└───────────────────┴──────────────────────────┘
```

Mobile:

``` text
Categories
[ Starters ▼ ]

Available Items

[ + ] Paneer Tikka
[ + ] Veg Cutlet
[ + ] Gobi 65

Selected: 3 items
Estimated total: ₹XX,XXX
```

## 12.2 Item Card

Should display:

-   item name;
-   short description;
-   dietary marker;
-   price impact where appropriate;
-   selected state;
-   Add/Remove action.

## 12.3 Search

For large catalogs:

`Search dishes`

## 12.4 Recommendation Area

Optional:

> Customers planning similar events often pair these with your
> selection.

This may later be AI-driven, but the base UI should also work with
deterministic recommendations.

------------------------------------------------------------------------

# 13. Package Customization Flow

For a package with selectable groups:

### Example

``` text
Choose 2 Starters

○ Paneer Tikka
○ Veg Cutlet
○ Hara Bhara Kabab
○ Gobi 65
○ Corn Cheese Balls

2 of 5 selected
```

When selection limit is reached:

-   additional invalid choices should be disabled or clearly explained;
-   the customer can replace an existing choice.

### Paid Addition

``` text
Optional Additions

☐ Live Chaat Counter       +₹120/person
☐ Premium Dessert          +₹80/person
☐ Extra Starter            +₹60/person
```

### Important UX Rule

Included items and paid additions must be visually distinguishable.

------------------------------------------------------------------------

# 14. Step 5 --- Guest Count

### Route

`/events/{id}/guests`

### Heading

> How many guests are you expecting?

### Input

Large numeric control:

``` text
[ − ]     500     [ + ]
```

or:

``` text
Number of guests
[ 500 ]
```

### Supporting Text

> You can update this later.

### Validation

-   integer;

-   0;

-   package limits if applicable.

### Price Interaction

If pricing is available:

``` text
Estimated price
₹95,000 – ₹1,08,000

500 guests
```

Changing the count should update the estimate.

------------------------------------------------------------------------

# 15. Step 6 --- Budget

### Route

`/events/{id}/budget`

### Heading

> What's your catering budget?

### Options

``` text
○ Under ₹50,000
○ ₹50,000 – ₹75,000
○ ₹75,000 – ₹1,00,000
○ ₹1,00,000 – ₹1,50,000
○ ₹1,50,000+
○ I'll decide later
```

Alternatively, a numeric/range input may be used.

### Custom Budget

``` text
My budget
₹ [ 1,00,000 ]
```

### Messaging

> Your budget helps us suggest the best options. It does not limit you
> from requesting a quotation.

This is important because the budget is a soft constraint.

------------------------------------------------------------------------

# 16. Step 7 --- Event Details

### Route

`/events/{id}/details`

### Heading

> Tell us about your event

### Fields

#### Date

`Event date`

#### Time

`Event time`

#### Venue

`Venue / Location`

#### Additional Notes

`Anything else the caterer should know?`

Examples:

-   dietary requirements;
-   special serving requirements;
-   timing constraints;
-   VIP requirements;
-   other preferences.

### Validation

The date must not be in the past.

### Availability

If availability checking is implemented:

``` text
✓ Date currently appears available
```

If not:

Do not claim availability.

------------------------------------------------------------------------

# 17. Live Estimate Experience

### Route

`/events/{id}/estimate`

This is a key product moment.

## 17.1 Page Structure

``` text
Your Catering Estimate

Estimated total

₹95,000 – ₹1,08,000

For 500 guests

────────────────────

Menu
Gold Celebration Package
+ 2 paid additions

Guests
500

Budget
₹1,00,000

Event
18 October
7:00 PM
Vijayawada

────────────────────

Budget status
Near your target budget

[ Optimize for Budget ]

[ Review My Plan ]
```

## 17.2 Disclaimer

Always show:

> Estimated price only. Final quotation is subject to caterer
> confirmation.

## 17.3 Price Breakdown

Customer-visible breakdown may include:

-   base package/menu;
-   additional selections;
-   service charges;
-   event-related charges;
-   taxes where applicable.

Do not expose confidential internal cost or margin.

------------------------------------------------------------------------

# 18. Estimate States

## 18.1 Available

Show estimate normally.

## 18.2 Recalculating

Show:

> Updating your estimate...

Do not show stale data as if it were current.

## 18.3 Missing Pricing

Show:

> We can't calculate an estimate for this configuration yet. You can
> still submit the requirement for caterer review.

## 18.4 Invalid Configuration

Show exactly what needs correction.

Example:

> Your selected package allows up to 300 guests. Please choose another
> package or update your guest count.

------------------------------------------------------------------------

# 19. Budget Optimization Flow

Triggered by:

`Optimize for Budget`

### Route

`/events/{id}/optimize`

The system analyzes the current configuration and presents suggestions.

### Example

``` text
Your current estimate

₹1,08,000 – ₹1,18,000

Target budget: ₹1,00,000

Ways to get closer:

1. Replace Premium Dessert
   Save approximately ₹6,000

2. Remove one optional starter
   Save approximately ₹5,000

3. Choose Silver Celebration
   Save approximately ₹10,000

[ Apply ]

[ Keep My Current Menu ]
```

### Important

The system should distinguish:

-   recommendation;
-   applied change.

Nothing material is silently changed.

------------------------------------------------------------------------

# 20. Recommendation Comparison

When a recommendation is selected:

``` text
Current Plan
₹1,08,000 – ₹1,18,000

Recommended Plan
₹98,000 – ₹1,06,000

Changes
− Premium Dessert
+ Standard Dessert

[ Apply Changes ]
[ Cancel ]
```

After applying:

-   event configuration updates;
-   estimate becomes stale/recalculated;
-   customer returns to the planner or estimate.

------------------------------------------------------------------------

# 21. Review Page

### Route

`/events/{id}/review`

This is the final customer checkpoint before quotation request.

## 21.1 Layout

``` text
Review Your Event

FUNCTION
Wedding Reception
[ Edit ]

CATERING
Gold Celebration
[ Edit ]

MENU
8 selected items
2 paid additions
[ Edit ]

GUESTS
500
[ Edit ]

BUDGET
₹1,00,000
[ Edit ]

EVENT
18 Oct 2026
7:00 PM
Venue details
[ Edit ]

ESTIMATE
₹95,000 – ₹1,08,000

Estimated price only.
Final quotation is subject to caterer confirmation.

[ Request Final Quotation ]
```

## 21.2 Validation

The primary CTA should be enabled only when all mandatory requirements
are valid.

------------------------------------------------------------------------

# 22. Quotation Request Confirmation

After submitting:

### Route

`/events/{id}/submitted`

### UI

``` text
Quotation Request Submitted ✓

We've received your catering requirements.

Request ID
CR-2026-00125

Our team will review your requirements and send you a final quotation.

[ View Request ]

[ Go to My Events ]
```

### State

`REQUESTED`

------------------------------------------------------------------------

# 23. Customer Request Tracking

### Route

`/requests/{requestId}`

### Status Timeline

``` text
✓ Request submitted
    7 Sep

● Caterer reviewing
    Current

○ Final quotation
    Pending

○ Booking
    Pending
```

### Request Details

Customer can inspect the submitted snapshot.

### Important

The submitted request is not silently changed when the customer later
edits a draft.

------------------------------------------------------------------------

# 24. Caterer Dashboard

### Route

`/admin`

The caterer dashboard is operational rather than marketing-focused.

## 24.1 Dashboard Sections

``` text
Today's Overview

New Requests       5
Under Review       8
Quotations Sent    4
Upcoming Bookings  7

────────────────────────────

New Requests

CR-00125  Wedding  500 guests
CR-00124  Birthday 150 guests
CR-00123  Corporate 300 guests
```

## 24.2 Primary Actions

-   view request;
-   review quotation queue;
-   manage bookings;
-   manage catalog.

------------------------------------------------------------------------

# 25. Caterer Request Queue

### Route

`/admin/requests`

### Table/Card

``` text
Request       Function     Guests    Date       Budget      Status
CR-00125      Wedding      500       18 Oct     ₹1L         New
CR-00124      Birthday     150       22 Oct     ₹40K        Review
```

### Filters

-   status;
-   date;
-   function;
-   submission date.

------------------------------------------------------------------------

# 26. Caterer Request Detail

### Route

`/admin/requests/{id}`

## Sections

### Customer

-   name;
-   phone;
-   email if available.

### Event

-   function;
-   date;
-   time;
-   venue;
-   notes.

### Catering

-   offering;
-   package/custom;
-   menu;
-   guest count;
-   budget.

### Customer Estimate

Display the estimate shown to the customer, with appropriate internal
context if useful.

### Actions

-   `Start Review`;
-   `Create Quotation`;
-   `Contact Customer`.

------------------------------------------------------------------------

# 27. Caterer Quotation Builder

### Route

`/admin/requests/{id}/quotation/new`

## Layout

``` text
Create Final Quotation

Customer
Event
Menu

────────────────────────────

Quotation Items

Gold Package          ₹90,000
Premium Dessert        ₹4,000
Service Charge         ₹6,000
Travel                 ₹2,000

Subtotal              ₹1,02,000
Discount               -₹2,000
Tax                     ₹4,000
────────────────────────────
Final Amount           ₹1,04,000

Advance Required       ₹30,000

Valid Until             20 Sep

Notes
[____________________]

[ Save Draft ]
[ Send Quotation ]
```

## Important

This amount is the caterer's final commercial offer.

The caterer may differ from the customer estimate.

------------------------------------------------------------------------

# 28. Quotation Versioning

When a sent quotation requires changes:

Do not silently mutate the previously sent version.

Preferred model:

``` text
Quotation v1
   ↓
Superseded
   ↓
Quotation v2
   ↓
Sent
```

The customer should see the currently active quotation while history
remains auditable.

------------------------------------------------------------------------

# 29. Customer Quotation Page

### Route

`/quotations/{quotationId}`

## Layout

``` text
Final Quotation

Wedding Reception
500 guests
18 October 2026

────────────────────

Catering
Gold Celebration

Menu
...

Subtotal             ₹1,02,000
Discount              -₹2,000
Tax                    ₹4,000

Total                ₹1,04,000

Advance required       ₹30,000
Balance                 ₹74,000

Valid until 20 Sep

Terms & Notes
...

[ Accept Quotation ]
[ Reject ]
```

### Important Visual Distinction

The page should explicitly label:

`FINAL QUOTATION`

and not call it an estimate.

------------------------------------------------------------------------

# 30. Quotation Acceptance Flow

When customer taps `Accept Quotation`:

### Confirmation modal

``` text
Accept this quotation?

Final amount
₹1,04,000

Advance required
₹30,000

By continuing, you confirm acceptance of this quotation.

[ Accept & Continue ]
[ Cancel ]
```

### On confirmation

If no advance is required:

→ booking creation.

If advance is required:

→ payment page.

------------------------------------------------------------------------

# 31. Quotation Rejection Flow

### Modal

``` text
Are you sure you want to reject this quotation?

Optional reason
[________________]

[ Reject Quotation ]
[ Keep Quotation ]
```

Quotation transitions to:

`REJECTED`

The customer may later contact the caterer or submit a new request
according to business rules.

------------------------------------------------------------------------

# 32. Advance Payment Flow

### Route

`/bookings/{bookingId}/payment`

### UI

``` text
Confirm Your Booking

Final amount
₹1,04,000

Advance required
₹30,000

Payment method

[ Pay ₹30,000 ]

Secure payment
```

The actual payment provider UI is external/embedded depending on the
selected provider.

------------------------------------------------------------------------

# 33. Payment Result States

## Success

``` text
Payment successful ✓

₹30,000 paid

Your booking is confirmed.

[ View Booking ]
```

## Failed

``` text
Payment was not completed.

Your quotation is still available if it has not expired.

[ Try Again ]
```

## Pending

``` text
We're confirming your payment.

Please wait while we verify the transaction.
```

Do not immediately assume failure if provider confirmation is delayed.

------------------------------------------------------------------------

# 34. Booking Confirmation

### Route

`/bookings/{bookingId}`

### Layout

``` text
Booking Confirmed ✓

Booking ID
BK-2026-00412

Wedding Reception
18 October 2026
7:00 PM
Venue

500 guests

Final amount
₹1,04,000

Advance paid
₹30,000

Balance
₹74,000

[ View Quotation ]
[ Contact Caterer ]
```

------------------------------------------------------------------------

# 35. Booking Dashboard

Customer booking cards should show:

``` text
Wedding Reception

✓ Confirmed
18 Oct 2026
500 guests

₹1,04,000
Advance ₹30,000

[ View ]
```

Historical bookings should remain accessible.

------------------------------------------------------------------------

# 36. AI Assistant Product Flow

AI is integrated as a parallel interaction layer.

There are three major AI entry points.

## 36.1 AI Entry Point A --- Landing Page

Customer can say:

> I need catering for 500 people for a wedding under one lakh.

AI starts a planning conversation.

## 36.2 AI Entry Point B --- During Event Planning

A floating assistant or assistant panel is available while planning.

Example:

``` text
┌────────────────────────────────────┐
│ Catering Assistant                 │
│                                    │
│ You have selected 500 guests.      │
│ Your estimate is ₹1.08L–₹1.18L.   │
│                                    │
│ Would you like options closer      │
│ to your ₹1L budget?                │
│                                    │
│ [ Yes, optimize ]                  │
│                                    │
│ Ask anything...                    │
└────────────────────────────────────┘
```

## 36.3 AI Entry Point C --- Dedicated Assistant

### Route

`/assistant`

A full conversational planning interface.

------------------------------------------------------------------------

# 37. AI Conversation Flow

Example:

### Customer

> I need catering for 500 people for a wedding under one lakh.

### Assistant

Extract:

``` text
Function: Wedding
Guests: 500
Budget: ₹1,00,000
```

Then ask only important missing information:

> I can help with that. Do you need lunch, dinner, or a full-day
> catering option?

Customer:

> Dinner.

Assistant:

> Great. I found a few options that fit your requirements. The closest
> package is estimated at ₹98,000--₹1,06,000 for 500 guests. Would you
> like me to show the menu?

Customer:

> Yes.

Assistant displays menu.

Customer:

> Remove the premium dessert and add gulab jamun.

Assistant:

``` text
I can make that change:

Remove:
Premium Dessert

Add:
Gulab Jamun

Estimated impact:
Approximately lower than your current plan.

Apply this change?
[ Apply ] [ Cancel ]
```

After approval, the normal event planner reflects the change.

------------------------------------------------------------------------

# 38. AI Structured State Interaction

The conversational state must map to the same event state used by the
visual planner.

Conceptually:

``` text
AI Conversation
      ↓
Intent / Entity Extraction
      ↓
Structured Action
      ↓
Application Service
      ↓
Event State
      ↓
Pricing / Recommendation
      ↓
UI Refresh
```

The LLM is not the source of truth.

------------------------------------------------------------------------

# 39. AI Action Confirmation UX

For low-impact informational actions:

``` text
What packages are available?
```

No confirmation needed.

For material state changes:

``` text
Change guest count to 500
Remove Paneer Tikka
Choose Gold Package
```

Use confirmation where appropriate.

For consequential actions:

``` text
Request final quotation
Accept quotation
Make payment
```

AI should not autonomously perform these actions.

The normal explicit UI action should remain authoritative.

------------------------------------------------------------------------

# 40. Multilingual Conversation Flow

The user may interact in:

-   English;
-   an Indian language;
-   transliterated Indian language;
-   mixed English + Indian language.

Example:

> 500 members ki wedding hai, budget one lakh ke around hai.

The assistant should interpret:

``` text
guest_count = 500
function = wedding
budget ≈ ₹1,00,000
```

The canonical application state remains language-independent.

------------------------------------------------------------------------

# 41. Voice Flow

Voice UI can be represented as:

``` text
Tap microphone
      ↓
Speak
      ↓
Speech recognition
      ↓
Language / intent processing
      ↓
AI interpretation
      ↓
Structured application action
      ↓
Confirmation if needed
      ↓
Event state update
      ↓
Visual UI update
      ↓
Spoken response
```

Example:

> "500 guests ke liye one lakh ke andar dinner menu suggest karo."

The system should visually show the interpreted request before
consequential changes.

------------------------------------------------------------------------

# 42. Navigation Rules

## PF-NAV-001

The customer should be able to move backward through the planning flow.

## PF-NAV-002

Going backward shall not automatically erase later data.

## PF-NAV-003

If a change invalidates later data, the application shall clearly
identify the affected state.

Example:

Changing package may invalidate previous menu selections.

## PF-NAV-004

The customer should be able to leave the planning flow and return later.

## PF-NAV-005

Unsaved local input should not unexpectedly disappear because of
accidental navigation where practical.

------------------------------------------------------------------------

# 43. Edit Dependencies

Changing one field can affect downstream state.

  Change        Potential Impact
  ------------- -----------------------------------
  Function      Offering/package/menu eligibility
  Offering      Package/menu eligibility
  Package       Existing menu selections
  Menu item     Estimate
  Guest count   Package eligibility + estimate
  Budget        Recommendations
  Date          Availability
  Venue         Potential travel/service cost
  Event time    Availability/service rules

The UI must make these dependencies understandable.

------------------------------------------------------------------------

# 44. Customer Draft State Model

The planning experience should support:

``` text
DRAFT
  │
  ├── Function selected
  │
  ├── Offering selected
  │
  ├── Menu selected
  │
  ├── Guests entered
  │
  ├── Budget entered
  │
  ├── Event details entered
  │
  └── Ready for review
          ↓
      SUBMITTED
```

A draft may be incomplete.

------------------------------------------------------------------------

# 45. Request State Model

``` text
REQUESTED
    ↓
UNDER_REVIEW
    ↓
QUOTATION_SENT
    │
    ├── Customer accepts
    │
    ├── Customer rejects
    │
    └── Quotation expires
```

Cancellation rules should be enforced by explicit application actions.

------------------------------------------------------------------------

# 46. Quotation State Model

``` text
DRAFT
  ↓
SENT
  ├── ACCEPTED
  ├── REJECTED
  ├── EXPIRED
  └── SUPERSEDED
```

A quotation cannot return arbitrarily from a terminal state to draft.

------------------------------------------------------------------------

# 47. Booking State Model

``` text
PENDING_ADVANCE
       ↓
   CONFIRMED
       ↓
   COMPLETED

Cancellation may occur according to business policy.
```

------------------------------------------------------------------------

# 48. Notification Flow

Notifications should accompany important lifecycle transitions.

Example:

``` text
Customer submits request
        ↓
In-app confirmation
        ↓
Caterer notification
        ↓
Caterer sends quotation
        ↓
Customer notification
        ↓
Customer accepts
        ↓
Caterer notification
        ↓
Payment
        ↓
Booking confirmation
        ↓
Customer + caterer notification
```

The notification mechanism should not be responsible for changing the
underlying business state.

------------------------------------------------------------------------

# 49. Error UX

Every major page must define:

## Loading

``` text
Loading your catering options…
```

## Empty

``` text
No options are available for this selection yet.
```

## Recoverable Error

``` text
Something went wrong.
[ Try Again ]
```

## Validation Error

Explain exactly what needs to be corrected.

## Authorization Error

Do not reveal whether another user's resource exists.

------------------------------------------------------------------------

# 50. Network Recovery

For customer planning:

1.  user changes data;
2.  client attempts persistence;
3.  network fails;
4.  UI preserves local working state where feasible;
5.  user sees connection warning;
6.  retry occurs;
7.  server becomes authoritative after successful synchronization.

The system must avoid duplicate writes when retries occur.

------------------------------------------------------------------------

# 51. Mobile UX Rules

The mobile application should prioritize:

-   large touch targets;
-   sticky primary CTA;
-   compact progress indicator;
-   bottom-sheet item selection where appropriate;
-   readable price display;
-   easy back navigation;
-   minimal typing;
-   numeric keypad for guest count and budget;
-   calendar/time controls for event details.

The menu builder should remain usable with one hand where practical.

------------------------------------------------------------------------

# 52. Desktop UX Rules

Desktop can provide richer layouts:

-   split-screen menu builder;
-   persistent estimate sidebar;
-   larger comparison cards;
-   admin tables;
-   detailed quotation builder.

The desktop layout should not introduce different business behavior from
mobile.

------------------------------------------------------------------------

# 53. Pricing Visibility Rules

The product should progressively expose pricing information.

### Early browsing

Indicative package pricing where configured.

### During planning

Current estimated range.

### Review

Estimated range plus major context.

### Quotation

Final quotation amount.

### Booking

Accepted final amount + payment state.

The same number should never be ambiguously labeled across these stages.

------------------------------------------------------------------------

# 54. Estimate vs Quotation UX

  Attribute              Estimate        Final Quotation
  ---------------------- --------------- ----------------------
  Created by             System          Caterer
  Purpose                Planning        Commercial offer
  Price                  Range           Final amount
  Binding                No              Business-defined
  Editable by customer   Event inputs    Usually no
  Customer acceptance    No              Yes
  Expiry                 Optional/none   Yes where configured

------------------------------------------------------------------------

# 55. Contact Caterer Flow

The customer may need to contact the caterer.

Possible actions:

``` text
[ Call Caterer ]
[ WhatsApp Caterer ]
```

These should use the caterer's configured contact details.

The contact action itself does not replace the application state
machine.

------------------------------------------------------------------------

# 56. Caterer Catalog Management Flow

### Route

`/admin/catalog`

Structure:

``` text
Catalog
├── Functions
├── Offerings
├── Categories
├── Menu Items
└── Packages
```

------------------------------------------------------------------------

# 57. Function Management Flow

### `/admin/catalog/functions`

Actions:

-   create;
-   edit;
-   activate/deactivate.

Function detail:

``` text
Function Name
Description
Image
Active

Applicable Offerings
Packages

[ Save ]
```

------------------------------------------------------------------------

# 58. Menu Item Management Flow

### `/admin/catalog/menu-items`

Actions:

-   search;
-   filter;
-   create;
-   edit;
-   deactivate.

Item form:

``` text
Name
Category
Description
Dietary Type
Base Price
Active
Eligible Functions
Eligible Offerings

[ Save ]
```

Exact pricing fields depend on the pricing model defined in
`database-design.md`.

------------------------------------------------------------------------

# 59. Package Management Flow

### `/admin/catalog/packages`

Package builder:

``` text
Package Name
Description
Applicable Functions
Applicable Offerings

Included Items
Selectable Groups
Paid Additions
Guest Limits
Pricing Rules

[ Save Package ]
```

A package should be previewable from the customer perspective.

------------------------------------------------------------------------

# 60. Caterer Pricing Flow

### `/admin/pricing`

The admin can maintain the commercial rules used by the estimate engine.

The UI should distinguish:

-   customer-facing pricing;
-   internal cost information;
-   configurable charges;
-   discounts;
-   tax configuration.

The exact pricing editor should be designed after the pricing domain
model is finalized.

------------------------------------------------------------------------

# 61. Admin Quotation Flow

``` text
New Request
    ↓
Review
    ↓
Create Draft Quotation
    ↓
Validate
    ↓
Send
    ↓
Customer Receives
    ↓
Accept / Reject / Expire
```

------------------------------------------------------------------------

# 62. Admin Booking Flow

``` text
Accepted Quotation
      ↓
Pending Advance
      ↓
Payment Verification
      ↓
Confirmed
      ↓
Upcoming Event
      ↓
Completed
```

The V1 system does not attempt to manage the caterer's physical
equipment or fleet during this flow.

------------------------------------------------------------------------

# 63. AI + Normal UI Synchronization

The application should treat the event state as canonical.

Example:

``` text
                    ┌─────────────┐
                    │ Event State │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       Normal UI                    AI Assistant
              │                         │
              └────────────┬────────────┘
                           │
                    Application Services
                           │
              ┌────────────┴────────────┐
              │                         │
         Pricing                  Recommendations
```

The assistant should never create a parallel hidden version of the
event.

------------------------------------------------------------------------

# 64. AI Context Display

When AI is active during planning, the assistant should have enough
context to understand:

-   current function;
-   offering;
-   package/custom mode;
-   current menu;
-   guest count;
-   budget;
-   event details;
-   current estimate;
-   unresolved validation issues.

The assistant does not need unrestricted access to the entire customer
database.

------------------------------------------------------------------------

# 65. AI Recommendation Presentation

Recommendations should be structured rather than only conversational.

Example:

``` text
Recommended for your budget

Gold Celebration
₹98,000 – ₹1,06,000

Why:
• Fits 500 guests
• Closest to ₹1L budget
• Includes your selected dessert
• Suitable for wedding dinner

[ Use This Plan ]
[ View Menu ]
```

This gives the customer a bridge between AI conversation and the normal
application.

------------------------------------------------------------------------

# 66. Critical Action Boundary

AI must not become a hidden transaction engine.

The following should remain explicit customer actions:

-   Request final quotation;
-   Accept final quotation;
-   Make payment;
-   Cancel booking;
-   Other financially consequential actions.

AI can explain and guide these actions.

------------------------------------------------------------------------

# 67. Accessibility Flow Requirements

Keyboard users should be able to:

-   navigate package cards;
-   select menu items;
-   operate guest controls;
-   edit event details;
-   open/close AI assistant;
-   review quotation;
-   accept/reject quotation.

Form controls must have accessible labels.

------------------------------------------------------------------------

# 68. Analytics Events

The product should eventually record useful product analytics.

Candidate events:

``` text
landing_viewed
login_started
otp_verified
event_created
function_selected
offering_selected
package_viewed
package_selected
custom_menu_started
menu_item_added
menu_item_removed
guest_count_updated
budget_updated
estimate_viewed
budget_optimization_viewed
recommendation_applied
review_viewed
quotation_requested
quotation_viewed
quotation_accepted
quotation_rejected
payment_started
payment_completed
booking_confirmed
ai_opened
ai_recommendation_requested
ai_change_approved
voice_started
```

Analytics should avoid unnecessarily collecting sensitive personal data.

------------------------------------------------------------------------

# 69. Primary Happy Path

The complete customer journey should feel approximately like:

``` text
Landing
  ↓
Login / OTP
  ↓
Wedding
  ↓
Dinner
  ↓
Gold Package
  ↓
Customize
  ↓
500 Guests
  ↓
₹1,00,000 Budget
  ↓
18 Oct / 7 PM / Venue
  ↓
₹95K–₹1.08L Estimate
  ↓
Optimize
  ↓
₹98K–₹1.06L
  ↓
Review
  ↓
Request Quotation
  ↓
Caterer Review
  ↓
₹1.04L Final Quotation
  ↓
Accept
  ↓
₹30K Advance
  ↓
Booking Confirmed
```

This path is the primary end-to-end product benchmark.

------------------------------------------------------------------------

# 70. Alternative Happy Path --- Custom Menu

``` text
Login
  ↓
Function
  ↓
Offering
  ↓
Custom Menu
  ↓
Select Categories
  ↓
Add / Remove Items
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
  ↓
Final Quotation
  ↓
Booking
```

------------------------------------------------------------------------

# 71. Alternative Path --- AI Assisted

``` text
Login
  ↓
AI Assistant
  ↓
"I need catering for 500 under ₹1L"
  ↓
AI extracts requirements
  ↓
AI asks missing questions
  ↓
Catalog-backed recommendations
  ↓
Pricing service
  ↓
Recommendation cards
  ↓
Customer approves plan
  ↓
Event Planner populated
  ↓
Customer reviews
  ↓
Normal quotation flow
```

The AI path must converge into the same event and quotation workflow.

------------------------------------------------------------------------

# 72. Cancellation and Recovery

## Customer Draft

Customer may abandon a draft and return later.

## Quotation Request

Cancellation behavior is business-defined and should not be confused
with simply leaving the page.

## Quotation

Rejected/expired quotations remain historical.

## Booking

Cancellation follows explicit business rules and must be auditable.

------------------------------------------------------------------------

# 73. Product Flow Quality Gates

Before a page is considered complete:

### Functional

-   primary action works;
-   back navigation works;
-   state persists;
-   validation works;
-   error recovery works.

### UX

-   page has one clear purpose;
-   primary CTA is obvious;
-   important information is visible;
-   mobile layout is usable.

### Business

-   pricing labels are correct;
-   no unsupported availability claims;
-   no accidental quote/booking mutation.

### Security

-   unauthorized resource access is rejected;
-   customer data is protected.

### AI

Where AI is present:

-   AI understands current event context;
-   recommendations use valid catalog data;
-   mutations go through application services;
-   consequential actions remain explicit.

------------------------------------------------------------------------

# 74. Route Map

## Customer

``` text
/
├── /login
├── /login/verify
├── /dashboard
├── /events/new
├── /events/{id}/function
├── /events/{id}/offering
├── /events/{id}/menu-type
├── /events/{id}/packages
├── /events/{id}/packages/{packageId}
├── /events/{id}/custom-menu
├── /events/{id}/guests
├── /events/{id}/budget
├── /events/{id}/details
├── /events/{id}/estimate
├── /events/{id}/optimize
├── /events/{id}/review
├── /events/{id}/submitted
├── /requests/{requestId}
├── /quotations/{quotationId}
├── /bookings/{bookingId}
├── /bookings/{bookingId}/payment
└── /assistant
```

## Admin

``` text
/admin
├── /admin/requests
├── /admin/requests/{id}
├── /admin/requests/{id}/quotation/new
├── /admin/quotations
├── /admin/quotations/{id}
├── /admin/bookings
├── /admin/bookings/{id}
├── /admin/catalog
├── /admin/catalog/functions
├── /admin/catalog/offerings
├── /admin/catalog/categories
├── /admin/catalog/menu-items
├── /admin/catalog/packages
└── /admin/pricing
```

The final route structure may change during frontend architecture
design, but the product-level page responsibilities should remain
stable.

------------------------------------------------------------------------

# 75. Page Inventory

    \# Page                    Actor      Core Purpose                Phase
  ---- ----------------------- ---------- ------------------------- -------
     1 Landing                 Customer   Start planning                  4
     2 Login                   Customer   Phone authentication            2
     3 OTP                     Customer   Verify identity                 2
     4 Dashboard               Customer   Resume/view activity           11
     5 Function                Customer   Select event type               4
     6 Offering                Customer   Select catering service         4
     7 Menu Type               Customer   Package/custom choice           4
     8 Packages                Customer   Browse packages                 4
     9 Package Detail          Customer   Inspect package                 4
    10 Custom Menu             Customer   Build menu                      5
    11 Package Customization   Customer   Customize package               5
    12 Guests                  Customer   Guest count                     5
    13 Budget                  Customer   Budget                          5
    14 Event Details           Customer   Date/time/venue                 5
    15 Estimate                Customer   Indicative pricing              6
    16 Optimize                Customer   Budget recommendations          7
    17 Review                  Customer   Final review                    8
    18 Submission              Customer   Confirm request                 8
    19 Request Detail          Customer   Track request                8/11
    20 Quotation               Customer   Review final offer              9
    21 Payment                 Customer   Pay advance                    10
    22 Booking                 Customer   View confirmed booking      10/11
    23 AI Assistant            Customer   Conversational planning        12
    24 Admin Dashboard         Caterer    Operational overview           11
    25 Request Queue           Caterer    Review requests                 8
    26 Request Detail          Caterer    Inspect customer need           8
    27 Quotation Builder       Caterer    Create final quote              9
    28 Quotation Detail        Caterer    Manage quote                    9
    29 Booking Queue           Caterer    Manage bookings             10/11
    30 Booking Detail          Caterer    Manage booking              10/11
    31 Catalog                 Caterer    Catalog overview                3
    32 Menu Items              Caterer    Manage menu                     3
    33 Packages                Caterer    Manage packages                 3
    34 Pricing                 Caterer    Manage pricing                3/6

------------------------------------------------------------------------

# 76. Recommended Frontend Component Boundaries

The product flows imply reusable components such as:

``` text
AppShell
ProgressStepper
FunctionCard
OfferingCard
PackageCard
PackageDetail
MenuCategoryTabs
MenuItemCard
MenuBuilder
SelectionGroup
GuestCounter
BudgetSelector
DatePicker
TimePicker
VenueForm
EstimateCard
EstimateBreakdown
BudgetStatus
RecommendationCard
ReviewSection
QuotationCard
QuotationTimeline
PaymentSummary
BookingSummary
StatusBadge
ConfirmationModal
AIChatPanel
VoiceControl
```

These are product-level component boundaries, not yet final
implementation contracts.

------------------------------------------------------------------------

# 77. State Ownership Principle

The frontend should distinguish:

### Server State

Examples:

-   catalog;
-   event persisted state;
-   quotations;
-   bookings;
-   payments;
-   notifications.

### Local UI State

Examples:

-   currently open category;
-   modal state;
-   temporary input;
-   expanded section.

### Derived State

Examples:

-   budget status;
-   selected item count;
-   estimate freshness;
-   completion percentage.

The canonical event configuration must ultimately come from validated
application state.

------------------------------------------------------------------------

# 78. Product Flow Dependency on Backend

The UI should not implement business logic independently where that
would create divergence.

Examples:

### Package Eligibility

Backend authoritative.

### Pricing

Backend authoritative.

### Quotation Status

Backend authoritative.

### Booking Status

Backend authoritative.

### Payment Status

Payment provider + backend authoritative.

### AI Recommendations

AI may generate proposals, but application services validate them.

------------------------------------------------------------------------

# 79. Design Handoff Notes

The following documents should use this flow specification as the
baseline:

### `system-design.md`

Define:

-   frontend architecture;
-   backend architecture;
-   service boundaries;
-   event state;
-   pricing service;
-   AI service;
-   notification architecture;
-   payment integration.

### `database-design.md`

Define entities and relationships for:

-   events;
-   menus;
-   packages;
-   quotations;
-   bookings;
-   payments;
-   AI conversations.

### `api-spec.md`

Convert each major flow action into concrete API contracts.

### `ai-design.md`

Define:

-   intent extraction;
-   tool architecture;
-   structured actions;
-   conversation state;
-   approval mechanism;
-   multilingual handling;
-   voice pipeline.

### `testing-strategy.md`

Convert these flows into:

-   unit tests;
-   integration tests;
-   E2E scenarios;
-   AI evaluation scenarios.

------------------------------------------------------------------------

# 80. Product Flow Definition of Done

The product-flow design is considered complete for system-design handoff
when:

1.  every MVP customer action has a defined page/interaction;
2.  every MVP caterer action has a defined page/interaction;
3.  navigation between pages is explicit;
4.  state persistence expectations are defined;
5.  estimate/quotation/booking distinctions are explicit;
6.  major error states are defined;
7.  AI entry and convergence into normal UI are defined;
8.  mobile behavior is considered;
9.  critical financial actions require explicit user intent;
10. backend ownership of business rules is clear.

------------------------------------------------------------------------

# 81. Next Step

The next artifact should be:

**`system-design.md`**

It should convert these product flows into a concrete technical
architecture covering:

-   Next.js frontend architecture;
-   FastAPI backend architecture;
-   PostgreSQL data architecture;
-   domain/service/repository boundaries;
-   authentication/session architecture;
-   pricing engine architecture;
-   quotation and booking state machines;
-   AI tool architecture;
-   multilingual/voice boundaries;
-   notification and payment integrations;
-   security boundaries;
-   deployment architecture;
-   sequence diagrams;
-   request/data flows;
-   scalability and observability.

Implementation should still proceed incrementally, beginning with
project foundation and authentication rather than building all modules
at once.
