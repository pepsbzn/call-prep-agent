# Maison & Main — Client Meeting Notes
## Sierra AI | Agent Development | Retail Vertical

**Client:** Maison & Main
**Industry:** Home goods and lifestyle retail | $800M revenue | Strong DTC e-commerce
**Sierra Contact:** Peps Bengzon, Strategist — Agent Development
**Agent Scope:** Returns, upsell recommendations, automated outreach to negative reviews

**Key Stakeholders:**
- **Dana Reyes** — VP Customer Experience. Executive sponsor. Commercially driven, wants results fast
- **Tom Keller** — Sr. Director Digital Product. Technical skeptic. Needs data before sign-off
- **Priya Nair** — CX Operations Manager. Day-to-day partner. Owns Experience Manager reviews
- **Marcus Webb** — Lead Engineer. Handles API integrations. Responsive but stretched thin

---

## Meeting 1 — Kickoff
**Date:** Week 1
**Attendees:** Dana Reyes, Tom Keller, Priya Nair, Marcus Webb, Peps (Sierra)

**Summary:**
Introductions and scope alignment. Dana opened by emphasizing that resolution rate improvement is the primary success metric — she wants to see meaningful containment lift within the first quarter post-launch. Tom pushed back on timeline, citing past failed chatbot implementations and requesting more rigorous testing before anything goes live. Priya confirmed she will own the Experience Manager review process and has already begun auditing existing CX documentation.

**Decisions made:**
- Agent scope confirmed: returns processing, upsell recommendations, automated outreach to customers who left 1-2 star reviews
- Success metrics agreed: 55% containment rate target, CSAT floor of 4.2, escalation rate below 30%
- RACI established: Sierra owns build and optimization, Maison & Main owns knowledge base content and API access provisioning
- Launch target: 10 weeks from kickoff

**Open items:**
- Marcus to provide API documentation for OMS and CRM by end of Week 2
- Priya to complete documentation audit by end of Week 3
- Tom requested a written data privacy summary covering PII handling before build begins
- Sierra to share simulation methodology deck before next meeting

---

## Meeting 2 — Technical Discovery
**Date:** Week 3
**Attendees:** Tom Keller, Marcus Webb, Peps (Sierra), Sierra Engineering

**Summary:**
Deep dive into Maison & Main's backend systems. Marcus walked through their OMS (custom-built, REST API, mostly clean documentation) and CRM (Salesforce, standard integration). Returns flow requires three sequential API calls: verify order eligibility, initiate return, trigger refund. Marcus flagged that the refund API has an undocumented rate limit of 50 calls per minute — a potential bottleneck during peak periods. PII concern raised: customer email and order history will pass through the agent, triggering need for a data processing addendum (DPA) before build begins.

**Decisions made:**
- OMS and CRM integrations scoped — both achievable within timeline
- Returns flow will require chained API calls: eligibility check → return initiation → refund trigger
- Upsell journey will pull from product recommendation engine via separate API (Marcus to document)
- Review outreach will use customer email API — PII implications confirmed, DPA required

**Open items:**
- Marcus to document product recommendation API and rate limits by Week 4
- Legal (both sides) to review and sign DPA before build begins — flagged as critical path
- Sierra to build fallback messaging for refund API rate limit scenario
- Tom to confirm whether sandbox environment mirrors production data structure

**Risks flagged:**
- DPA timeline could push build start — legal review estimated at 2-3 weeks
- Sandbox environment uses anonymized data — may not surface all edge cases during testing

---

## Meeting 3 — Build Check-In
**Date:** Week 6
**Attendees:** Dana Reyes, Priya Nair, Tom Keller, Peps (Sierra)

**Summary:**
Mid-build review. Sierra presented Journey designs for all three use cases. Returns Journey approved with minor edits — Tom requested harder escalation guardrail for orders over $500 (agent must transfer to human, no exceptions). Upsell Journey approved — Dana wants the agent to lead with the recommendation before offering assistance, not after. Review outreach Journey flagged: Dana concerned the automated tone feels too templated and not on-brand. Priya confirmed knowledge base is 80% complete — gaps remain around bundle return policies and gift card handling.

**Decisions made:**
- Returns guardrail updated: hard escalation for orders over $500
- Upsell sequencing changed: recommendation leads the conversation
- Review outreach copy to be revised by Priya before testing phase — Sierra to provide template options
- First simulation suite to run end of Week 7

**Open items:**
- Priya to close knowledge base gaps (bundle returns, gift cards) by Week 7
- Sierra to send three review outreach tone options for Dana's approval by end of week
- Tom to confirm sandbox vs. production data parity — still outstanding from Meeting 2
- DPA signed by both parties — legal cleared, no longer a blocker

**Risks flagged:**
- Knowledge base gaps could limit simulation coverage — partial suite only if gaps not closed by Week 7
- Review outreach tone not approved — this Journey may slip behind returns and upsell

