# Gemini API Pricing - Quick Reference (2025)

**Last Updated:** December 14, 2025

---

## Free Tier Limits (No Credit Card Required)

| Model | RPM | TPM | RPD | Use For |
|-------|-----|-----|-----|---------|
| Flash-Lite | 15 | 250K | 1,000 | MVP, simple tasks |
| Flash | 10 | 250K | 250 | Balanced testing |
| Pro | 5 | 250K | 100 | Complex reasoning |

**Supports:** 50-100 active users with moderate usage

---

## Paid Tier Limits

| Tier | RPM | TPM | RPD | Cost to Access |
|------|-----|-----|-----|----------------|
| Tier 1 | 300 | 1M | 1,000 | Enable billing (instant) |
| Tier 2 | 1,000 | 2M | 10,000 | $250 spend + 30 days |
| Tier 3 | Custom | Custom | Custom | $1,000 spend |

---

## Pricing (per 1M tokens)

### Recommended Models for Vox App

| Model | Input | Output | Best For |
|-------|--------|--------|----------|
| **Flash-Lite** | $0.10 | $0.40 | Flashcards, simple Q&A |
| **Flash** | $0.30 | $2.50 | Conversations, stories, grammar |
| **Pro** | $1.25 | $10.00 | Learning paths, advanced tutoring |

**Batch API:** 50% discount on all models (non-urgent tasks)

---

## Cost Per Feature (Flash Model)

| Feature | Input Tokens | Output Tokens | Cost | Optimized Cost* |
|---------|--------------|---------------|------|-----------------|
| Conversation session (15 min) | 500 | 1,000 | $0.0026 | $0.0015 |
| Learning path (onboarding) | 1,000 | 2,500 | $0.0066 | $0.0033 |
| Story generation | 500 | 1,500 | $0.0039 | $0.0020 |
| Grammar explanation | 200 | 300 | $0.0008 | $0.0003 |

*Using Flash-Lite + Batch API

---

## Monthly Cost Estimates

### By User Count (Moderate Usage)

| Users | API Cost | Revenue (10% @ $9.99) | Net Profit |
|-------|----------|----------------------|------------|
| 100 | $0 (free) | $100 | +$100 |
| 500 | $50 | $500 | +$450 |
| 1,000 | $100 | $999 | +$899 |
| 5,000 | $500 | $4,995 | +$4,495 |
| 10,000 | $1,000 | $9,990 | +$8,990 |

**Cost per active user:** $0.05-0.15/month

---

## Top 3 Cost Optimization Strategies

1. **Dynamic Model Routing**
   - Simple tasks → Flash-Lite ($0.10/$0.40)
   - Complex tasks → Flash ($0.30/$2.50)
   - Savings: 60-80%

2. **Batch API (50% off)**
   - Pre-generate stories, lessons, content
   - Run overnight for next-day content
   - Savings: 50%

3. **Free Tier for MVP**
   - Supports 50-100 users
   - Zero cost validation
   - Upgrade to Tier 1 when needed

---

## Recommended Launch Strategy

### Phase 1: MVP (0-100 users)
- **Model:** Flash-Lite only
- **Cost:** $0/month (free tier)
- **Duration:** 3-6 months

### Phase 2: Growth (100-1,000 users)
- **Model:** Mix Flash-Lite (70%) + Flash (30%)
- **Cost:** $50-150/month
- **Tier:** Tier 1 (enable billing)

### Phase 3: Scale (1,000-10,000 users)
- **Model:** Flash-Lite (40%) + Flash (50%) + Pro (10%)
- **Cost:** $300-1,000/month
- **Tier:** Tier 2 ($250 spend + 30 days)

---

## Break-Even Analysis

**Premium tier at $9.99/month:**
- API cost per user: ~$0.10/month
- Profit per premium user: ~$9.89/month

**Break-even conversion rate:**
- 1,000 users with $100 API cost = 11 premium users needed
- **Required conversion:** 1.1% (very achievable)

---

## Critical Metrics to Track

1. **Tokens per feature** (input + output)
2. **Cost per active user** (monthly)
3. **API cost as % of revenue** (target <20%)
4. **Requests per day** (monitor RPD limits)

---

## When to Upgrade Tiers

**Free → Tier 1:**
- Hitting 1,000 RPD limit regularly
- Need 300+ RPM capacity
- ~100+ active users

**Tier 1 → Tier 2:**
- Hitting 1,000 RPD limit
- Growing beyond 1,000 active users
- After $250 Google Cloud spend + 30 days

**Tier 2 → Tier 3:**
- Need custom limits
- 10,000+ active users
- Enterprise features required

---

## Key Takeaways

1. Start on free tier - supports 50-100 users
2. Gemini Flash-Lite is incredibly cost-effective ($0.10/$0.40)
3. Cost per user is ~$0.10/month (very sustainable)
4. Break-even at <2% conversion with $9.99 premium tier
5. Use Batch API for 50% savings on non-urgent tasks
6. Route simple tasks to Flash-Lite, complex to Flash/Pro

---

**Full analysis:** See `/docs/GEMINI_API_PRICING_2025.md`

**Sources:**
- [Official Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Official Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
