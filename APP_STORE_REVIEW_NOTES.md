# App Store Review Notes & Technical Architecture Overview

## Application Summary
**RadioCast Live** (Radyo Dünyası & Podcast) is a web-based live radio discovery, streaming, and podcast directory application. It enables users to browse, search, and stream publicly available live radio broadcasts and Turkish podcasts.

## Key Architecture & Media Delivery Principles
1. **Directory & Metadata Integration**:
   - Radio metadata is aggregated from public directory catalogs (e.g., Radio Browser API) and verified curated Turkish station listings.
   - Podcast metadata is fetched via official iTunes Search API endpoints and public podcast RSS feeds.

2. **Stream Playback & Media Handling**:
   - **Direct Playback**: Compatible, CORS-enabled HTTPS audio streams are played directly from the broadcaster's original server URL using HTML5 `<audio>` and `hls.js`.
   - **Controlled Stream Relay**: For certain legacy HTTP broadcasts or streams requiring browser protocol compatibility, the backend provides an SSRF-protected, controlled transient relay endpoint (`/api/radio/stream/:stationId`).
   - **No Media Hosting / No Downloads**: The application does **NOT** permanently host, save, record, convert, or allow downloading of any audio files or streams.
   - **No Open Proxy**: The relay endpoint accepts only validated station IDs registered in the internal catalog; it does not serve as an open URL proxy.

3. **Content Protection & Takedown Mechanism**:
   - **Contact Email**: `radiocastlive@proton.me`
   - **Online Takedown Form**: Available on the public web app at `/takedown`.
   - **Enforcement**: Valid takedown or owner delisting notices are immediately enforced by registering the identifier (station UUID, stream URL, podcast ID, feed URL) into the permanent content blacklist (`data/content-blacklist.json`), removing the item from search, discovery, favorites, queues, and API relay endpoints.

4. **Production Legal & Compliance URLs**:
   - **Copyright Policy**: `https://ais-dev-tqc3zczl7lkv4fd5nkloua-424773571576.europe-west3.run.app/copyright`
   - **DMCA / Takedown**: `https://ais-dev-tqc3zczl7lkv4fd5nkloua-424773571576.europe-west3.run.app/dmca`
   - **Online Takedown Form**: `https://ais-dev-tqc3zczl7lkv4fd5nkloua-424773571576.europe-west3.run.app/takedown`
   - **Privacy Policy**: `https://ais-dev-tqc3zczl7lkv4fd5nkloua-424773571576.europe-west3.run.app/privacy`
   - **Terms of Service**: `https://ais-dev-tqc3zczl7lkv4fd5nkloua-424773571576.europe-west3.run.app/terms`
   - **Content Policy**: `https://ais-dev-tqc3zczl7lkv4fd5nkloua-424773571576.europe-west3.run.app/content-policy`
