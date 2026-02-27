# Week 7: Manual Verification Checklist

Follow these steps to visually verify the Week 7 Interface Polish changes:

## 1. Day 1: Field Label Updates (Subject & Student Name)
**Role:** Any (`tutor@tsh.com`, `hod@tsh.com`, `cm@tsh.com`)
- [ ] Go to **Campaigns** tab → Click **+ New Campaign**.
  - Verify the first input placeholder is `"Subject/Course (e.g. G12 Math, University Physics)"` (was "Subject").
  - Submit it to ensure it processes normally.
- [ ] Go to **Upload Queue** tab → Click **+ New Asset**.
  - Select any category to reveal the form.
  - Verify the placeholder is `"Subject/Course (e.g. Math, Biology)"` (was "Subject").
  - Submit an asset to ensure it processes normally.
- [ ] Go to **Assessment Map** tab → Click **+ Add Assessment**.
  - Verify the first input placeholder says `"Subject/Course (e.g. G12 Math)"`.
  - Submit it to ensure it processes.
- [ ] Go to **Support Sessions** tab → Click **Schedule Session**.
  - Verify the `"Student Name"` field has been completely removed.
  - Verify the `"Subject"` label now reads `"Course/Subject"`.
  - Submit the form and verify the session appears in the list successfully.

## 2. Day 2: Assessment Map Updates (Quiz/Topic & Auto-Pressure)
**Role:** Any (`tutor@tsh.com`, `hod@tsh.com`)
- [ ] Go to **Assessment Map** tab → Click **+ Add Assessment**.
  - Open the **Type** dropdown.
  - Verify it now contains `"Quiz"` and `"Topic"`.
  - Verify the `"High Pressure/Medium/Low"` dropdown has been removed from the form.
- [ ] Create 3 Assessments with different dates:
  1. Date within 7 days from today.
  2. Date 14 days from today.
  3. Date 30 days from today.
- [ ] Check the Assessment Cards for those created:
  - The one within 7 days should show a red `HIGH` badge.
  - The one 14 days out should show a yellow `MEDIUM` badge.
  - The one 30 days out should show a green `LOW` badge.

## 3. Day 3: Tutor Notes (Upload Queue)
**Role:** Tutor (`tutor@tsh.com`) and HOD (`hod@tsh.com`)
- [ ] Log in as **Tutor**.
- [ ] Go to **Upload Queue** tab → Click **+ New Asset**.
  - Select "Hub Resource" or "Free Class Content" and tick an asset checkbox.
  - Verify the **Tutor Notes (Optional)** textarea is positioned just above the Submit row.
  - Fill out the form, add some test notes like "Please review from 10:00 to 15:00", and submit.
- [ ] Log in as **HOD** (for a Hub Resource) or **Content Manager** (for Free Content).
- [ ] Go to **Upload Queue** tab.
  - Find the asset you just uploaded.
  - Verify your Tutor Notes are displayed clearly on the card in a blue box below the drive link.

## 4. Days 4 & 5: SOP Link Placeholders (Overview pages)
**Role:** Tutor (`tutor@tsh.com`) and HOD (`hod@tsh.com`)
- [ ] Log in as **Tutor**.
- [ ] On the default **Overview** (Getting Started) screen, check the list items.
  - Verify the 4 SOP links with document icons (📄) appear:
    - *Class Planning & Asset Prep Guide*
    - *Class Delivery Guide (Free & Paid)*
    - *Asset Building Guide (Worksheets, Guides, Solutions)*
    - *Video Creation Guide (Short & Long Form)*
  - Hover over or click them — verify they safely open `#` (empty page or top of window), proving the placeholder works.
- [ ] Log in as **HOD**.
- [ ] On the default **Overview** (Getting Started) screen, check the list items.
  - Verify the 1 SOP link appears under "Review pending campaigns":
    - *Campaign Approval Criteria (SOP-ACA-007)*
  - Click it and verify it points to the `#` placeholder safely.

**Verification passed when all boxes are checked.** If you need to add the actual SOP links, view `SOP_URL_REPLACEMENT_GUIDE.md`.
