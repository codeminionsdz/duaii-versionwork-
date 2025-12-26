# ⚡ Critical Action Items - Google Play Submission

**Timeline:** 2-3 weeks  
**Effort:** ~40-50 hours  
**Priority:** Must complete before Play Store submission

---

## WEEK 1: Foundation & Legal (16 hours)

### Day 1-2: Privacy Policy & Legal (4 hours)
```
Task 1: Create Privacy Policy page
  - Location: /app/privacy/page.tsx
  - Include: data collection, usage, retention, deletion
  - Use template: Termly.io or similar
  - Link from footer on all pages
  Time: 2 hours

Task 2: Create Terms of Service
  - Location: /app/terms/page.tsx
  - Include: usage restrictions, liability, data processing
  Time: 1 hour

Task 3: Add legal footer to layout
  - Location: components/layout/footer.tsx (new)
  - Links: Privacy, Terms, Support
  Time: 1 hour
```

### Day 3-4: App Icons & Store Assets (6 hours)
```
Task 4: Generate app icons
  - Create 512x512 base icon (medical pharmacy theme)
  - Use online converter to generate all sizes:
    - 192x192, 108x108 (Android)
    - 1024x512 (Play Store feature graphic)
  Tool: https://easyappicon.com or https://www.favicon-generator.org
  Time: 3 hours (includes design iteration)

Task 5: Create store screenshots (3)
  - Screenshot 1: Login/Welcome
  - Screenshot 2: Map with pharmacies
  - Screenshot 3: Prescription upload
  - Format: 1080x1920 pixels (PNG or JPEG)
  - Add Arabic text overlays with key features
  Time: 3 hours
```

### Day 5-6: Error Tracking Setup (6 hours)
```
Task 6: Install Sentry
  - npm install @sentry/nextjs
  - Create account: sentry.io (free)
  - Initialize in next.config.js
  - Test: Trigger test error, verify in dashboard
  Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
  Time: 3 hours

Task 7: Add error boundary component
  - Location: components/error-boundary.tsx
  - Wrap around page content
  - Show user-friendly error message
  - Log to Sentry
  Time: 2 hours

Task 8: Remove console.log() from production code
  - Find all console.log in production files (app/, components/)
  - Replace with Sentry.captureMessage() or delete
  - Tools: grep, IDE find/replace
  Time: 1 hour
```

---

## WEEK 2: Security & Performance (16 hours)

### Day 7-8: Rate Limiting & Validation (8 hours)
```
Task 9: Add Zod validation schemas
  - Location: lib/schemas/
  - Files:
    - auth.ts (signup/login schemas)
    - prescription.ts (upload schemas)
    - pharmacy.ts (search schemas)
  - Integration points: All form submissions
  Time: 4 hours

Task 10: Implement rate limiting
  - Method: Upstash Redis (simplest for Vercel)
  - Routes to protect:
    - POST /api/auth/signup
    - POST /api/auth/login
    - POST /api/prescriptions/upload
    - GET /api/pharmacies
    - POST /api/notifications/subscribe
  - Limit: 100 req/hour per IP
  Time: 4 hours
```

### Day 9-10: Service Worker & Offline (6 hours)
```
Task 11: Implement proper service worker caching
  - Location: public/sw.js (rewrite)
  - Cache strategy:
    - Cache-first: static assets (images, fonts)
    - Network-first: API calls (with fallback to cache)
  - Cache pharmacies list for offline use
  - Show offline indicator badge
  Docs: https://web.dev/service-worker-caching-strategies/
  Time: 4 hours

Task 12: Test offline behavior
  - DevTools > Network > Offline
  - Verify: Maps load, data displays, UI intact
  - Verify: Forms work offline, sync on reconnect
  Time: 2 hours
```

### Day 11-12: CI/CD Setup (6 hours)
```
Task 13: Create GitHub Actions workflow
  - Location: .github/workflows/ci.yml
  - Jobs:
    - Lint: ESLint all files
    - Type-check: tsc --noEmit
    - Build: npm run build
    - Test: npm run test (will be minimal)
  - Trigger: On push to main, all PRs
  Time: 3 hours

Task 14: Configure deployment
  - Vercel auto-deploys on push (already working)
  - Add Sentry releases tracking
  - Document deployment procedure
  Time: 2 hours

Task 15: Set up preview/staging
  - Create /staging branch for staging deployments
  - Document QA procedure
  Time: 1 hour
```

