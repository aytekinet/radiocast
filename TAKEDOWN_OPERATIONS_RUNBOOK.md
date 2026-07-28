# Takedown Operations Runbook

Step-by-step procedures for operators receiving copyright or station-owner delisting requests.

## Takedown Workflow

1. **Receipt of Request**:
   - Check `radiocastlive@proton.me` or online takedown submission at `/takedown`.
2. **Verification**:
   - Verify claimant identity and authority (broadcaster domain email, ownership proof).
   - Identify target content: Station Name, Station UUID, Stream URL, or Podcast Collection ID / Feed URL.
3. **Execution**:
   - Open `data/content-blacklist.json`.
   - Add entry with identifier, reason code (`copyright_request`, `station_owner_request`), timestamp, and active flag `true`.
   - Commit changes to Git repository:
     ```bash
     git add data/content-blacklist.json
     git commit -m "fix(compliance): blacklist station UUID <ID> per claim <CASE_ID>"
     git push
     ```
4. **Verification in Production**:
   - Confirm that the station/podcast disappears from search, discovery, catalog, and relay proxy (`/api/radio/stream/:stationId` returns 404).
5. **Confirmation**:
   - Send email confirmation to claimant from `radiocastlive@proton.me`.
