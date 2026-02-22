# Remaining react-router-dom → react-router Fixes

## ✅ COMPLETED
- HomePage.tsx
- CustomerApp.tsx  
- UnifiedLanding.tsx
- MessagesPage.tsx
- AdminDashboard.tsx
- EditCard.tsx
- StylistsPage.tsx

## ⚠️ STILL NEED TO FIX (Change `react-router-dom` → `react-router`)

### High Priority (Core Functionality)
1. MessageDetailPage.tsx - `useParams, useNavigate`
2. ProtectedRoute.tsx - `useNavigate`
3. CreateEditPage.tsx - `useNavigate, useLocation, useParams`
4. CustomerOrderView.tsx - `useNavigate, useParams`

### Medium Priority (Forms & Pages)
5. ChrisLanding.tsx - `useNavigate`
6. ChrisIntakeForm.tsx - `useNavigate`
7. ChrisWaitlistPage.tsx - `useNavigate, useLocation`
8. LewisLanding.tsx - `useNavigate`
9. LewisWaitlistPage.tsx - `useNavigate, useLocation`
10. DorianLanding.tsx - `useNavigate`
11. DorianWaitlistPage.tsx - `useNavigate, useLocation`
12. EditIntakeForm.tsx - `useNavigate, useParams`
13. IntakeFormPage.tsx - `useParams, useNavigate`
14. GenericWaitlistPage.tsx - `useNavigate, useLocation, useParams`
15. CustomerInboxPage.tsx - `useNavigate`

### Low Priority (Settings & Info Pages)
16. RorySelectsDetail.tsx - `useNavigate, useParams`
17. ChangeEmailPage.tsx - `useNavigate`
18. PrivacyPolicyPage.tsx - `useNavigate`
19. TermsOfServicePage.tsx - `useNavigate`
20. NotificationsPage.tsx - `useNavigate`
21. HelpContactPage.tsx - `useNavigate`

### Debug/Admin Tools
22. DebugOrders.tsx - `useNavigate`
23. SimpleDebug.tsx - `useNavigate`
24. BottomNav.tsx - `useNavigate, useLocation`
25. IOSBottomNav.tsx - `useNavigate, useLocation`
26. IonicBottomNav.tsx - `useNavigate, useLocation`
27. AdminCleanupPage.tsx - `useNavigate`

## Quick Fix Pattern

For each file, find and replace:
```
import { useNavigate } from 'react-router-dom';
```
With:
```
import { useNavigate } from 'react-router';
```

And:
```
import { useNavigate, useLocation } from 'react-router-dom';
```
With:
```
import { useNavigate, useLocation } from 'react-router';
```

etc.
