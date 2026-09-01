# Monetization scope decision — 1 September 2026

## Decision

v0.1 is a fully enabled, free desktop download. No one-time purchase, checkout, or license restore control is exposed in v0.1.

## Why this is truthful

The earlier research acceptance called for a one-time purchase, but no registered Sociobot billing product or working checkout is available for this release. Advertising a price or purchase button would therefore point visitors to an unavailable purchase. The public site and app instead say **Free to download** and do not imply a paid unlock.

## Tested boundary

`@claim:free-download` checks the landing copy, README, this decision, and the absence of checkout/payment integration in shipped site, desktop, and public code. This records the deliberate scope change while preserving the complete free local-search workflow.

## Revisit

Before a paid tier is announced, register the product through the Sociobot billing engine and implement checkout, return-token storage, daily license verification, and license restoration under the paid-unlock contract. Until that work is released, a purchase is not an available purchase.
