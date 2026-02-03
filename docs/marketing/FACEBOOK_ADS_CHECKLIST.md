# Facebook Ads Setup - Step-by-Step Checklist

## Overview

This guide walks you through setting up Facebook Ads for Vox from scratch. Follow each step in order. Estimated time: 2-3 hours total.

---

## Phase 1: Account Setup (Day 4)

### Step 1: Create Facebook Business Manager

Time: 15 minutes

- [ ] Go to [business.facebook.com](https://business.facebook.com)
- [ ] Click "Create Account"
- [ ] Enter your business name: "Vox Language App" (or your company name)
- [ ] Enter your name and business email
- [ ] Click "Submit"
- [ ] Verify your email

**Tip**: Use a business email if you have one. This account will manage all your ad assets.

---

### Step 2: Create Ad Account

Time: 10 minutes

- [ ] In Business Manager, go to "Business Settings"
- [ ] Click "Accounts" → "Ad Accounts"
- [ ] Click "Add" → "Create a New Ad Account"
- [ ] Name it: "Vox Ads"
- [ ] Select your time zone and currency
- [ ] Assign yourself as admin

---

### Step 3: Add Payment Method

Time: 5 minutes

- [ ] Go to "Payment Settings" in Ad Account
- [ ] Click "Add Payment Method"
- [ ] Add your credit/debit card
- [ ] Set spending limit (optional but recommended): $100

**Important**: Facebook may charge small amounts to verify your card.

---

### Step 4: Create Facebook Page (If You Don't Have One)

Time: 15 minutes

- [ ] Go to [facebook.com/pages/create](https://facebook.com/pages/create)
- [ ] Select "Business or Brand"
- [ ] Page name: "Vox Language App"
- [ ] Category: "Education App" or "Language School"
- [ ] Add profile picture (app icon)
- [ ] Add cover photo (marketing image)
- [ ] Fill in description:
  ```
  AI-powered language learning app that builds a custom path for YOUR goals.
  Learn English, Spanish, or French with grammar explanations and speaking practice.
  ```

---

### Step 5: Connect Instagram (Optional but Recommended)

Time: 5 minutes

- [ ] In Business Manager, go to "Accounts" → "Instagram Accounts"
- [ ] Click "Add" → "Connect Your Instagram Account"
- [ ] Log in to your Instagram account
- [ ] Confirm connection

**Why**: Allows you to run ads on Instagram with the same campaign.

---

## Phase 2: App Registration (Day 4)

### Step 6: Register App with Facebook

Time: 20 minutes

This allows Facebook to track app installs from your ads.

- [ ] Go to [developers.facebook.com](https://developers.facebook.com)
- [ ] Click "My Apps" → "Create App"
- [ ] Select "Business" as app type
- [ ] App name: "Vox Language App"
- [ ] App contact email: your email
- [ ] Business Manager Account: select your business

- [ ] In your app dashboard, go to "Settings" → "Basic"
- [ ] Add iOS Bundle ID: `com.vox.languageapp` (your actual bundle ID)
- [ ] Add iOS App Store URL (after approval): your App Store URL
- [ ] Add Privacy Policy URL: your privacy policy
- [ ] Add Terms of Service URL: your terms

---

### Step 7: Set Up App Events (Recommended for Tracking)

Time: 30 minutes (requires code changes)

**Note**: This is optional for beta but recommended for better tracking.

For Expo/React Native:
```bash
npx expo install expo-facebook
```

Basic setup in your app:
```javascript
import * as Facebook from 'expo-facebook';

// In App.js or on app start
await Facebook.initializeAsync({
  appId: 'YOUR_FACEBOOK_APP_ID',
});

// Track app install
Facebook.logEvent('fb_mobile_activate_app');

// Track first lesson completed
Facebook.logEvent('fb_mobile_complete_registration');
```

**If skipping this step**: You can still run ads, but tracking will be less accurate. Facebook will estimate installs.

---

## Phase 3: Campaign Creation (Day 8)

### Step 8: Create Campaign

Time: 20 minutes

- [ ] Go to [adsmanager.facebook.com](https://adsmanager.facebook.com)
- [ ] Click "+ Create"
- [ ] **Campaign Objective**: Select "App Promotion"
- [ ] **App**: Select your registered app (or enter App Store URL)
- [ ] **Campaign Name**: "Vox Beta Launch - Career Focused"
- [ ] **Budget**: Select "Daily Budget" → $5.00
- [ ] Click "Continue"

---

### Step 9: Set Up Ad Set (Targeting)

Time: 15 minutes

**Ad Set Name**: "Career Professionals 25-45"

**Location**:
- [ ] United States
- [ ] Canada
- [ ] United Kingdom
- [ ] Australia
(Start with English-speaking countries)

**Age**:
- [ ] 25-45

**Gender**:
- [ ] All

**Detailed Targeting** (Add these interests):
- [ ] Career development
- [ ] Professional development
- [ ] Business English
- [ ] Language learning
- [ ] Self-improvement
- [ ] International business

**Placements**:
- [ ] Select "Advantage+ placements" (let Facebook optimize)
- OR manually select:
  - [ ] Facebook Feed
  - [ ] Instagram Feed
  - [ ] Instagram Stories
  - [ ] Facebook Stories

**Optimization**:
- [ ] Optimize for: "App Installs"
- [ ] Cost control: Leave blank (let Facebook optimize)

---

### Step 10: Create First Ad

Time: 15 minutes

**Ad Name**: "Ad 1 - Career Pain Point"

**Format**:
- [ ] Single Image

**Media**:
- [ ] Upload your first marketing image (from FACEBOOK_ADS.md template 1)

**Primary Text**:
```
Your English is "good enough" for emails. But what about that promotion?

Vox builds a learning path for YOUR career goals. Not random vocabulary. Real business English that gets you noticed.

Free during beta. Download now.
```

**Headline**:
```
Learn the English That Gets You Promoted
```

**Description**:
```
AI-powered. Career-focused.
```

**Call to Action**:
- [ ] Select "Install Now"

**Destination**:
- [ ] App Store URL (enter your TestFlight or App Store link)

- [ ] Click "Publish"

---

### Step 11: Duplicate for Additional Ads

Time: 20 minutes

Create 4 more ads using the templates from FACEBOOK_ADS.md:

- [ ] Ad 2: Duolingo Frustration
- [ ] Ad 3: Job Interview Angle
- [ ] Ad 4: Time Efficiency
- [ ] Ad 5: Speaking Confidence

To duplicate:
1. In Ads Manager, select your first ad
2. Click "Duplicate"
3. Change the name, image, and copy
4. Publish

---

## Phase 4: Launch & Monitor (Day 8+)

### Step 12: Launch Campaign

- [ ] Review all ads in Ads Manager
- [ ] Check status: "Active" or "In Review"
- [ ] Confirm budget is $5/day
- [ ] Confirm payment method is working

**Note**: Facebook reviews ads before they go live. This can take 15 minutes to 24 hours.

---

### Step 13: Daily Monitoring Checklist (15 min/day)

**Every Day at Same Time**:

- [ ] Open Ads Manager
- [ ] Check these metrics for each ad:

| Metric | Good | Needs Attention |
|--------|------|-----------------|
| Impressions | Growing | Flat or declining |
| CTR | > 1.5% | < 1% |
| CPC | < $0.50 | > $1.00 |
| Installs | > 2/day | 0-1/day |
| CPI | < $1.00 | > $2.00 |

- [ ] Note best and worst performing ads
- [ ] Check comments on ads (respond if needed)
- [ ] Check spend (make sure it matches budget)

---

### Step 14: Optimization Actions

**After 3 Days (Day 11)**:

- [ ] Identify top 3 performing ads
- [ ] Pause bottom 2 performing ads
- [ ] Reallocate budget to winners

**After 7 Days (Day 14)**:

- [ ] Double budget on best performer ($10/day)
- [ ] Create 2 new ad variations based on winning themes
- [ ] Consider expanding targeting (new interests)

---

## Phase 5: Scaling (Week 2+)

### Step 15: Budget Scaling Rules

**When to Increase Budget**:
- CPI is consistently < $1.00
- Getting 5+ installs/day
- Day 1 retention > 40%

**How to Scale**:
- Increase by 20% every 3-4 days (not more)
- Example: $5 → $6 → $7.50 → $9 → $10

**Warning Signs to Pause**:
- CPI jumps above $2.00
- CTR drops below 0.5%
- No installs for 2 days

---

## Quick Reference: Key URLs

| Resource | URL |
|----------|-----|
| Business Manager | business.facebook.com |
| Ads Manager | adsmanager.facebook.com |
| Facebook Developers | developers.facebook.com |
| Create Page | facebook.com/pages/create |
| Meta Blueprint (Learn) | facebook.com/business/learn |

---

## Troubleshooting Common Issues

### "Ad Rejected"
- Check for prohibited content (health claims, discrimination)
- Ensure landing page matches ad content
- Remove any misleading claims
- Resubmit for review

### "Account Restricted"
- Verify your identity
- Check payment method
- Contact Facebook support

### "Low Reach"
- Audience too narrow → expand interests
- Budget too low → increase to $10/day minimum
- Ad fatigue → create new creatives

### "High CPI"
- Wrong targeting → adjust interests/demographics
- Poor creative → test new images/copy
- Competition → try different placements

---

## Glossary

| Term | Meaning |
|------|---------|
| **CTR** | Click-Through Rate (clicks ÷ impressions) |
| **CPC** | Cost Per Click |
| **CPI** | Cost Per Install |
| **CPM** | Cost Per 1,000 Impressions |
| **ROAS** | Return on Ad Spend |
| **Impression** | Each time your ad is shown |
| **Reach** | Number of unique people who saw your ad |
| **Frequency** | Average times each person saw your ad |

---

## Checklist Summary

### Day 4: Setup
- [ ] Business Manager created
- [ ] Ad Account created
- [ ] Payment method added
- [ ] Facebook Page created
- [ ] Instagram connected
- [ ] App registered with Facebook

### Day 8: Launch
- [ ] Campaign created
- [ ] Ad Set configured (targeting)
- [ ] 5 ads created and published
- [ ] Budget set to $5/day

### Days 9-14: Optimize
- [ ] Daily monitoring (15 min)
- [ ] Pause underperformers (Day 11)
- [ ] Scale winners (Day 13-14)
- [ ] Create new variations

**Congratulations!** You've set up your first Facebook Ads campaign.
