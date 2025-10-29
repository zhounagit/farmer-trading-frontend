# Quick Troubleshooting Checklist

## Profile Picture Infinite Loop

### Immediate Checks
- [ ] **Network Tab**: Check for repeated `/api/users/{userId}/profile-picture` calls
- [ ] **Console Logs**: Look for profile loading debug messages
- [ ] **Response Codes**: Verify endpoints return 200/404 (not 500 errors)

### Frontend Issues
- [ ] **useProfile Hook**: Ensure it tracks all profiles (not just those with pictures)
- [ ] **Loading States**: Check for concurrent request prevention
- [ ] **AuthContext**: Verify profile sync doesn't trigger on every render
- [ ] **Dependencies**: Confirm useEffect dependencies are correct

### Backend Issues
- [ ] **Endpoints Exist**: Verify GET/POST `/api/users/{userId}/profile-picture` are implemented
- [ ] **Static Files**: Check `/uploads` directory and static file configuration
- [ ] **Database**: Confirm user profile picture URL storage works

### Quick Fixes
1. **Update useProfile condition**:
   ```typescript
   // Change from:
   if (existingProfile?.profilePictureUrl) return;
   // To:
   if (existingProfile) return;
   ```

2. **Add debug logging**:
   ```typescript
   console.log('🔄 Profile load:', { userId, existing: !!existingProfile });
   ```

3. **Check backend response**:
   - Should return 200 with data or 404 if no picture
   - Never return 500 errors

### Prevention
- [ ] Implement request deduplication
- [ ] Add proper error handling
- [ ] Use loading state tracking per user ID
- [ ] Add request debouncing (500ms)

### Common Root Causes
1. **Missing profile tracking** - Hook only prevents reloads for profiles WITH pictures
2. **Missing backend endpoints** - 404 responses trigger retries
3. **AuthContext loops** - Profile sync triggers repeatedly
4. **Concurrent requests** - No loading state management

### Emergency Stop
If infinite loop persists:
1. Temporarily disable profile picture loading in AuthContext
2. Comment out `syncProfilePicture` calls
3. Implement manual profile picture loading only when needed