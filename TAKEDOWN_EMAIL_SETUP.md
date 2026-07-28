# RadioCast Live - DMCA & Content Takedown Resend Integration Setup

This document describes how the server-side email delivery system works for copyright, DMCA, and content takedown notices on RadioCast Live.

## Overview

The takedown system collects structured DMCA and copyright notices via the online form at `/takedown` and transmits them securely via [Resend](https://resend.com) to `radiocastlive@proton.me`.

The integration operates strictly **server-side** (via Node.js server route `/api/takedown` or Vercel Serverless Function `/api/takedown.ts`). No API keys or sensitive credentials are ever exposed to the client bundle or browser.

---

## Environment Variables (Vercel)

Set the following environment variables in your Vercel Project Settings (`Settings` -> `Environment Variables`):

| Variable Name | Required | Description | Example Value |
|---|---|---|---|
| `RESEND_API_KEY` | **Yes** | Vercel secret key for Resend API | `re_your_secret_key` |
| `TAKEDOWN_TO_EMAIL` | Optional | Destination email address for notices | `radiocastlive@proton.me` |
| `RESEND_FROM_EMAIL` | Optional | Sender address (Resend verified domain or onboarding) | `RadioCast Live <onboarding@resend.dev>` |
| `PUBLIC_SITE_URL` | Optional | Production public URL of the application | `https://radiocastlive.vercel.app` |

---

## Technical Flow & Features

1. **Client Submission**:
   - User fills out the DMCA / Takedown form at `/takedown`.
   - Client sends JSON POST payload to `/api/takedown`.

2. **Server-Side Validation & Case ID**:
   - Validates mandatory fields (Name, Email, Description, Declarations, Electronic Signature).
   - Generates a unique Case ID (e.g. `RC-20260728-A1B2C3`).
   - Escapes HTML inputs to prevent injection vulnerabilities.
   - Enforces IP rate limiting.

3. **Resend Email Transmission**:
   - Sends formatted plain-text & safe HTML emails to `TAKEDOWN_TO_EMAIL` (`radiocastlive@proton.me`).
   - Sets `replyTo` header to the claimant's validated email address so hitting "Reply" in Proton responds directly to the applicant.

4. **Response**:
   - Returns JSON response with `success: true` and the generated `caseId`.
   - Displays confirmation to the user without exposing internal server error traces or secret keys.

---

## Fallback Mechanism

If server email delivery fails or if the server is unreachable, the client provides an immediate `mailto:` fallback button allowing the user to send their prepared notice directly from their default mail application to `radiocastlive@proton.me`.
