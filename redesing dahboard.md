 **@Screenshot 2026-06-23 165346.png**  now dashboard like this

---


Let me explore the project structure first.

---


Now I have a clear picture. I need to:

1. Redesign `SuperAdminSidebar` to match the screenshot (logo, icons, nav sections, user profile, logout)
2. Redesign `super-admin/clients/page.tsx` to match the screenshot (stats cards, search/filter bar, rich table with avatars, status badges, actions, pagination)
3. Update `ClientsTable` to support the new design with email, phone, joined date, status columns
4. Update `Pagination` to match the numbered pagination style

Let me also check the User model for available fields:

---


Now I have everything I need. Here's the plan:

1. **`SuperAdminSidebar.tsx`** — Redesign with logo, icons, proper nav sections (Super Admin + System), user profile at bottom, logout
2. **`super-admin/clients/page.tsx`** — Add stats cards (Total Clients, Active Clients, Total Campaigns, Avg Campaigns/Client), pass email/createdAt to table
3. **`ClientsTable.tsx`** — New columns: avatar initials, Client Name, Email, Phone (N/A from DB), Joined On, Total Campaigns, Status, Actions (3-dot menu)
4. **`Pagination.tsx`** — Numbered pagination with prev/next arrows

Let's start:

---

Redesign SuperAdminSidebar to match the screenshot with logo, icons, nav sections, user profile, and logout.

---

Redesign the clients page to match the screenshot with stats cards, header actions, and pass email/createdAt to the table.

---

Redesign ClientsTable to match the screenshot with avatar initials, email, phone, joined date, status badge, and 3-dot actions menu.

---

You have reached the limit. 

Request ID: 846de210-2f5d-4645-9e19-e5d04eb24df9 