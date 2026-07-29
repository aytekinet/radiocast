# Copyright Compliance Implementation Guide

This document details the copyright compliance, takedown handling, and central blacklisting implementation.

## 1. Routes Implemented
- `/copyright`: Copyright Notice and Takedown Policy (TR/EN)
- `/dmca`: DMCA and Notice-and-Takedown Policy (TR/EN)
- `/takedown`: Online Takedown / Delisting Request Form
- `/counter-notice`: Counter Notice Procedure Page
- `/privacy`: Privacy Policy detailing takedown request data processing
- `/terms`: Terms of Service explaining index/directory nature
- `/content-policy`: Content Moderation & Listing Policy

## 2. Central Content Blacklist System
- **Blacklist File**: `data/content-blacklist.json`
- **Matching Criteria**:
  - Station ID / UUID
  - Podcast ID / iTunes Collection ID
  - Podcast Episode GUID
  - Stream URL SHA-256 Hash / Normalized URL
  - Hostname / Domain
- **Filtered Layers**:
  - `server.ts`: Radio Browser API proxy, Station search, Single station by ID, Podcast search, Podcast RSS feed parser, Stream Relay endpoint (`/api/radio/stream/:stationId`)
  - `radioApi.ts`: Client API wrapper & fallback turkish stations array
  - UI Views: DiscoverView, PodcastView, FavoritesView, PlaylistsView, CountriesView, Search, Playback Queues (Next/Previous)

## 3. Contact Email
All notice-and-takedown correspondence is directed to:
**`radiocastlive@proton.me`**

## 4. Takedown Form Features
- Located at `/takedown`
- Input validation (Name, Email, Application URL, Complaint Description, Good Faith & Accuracy Declarations)
- Rate limiting & anti-abuse checks
- Server-side email proxy attempt with `mailto:` fallback to `radiocastlive@proton.me`
