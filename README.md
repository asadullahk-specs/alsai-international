# AL SA'I - Luxury Perfume eCommerce Platform

A full-stack eCommerce system for the AL SA'I perfume brand: a public storefront and
a separate enterprise-grade admin panel, built on the
MERN stack (MongoDB, Express, React, Node) with Tailwind CSS. Every piece of content
- products, prices, homepage sections, policies, footer, testimonials - is
stored in MongoDB and managed through the admin panel. Nothing is hardcoded.

## System overview

The project is really **two connected front-ends sharing one backend**:

1. **Public website** - browsing, search, cart, checkout, product pages, policies.
   There is no separate customer dashboard/panel: once logged in, a customer simply
   gets access to place orders, plus a notifications icon, an orders icon (their
   bill/order history), a profile icon, and a logout button in the same navbar
   everyone else uses. Checkout is a single simple form (name, phone, email,
   address, payment method) that ends in an order confirmation ("the bill"),
   which is the same view shown again from My Orders.
2. **Admin panel** - a completely separate, independently-secured control center
   covering catalog, sales, marketing, content, operations, and system
   administration. The public navbar never appears inside it, and vice versa.

## Tech stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT access tokens (in-memory only, never in localStorage) + httpOnly
  refresh-token cookies, with CSRF token cookies for mutating requests
- **Security middleware:** Helmet, CORS allow-list, rate limiting, MongoDB
  injection sanitization, XSS sanitization, HPP protection, bcrypt password
  hashing, RBAC (role-based access control) on every admin route
- **Media:** all admin-managed images/videos are entered as **Google Drive share
  links** (never uploaded to the app server) and are automatically converted to
  Google's direct-thumbnail format at render time (see `driveImg()` below) - the
  only exception is customer-submitted review photos, which are real file uploads.

## Project structure

```
alsai-ecommerce/
├── server/                     Express API
│   └── src/
│       ├── models/             Mongoose schemas (~25 models)
│       ├── controllers/        Route handlers, one per resource
│       ├── routes/             Route definitions, mounted under /api
│       ├── middleware/         auth, RBAC (authorize), rate limiting, sanitization
│       ├── utils/               shared helpers (email, activity logging, tokens...)
│       └── seed/                database seed scripts
└── client/                     React app (Vite)
    └── src/
        ├── pages/               public site + customer account pages
        ├── components/          shared public/customer components
        ├── admin/                the entire admin panel (pages, components, layout)
        ├── context/              AuthContext, AdminAuthContext, CartContext...
        ├── hooks/                shared hooks (e.g. useSessionGuard)
        ├── api/                  axios instances (public / customer / admin)
        └── utils/                formatPrice, driveImg, etc.
```

## Feature coverage

