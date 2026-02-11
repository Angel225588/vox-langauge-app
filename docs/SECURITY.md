# Vox Security Documentation

## Overview

This document outlines the security architecture, protocols, and best practices for the Vox Language App. Security is a top priority given that we handle sensitive user data including learning progress, voice recordings, and personal information.

## Security Command

Run `/security` in Claude Code to execute a comprehensive security audit with our team of expert agents.

### Quick Commands
```bash
# Full security audit
/security full

# Quick scan (dependencies + secrets)
/security quick

# Dependencies only
/security deps

# Code security only
/security code
```

## Security Architecture

### Data Protection Layers

```
+------------------+
|   Application    |  <- Input validation, sanitization
+------------------+
|   API Layer      |  <- Rate limiting, authentication
+------------------+
|   Database       |  <- RLS policies, encryption
+------------------+
|   Storage        |  <- Encrypted at rest (MMKV)
+------------------+
```

### Authentication Flow

1. User initiates auth via Supabase Auth
2. JWT token generated and securely stored
3. Token refreshed automatically
4. Session validated on each API call

## Sensitive Data Handling

### Data Classification

| Category | Examples | Protection Level |
|----------|----------|------------------|
| Critical | API keys, tokens | Never stored in code |
| High | User credentials | Encrypted, never logged |
| Medium | Learning progress | Encrypted storage |
| Low | UI preferences | Standard storage |

### Storage Solutions

- **Secrets**: Environment variables only
- **User tokens**: Expo SecureStore
- **App state**: React Native MMKV (encrypted)
- **Offline data**: SQLite with encryption consideration

## Dependency Security

### Package Management

1. Regular `npm audit` checks (weekly minimum)
2. Lock file (`package-lock.json`) committed
3. No direct dependency on unvetted packages
4. Prefer well-maintained packages with security policies

### Vulnerability Response

| Severity | Response Time | Action |
|----------|---------------|--------|
| Critical | Immediate | Stop work, fix now |
| High | 24 hours | Prioritize fix |
| Moderate | 1 week | Schedule fix |
| Low | Next sprint | Plan fix |

## Known Dependency Vulnerabilities

*Last audited: 2026-02-11 | Status: 5 HIGH (all transitive, no fix available, accepted risk)*

### Resolved (auto-fixed)
- `@isaacs/brace-expansion` (high) - Uncontrolled Resource Consumption
- `lodash` (moderate) - Prototype Pollution in `_.unset` and `_.omit`
- `react-server-dom-webpack` (high) - DoS vulnerabilities

### Unresolvable (transitive dependencies)
| Package | Severity | Issue | Root Cause |
|---------|----------|-------|------------|
| `tar` <=7.5.6 | High | Arbitrary File Overwrite, Symlink Poisoning, Hardlink Path Traversal | Transitive dep of `expo-edge-speech` via `expo@52.0.49` -> `@expo/cli` -> `cacache` -> `tar@6.2.1`. No fix available upstream. |

**Risk Assessment**: The `tar` vulnerabilities affect file extraction operations. In the context of a React Native mobile app, these are low practical risk since `tar` is only used during development/build tooling (not at runtime on device). The vulnerable version comes from `expo-edge-speech` which pins an older Expo SDK.

**Mitigation**: Monitor `expo-edge-speech` for updates to a newer Expo SDK. Consider replacing the package if it remains unmaintained.

## Code Security Standards

### Input Validation

```typescript
// GOOD: Validate all user input
const sanitizedInput = validateAndSanitize(userInput);

// BAD: Trust user input directly
const data = userInput; // NEVER DO THIS
```

### API Key Handling

```typescript
// GOOD: Use environment variables
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

// BAD: Hardcoded keys
const apiKey = "sk-abc123..."; // NEVER DO THIS
```

### Secure Data Fetching

```typescript
// GOOD: Use HTTPS, validate responses
const response = await fetch('https://api.example.com/data', {
  headers: { Authorization: `Bearer ${token}` }
});
if (!response.ok) throw new Error('Request failed');
const data = await response.json();
validateSchema(data); // Always validate

// BAD: No validation, HTTP
const data = await fetch('http://...').then(r => r.json());
```

## AI Security (Gemini Integration)

### Prompt Injection Prevention

1. Never include raw user input in system prompts
2. Validate AI responses before display
3. Sanitize any AI-generated content
4. Rate limit AI API calls

### API Key Protection

- Gemini API key stored in `.env` only
- Key never exposed to client-side code
- Consider API gateway for production

## Mobile-Specific Security

### Expo/React Native

1. **Debug Mode**: Disabled in production builds
2. **Deep Links**: Validate all deep link parameters
3. **Permissions**: Request only necessary permissions
4. **Updates**: Use Expo Updates with code signing

### Secure Storage

```typescript
// Use SecureStore for sensitive data
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', userToken);
const token = await SecureStore.getItemAsync('token');
```

## Supabase Security

### Row Level Security (RLS)

All tables must have RLS enabled with policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data"
ON user_progress
FOR SELECT
USING (auth.uid() = user_id);
```

### API Key Types

| Key Type | Usage | Exposure |
|----------|-------|----------|
| anon key | Client-side | Public (with RLS) |
| service_role | Server-side only | NEVER expose |

## Incident Response

### If a Vulnerability is Found

1. **Assess**: Determine severity and impact
2. **Contain**: Isolate affected systems
3. **Fix**: Apply patch immediately
4. **Test**: Verify fix effectiveness
5. **Deploy**: Push to production
6. **Document**: Record for post-mortem

### If Secrets are Exposed

1. **Revoke**: Immediately invalidate exposed keys
2. **Rotate**: Generate new credentials
3. **Audit**: Check for unauthorized access
4. **Update**: Deploy with new credentials
5. **Review**: Prevent future exposure

## Security Checklist

### Before Each Release

- [ ] `npm audit` shows 0 vulnerabilities
- [ ] No secrets in codebase (run secret scan)
- [ ] All user inputs validated
- [ ] API responses validated
- [ ] RLS policies active on all tables
- [ ] Debug mode disabled
- [ ] HTTPS used for all requests

### Weekly Tasks

- [ ] Run `/security` full audit
- [ ] Review dependency updates
- [ ] Check Supabase logs for anomalies
- [ ] Review AI API usage patterns

### Monthly Tasks

- [ ] Full code security review
- [ ] Update security documentation
- [ ] Review and rotate API keys
- [ ] Penetration testing (if applicable)

## Contact

For security concerns or to report vulnerabilities:
- Use the `/security` command for automated checks
- Document findings in `.claude/review-log.md`

---

*Last Updated: December 2024*
*Security Lead: Claude Code AI Assistant*
