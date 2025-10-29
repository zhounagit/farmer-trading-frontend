# Referral Program Design Document

## Overview

The Farmer Trading referral program is designed to incentivize user growth through a multi-level commission system. Users can earn credits by referring new customers and store owners to the platform, creating a sustainable growth mechanism while rewarding existing users for their advocacy.

## Business Objectives

### Primary Goals
1. **User Acquisition**: Drive new user registrations through existing user networks
2. **Platform Growth**: Increase both customer and store owner user bases
3. **User Engagement**: Encourage active participation and platform advocacy
4. **Revenue Generation**: Create additional revenue streams through commission-based referrals

### Key Metrics
- Referral conversion rate
- Average referral value per user
- Active referrer percentage
- Commission payout distribution
- Referral program ROI

## System Architecture

### Database Schema

#### Core Referral Tables
```sql
-- Referral codes for user tracking
CREATE TABLE public.referral_codes (
    referral_code_id integer PRIMARY KEY,
    user_id integer NOT NULL,
    code character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    times_used integer DEFAULT 0 NOT NULL,
    max_uses integer,
    CONSTRAINT valid_expiry CHECK (expires_at > created_at),
    CONSTRAINT valid_uses CHECK (times_used >= 0 AND (max_uses IS NULL OR times_used <= max_uses))
);

-- Commission rates for different referral levels
CREATE TABLE public.referral_commission_rates (
    level smallint PRIMARY KEY,
    commission_rate numeric(5,2) NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by integer,
    CONSTRAINT referral_commission_rates_commission_rate_check CHECK (commission_rate > 0),
    CONSTRAINT referral_commission_rates_level_check CHECK (level >= 1)
);

-- Referral transaction tracking
CREATE TABLE public.referral_transactions (
    transaction_id integer PRIMARY KEY,
    order_id bigint NOT NULL,
    beneficiary_id integer NOT NULL,
    referrer_level smallint NOT NULL,
    amount numeric(10,2) NOT NULL,
    commission_rate numeric(5,2) NOT NULL,
    status character varying(20) DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- User referral balance tracking
CREATE TABLE public.referral_balances (
    user_id integer PRIMARY KEY,
    pending_amount numeric(10,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0 NOT NULL,
    last_payout_date timestamp with time zone
);
```

#### User Table Extensions
```sql
-- Additional columns in users table for referral tracking
ALTER TABLE public.users ADD COLUMN referrer_id integer;
ALTER TABLE public.users ADD COLUMN used_referral_code character varying(50);
ALTER TABLE public.users ADD COLUMN my_referral_code character varying(50);
ALTER TABLE public.users ADD COLUMN referred_at timestamp with time zone;
```

### Backend Architecture

#### Controller Layer
```
FarmerTrading/API/Controllers/
├── ReferralController.cs          # Referral-specific operations
├── UsersController.cs             # User referral endpoints
└── CommissionController.cs        # Commission management
```

#### Service Layer
```
FarmerTrading/Application/Services/
├── IReferralService.cs            # Referral business logic
├── ICommissionService.cs          # Commission calculations
└── IUserService.cs                # User referral methods
```

### Frontend Architecture

#### Feature Structure
```
src/features/referral/
├── components/
│   ├── ReferralProgramPage.tsx    # Main referral dashboard
│   └── ReferralFeatureWrapper.tsx # Context wrapper
├── services/
│   ├── referralApi.ts             # Referral API calls
│   └── commissionApi.ts           # Commission API calls
├── types/
│   └── referral.ts                # Type definitions
└── routes.tsx                     # Referral routes
```

## Core Features

### 1. Referral Code Generation

#### Automatic Code Generation
- **Trigger**: User registration completion
- **Format**: 6-12 character alphanumeric codes (e.g., "FARMER123")
- **Uniqueness**: Guaranteed unique across platform
- **Activation**: Immediate upon generation

#### Code Validation Rules
```typescript
interface ReferralCodeValidation {
  format: RegExp;           // /^[A-Z0-9]{6,12}$/
  active: boolean;          // Code must be active
  maxUses: number | null;   // Usage limit if set
  expiration: Date;         // Must not be expired
  userActive: boolean;      // Referrer must be active
}
```

### 2. Multi-Level Commission System

