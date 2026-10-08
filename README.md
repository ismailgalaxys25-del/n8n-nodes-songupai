# n8n-nodes-songupai

This is an n8n community node for [SongUp AI](https://www.songupai.com), an AI song maker. It makes songs with vocals in
24 languages from an idea or your own lyrics, and starts workflows when a song is finished.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community
nodes documentation and install `n8n-nodes-songupai`.

## Operations

**SongUp AI** node (also usable as an AI agent tool):

- **Song → Create:** starts a song from a song idea, with optional language, lyrics, music type, style and title. The song
  comes back with status `pending` and is ready in about 1-3 minutes.
- **Song → Get:** gets a song by ID, with its status and the MP3 link (`audio_url`) once it is finished.
- **Song → Get Many:** lists the account's songs, newest first, filtered by status.

**SongUp AI Trigger** node:

- **Song Finished:** polls for finished songs and starts the workflow once per song, including songs made on
  songupai.com and with the Create operation.

## Credentials

1. Sign in at [songupai.com](https://www.songupai.com) (free accounts work).
2. Open [Settings → API keys](https://www.songupai.com/settings?tab=developers) and make a key. It starts with `sup_`.
3. In n8n, create a **SongUp AI API** credential and paste the key.

## Compatibility

Built with `@n8n/node-cli` 0.51 and tested with n8n 1.x. No runtime dependencies.

## Usage

A common workflow: a form, CRM or shop trigger → **SongUp AI → Create** with a song idea such as "A birthday song for
{{ $json.name }}" → a second workflow with **SongUp AI Trigger** → email or post the `audio_url`.

## Resources

- [SongUp AI API docs](https://www.songupai.com/developers)
- [OpenAPI spec](https://www.songupai.com/api/v1/openapi)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