### Public website
Home (hero slider, featured collections, shop-by-category, best sellers, promotions
banner, new arrivals, testimonials, our story, newsletter), Shop (filters,
sort, pagination, search, gift sets rail), Gift Set detail pages (gallery, price,
included products list linking back to each product's own page), Product detail
(gallery/video, size selector, reviews, related & recently viewed), Gift Sets
listing, Promotions listing, Cart, Wishlist, Contact, About, FAQs, policy pages,
and a working search modal (debounced live results from the navbar search icon).

### Customer account
There is no separate customer panel/dashboard. Once logged in, a customer gets:
a notifications icon (real order-status updates, unread badge), an orders icon
(flat "My Orders" list - clicking an order shows the bill again, with live
status), a profile icon (the details entered at signup, plus a Change Password
section), and a logout button - all living in the same navbar as everyone else,
inside the normal site chrome. Checkout is a single simple form (name, phone,
email, address, payment method); placing the order shows the bill immediately.
All backed by real API calls, no mock data.

### Admin panel
Dashboard (KPI cards + Recharts sales/orders charts, top products, recent activity),
Products, Categories (Perfumes/Attars), Collections & Featured Collections,
Fragrance Families, Gift Sets, Promotions, Orders, Customers, Reviews, Messages
(contact form submissions), Inventory, Reports (sales/orders/customers/products/
inventory/revenue tabs with charts), Notifications, Homepage Manager (hero slider,
featured collections, best sellers, new arrivals, promotions banner, newsletter,
testimonials), Website Content (about page, shop page banner, contact info, footer,
social links, announcement bar, FAQs, policies), Newsletter
subscriber management, Settings (general, shipping, pricing, payments, email,
**email templates editor**, security), Activity Logs, Backup & Restore, and Users &
Roles with granular per-module permissions.

## Responsive design system

Beyond Tailwind's default breakpoints, the project defines a set of custom
`min-*`/`max-*` pixel breakpoints in `client/tailwind.config.js` (e.g. `max-480`,
`max-820`, `min-1181`) to hit exact client-specified breakpoints throughout the
admin and public UI. Two reusable components implement the recurring "Orders-style"
responsive pattern used across most admin list pages:

- **`admin/components/common/StackTable.jsx`** - renders as a normal `<table>`
  above a given pixel breakpoint, and as stacked label-left/value-right cards below
  it. Takes its breakpoint as a prop (via an injected scoped `<style>` media query,
  not a Tailwind class), so every page can use its own exact pixel value without
  needing that value pre-registered as a Tailwind screen.
- **`admin/components/common/FilterTabs.jsx`** - the same idea for a row of status
  tabs: a horizontal tab strip above the breakpoint, a `<select>` dropdown below it.

Below 480px site-wide, a single global CSS rule (`html { font-size: 87.5% }` in
`index.css`) proportionally shrinks every rem-based font size and spacing value
across the whole system, rather than hand-tuning hundreds of individual classes.

## Security

- Access tokens live in memory only (never `localStorage`/`sessionStorage`);
  session continuity comes from an httpOnly, secure refresh-token cookie.
- CSRF tokens are read from a separate cookie and attached to all mutating
  requests (`POST`/`PUT`/`PATCH`/`DELETE`).
- **Customer sessions:** auto-logout after 10 minutes of inactivity, and shortly
  after the tab is minimized/backgrounded and stays that way. A page refresh does
  **not** log the customer out - the session is restored via the refresh cookie.
- **Admin sessions are stricter:** everything customer sessions do, **plus** a
  full page reload/refresh always forces re-authentication (the admin session is
  actively invalidated server-side on every mount of the admin app shell).
- Every admin API route is gated by `authorize(module, action)` RBAC middleware,
  matched against the permissions on the admin's assigned Role.
- Every important admin action (product changes, order updates, settings changes,
  role/user management, review moderation, login/logout) is written to the
  Activity Log.
- Rate limiting, Helmet security headers, MongoDB-injection sanitization, and XSS
  sanitization are applied globally in `server/src/app.js`.

## Getting started

### Prerequisites
Node.js 18+, a MongoDB instance (local or Atlas).

### Backend
```bash
cd server
cp .env.example .env      # then fill in MONGODB_URI, JWT secrets, etc.
npm install
npm run seed               # creates the first Super Admin (see .env for credentials)
npm run seed:catalog       # optional: seeds sample catalog data
npm run dev                 # starts on PORT from .env (default 5000)
```

### Frontend
```bash
cd client
cp .env.example .env       # VITE_API_URL should point at the backend above
npm install
npm run dev                 # Vite dev server, default http://localhost:5173
```

Admin panel: `http://localhost:5173/admin/login` (credentials from the seed step).
Customer site: `http://localhost:5173/`.

### Production build
```bash
cd client && npm run build   # outputs client/dist
cd server && npm start        # serves the API; point your web server at client/dist
```

## Media: how Google Drive links work

Every admin form that manages an image or video (products, banners, homepage
sections, gift sets, etc.) takes a Google Drive **share link** as plain text -
never a file upload. Behind the scenes, `client/src/utils/driveImg.js` recognizes
Drive share-link formats (`/file/d/<id>/view`, `?id=<id>`) and rewrites them to
`https://drive.google.com/thumbnail?id=<id>&sz=w1000` at render time, which is the
format Google actually serves raw image bytes from for hotlinking. Paste any
"Anyone with the link can view" Drive share URL and it will render correctly
everywhere in the app; non-Drive URLs (including the app's own locally-stored
customer review photos) pass through unchanged. Admin forms that manage media also
show a live thumbnail preview next to the link field so you can confirm a link
works before saving.

## Notes for continued development

- The `StackTable`/`FilterTabs` components are the intended pattern for any new
  admin list page that needs to be responsive - reuse them rather than hand-rolling
  another breakpoint-specific table.
- `driveImg()` should be applied to any new `<img>`/`<video>` `src` that comes from
  admin-entered data, for the same reason described above.
- The custom Tailwind breakpoints in `tailwind.config.js` intentionally avoid
  arbitrary bracket variants like `min-[900px]:` - Tailwind silently disables those
  once any *named* screen uses the `{ max: '...' }` object form, which caused a
  real bug earlier in this project. Add a new named breakpoint to the config
  instead of reaching for an arbitrary one.
- When using more than one `max-*` custom breakpoint on the same element (e.g.
  `max-1280:grid-cols-2 max-640:grid-cols-1`), be aware that Tailwind emits the
  media queries in the **order the screens are declared in `tailwind.config.js`**,
  not the order the classes appear in your JSX. Two overlapping `max-width` rules
  at the same specificity means whichever one is declared later in the config
  wins in the browser, even at very narrow widths - this silently broke the
  Inventory and Reports stat-card grids (they never actually collapsed to 1
  column) before this round of fixes. Prefer mobile-first `min-*` breakpoints
  (base class + `min-641:` + `min-1281:` etc.) for any new multi-breakpoint grid
  to sidestep the issue entirely.

## Changelog - round 1

**Main site**
- "Our Story" section text is now left-aligned on mobile (was visually centered
  because the flex container used `items-center` in its stacked/column layout).
- Hero Slider: all slide images now preload together up front instead of each
  slide's `<img>` mounting fresh only when it becomes active, which was causing a
  visible late-load flash on every slide change.
- Seasonal Cuts section (`SeasonalBanner`) moved to sit below Best Sellers and
  above New Arrivals on the homepage. Its auto-rotate interval is now 2.5s
  (previously 4.5s), and its banner images use the same up-front-preload fix as
  the Hero Slider. The navbar's "SEASONAL CUTS" link now smooth-scrolls straight
  to this section (navigating home first if needed) instead of opening the
  separate `/seasonal` page.
- Shop page: the "All Fragrances" / collection banner (shared by the All,
  Perfumes, and Attars views) now has an explicit hero-like height
  (`h-[220px] sm:h-[280px] md:h-[320px]`) so its background image actually shows,
  instead of collapsing to just the height of the text content above it.
- Shop page: gift set thumbnails were rendering broken images because the
  Google Drive share link wasn't being converted via `driveImg()` - fixed.
- Gift Sets now have their own customer-facing product page
  (`/gift-sets/:slug`, `client/src/pages/product/GiftSetPage.jsx`) with gallery,
  price, quantity, add-to-cart, and a "What's Included" list linking to each
  included product's own page. Backed by a new `GET /api/gift-sets/:slug`
  endpoint that populates `includedProducts.product`. Gift set cards on the Shop
  page and Gift Sets listing page are now clickable links to this page. (Admin
  management of gift sets - including which products are included and at what
  size - already existed at Admin > Gift Sets and needed no changes.)

**Admin panel**
- Product edit > Pricing tab: the sizes/pricing/stock table now switches to a
  stacked-card layout below 820px (matching the responsive treatment already
  used by the Lowest/Highest/Average Price + Total Stock summary directly below
  it), instead of forcing horizontal scroll on a 700px-wide table on mobile.
- Homepage Manager: the "Add New Slide" and "Add Testimonial" buttons now drop
  below their section headers on screens narrower than 480px instead of being
  squeezed onto the same line.
- Website Content: the Footer / Social Links / Announcement Bar row now switches
  from a stacked to a 3-column layout at 1301px instead of 1024px, giving Social
  Links more room before the layout compresses.
- Inventory page: the 4 top stat cards now correctly collapse to 1 per row below
  640px (previously they got stuck at 2 columns due to a Tailwind breakpoint
  cascade-order conflict - see note below).
- Reports page: the 6 overview stat cards now correctly collapse to 1 per row
  below 640px (same cascade-order fix, also moved from the previous 480px cutoff
  to 640px per the new spec).

**Customer account**
- Edit Address: the City/Province fields now stack into a single column at the
  same breakpoint (480px) where the Cancel/Save buttons already stack, instead of
  always staying side-by-side regardless of screen width.

## Answers to open questions (asked during round 1, now resolved in round 2)

- **Where is the coupons banner used?** It's the site-wide **Announcement Bar**
  (Admin > Website Content > Announcement Bar) - a text-only strip rendered at
  the very top of the site by `Navbar.jsx`, driven by
  `websiteContent.announcementBar.text`/`.isActive`. It's the natural place to
  advertise an active coupon code; it does not carry an image. The coupon code
  itself is redeemed at checkout (`ReviewStep.jsx` calls
  `POST /coupons/validate`) - the announcement bar and the Coupons collection
  aren't linked in code, so the text has to be updated by hand to match
  whatever coupon is currently active.
- **Where are the banner images used?** The `PromoBanner` model (Admin > Banners,
  `placement` values `shop_top` / `shop_bottom` / `product_page` / `sitewide`)
  previously had no public route and wasn't rendered anywhere - as of round 2
  this is now wired up end-to-end; see the round 2 changelog below.

## Changelog - round 2

**The hero slider "disappearing images" bug (root cause fixed)**
- Root cause: `server/src/seed/seedCatalog.js`'s `upsert()` helper ran
  `Model.findOneAndUpdate(match, data, ...)` with a plain data object (no
  `$set`). MongoDB treats an update object with no `$` operators as a **full
  document replacement**, not a merge. For per-item seeds (Products,
  Collections, Gift Sets - each matched by its own unique slug) that's
  harmless. But `WebsiteContent` and `HomepageContent` are **singleton**
  documents matched by `{}`, so every time `npm run seed:catalog` was re-run
  (which the README's own setup steps tell you to do), the entire document was
  replaced with the hardcoded seed defaults below it - silently wiping any
  hero slides, images, or text an admin had added or edited through the admin
  panel, since none of the placeholder hero slides in the seed script even
  have a `backgroundImage` set. This is exactly what "images disappear after a
  fresh restart" was.
- Fix: added a `seedOnce()` helper (uses `$setOnInsert` instead) and switched
  the `WebsiteContent` and `HomepageContent` seed calls to it. These two
  documents are now only ever populated the *first* time the script runs
  (i.e. when neither document exists yet) and are a safe no-op on every
  subsequent run, no matter how many times you re-seed. Per-item seeds
  (Products, Collections, Gift Sets, Testimonials, Fragrance Families,
  Featured Collections) are unchanged and still update-in-place by design.

**Homepage**
- "Our Specialities" (Perfumes/Attars cards) now supports an optional video
  per collection (Admin > Categories > Video field, Google Drive link) as its
  primary media - falls back to the static image if no video is set. Unlike
  New Arrivals, these cards have no hover-image swap.
- New Arrivals row now uses the same `mediaMode="video"` treatment as Best
  Sellers: video plays as primary media where a product has one; products
  without a video fall back to image + hover-image swap on hover.
- Navbar's "SEASONAL CUTS" link reverted back to linking straight to the
  dedicated `/seasonal` page (this undoes the scroll-to-homepage-section
  behaviour from round 1, per updated instructions - the Seasonal Cuts section
  still lives on the homepage between Best Sellers and New Arrivals, it's just
  no longer where the navbar link points).

**Gift Set product pages**
- Added a new admin-managed background banner for gift set product pages:
  Admin > Website Content > Gift Set Page > banner image, rendered at the top
  of every `/gift-sets/:slug` page.

**Promo Banners - now actually wired up**
- Added `GET /api/promo-banners?placement=...` (public, matches placement
  exactly) and a shared `<PromoBanner placement="..." />` component.
- `shop_top` renders at the top of the Shop page filter/grid area; `shop_bottom`
  renders at the very bottom of the Shop page; `product_page` renders on every
  product detail page, above Related Products; `sitewide` renders once,
  globally, in `PublicLayout.jsx` (just below the navbar, on every page) -
  each placement is matched exactly by the backend so `sitewide` banners don't
  also show up duplicated inside the other three placements.
- Banners with no `linkUrl` render as plain images; banners with a `linkUrl`
  are wrapped in a link.

**Seasonal Cuts page (`/seasonal`) - redesigned**
- Was two separate banners stacked on top of each other (a static heading
  strip, then a separate "Promotion Timings" image below it) - looked doubled
  up compared to every other page (Shop, Gift Sets) which has exactly one
  hero-style banner. Replaced both with a single unified banner: the heading
  text stays fixed in place while the background auto-rotates through every
  active campaign's banner image every 2.5s, using the same up-front image
  preload technique as the Hero Slider so it never looks static or "not
  changing" and never has a late-load flash on transition.
- Fixed the discount sub-line being cramped against the bottom edge of the
  banner - the text block now sits centered with extra bottom padding
  reserved so it's never flush against the frame edge on any screen size.
- The page now only ever shows genuinely discounted products. Previously, a
  campaign set to "applies to all products" pulled in up to 24 arbitrary
  active products regardless of whether they had a live discount. The backend
  now filters every campaign's product list down to items where at least one
  size has a `salePrice` that's actually lower than its `price`, and drops any
  campaign left with zero qualifying products instead of showing an empty
  section.

## Changelog - round 3

**Media reliability (Google Drive images/videos)**
- Root cause of "images not showing / disappearing after a restart": the app
  hot-linked straight to Google's undocumented thumbnail endpoints
  (`drive.google.com/thumbnail`, `lh3.googleusercontent.com`), which get
  throttled once a page fires off 20+ simultaneous requests (a shop grid,
  hero slider, etc.) and intermittently just stop serving. The database was
  never losing anything - `MONGODB_URI` points at Atlas, which is persistent.
- Fix: added a backend media proxy/cache (`GET /api/media/:fileId`,
  `server/src/utils/driveMedia.js`). It resolves a Drive link once, tries
  several Google endpoints in sequence, and caches the actual bytes to local
  disk (`server/uploads/drive-cache/`). Every request after that is served
  from disk - fast, immune to Google's throttling, and survives restarts.
  Genuine failures (deleted/unshared file) now show a clean placeholder
  instead of a broken-image icon, site-wide, since every image/video funnels
  through the single `driveImg()` client helper. Range requests are
  supported so video scrubbing still works.

**No customer panel - removed entirely**
- Per client request, the customer account panel/dashboard (`AccountLayout`,
  `/account/*` routes, saved Addresses, the multi-step checkout wizard) has
  been removed. A logged-in customer now simply has access to place orders,
  reached through ordinary icons in the same navbar as everyone else - no
  separate dashboard shell:
  - **Notifications** (bell icon) - real order-status notifications with an
    unread badge (`CustomerNotificationContext`, mirrors the existing admin
    one). Logged out, this (like every protected link below) routes to
    `/login`, which shows "Please login to your account to continue."
  - **My Orders** (the existing account icon, repurposed) - a flat order
    history list at `/orders`; opening an order shows the same "bill" view
    (`/orders/:id`) with its live status, whether reached from My Orders or
    right after placing an order.
  - **Profile** (new icon, shown only once logged in) - the details entered
    at signup, plus an inline collapsible Change Password section, at
    `/profile`.
  - **Logout** - a dedicated button in the navbar, shown only once logged in.
  - **Checkout** (`/checkout`) - collapsed from a 4-step wizard into one
    simple form: name, phone, email, address, payment method. Placing the
    order shows the bill immediately.
  - Forgot/Reset Password already existed and needed no changes: the email
    sent contains a button linking to `/reset-password/:token`.
  - The `Address` model/API were left in place (harmless, unused) rather than
    deleted, since the admin's Customer Details page still reads from it;
    checkout itself no longer saves or reads from an address book.

**Coupons & Banners - removed entirely (admin + web)**
- Deleted end-to-end: `Coupon`/`PromoBanner` models, their controllers and
  routes (customer + admin), the admin Coupons/Banners pages and sidebar
  links, the `<PromoBanner placement="..." />` component and every usage
  (`PublicLayout`, Shop, Product page), the coupon-code field on checkout,
  and their entries in the backup/export tool.

**"Seasonal Cuts" renamed to "Promotions"**
- Renamed everywhere it's user-visible: navbar link (`/promotions`), admin
  sidebar entry and route (`/admin/promotions`), page headings, the
  homepage's rotating discount banner's link, and the footer's seeded nav
  link. The underlying `SeasonalCollection` model/API paths were left as an
  internal implementation detail and were not renamed.