#### Commission Structure
```typescript
interface CommissionLevel {
  level: 1 | 2 | 3;         // Direct, secondary, tertiary
  rate: number;             // Commission percentage (e.g., 0.10 for 10%)
  description: string;      // "Direct referral", "Secondary referral", etc.
}

// Default commission rates
const DEFAULT_COMMISSION_RATES: CommissionLevel[] = [
  { level: 1, rate: 0.10, description: "Direct referral commission" },
  { level: 2, rate: 0.05, description: "Secondary referral commission" },
  { level: 3, rate: 0.02, description: "Tertiary referral commission" }
];
```

#### Commission Calculation
```typescript
interface CommissionCalculation {
  orderAmount: number;      // Total order value
  commissionRate: number;   // Applicable rate for level
  commissionAmount: number; // orderAmount * commissionRate
  beneficiaryId: number;    // User receiving commission
  referrerLevel: number;    // 1, 2, or 3
  status: 'pending' | 'paid' | 'cancelled';
}
```

### 3. Referral Tracking & Analytics

#### Referral History
```typescript
interface ReferralHistoryItem {
  id: number;
  referredUserId: number;
  referredEmail: string;
  referredFirstName: string;
  referredLastName: string;
  dateReferred: string;
  status: 'active' | 'inactive' | 'pending';
  totalPurchases: number;
  totalEarnings: number;
  commissionLevel: number;
}
```

#### User Referral Statistics
```typescript
interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  pendingAmount: number;
  paidAmount: number;
  referralLink: string;
  conversionRate: number;   // (activeReferrals / totalReferrals) * 100
}
```

### 4. Sharing & Distribution

#### Generated Sharing Links
```typescript
interface SharingLinks {
  referralUrl: string;              // Direct registration link
  emailSubject: string;             // Pre-filled email subject
  emailBody: string;                // Pre-filled email body
  smsText: string;                  // SMS-friendly text
  socialText: string;               // Social media optimized text
  whatsappText: string;             // WhatsApp optimized text
}
```

#### Integration Points
- **Registration Flow**: Pre-populate referral code from URL parameters
- **Email Templates**: Branded referral invitation templates
- **Social Sharing**: Native sharing to social platforms
- **QR Codes**: Generate scannable codes for offline sharing

## API Contracts

### Backend Endpoints

#### Referral Management
```typescript
// GET /api/users/{userId}/referral-info
interface ReferralInfoResponse {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  referralCredits: number;
  referralLink: string;
}

// GET /api/users/{userId}/referral-history
interface ReferralHistoryResponse {
  history: ReferralHistoryItem[];
  pagination: PaginationInfo;
}

// POST /api/referral/update-referrer
interface UpdateReferrerRequest {
  targetUserEmail?: string;
  targetUserPhone?: string;
  newReferrerCode: string;
}
```

#### Commission Management
```typescript
// GET /api/commission/referral/rates
interface CommissionRatesResponse {
  rates: CommissionLevel[];
}

// PUT /api/commission/referral/rates/{level}
interface UpdateCommissionRateRequest {
  commissionRate: number;
  description?: string;
}
```

### Frontend Services

#### Referral API Service
```typescript
class ReferralApiService {
  static async getReferralHistory(userId: number): Promise<ReferralHistoryItem[]>;
  static async getReferralCodeUsage(userId: number): Promise<ReferralCodeUsageInfo | null>;
  static async updateReferrer(request: UpdateReferrerRequest): Promise<boolean>;
  static generateSharingLinks(referralCode: string): SharingLinks;
  static async getCompleteReferralData(userId: number): Promise<CompleteReferralData>;
  static validateReferralCode(code: string): boolean;
  static async copyToClipboard(text: string): Promise<boolean>;
}
```

## User Experience Flow

### 1. Referral Discovery
- **Dashboard Widget**: Prominent referral section in user dashboard
- **Onboarding**: Introduction during user registration completion
- **Periodic Reminders**: Email/SMS notifications about referral program
- **Achievement Badges**: Visual rewards for referral milestones

### 2. Code Sharing Process
```
1. User accesses referral dashboard
2. System generates/retrieves unique referral code
3. User selects sharing method (link, email, social, etc.)
4. System provides pre-formatted content
5. User shares through preferred channel
6. System tracks sharing activity
```

### 3. New User Registration with Referral
```
1. New user clicks referral link
2. Registration form pre-populates referral code
3. Backend validates referral code during registration
4. System establishes referral relationship
5. Both users receive confirmation notifications
```

