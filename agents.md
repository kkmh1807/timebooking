Private Dance Lesson Booking — Product & Tech Plan

1. Product overview

A small, studio-owned web app for booking private dance lessons (one-to-one or small private sessions—not group class schedules). Customers browse open time slots, book a lesson, and read studio info. A handful of admins post availability by date/hour, see who booked, and publish general information. Goal: ship a usable MVP fast for one studio, with clear ownership of slots and bookings. All user-facing UI copy (customer and admin) is in Norwegian.

2. Personas & jobs

Customer

Find when the studio/instructor is free

Book a private lesson for a specific date and hour

Confirm details (style, duration, contact) without calling

Read practical info (location, styles, pricing notes, how booking works)

Admin (studio owner / instructor)

Publish open lesson hours by date and hour

See who booked which slot (name, contact, notes)

Post/update general information pages or announcements

Avoid double-booking and keep a single source of truth for the calendar

3. Core flows

Customer

Browse availability — Open calendar/list of upcoming open slots; filter by date (and optionally style/instructor if offered in MVP).

Book a lesson — Pick a free slot → enter name, email/phone, optional notes (style preference, experience) → submit → see confirmation; slot becomes unavailable.

Read info — View studio pages (about, location, pricing, policies).

Admin

Post slots — Pick date(s) and hour(s) → create open slots (duration fixed or selectable) → optionally set style/instructor label.

View bookings — List upcoming bookings with customer contact and slot details; mark cancel/no-show if needed.

Post info — Create/edit general info content (markdown or simple rich text) and publish.

4. MVP scope

Must-have (v1)

Public site: availability list/calendar, book form, confirmation screen

Admin: login, create/delete open slots by date+hour, booking list with contact fields

Simple “info” content (1–3 pages or one editable info document)

Roles: customer (no account required to book) vs admin (authenticated)

Prevent double-booking (slot status: open → booked)

Basic email confirmation to customer (and optional admin notify) if easy with chosen stack

Explicitly out of scope (v1)

Payments / deposits / packages

Multi-studio marketplace or franchise admin

Recurring group class schedules

Student accounts, lesson history portals, progress tracking

SMS, waitlists, reschedule self-service, instructor multi-calendar complexity

Mobile native apps; complex CRM / marketing automation

5. Information model

Entity

Purpose

Key fields

User

Admin identity (customers may be guest bookers)

id, email, name, role (admin), auth provider ids

Slot

Bookable private lesson hour

id, startsAt, endsAt (or durationMinutes), status (open | booked | cancelled), optional label (style/instructor), createdBy

Booking

Reservation against a slot

id, slotId (unique when booked), customerName, customerEmail, customerPhone, notes, status (confirmed | cancelled), createdAt

InfoPage

General published content

id, slug, title, body, updatedAt, published

Rules of thumb:

One active booking per slot; releasing a booking reopens the slot or deletes/cancels both consistently.

Slots are the inventory; bookings are the demand records with PII.

6. Tech stack recommendation

Opinionated pick for a small admin + public booking site that ships quickly:

Layer

Choice

Why

Frontend + backend

SvelteKit (Svelte 5)

One repo, SSR + forms, fast UI; excellent for marketing pages + app routes

API

SvelteKit server routes / form actions

No separate API service for MVP

Auth

Simple admin password (session cookie after login; env-stored secret)

Customers book as guests; one studio admin—no OAuth or magic links

Database

SQLite via Turso (libSQL) + Drizzle ORM

Same relational model as Postgres, zero hosted Postgres ops; Turso keeps the file durable across deploys

Hosting

Vercel

Chosen deploy target; push-to-deploy with SvelteKit; pair with Turso so the DB isn’t on ephemeral disk

Email

Resend

Booking confirmations / admin alerts

Rationale: Single full-stack app, guest checkout-style booking, admin-gated mutations, SQLite for slots/bookings/info with unique constraints to prevent double-booking. Turso (not a local .db on the serverless host) so data survives deploys. Avoids overbuilding (no separate Nest/Rails API, no Firebase client-only rules soup).

Brief alternatives: Local SQLite file if we self-host on a single long-lived server. Postgres/Neon later if we outgrow SQLite. Next.js + Prisma if the team prefers React.

7. App structure

Customer (public)

/ — Home + short pitch + CTA to book / view availability

/availability — Upcoming open slots

/book/[slotId] — Booking form for one slot

/book/confirmation — Success state

/info or /info/[slug] — General information

/login — Admin only (customers don’t need accounts)

Admin (protected)

/admin — Dashboard summary (today/upcoming bookings)

/admin/slots — List + create/delete availability

/admin/bookings — Who booked what; cancel/release

/admin/info — Edit/publish general info

8. Design direction

Minimal and easy: clear hierarchy, lots of calm space, few controls per screen.

No AI-slop aesthetics: avoid purple/indigo gradients, cream+serif+terracotta clichés, glow effects, pill clusters, decorative card grids, emoji ornament.

Norwegian UI throughout; expressive but restrained typography; one clear visual direction tied to the studio brand when branding is set.

9. Open decisions

Payments? Pay at studio only for v1, or take a deposit online later?

Single studio / single instructor for launch, or multiple instructors with separate calendars?

Lesson length fixed (e.g. 60 min) or selectable when posting slots?

Confirmations: email only, or also SMS? Who gets notified (customer, admin, both)?

Cancellation policy: admin-only cancel, or customer self-cancel via link?

Timezone / studio location: one fixed timezone assumed? (Europe/Oslo likely)

Studio branding: name, logo, colors for the minimal look?

Capacity: strictly 1:1, or allow “private” sessions up to N people on one booking?