---

## Meeting 4 — Pre-Launch Review
**Date:** Week 9
**Attendees:** Dana Reyes, Tom Keller, Priya Nair, Marcus Webb, Peps (Sierra)

**Summary:**
Final review before staged rollout. Simulation results presented: returns Journey at 61% simulated containment, upsell at 58%, review outreach at 44% (lower due to tone variability across reviewer types). Tom raised a new concern: the returns flow passes full order history to the agent — he wants this scoped to the specific order in question only. Change required before launch. Dana accepted a 1-week delay to accommodate. Marcus confirmed all APIs are stable in production. Staged rollout plan agreed: 10% of traffic for first two weeks, expand to 50% if metrics hold, full launch at Week 12.

**Decisions made:**
- Returns flow scoped to single-order PII only — full order history removed from payload
- Staged rollout: 10% → 50% → 100% with 2-week gates
- Go/no-go criteria: containment above 45% and CSAT above 4.0 at each gate
- Review outreach Journey delayed — will launch 2 weeks after returns and upsell

**Open items:**
- Sierra to update returns payload scope before rollout begins
- Marcus to monitor API error rates during 10% rollout and report daily
- Priya to begin daily Experience Manager reviews from day one of rollout
- Dana wants weekly executive summary during rollout period — Sierra to own

**Risks flagged:**
- Review outreach delay means one of three Journeys won't be live at launch
- 10% traffic may skew toward edge cases — early metrics may not be representative

---

## Meeting 5 — Post-Launch Review
**Date:** Week 14
**Attendees:** Dana Reyes, Priya Nair, Marcus Webb, Peps (Sierra)

**Summary:**
First performance review after full launch. Overall containment at 41% — below the 55% target. Returns Journey underperforming most significantly at 34% containment. Root causes identified: guardrail for orders over $500 is triggering too broadly (flagging orders at $480-$500 range due to tax/shipping ambiguity), knowledge base gaps on bundle returns causing agent to escalate rather than resolve, and Marcus reporting intermittent API timeouts on the refund trigger call (affecting roughly 8% of return attempts). Upsell Journey performing well at 61% containment. Review outreach just launched — too early for meaningful data. Dana visibly frustrated — wants a remediation plan by end of week.

**Decisions made:**
- Returns guardrail recalibrated: $500 threshold now applies to item price only, not order total
- Knowledge base gaps (bundle returns) escalated to Priya — 48-hour remediation timeline
- Marcus to investigate refund API timeout — suspected rate limit issue during peak hours
- Weekly remediation check-ins added until containment hits 50%+

**Open items:**
- Priya to update bundle return policies in knowledge base by end of Week 14
- Marcus to pull API error logs and identify timeout pattern — report by end of week
- Sierra to run targeted simulation on returns Journey post-guardrail fix
- Dana requested updated containment projections based on fixes — due Monday

**Risks flagged:**
- API timeout issue unresolved — if rate limit confirmed, requires architectural fix not just a patch
- Dana's patience is thin — if containment doesn't improve materially by Week 16, escalation to her SVP likely
- Review outreach performance data not yet available — third Journey still unproven

---

## Meeting 6 — Optimization Session
**Date:** Week 18
**Attendees:** Dana Reyes, Priya Nair, Tom Keller, Peps (Sierra)

**Summary:**
Significant improvement since last session. Overall containment now at 52% — still below 55% target but trajectory is strong. Returns Journey recovered to 48% after guardrail recalibration and knowledge base updates. API timeout issue resolved — Marcus confirmed it was a rate limit issue during 6-8pm peak; solution was request queuing rather than architectural change. Review outreach showing early promise: 38% of outreach conversations resulting in review update or customer re-engagement. Tom acknowledged improvement but wants to see 55% sustained for two consecutive weeks before signing off on upsell Journey expansion. Dana approved scoping next phase: upsell Journey expansion to include cross-category recommendations (currently limited to same-category).

**Decisions made:**
- Containment target of 55% remains — Tom's two-week sustained threshold added as gate
- Upsell expansion scoped: cross-category recommendations using collaborative filtering API
- Review outreach to be evaluated formally at Week 20 — Priya to compile engagement metrics
- Request queuing implemented as permanent fix for refund API rate limit

**Open items:**
- Sierra to design cross-category upsell Journey — initial design due Week 20
- Priya to compile review outreach engagement report by Week 20
- Tom's two-week 55% gate — Week 19 and 20 containment reports critical
- Dana asked about voice agent possibility for returns — Sierra to assess feasibility and share POV

**Risks flagged:**
- Cross-category recommendations require new API integration (collaborative filtering) — Marcus bandwidth a concern
- Two-week gate means upsell expansion can't be formally scoped until Week 21 at earliest
- Voice agent feasibility unknown — Dana's interest may create scope creep if not managed carefully

