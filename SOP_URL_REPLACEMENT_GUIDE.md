# Week 7: SOP URL Replacement Guide

Implementation for Week 7 is complete with **placeholder SOP links**.

To activate the links, replace the 5 `href="#"` values with actual Notion URLs.

---

## How to Replace URLs

### **Step 1: Find Placeholder Links in `index.html`**

Open `index.html` and search for: `data-sop=`

You'll find 5 links tagged with these identifiers:

1. `data-sop="CLASS_PLANNING"`
2. `data-sop="CLASS_DELIVERY"`
3. `data-sop="ASSET_BUILDING"`
4. `data-sop="VIDEO_CREATION"`
5. `data-sop="APPROVAL_CRITERIA"`

---

### **Step 2: Replace `href="#"` with Actual URLs**

**Example:**

**BEFORE:**
```html
<a href="#" data-sop="CLASS_PLANNING" target="_blank" rel="noopener">
  Class Planning & Asset Prep Guide
</a>
```

**AFTER:**
```html
<a href="https://notion.so/your-workspace/class-planning-sop-123abc" 
   data-sop="CLASS_PLANNING" target="_blank" rel="noopener">
  Class Planning & Asset Prep Guide
</a>
```

---

## Required URLs

### **Tutor Overview (4 URLs needed)**

| data-sop Attribute | Link Text | SOP Description |
|--------------------|-----------|-----------------|
| `CLASS_PLANNING` | Class Planning & Asset Prep Guide | How to prepare lessons after campaign approval |
| `CLASS_DELIVERY` | Class Delivery Guide (Free & Paid) | How to deliver free campaign classes and paid support sessions |
| `ASSET_BUILDING` | Asset Building Guide | How to build worksheets, guides, and solutions |
| `VIDEO_CREATION` | Video Creation Guide | How to record/edit short-form and long-form videos |

### **HOD Overview (1 URL needed)**

| data-sop Attribute | Link Text | SOP Description |
|--------------------|-----------|-----------------|
| `APPROVAL_CRITERIA` | Campaign Approval Criteria | SOP-ACA-007: When to approve/reject campaign proposals |

---

## Verification

After replacing URLs:

1. Login as Tutor
2. Go to Overview page
3. Click each of the 4 SOP links
4. Verify they open correct Notion pages in new tab
5. Login as HOD
6. Go to Overview page  
7. Click the 1 SOP link
8. Verify it opens correct Notion page in new tab

If you don't have Notion SOP URLs yet, the system functions perfectly with placeholder links.
