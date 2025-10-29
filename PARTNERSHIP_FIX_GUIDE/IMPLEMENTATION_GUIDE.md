# Partnership Page Fix - Implementation Guide

## Problem Summary
The Edit Store partnership page fails to load established partnerships. It only shows potential partners as if creating a new store, instead of displaying already-established partnerships like the Dashboard Overview does.

## Root Cause
The `PartnershipStep` component doesn't use the `isEditMode` flag to determine which mode to operate in:
- **Edit Mode**: Should load and display established partnerships using the correct API call with `partnerType` parameter
- **New Store Mode**: Should show potential partners for selection during setup

## Solution Overview

### Key Changes Required

#### 1. **Extract `isEditMode` prop** (Already available in StepProps)
The `isEditMode` prop is already defined in `StepProps` but not being used by `PartnershipStep`.

```tsx
const PartnershipStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
  isEditMode,  // <- ADD THIS
}) => {
```

#### 2. **Add State Variables for Edit Mode**
```tsx
const [establishedPartnerships, setEstablishedPartnerships] = useState<Partnership[]>([]);
const [showEstablished, setShowEstablished] = useState(false);
const [searchDialogOpen, setSearchDialogOpen] = useState(false);
```

#### 3. **Import Additional Components & Types**
```tsx
import { partnershipsApi, type Partnership } from '@/features/partnerships/services/partnershipsApi';
// Add to MUI imports:
Dialog, DialogTitle, DialogContent, DialogActions
// Add to Icon imports:
Add as AddIcon, Settings as SettingsIcon
```

#### 4. **Add `loadEstablishedPartnerships` Function**
This function loads established partnerships using the correct API call with `partnerType` parameter:

```tsx
const loadEstablishedPartnerships = async () => {
  if (!formState.storeId) return;

  try {
    const partnershipType = getPartnershipType();
    if (!partnershipType) return;

    const partnershipsResponse = await partnershipsApi.getPartnershipsByStoreId(
      Number(formState.storeId),
      {
        storeId: Number(formState.storeId),
        partnerType: partnershipType as 'producer' | 'processor',
      }
    );

    if (partnershipsResponse?.partnerships?.length > 0) {
      setEstablishedPartnerships(partnershipsResponse.partnerships);
      setShowEstablished(true);
      // Update form state with partner IDs
    } else {
      setShowEstablished(false);
      setEstablishedPartnerships([]);
    }
  } catch (error) {
    console.error('Error loading established partnerships:', error);
  }
};
```

#### 5. **Update useEffect Hooks**

**For loading established partnerships in edit mode:**
```tsx
useEffect(() => {
  if (formState.storeId && isEditMode) {
    loadEstablishedPartnerships();
  }
}, [formState.storeId, isEditMode]);
```

**For auto-search in new store mode only:**
```tsx
useEffect(() => {
  if (formState.storeId && !partnerships.partnershipType && !isEditMode) {
    // Auto-search logic...
  }
}, [formState.storeId, isEditMode]);
```

#### 6. **Add Helper Functions**

```tsx
const getPartnerStoreName = (partnership: Partnership): string => {
  return isProducerStore
    ? partnership.processorStoreName
    : partnership.producerStoreName;
};

const handleOpenSearchDialog = () => {
  setSearchDialogOpen(true);
  searchPartners();
};

const handleCloseSearchDialog = () => {
  setSearchDialogOpen(false);
};

const handleCreatePartnership = async (partnerId: number, partnerName: string) => {
  // Create partnership logic...
  loadEstablishedPartnerships(); // Reload after creation
};
```

#### 7. **Add Conditional UI in Render**

**When in edit mode with established partnerships:**
```tsx
{isEditMode && showEstablished && establishedPartnerships.length > 0 && (
  <Card sx={{ mb: 4 }}>
    <CardContent>
      <Typography variant='h6'>
        {isProcessorStore ? `Processing Partners` : `Live Animals Partners`}
        ({establishedPartnerships.length})
      </Typography>
      
      <List dense sx={{ mb: 3 }}>
        {establishedPartnerships.map((partnership) => (
          <ListItem key={partnership.partnershipId}>
            <Card variant='outlined' sx={{ width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant='subtitle2'>
                      {getPartnerStoreName(partnership)}
                    </Typography>
                    <Chip
                      label={partnershipsApi.getStatusDisplayText(partnership.status)}
                      size='small'
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant='outlined'
          startIcon={<AddIcon />}
          onClick={handleOpenSearchDialog}
          fullWidth
        >
          + Add New Partners
        </Button>
        <Button
          variant='outlined'
          startIcon={<SettingsIcon />}
          onClick={handleOpenSearchDialog}
          fullWidth
        >
          ⚙️ Manage Partners
        </Button>
      </Box>
    </CardContent>
  </Card>
)}
```

**When in edit mode with no established partnerships:**
```tsx
{isEditMode && !showEstablished && (
  <Card sx={{ mb: 4 }}>
    <CardContent>
      <Alert severity='info' sx={{ mb: 3 }}>
        No established partnerships yet. Search to add new partnerships.
      </Alert>
      <Button
        variant='contained'
        startIcon={<AddIcon />}
        onClick={handleOpenSearchDialog}
        fullWidth
      >
        Find Partners
      </Button>
    </CardContent>
  </Card>
)}
```

**Search Dialog for adding partners:**
```tsx
<Dialog
  open={searchDialogOpen}
  onClose={handleCloseSearchDialog}
  maxWidth='sm'
  fullWidth
>
  <DialogTitle>Search and Add Partners</DialogTitle>
  <DialogContent>
    {partnerships.potentialPartners.length > 0 ? (
      <List>
        {partnerships.potentialPartners.map((partner) => (
          <ListItem
            key={partner.storeId}
            secondaryAction={
              <Button
                variant='contained'
                size='small'
                onClick={() =>
                  handleCreatePartnership(partner.storeId, partner.storeName)
                }
              >
                Add
              </Button>
            }
          >
            <ListItemText
              primary={partner.storeName}
              secondary={`${Math.round(partner.distanceMiles)} miles away`}
            />
          </ListItem>
        ))}
      </List>
    ) : (
      <Alert severity='info'>No partners found</Alert>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseSearchDialog}>Close</Button>
  </DialogActions>
</Dialog>
```

## Implementation Steps

1. Update imports to include `Partnership` type and new MUI components/icons
2. Add `isEditMode` to function signature (destructure from props)
3. Add state variables for edit mode
4. Add `loadEstablishedPartnerships` function
5. Update useEffect hooks to conditionally load based on `isEditMode`
6. Add helper functions
7. Add conditional UI rendering based on `isEditMode` and `showEstablished`
8. Test in both modes:
   - New store setup (isEditMode=false)
   - Edit existing store with partnerships (isEditMode=true, showEstablished=true)
   - Edit existing store without partnerships (isEditMode=true, showEstablished=false)

## API Calls Used

- **Load established partnerships**: `GET /api/partnerships/store/{storeId}?partnerType=processor|producer`
- **Search potential partners**: `GET /api/partnerships/store/{storeId}/potential-partners?radiusMiles=50&partnerType=processor|producer`
- **Create partnership**: `POST /api/partnerships`

## Key Difference from Current Code

**WRONG** (current):
```tsx
await partnershipsApi.getPartnershipsByStoreId(formState.storeId, {
  status: 'active,pending'  // ❌ Returns empty
});
```

**RIGHT** (after fix):
```tsx
await partnershipsApi.getPartnershipsByStoreId(formState.storeId, {
  partnerType: 'processor' // ✅ Returns established partnerships
});
```
