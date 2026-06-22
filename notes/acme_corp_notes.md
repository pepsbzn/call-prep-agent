# Acme Corp — Client Meeting Notes
## Sierra AI | Agent Development | Retail Vertical

**Client:** Acme Corp
**Industry:** Sporting goods retail | $400M revenue | Omnichannel
**Sierra Contact:** Peps Bengzon, Strategist — Agent Development
**Agent Scope:** Order tracking, returns, loyalty program inquiries

---

## Meeting 1 — Kickoff
**Date:** Week 1

**Summary:**
Initial scope alignment. Client wants to reduce inbound call volume by 30% within two quarters. Primary use case is order tracking — 60% of inbound contacts are "where is my order" queries. Returns and loyalty inquiries are secondary.

**Decisions made:**
- Agent scope confirmed: order tracking, returns, loyalty balance inquiries
- Success metric: 30% reduction in inbound call volume
- Launch target: 8 weeks from kickoff

**Open items:**
- IT team to provide OMS API documentation by Week 2
- Legal to confirm data handling requirements

---

## Meeting 2 — Technical Discovery
**Date:** Week 3

**Summary:**
OMS uses a third-party platform (Manhattan Associates). API documentation provided — standard REST, well documented. Loyalty platform is custom-built with limited API coverage. Engineer flagged that loyalty balance API only supports read operations — no write access, meaning the agent cannot redeem points on behalf of customers.

**Decisions made:**
- Order tracking and returns scoped for build
- Loyalty limited to balance inquiry only — no redemption
- Fallback to human agent for loyalty redemption requests

**Open items:**
- Confirm whether loyalty API rate limits apply
- Legal sign-off on customer PII handling still pending
