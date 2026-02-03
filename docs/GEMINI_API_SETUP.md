# Gemini API Setup Guide

## Overview

Vox Language App uses Google's Gemini AI for personalized learning path generation. This document covers the API configuration, troubleshooting, and best practices.

---

## Current Configuration

| Setting | Value |
|---------|-------|
| **Model** | `gemini-2.0-flash` |
| **API Version** | `v1beta` |
| **Environment Variable** | `EXPO_PUBLIC_GEMINI_API_KEY` |

### Files Using Gemini API

| File | Purpose |
|------|---------|
| `lib/ai/gemini.ts` | Main Gemini client with retry logic |
| `lib/services/pathGeneration.ts` | Learning path generation service |
| `lib/ai/prompts/pathGeneration.ts` | AI prompts for path generation |

---

## API Keys

### Active Key (as of Dec 14, 2025)

```
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyD71xtJedeH593z4rCe8Cy0l8Ac1o7AP4Q
```

### Backup Key

```
AIzaSyB6nCrBeYeTDIdCQgJZpyiY1ujGKaE8E48
```

### Deprecated Key (DO NOT USE)

```
AIzaSyDUuLOkRQc5-dh9LxtwRu0hQRCugCJXz6g  ← INVALID/REVOKED
```

---

## Available Models (Dec 2025)

Based on API response, these models are available:

| Model | Use Case | Status |
|-------|----------|--------|
| `gemini-2.0-flash` | Fast, cost-effective | **RECOMMENDED** |
| `gemini-2.0-flash-lite` | Lighter, faster | Available |
| `gemini-2.5-flash` | Latest flash | Available |
| `gemini-2.5-pro` | Advanced reasoning | Available |

### Deprecated Models

| Model | Status |
|-------|--------|
| `gemini-1.5-flash` | **NOT AVAILABLE** on new keys |
| `gemini-1.5-pro` | **NOT AVAILABLE** on new keys |
| `gemini-1.0-pro` | **NOT AVAILABLE** on new keys |

---

## Free Tier Limits

Google Gemini API has free tier quotas that reset periodically:

| Metric | Limit |
|--------|-------|
| Requests per minute (RPM) | ~15-60 (varies) |
| Requests per day (RPD) | ~1,500 (varies) |
| Tokens per minute | ~32,000 (varies) |

### Quota Exceeded Error

```
You exceeded your current quota, please check your plan and billing details.
```

**Solutions:**
1. Wait for quota reset (usually resets daily)
2. Use backup API key
3. Enable billing for higher limits
4. Use fallback templates (automatic)

---

## Fallback System

When AI generation fails (quota exceeded, API error, etc.), the app automatically falls back to template-based paths:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AI Generation  │────▶│  AI Fails?      │────▶│  Use Templates  │
│  (Personalized) │     │  (Quota/Error)  │     │  (Predefined)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Template Categories

Templates are defined in `lib/ai/prompts/pathGeneration.ts`:

- `career` - Professional/business focus
- `travel` - Travel and adventure
- `relationship` - Personal relationships
- `academic` - Education/study
- `heritage` - Cultural connection

Each template has 8 predefined stairs.

---

## Troubleshooting

### Error: "API key not valid"

**Cause:** Key is revoked, deleted, or from wrong project

**Fix:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Update `.env` file
4. Restart Expo: `npx expo start --clear`

### Error: "Model not found"

**Cause:** Using deprecated model name (e.g., `gemini-1.5-flash`)

**Fix:**
1. Update model name to `gemini-2.0-flash` in:
   - `lib/ai/gemini.ts`
   - `lib/services/pathGeneration.ts`

### Error: "Quota exceeded"

**Cause:** Free tier limit reached

**Fix:**
1. Wait for quota reset (automatic fallback works meanwhile)
2. Switch to backup API key
3. Enable Google Cloud billing

---

## Testing API Key

### Quick Test (Terminal)

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

### List Available Models

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY" | jq '.models[].name'
```

---

## Best Practices

1. **Never commit API keys** - Use `.env` file (gitignored)
2. **Have backup keys** - Create 2-3 keys for redundancy
3. **Monitor usage** - Check [AI Studio Usage](https://ai.dev/usage)
4. **Use fallback** - Always have template fallback for reliability
5. **Update models** - Check for new model versions quarterly

---

## Related Documentation

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Model Overview](https://ai.google.dev/gemini-api/docs/models)

---

## Change Log

| Date | Change |
|------|--------|
| Dec 14, 2025 | Updated from `gemini-1.5-flash` to `gemini-2.0-flash` |
| Dec 14, 2025 | Replaced invalid key with `AIzaSyD71xtJedeH593z4rCe8Cy0l8Ac1o7AP4Q` |
| Dec 14, 2025 | Added fallback template system documentation |
