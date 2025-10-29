# Partnership Page Fix - Summary

## Issue
The Edit Store partnership page fails to load established partnerships. Instead, it only displays potential partners as if the user is creating a new store, while the Dashboard Overview correctly shows established partnerships.

## Root Cause
The `PartnershipStep` component in `src/features/stores/components/steps/PartnershipStep.tsx` doesn't implement the `isEditMode` flag that's already available in the `StepProps` interface. This causes it to always behave as if it's in new store setup mode, never loading established partnerships.

## Current Incorrect Behavior
In edit mode, the component calls:
```
await partnershipsApi.getPartnershipsByStoreId(formState.storeId, {
  status: 'active,pending'  // ❌ WRONG - returns empty
})
```

## Correct Behavior (from Dashboard)
In edit mode, it should call:
```
await partnershipsApi.getPartnershipsByStoreId(formState.storeId, {
  partnerType: 'processor' // or 'producer' ✅ CORRECT - returns partnerships
})
```

## Solution Overview

### 1. Add isEditMode Flag to Props
Extract the `isEditMode` prop from `StepProps` in the function signature.

### 2. Add State for Edit Mode
```typescript
const [establishedPartnerships, setEstablishedPartnerships] = useState<Partnership[]>([]);
const [showEstablished, setShowEstablished] = useState(false);
const [searchDialogOpen, setSearchDialogOpen] = useState(false);
```

### 3. Add loadEstablishedPartnerships Function
Replaces `loadExistingPartnerships`. Calls the correct API with `partnerType` parameter.

### 4. Update useEffect Hooks
- Load established partnerships when in edit mode: `if (formState.storeId && isEditMode)`
- Auto-search only in new store mode: `if (formState.storeId && !partnerships.partnershipType && !isEditMode)`

### 5. Add Helper Functions
- `getPartnerStoreName()` - Get the partner's store name
- `handleOpenSearchDialog()` - Open search dialog for adding partners
- `handleCloseSearchDialog()` - Close search dialog
- `handleCreatePartnership()` - Create new partnership and reload

### 6. Add Conditional UI Rendering
Three states in edit mode:
1. **Has established partnerships**: Show partnership cards with "Add New Partners" and "Manage Partners" buttons
2. **No established partnerships**: Show "Find Partners" button
3. **Search dialog**: Allow user to search and add new partners

In new store mode, show existing UI (potential partners list).

## Required Imports
```typescript
import { partnershipsApi, type Partnership } from '@/features/partnerships/services/partnershipsApi';
// Add to MUI imports: Dialog, DialogTitle, DialogContent, DialogActions
// Add to icon imports: Add as AddIcon, Settings as SettingsIcon
```

## Testing Checklist
- [ ] New store setup: Shows potential partners, can select and save
- [ ] Edit store with partnerships: Shows established partnerships with action buttons
- [ ] Edit store with no partnerships: Shows "Find Partners" button
- [ ] Add New Partners button: Opens dialog with potential partners
- [ ] Can add partnership from dialog and see it appear in list

## Files to Modify
- `src/features/stores/components/steps/PartnershipStep.tsx` (Main fix)
- No other files need changes (isEditMode is already passed from OpenShopPage.tsx)

## Implementation Priority
High - This blocks users from managing partnerships when editing their stores.