### 4. Commission Earning Process
```
1. Referred user makes first purchase
2. System identifies referrer chain
3. Commission calculated based on order value and level
4. Commission added to referrer's pending balance
5. Notification sent to referrer about new earnings
```

## Commission & Payout System

### Payout Rules
- **Minimum Payout**: $10 minimum balance for withdrawal
- **Payout Frequency**: Monthly automatic payouts
- **Payment Methods**: Platform credits or bank transfer
- **Tax Documentation**: Required for payouts over $600 annually

### Commission Lifecycle
```
Pending → Available → Processing → Paid
    ↑          ↓
  Refund   Withdrawal
    ↓          ↓
 Cancelled  Processing
```

### Fraud Prevention
- **Duplicate Detection**: Prevent self-referrals and duplicate accounts
- **Velocity Limits**: Maximum referrals per time period
- **Geographic Validation**: Flag suspicious cross-border referrals
- **Behavioral Analysis**: Detect bot-like referral patterns

## Integration Points

### With Authentication System
- Referral code validation during registration
- Cross-tab synchronization of referral data
- Secure token-based API calls for referral operations

### With User Profile
- Referral statistics in user profile
- Commission balance display
- Referral history integration

### With Order System
- Commission triggers on order completion
- Order value tracking for commission calculation
- Refund handling and commission reversal

### With Notification System
- Referral success notifications
- Commission earned alerts
- Payout status updates
- Program updates and promotions

## Security & Compliance

### Data Protection
- **PII Handling**: Secure storage of referral relationships
- **GDPR Compliance**: Right to be forgotten in referral chains
- **Data Retention**: Automatic cleanup of expired referral data

### Financial Compliance
- **Tax Reporting**: Annual 1099 forms for US users
- **Audit Trail**: Complete transaction history
- **Anti-Money Laundering**: Suspicious activity monitoring

### Access Controls
- **Role-Based Access**: Different views for customers, store owners, admins
- **API Rate Limiting**: Prevent abuse of referral endpoints
- **Data Validation**: Input sanitization and type checking

## Testing Strategy

### Unit Tests
- Referral code generation and validation
- Commission calculation logic
- API service error handling
- Sharing link generation

### Integration Tests
- End-to-end referral flow
- Commission payout processing
- Cross-user referral relationships
- Error scenarios and edge cases

### Performance Tests
- High-volume referral code generation
- Commission calculation under load
- Database query performance
- API response times

### Security Tests
- SQL injection prevention
- XSS vulnerability testing
- Authentication bypass attempts
- Data leakage prevention

## Monitoring & Analytics

### Key Performance Indicators
- **Referral Conversion Rate**: Registrations ÷ Clicks
- **Average Commission Value**: Total commissions ÷ Successful referrals
- **Active Referrer Rate**: Users with active referrals ÷ Total users
- **Program ROI**: Revenue from referrals ÷ Program costs

### Operational Metrics
- API response times and error rates
- Database query performance
- Commission calculation accuracy
- Payout processing success rates

### Business Intelligence
- Geographic distribution of referrals
- Most effective sharing channels
- Seasonal referral patterns
- User lifetime value by referral source

## Future Enhancements

### Phase 2 Features
- **Tiered Rewards**: Increased commissions for high-performing referrers
- **Custom Landing Pages**: Personalized referral landing pages
- **Advanced Analytics**: Predictive modeling for referral success
- **Gamification**: Leaderboards and achievement systems

### Phase 3 Features
- **Corporate Referral Programs**: B2B referral partnerships
- **International Expansion**: Multi-currency commission handling
- **API Access**: Third-party integration capabilities
- **Advanced Fraud Detection**: Machine learning-based anomaly detection

### Technical Improvements
- **Real-time Analytics**: Live dashboard with streaming data
- **Microservices Architecture**: Decoupled referral services
- **Event Sourcing**: Complete audit trail of all referral events
- **Caching Strategy**: Improved performance for high-traffic scenarios

## Conclusion

The Farmer Trading referral program represents a comprehensive growth engine that aligns user incentives with platform objectives. Through its multi-level commission structure, robust tracking system, and seamless user experience, the program creates a sustainable mechanism for organic growth while providing tangible value to engaged users.

The system's modular architecture ensures scalability and maintainability, while its integration with core platform features provides a cohesive user experience. With built-in security measures, comprehensive analytics, and clear upgrade paths, the referral program is positioned to drive significant platform growth while adapting to evolving business needs.