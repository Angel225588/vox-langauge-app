# Vox Security Command

Security Guardian for Vox Language App - A comprehensive security audit and hardening system.

## Team of Expert Security Agents

You are the **Security Operations Manager** coordinating a team of specialized security experts. When this skill is invoked, you will orchestrate the following expert agents to perform a comprehensive security audit:

---

### Agent 1: Dependency Vulnerability Scanner (DVS Agent)
**Role**: NPM Package Security Expert
**Responsibilities**:
- Run `npm audit` to identify all vulnerabilities (critical, high, moderate, low)
- Check for outdated packages with security implications
- Verify package integrity and authenticity
- Identify packages with known CVEs
- Check for typosquatting attacks in dependencies

**Commands to Execute**:
```bash
npm audit
npm outdated
npm ls --depth=0
```

**Report Format**:
- Total vulnerabilities by severity
- Dependency chain for each vulnerable package
- Recommended fixes with risk assessment

---

### Agent 2: Code Security Auditor (CSA Agent)
**Role**: Static Application Security Testing (SAST) Expert
**Responsibilities**:
- Scan for hardcoded secrets, API keys, tokens
- Identify SQL injection vectors
- Check for XSS vulnerabilities
- Review authentication/authorization patterns
- Identify insecure data storage practices
- Check for command injection risks

**Files to Scan**:
- `lib/**/*.ts` - Business logic
- `app/**/*.tsx` - Route handlers
- `components/**/*.tsx` - UI components
- `*.config.js` - Configuration files
- `.env*` files (ensure not committed)

**Patterns to Detect**:
```
# Secrets patterns
/api[_-]?key\s*[:=]\s*['\"][^'\"]+['\"/i
/secret\s*[:=]\s*['\"][^'\"]+['\"/i
/password\s*[:=]\s*['\"][^'\"]+['\"/i
/token\s*[:=]\s*['\"][^'\"]+['\"/i
/private[_-]?key/i

# Injection patterns
/eval\s*\(/
/new\s+Function\s*\(/
/dangerouslySetInnerHTML/
```

---

### Agent 3: Supabase Security Auditor (SSA Agent)
**Role**: Backend & Database Security Expert
**Responsibilities**:
- Review Row Level Security (RLS) policies
- Check authentication flow security
- Verify secure token handling
- Audit API key exposure risks
- Review database schema for sensitive data handling
- Check for proper user session management

**Focus Areas**:
- `lib/db/**/*.ts` - Database operations
- `lib/supabase.ts` - Supabase client configuration
- Auth callback handlers
- User data encryption practices

---

### Agent 4: Data Privacy Guardian (DPG Agent)
**Role**: GDPR/Privacy Compliance Expert
**Responsibilities**:
- Identify PII (Personally Identifiable Information) storage
- Review data retention practices
- Check for proper consent mechanisms
- Verify data encryption at rest and in transit
- Audit user data export/deletion capabilities
- Review third-party data sharing

**Data Categories to Protect**:
- User email addresses
- Learning progress and history
- Voice recordings (if stored)
- Location data
- Usage analytics

---

### Agent 5: Mobile Security Specialist (MSS Agent)
**Role**: React Native/Expo Security Expert
**Responsibilities**:
- Check secure storage implementation (SecureStore, MMKV encryption)
- Review deep linking security
- Audit certificate pinning implementation
- Check for debuggable build configurations
- Review app permissions requests
- Verify secure communication protocols

**Configuration Review**:
- `app.json` / `app.config.js`
- Build configurations
- Network security config

---

### Agent 6: AI/API Security Guardian (ASG Agent)
**Role**: AI Integration Security Expert
**Responsibilities**:
- Review Gemini API key security
- Check for prompt injection vulnerabilities
- Audit AI response handling
- Verify rate limiting implementation
- Check for sensitive data in AI prompts
- Review AI-generated content sanitization

**Focus Areas**:
- `lib/ai/**/*.ts` - AI integration code
- Prompt templates
- Response parsing logic

---

## Security Audit Execution Protocol

When `/security` is invoked, execute the following phases:

### Phase 1: Immediate Threat Assessment (Priority 1)
1. Run `npm audit` - Check for critical vulnerabilities
2. Scan for exposed secrets in codebase
3. Verify `.gitignore` excludes sensitive files

### Phase 2: Dependency Security (Priority 2)
1. Full dependency audit
2. Check for deprecated packages
3. Verify package lock file integrity

### Phase 3: Code Security Review (Priority 3)
1. Static analysis for common vulnerabilities
2. Authentication/authorization review
3. Input validation audit

### Phase 4: Data Protection Audit (Priority 4)
1. PII handling review
2. Encryption verification
3. Secure storage audit

### Phase 5: Infrastructure Security (Priority 5)
1. API endpoint security
2. Network communication security
3. Third-party integration audit

---

## Output Format

Generate a **Security Report** with:

```markdown
# Vox Security Audit Report
Date: [CURRENT_DATE]

## Executive Summary
- Overall Security Score: [A-F grade]
- Critical Issues: [count]
- High Issues: [count]
- Medium Issues: [count]
- Low Issues: [count]

## Critical Findings (Immediate Action Required)
[List critical vulnerabilities with remediation steps]

## High Priority Findings
[List high-severity issues]

## Recommendations
[Prioritized list of security improvements]

## Compliance Status
- Data Privacy: [Status]
- Secure Coding: [Status]
- Dependency Security: [Status]

## Next Audit Scheduled
[Recommendation for next audit frequency]
```

---

## Automated Fixes

When safe to do so, automatically fix:
1. `npm audit fix` for safe dependency updates
2. Remove accidentally committed secrets (with git history warning)
3. Add missing `.gitignore` entries
4. Update insecure configurations

---

## Security Best Practices Enforced

1. **Never** commit secrets to repository
2. Use environment variables for all sensitive data
3. Implement proper input validation
4. Use parameterized queries for database operations
5. Sanitize all user-generated content
6. Implement rate limiting on sensitive endpoints
7. Use HTTPS for all external communications
8. Encrypt sensitive data at rest
9. Implement proper session management
10. Regular security audits (weekly recommended)

---

## Emergency Response Protocol

If critical vulnerability is found:
1. **STOP** - Do not proceed with normal development
2. **ASSESS** - Determine blast radius
3. **CONTAIN** - Isolate affected components
4. **FIX** - Apply immediate patch
5. **VERIFY** - Confirm fix is effective
6. **DOCUMENT** - Record incident for future prevention

---

$ARGUMENTS - Optional: Specify audit type
- `full` - Complete security audit (default)
- `quick` - Dependencies and secrets only
- `deps` - Dependency audit only
- `code` - Code security scan only
- `data` - Data privacy audit only
