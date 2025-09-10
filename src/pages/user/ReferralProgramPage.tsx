import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
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
} from '@mui/material';
import {
  ContentCopy,
  Share,
  Refresh,
  People,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  ExpandMore,
  CardGiftcard,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { referralApi } from '../../utils/api';
import toast from 'react-hot-toast';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  availableCredits: number;
}

interface ReferralHistory {
  id: string;
  referredEmail: string;
  referredName?: string;
  dateReferred: string;
  status: 'pending' | 'completed' | 'failed';
  earnings: number;
}

const ReferralProgramPage: React.FC = () => {
  const { user, updateReferralCode } = useAuth();
  const [referralCode, setReferralCode] = useState<string>(user?.referralCode || '');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setIsLoading(true);
    try {
      const data = await referralApi.getInfo();
      const apiData = data as any;

      setStats({
        totalReferrals: apiData.totalReferrals || 0,
        successfulReferrals: apiData.successfulReferrals || 0,
        pendingReferrals: apiData.pendingReferrals || 0,
        totalEarnings: apiData.totalEarnings || 0,
        availableCredits: apiData.availableCredits || 0,
      });

      setHistory(apiData.referralHistory || []);

      if (apiData.referralCode && apiData.referralCode !== user?.referralCode) {
        setReferralCode(apiData.referralCode);
        updateReferralCode(apiData.referralCode);
      }
    } catch (err) {
      setError('Failed to load referral data');
      console.error('Failed to load referral data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await referralApi.generate();
      const newCode = (data as any).referralCode;

      setReferralCode(newCode);
      updateReferralCode(newCode);
      toast.success('Referral code generated successfully!');

      // Reload data to get updated stats
      await loadReferralData();
    } catch (err) {
      setError('Failed to generate referral code. Please try again.');
      toast.error('Failed to generate referral code');
      console.error('Referral code generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        toast.success('Referral code copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Referral code copied to clipboard!');
      }
    }
  };

  const shareReferralCode = async () => {
    const shareText = `Join me on Heartwood Trading Platform! Use my referral code: ${referralCode}`;
    const shareUrl = `${window.location.origin}?ref=${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Heartwood Trading Platform',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success('Referral link copied to clipboard!');
      } catch (err) {
        copyToClipboard();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Referral Program
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Invite friends and earn rewards when they join our platform!
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <People color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      {stats?.totalReferrals || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Referrals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Typography variant="h6" fontWeight={600}>
                      {stats?.successfulReferrals || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Successful Referrals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoney color="success" />
                    <Typography variant="h6" fontWeight={600}>
                      ${stats?.totalEarnings || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Earnings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CardGiftcard color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      ${stats?.availableCredits || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Available Credits
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Your Referral Code */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
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
                        <IconButton onClick={copyToClipboard} size="small" title="Copy">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton onClick={shareReferralCode} size="small" title="Share">
                          <Share fontSize="small" />
                        </IconButton>
                      </Box>
                    ),
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      bgcolor: 'grey.50',
                    },
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={copyToClipboard}
                    size="small"
                  >
                    Copy Code
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={shareReferralCode}
                    size="small"
                  >
                    Share Link
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<Refresh />}
                    onClick={generateReferralCode}
                    disabled={isGenerating}
                    size="small"
                  >
                    Generate New
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You don't have a referral code yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={generateReferralCode}
                  disabled={isGenerating}
                  startIcon={isGenerating ? <CircularProgress size={16} /> : <Refresh />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Referral Code'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* How It Works */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
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
                <ListItemText primary="Share your unique referral code with friends" />
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
                <ListItemText primary="They sign up using your referral code" />
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
                <ListItemText primary="You both earn rewards when they complete their first purchase" />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Reward:</strong> Earn $10 credit for each successful referral!
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Referral History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Referral History
            </Typography>

            {history.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Friend</TableCell>
                      <TableCell>Date Referred</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Earnings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2">
                                {item.referredName || 'Anonymous User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.referredEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(item.dateReferred).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(item.status)}
                            color={getStatusColor(item.status) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ${item.earnings}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <People sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No referrals yet. Start sharing your referral code!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* FAQ */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Frequently Asked Questions
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>How do I earn referral rewards?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  You earn $10 credit for each friend who signs up using your referral code and completes their first purchase on our platform.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>When do I receive my referral credits?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Referral credits are added to your account within 24-48 hours after your referred friend completes their first purchase.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>How can I use my referral credits?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Your referral credits can be used towards any purchase on our platform. They will be automatically applied at checkout.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Is there a limit to how many people I can refer?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  No! There's no limit to the number of friends you can refer. The more you refer, the more you earn.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReferralProgramPage;
