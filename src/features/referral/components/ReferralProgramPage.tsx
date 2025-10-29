import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Alert,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ContentCopy,
  Share,
  Refresh,
  People,
  AttachMoney,
  CheckCircle,
  ExpandMore,
  Person,
  CalendarToday,
  MailOutline,
  Message,
  ChatBubbleOutline,
  Public,
  AlternateEmail,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { userApiService } from '../../account-settings/services/userApiService';
import ReferralCommissionApiService from '../services/commissionApi';
import ReferralApiService from '../services/referralApi';
import type {
  ReferralCommissionRate,
  ReferralHistoryItem,
  ReferralCodeUsageInfo,
  UpdateReferrerRequest,
} from '@/shared/types/api-contracts';
import toast from 'react-hot-toast';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  availableCredits: number;
}

const ReferralProgramPage: React.FC = () => {
  const { user, updateReferralCode } = useAuth();
  const [referralCode, setReferralCode] = useState<string>(
    user?.myReferralCode || ''
  );
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [commissionRates, setCommissionRates] = useState<
    ReferralCommissionRate[]
  >([]);
  const [usageInfo, setUsageInfo] = useState<ReferralCodeUsageInfo | null>(
    null
  );
  const [showUpdateReferrer, setShowUpdateReferrer] = useState(false);
  const [updateReferrerData, setUpdateReferrerData] = useState({
    targetEmail: '',
    targetPhone: '',
    newReferrerCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [isUpdatingReferrer, setIsUpdatingReferrer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSharingLinks, setShowSharingLinks] = useState(false);

  const loadReferralData = useCallback(async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Use existing API that works
      const data = await userApiService.getReferralInfo(parseInt(user.userId));
      const apiData = data;

      setStats({
        totalReferrals: apiData.totalReferrals || 0,
        successfulReferrals: apiData.activeReferrals || 0,
        pendingReferrals:
          (apiData.totalReferrals || 0) - (apiData.activeReferrals || 0),
        totalEarnings: apiData.referralCredits || 0,
        availableCredits: apiData.referralCredits || 0,
      });

      // Load referral history separately
      try {
        const historyData = await ReferralApiService.getReferralHistory(
          parseInt(user.userId)
        );
        setHistory(historyData);
      } catch (historyErr) {
        console.warn('Failed to load referral history:', historyErr);
        setHistory([]);
      }

      // Load usage info separately
      try {
        const usageData = await ReferralApiService.getReferralCodeUsage(
          parseInt(user.userId)
        );
        setUsageInfo(usageData);
      } catch (usageErr) {
        console.warn('Failed to load usage info:', usageErr);
        setUsageInfo(null);
      }

      // Update referral code if different
      if (
        apiData.referralCode &&
        apiData.referralCode !== user?.myReferralCode
      ) {
        setReferralCode(apiData.referralCode);
        updateReferralCode(apiData.referralCode);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      // Only show error if this is an actual API failure, not empty data
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (
        !errorMessage.includes('404') &&
        !errorMessage.includes('not found')
      ) {
        setError('Failed to load referral data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, user?.myReferralCode, updateReferralCode]);

  useEffect(() => {
    if (user?.userId) {
      loadReferralData();
    }
    loadCommissionRates();
  }, [user?.userId, loadReferralData]);

  const loadCommissionRates = async () => {
    try {
      setIsLoadingRates(true);
      const rates =
        await ReferralCommissionApiService.getCommissionRatesWithFallback();
      setCommissionRates(rates);
    } catch (err) {
      console.error('Failed to load commission rates:', err);
      // Fallback is already handled in the service
      setCommissionRates([]);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const getCommissionText = () => {
    if (isLoadingRates) {
      return 'Loading commission rates...';
    }

    const level1Rate =
      commissionRates.find((r) => r.level === 1)?.commissionRate || 1.0;
    const level2Rate =
      commissionRates.find((r) => r.level === 2)?.commissionRate || 0.5;
    return `Earn ${level1Rate}% from direct referrals' purchases and ${level2Rate}% from indirect referrals' purchases.`;
  };

  const generateReferralCode = async () => {
    if (!user?.userId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await userApiService.generateReferralCode(
        parseInt(user.userId)
      );
      const newCode = response.referralCode;

      setReferralCode(newCode);
      updateReferralCode(newCode);
      setShowSharingLinks(true);
      toast.success('Referral code generated successfully!');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate referral code. Please try again.';
      setError(errorMessage);
      toast.error('Failed to generate referral code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string = referralCode) => {
    if (text) {
      const success = await ReferralApiService.copyToClipboard(text);
      if (success) {
        toast.success('Copied to clipboard!');
      } else {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const handleUpdateReferrer = async () => {
    if (!updateReferrerData.targetEmail && !updateReferrerData.targetPhone) {
      toast.error('Please enter either email or phone number');
      return;
    }

    if (!referralCode) {
      toast.error('You need a referral code first');
      return;
    }

    setIsUpdatingReferrer(true);
    try {
      const request: UpdateReferrerRequest = {
        newReferrerCode: referralCode,
      };

      if (updateReferrerData.targetEmail) {
        request.targetUserEmail = updateReferrerData.targetEmail;
      }
      if (updateReferrerData.targetPhone) {
        request.targetUserPhone = updateReferrerData.targetPhone;
      }

      await ReferralApiService.updateReferrer(request);
      toast.success('Referrer updated successfully for your friend!');
      setShowUpdateReferrer(false);
      setUpdateReferrerData({
        targetEmail: '',
        targetPhone: '',
        newReferrerCode: '',
      });

      // Reload referral data to get updated stats
      loadReferralData();
    } catch (updateError) {
      console.error('Failed to update referrer:', updateError);
      toast.error('Failed to update referrer. Please check the details.');
    } finally {
      setIsUpdatingReferrer(false);
    }
  };

  const getSharingLinks = () => {
    if (!referralCode) return null;
    return ReferralApiService.generateSharingLinks(referralCode);
  };

  const shareReferralCode = async () => {
    const shareText = `Join me on Farmer Trading! Use my referral code: ${referralCode}`;
    const shareUrl = `${window.location.origin}/register?ref=${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Farmer Trading',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success('Referral link copied to clipboard!');
      } catch {
        copyToClipboard();
      }
    }
  };

  const handleSpecificShare = (platform: string) => {
    const links = getSharingLinks();
    if (!links) return;

    const {
      referralUrl,
      emailSubject,
      emailBody,
      smsText,
      whatsappText,
      socialText,
    } = links;

    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
        break;
      case 'sms':
        window.open(`sms:?body=${smsText}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${whatsappText}`);
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${socialText}`
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${socialText}&url=${encodeURIComponent(referralUrl)}`
        );
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' fontWeight={600} gutterBottom>
          Referral Program
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Invite friends and earn rewards when they join our platform!
        </Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Overview */}
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr',
              },
              gap: 2,
            }}
          >
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={1}>
                  <People color='primary' />
                  <Typography variant='h6' fontWeight={600}>
                    {stats?.totalReferrals || 0}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Total Referrals
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={1}>
                  <CheckCircle color='success' />
                  <Typography variant='h6' fontWeight={600}>
                    {stats?.successfulReferrals || 0}
                  </Typography>
                </Box>
                <Tooltip title='Users who made at least one purchase using your referral code'>
                  <Typography variant='body2' color='text.secondary'>
                    Successful Referrals
                  </Typography>
                </Tooltip>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={1}>
                  <Refresh color='warning' />
                  <Typography variant='h6' fontWeight={600}>
                    {stats?.pendingReferrals || 0}
                  </Typography>
                </Box>
                <Tooltip title="Users registered with your referral code but haven't made any purchases yet">
                  <Typography variant='body2' color='text.secondary'>
                    Pending Referrals
                  </Typography>
                </Tooltip>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={1}>
                  <AttachMoney color='secondary' />
                  <Typography variant='h6' fontWeight={600}>
                    ${stats?.totalEarnings || 0}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  Total Earnings
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Referral Code Usage Info */}
        {usageInfo?.usedReferralCode && (
          <Alert severity='info'>
            <Typography variant='body2'>
              <strong>You registered with referral code:</strong>{' '}
              {usageInfo.usedReferralCode}
              {usageInfo.referrerName && (
                <>
                  {' '}
                  from <strong>{usageInfo.referrerName}</strong>
                </>
              )}
              {usageInfo.referredAt && (
                <> on {new Date(usageInfo.referredAt).toLocaleDateString()}</>
              )}
            </Typography>
          </Alert>
        )}

        {/* Main Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* Your Referral Code */}
          <Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Your Referral Code
              </Typography>

              {referralCode ? (
                <Box>
                  <TextField
                    fullWidth
                    value={referralCode}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => copyToClipboard()}
                            size='small'
                            title='Copy Code'
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Box>
                      ),
                      sx: {
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                      },
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Primary Action Buttons */}
                  <Box
                    sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}
                  >
                    <Button
                      variant='contained'
                      startIcon={<ContentCopy />}
                      onClick={() => copyToClipboard()}
                      sx={{ flex: 1, minWidth: '120px' }}
                    >
                      Copy Code
                    </Button>
                    <Button
                      variant='contained'
                      color='secondary'
                      startIcon={<Share />}
                      onClick={() => setShowSharingLinks(!showSharingLinks)}
                      sx={{ flex: 1, minWidth: '120px' }}
                    >
                      Share Code
                    </Button>
                  </Box>

                  {/* Sharing Options */}
                  {showSharingLinks && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant='subtitle2'
                        sx={{ mb: 1, color: 'text.secondary' }}
                      >
                        Choose how to share:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                          variant='outlined'
                          startIcon={<MailOutline />}
                          onClick={() => handleSpecificShare('email')}
                          size='small'
                        >
                          Email
                        </Button>
                        <Button
                          variant='outlined'
                          startIcon={<Message />}
                          onClick={() => handleSpecificShare('sms')}
                          size='small'
                        >
                          SMS
                        </Button>
                        <Button
                          variant='outlined'
                          startIcon={<ChatBubbleOutline />}
                          onClick={() => handleSpecificShare('whatsapp')}
                          size='small'
                          sx={{ color: '#25D366' }}
                        >
                          WhatsApp
                        </Button>
                        <Button
                          variant='outlined'
                          startIcon={<Public />}
                          onClick={() => handleSpecificShare('facebook')}
                          size='small'
                          sx={{ color: '#1877F2' }}
                        >
                          Facebook
                        </Button>
                        <Button
                          variant='outlined'
                          startIcon={<AlternateEmail />}
                          onClick={() => handleSpecificShare('twitter')}
                          size='small'
                          sx={{ color: '#1DA1F2' }}
                        >
                          Twitter
                        </Button>
                        <Button
                          variant='outlined'
                          startIcon={<Share />}
                          onClick={shareReferralCode}
                          size='small'
                        >
                          More
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Secondary Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant='text'
                      startIcon={<Refresh />}
                      onClick={generateReferralCode}
                      disabled={isGenerating}
                      size='small'
                    >
                      Generate New Code
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ mb: 2 }}
                  >
                    Generate your unique referral code to start earning rewards
                    when friends join!
                  </Typography>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={generateReferralCode}
                    disabled={isGenerating}
                    startIcon={
                      isGenerating ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Refresh />
                      )
                    }
                  >
                    {isGenerating ? 'Generating...' : 'Generate Referral Code'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Update Referrer for Friends */}
          <Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Update Referrer for Friends
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                If your friend forgot to use your referral code during
                registration, you can update it for them.
              </Typography>
              <Button
                variant='outlined'
                onClick={() => setShowUpdateReferrer(true)}
                fullWidth
                disabled={!referralCode}
              >
                Update Friend's Referrer
              </Button>
            </Paper>
          </Box>

          {/* How It Works */}
          <Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                How It Works
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      1
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary='Share your unique referral code with friends' />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      2
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary='They sign up using your referral code' />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      3
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary='You earn rewards when they complete each of their purchases' />
                </ListItem>
              </List>

              <Alert severity='info' icon={false} sx={{ mt: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  Commission Structure: {getCommissionText()}
                </Typography>
              </Alert>
            </Paper>
          </Box>
        </Box>

        {/* Referral History */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              Referral History
            </Typography>

            {history.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Date Referred</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Total Purchases</TableCell>
                      <TableCell>Total Earnings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={1}>
                            <Person />
                            <Box>
                              <Typography variant='body2' fontWeight={600}>
                                {item.referredFirstName} {item.referredLastName}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                ID: {item.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={1}>
                            <CalendarToday fontSize='small' />
                            <Typography variant='body2'>
                              {new Date(item.dateReferred).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(item.status)}
                            color={
                              getStatusColor(item.status) as
                                | 'success'
                                | 'error'
                                | 'default'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {item.totalPurchases}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            color='success.main'
                          >
                            ${item.totalEarnings}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  color: 'text.secondary',
                }}
              >
                <People sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                <Typography variant='body1'>
                  No referrals yet. Start sharing your referral code!
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Update Referrer Dialog */}
        <Dialog
          open={showUpdateReferrer}
          onClose={() => setShowUpdateReferrer(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Update Friend's Referrer</DialogTitle>
          <DialogContent>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              If your friend forgot to use your referral code during
              registration, you can update it here. Provide either their email
              or phone number.
            </Typography>

            <TextField
              fullWidth
              label="Friend's Email"
              type='email'
              value={updateReferrerData.targetEmail}
              onChange={(e) =>
                setUpdateReferrerData((prev) => ({
                  ...prev,
                  targetEmail: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Friend's Phone Number"
              value={updateReferrerData.targetPhone}
              onChange={(e) =>
                setUpdateReferrerData((prev) => ({
                  ...prev,
                  targetPhone: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUpdateReferrer(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateReferrer}
              disabled={isUpdatingReferrer}
              variant='contained'
              startIcon={
                isUpdatingReferrer ? <CircularProgress size={16} /> : null
              }
            >
              {isUpdatingReferrer ? 'Updating...' : 'Update Referrer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FAQ */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              Frequently Asked Questions
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>How do I earn referral rewards?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body2' color='text.secondary'>
                  {isLoadingRates ? (
                    'Loading commission rates...'
                  ) : (
                    <>
                      You earn{' '}
                      {commissionRates.find((r) => r.level === 1)
                        ?.commissionRate || 1}
                      % commission from direct referrals' purchases and{' '}
                      {commissionRates.find((r) => r.level === 2)
                        ?.commissionRate || 0.5}
                      % commission from indirect referrals' purchases. Credits
                      are earned on every purchase, not just the first one.
                    </>
                  )}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>When do I receive my referral credits?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body2' color='text.secondary'>
                  Referral credits are added to your account within 24-48 hours
                  after each purchase made by your referrals.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>How can I use my referral credits?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body2' color='text.secondary'>
                  You have two options for using your referral credits: 1) Use
                  them towards any purchase on our platform (automatically
                  applied at checkout), or 2) Transfer the money to your bank
                  account monthly. Credits never expire and can be accumulated
                  over time.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  Is there a limit to how many people I can refer?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body2' color='text.secondary'>
                  No! There's no limit to the number of friends you can refer.
                  The more you refer, the more you earn.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default ReferralProgramPage;
