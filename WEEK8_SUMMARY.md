# TSH ERP - Week 8 Summary ✅

**Status:** Complete  
**Focus:** Surgical Enhancements — Information Visibility + Workflow Simplification

## Problems Solved
1. **CRM Blind Spot** → CRM now sees approved campaign details and upcoming sessions
2. **Marketing Blind Spot** → Marketing now sees approved campaign details and sessions for promotion
3. **CM Context Gap** → Tutor notes now displayed in all asset cards
4. **HOD Bottleneck** → Hub assets now route directly to Content Manager (`pending_cm`)
5. **Guidance Gaps** → 19 new SOP links across CRM, Marketing, CM, Finance, HOD

## Changes Made

### server.js
- `GET /api/campaigns` — added `?status=` query param filter
- `GET /api/support_sessions` — added `?upcoming=true` and `?status=` filters
- `POST /api/assets` — Hub assets now status `pending_cm` (not `pending_hod`); CM notified for both categories
- `GET /api/assets` — CM now sees `pending_cm`, `approved`, `published` assets
- `PATCH /api/assets/:id/publish` — accepts `pending_cm` OR `approved` status

### index.html
- **CRM Overview**: Shows approved campaigns + upcoming sessions with cards
- **Marketing Overview**: Shows approved campaigns + scheduled sessions with cards
- **ContentManagerQueue**: Tutor notes shown in both Free and Hub asset cards; Hub tab counts `pending_cm`
- **HOD Sidebar**: Upload Queue tab removed (`hod` removed from roles)
- **API layer**: `getCampaigns(params)` and `getSessions(params)` now accept query params

## New Files
- `seed_week8_sops.js` — seeds 19 SOP links; fixes DB constraint to allow `finance` role
- `verify_week8.js` — 6-test automated verification
- `WEEK8_SUMMARY.md` — this file

## Workflow Change
**Before:** Tutor → Hub upload → `pending_hod` → HOD approves → CM publishes  
**After:** Tutor → Hub upload → `pending_cm` → CM approves & publishes

## SOP Links Seeded (19 total)
| Role | Links |
|------|-------|
| CRM | 5 |
| Marketing | 6 |
| Content Manager | 4 |
| Finance | 4 |
| HOD (additional) | 1 |

## Deferred to Week 10+
CEO interface, Admin Assistant interface, Content Calendar, Feedback log — pending user testing validation.