---

## WEEK 3: Mobile & Play Store (16 hours)

### Day 13-14: App Signing & Build (6 hours)
```
Task 16: Generate app signing keystore
  Command:
  ```
  keytool -genkey -v -keystore duaii-release.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias duaii-prod
  ```
  
  Store securely:
  - Save keystore in ~/.android/duaii-release.keystore
  - Save password in 1Password/Bitwarden
  - DON'T commit to repo
  Time: 1 hour

Task 17: Configure Gradle signing
  - Edit: android/app/build.gradle
  - Add signingConfigs with keystore
  - Set: buildTypes.release.signingConfig
  - Use environment variables for secrets
  Time: 2 hours

Task 18: Build release APK/AAB
  - Command: cd android && ./gradlew bundleRelease
  - Output: app-release.aab (for Play Store)
  - Also build APK for testing: ./gradlew assembleRelease
  - Test on physical device
  Time: 3 hours (includes testing)
```

### Day 15-16: Play Store Console Setup (6 hours)
```
Task 19: Create Play Console account
  - Visit: play.google.com/console
  - Create new app: "دوائي"
  - Add required information
  Time: 1 hour

Task 20: Complete store listing
  - App name & description (already written)
  - Upload icons (from Task 5)
  - Upload screenshots (from Task 5)
  - Add support email: support@duaiii.app
  - Content rating questionnaire
  - Privacy policy link (from Task 1)
  Time: 3 hours

Task 21: Configure release channels
  - Internal testing: Invite team
  - Beta: Prepare for beta testers
  - Production: Ready for launch
  - Staged rollout: 10% → 50% → 100%
  Time: 2 hours
```

### Day 17: Final QA (4 hours)
```
Task 22: Complete launch checklist
  - Run full manual test suite
  - Test on Android device (real device, not emulator)
  - Verify: Login, onboarding, pharmacies, upload, notifications
  - Check: No console errors, no crash on startup
  - Verify: Privacy policy accessible
  - Verify: App icons display correctly
  Time: 2 hours

Task 23: Documentation & runbook
  - Document: Build procedure
  - Document: Rollback procedure
  - Document: How to respond to crashes
  - Document: Emergency contacts
  Time: 2 hours
```

---

## Success Criteria

✅ **Week 1 Complete:** Legal pages visible, icons ready, Sentry capturing errors
✅ **Week 2 Complete:** Rate limiting working, offline PWA functional, CI/CD passing
✅ **Week 3 Complete:** App signed, Play Console configured, ready to submit

---

## Resources & Links

### Documentation
- [Sentry Nextjs Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Service Worker Strategies](https://web.dev/service-worker-caching-strategies/)
- [Zod Validation](https://zod.dev)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [Play Store Checklist](https://play.google.com/console/about/programs/pre-launch/)

### Tools
- **Icon Generator:** https://easyappicon.com
- **Screenshot Maker:** https://www.previewed.app
- **Privacy Policy:** https://termly.io/products/privacy-policy-generator
- **Keystore Generator:** Built-in keytool
- **Error Tracking:** https://sentry.io

### Costs (All Optional/Free Tier)
- Sentry: $0 (free tier: 5K events/month)
- Upstash: $0 (free tier: 10K requests/month)
- GitHub Actions: $0 (free tier: unlimited)
- Google Play Store: $25 one-time developer fee

---

## Team Assignments (if applicable)

```
Frontend/Full-Stack (1 person):
- Tasks 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 22, 23

Backend/DevOps (1 person):
- Tasks 10, 13, 16, 17, 18, 19, 20, 21

QA (1 person):
- Tasks 22 (testing focus), verify all tasks

Designer (0.5 person):
- Task 4 (icon design and store assets)
```

---

## Notes

- **Start with Week 1** - Legal pages and Sentry are quick wins
- **Parallelize where possible** - Icon creation can happen while coding
- **Test early** - Don't wait until Week 3 to test the app on a real device
- **Ask for help** - If any task is unclear, clarify before starting
- **Track progress** - Update this document as you complete tasks

---

**Estimated Total Time:** 40-50 hours  
**Realistic Timeline:** 2-3 weeks with 1-2 developers  
**Risk Level:** LOW - all tasks are straightforward, no architectural changes needed

Good luck with the launch! 🚀
