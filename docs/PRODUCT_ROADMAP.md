# VOX Language App - Product Roadmap

**Last Updated:** November 26, 2025
**Version:** 1.0
**Target Launch:** January 2026

---

## 🎯 Vision & Mission

### Vision
Create the most personalized language learning app that adapts to each user's goals, fears, motivations, and time constraints.

### Mission
Help professionals land their dream jobs by mastering English for job interviews, presentations, and workplace communication through AI-powered personalized learning paths.

### Unique Value Proposition
Unlike Duolingo's one-size-fits-all approach, VOX creates a completely personalized learning journey based on:
- **Deep Motivation Tracking** (why, fear, stakes, timeline)
- **AI-Generated Custom Paths** (Gemini AI)
- **Time-Based Adaptation** (min/max daily commitment)
- **Scenario-Specific Content** (job interviews, business, travel)
- **Progress Analytics** (weekly insights & recommendations)

---

## 📊 Current Status (November 26, 2025)

### ✅ Completed Features

#### Onboarding System (100%)
- 9-step comprehensive onboarding flow
- Learning goal selection (job interview, travel, business, etc.)
- Language & proficiency assessment
- Scenario selection (8 specific use cases)
- Time commitment tracking
- **Deep Motivation Capture:**
  - Why learning English?
  - Biggest fear/frustration
  - What's at stake?
  - Timeline with date picker

#### Personalized Staircase (90%)
- Gemini AI staircase generation
- Database schema (7 tables)
- API functions for progress tracking
- Beautiful UI with dark mode design
- 3 status states (completed, current, locked)
- Medal/achievement system
- Streak & points tracking
- **Missing:** Mini-lesson implementation (today's task)

#### Component System (100%)
- 8 card types for exercises
- Flashcard system with spaced repetition
- Base card component with variants
- UI components (ProgressCard, StatsCard)

#### Navigation (100%)
- 4-tab structure (Home, Practice, Community, Profile)
- Lesson routing infrastructure
- Safe area handling for iOS/Android

#### Testing (80%)
- 45 passing tests
- Authentication tests
- Staircase API tests
- Onboarding hook tests

---

## 🚀 Product Phases

### Phase 1: MVP (Minimum Viable Product)
**Target:** December 15, 2025 (3 weeks)
**Goal:** Launch-ready app with core learning experience

#### Must-Have Features:

**1. Core Learning Flow** ⭐ HIGH PRIORITY
- [x] Onboarding (9 steps with motivation tracking)
- [x] AI-generated personalized staircase
- [ ] 5 mini-lessons per stair (IN PROGRESS - Today!)
- [ ] 5-10 cards per mini-lesson
- [ ] Completion screens with XP/time/accuracy
- [ ] Progress persistence & tracking
- [ ] Unlock logic (complete mini-lesson → unlock next)

**2. Essential Card Types**
- [ ] Single Vocabulary (word + image + audio)
- [ ] Multiple Choice (text-based)
- [ ] Image Multiple Choice
- [ ] Audio to Image
- [ ] Text Input
- [ ] Speaking (record & playback)

**3. Progress System**
- [x] Streak tracking
- [x] Points/XP system
- [ ] Daily goals
- [ ] Progress dashboard
- [ ] Achievement unlocking

**4. Content**
- [ ] 3 complete stairs with content (15 mini-lessons total)
- [ ] ~150 vocabulary words
- [ ] Audio recordings for all words
- [ ] Images for visual cards

**5. Social & Mentor Features** ⭐ CORE MVP FEATURE
- [ ] Omegle-style practice matching (random partner)
- [ ] Mentor section (connect with tutors/mentors)
- [ ] Quick conversation sessions (5-10 min)
- [ ] Basic chat functionality
- [ ] Safe space guidelines & reporting

**6. Polish**
- [ ] Smooth animations (Lottie integration)
- [ ] Error handling
- [ ] Loading states
- [ ] Offline support (basic)

---

### Phase 2: Beta Testing
**Target:** December 16-31, 2025 (2 weeks)
**Goal:** Test with 20-50 real users, gather feedback

#### Activities:
- [ ] Recruit beta testers (LinkedIn, Reddit, friends)
- [ ] Set up feedback collection (Google Forms, Typeform)
- [ ] Track usage analytics
- [ ] Fix critical bugs
- [ ] Iterate on UX issues
- [ ] Performance optimization

#### Success Metrics:
- [ ] 70%+ completion rate for onboarding
- [ ] 50%+ users complete at least 1 stair
- [ ] Average session time: 10+ minutes
- [ ] 80%+ positive feedback
- [ ] <5 critical bugs

---

### Phase 3: Launch Preparation
**Target:** January 1-15, 2026 (2 weeks)
**Goal:** Polish & prepare for public launch

#### Tasks:
- [ ] App Store listing (copy, screenshots, preview video)
- [ ] Google Play Store listing
- [ ] Privacy policy & terms of service
- [ ] Marketing materials (landing page, social media)
- [ ] Press kit
- [ ] Launch announcement content
- [ ] Support documentation (FAQs, help center)
- [ ] Analytics setup (Mixpanel, Firebase, etc.)

---

### Phase 4: Public Launch
**Target:** January 20, 2026
**Goal:** Launch on iOS & Android app stores

#### Launch Strategy:
- [ ] Product Hunt launch
- [ ] Reddit posts (r/languagelearning, r/learneng, etc.)
- [ ] LinkedIn announcement
- [ ] Email to beta testers
- [ ] Social media campaign
- [ ] Influencer outreach (micro-influencers in EdTech)

---

### Phase 5: Post-Launch (v1.1)
**Target:** February-March 2026
**Goal:** Expand features based on user feedback

#### Features to Add:
- [ ] Achievement carousel on Practice tab
- [ ] More stairs (10+ total)
- [ ] Advanced analytics dashboard
- [ ] Weekly progress reports
- [ ] Reminder notifications
- [ ] Dark mode toggle (currently always dark for Home)
- [ ] Additional languages (Spanish, French as target languages)

---

### Phase 6: Community & Social (v1.2)
**Target:** April-May 2026
**Goal:** Add social features for engagement

#### Features:
- [ ] Practice with Others (live conversations)
- [ ] Community tab implementation
- [ ] Weekly conversation sessions
- [ ] Leaderboards (friends, global)
- [ ] Social sharing (achievements, streaks)
- [ ] User profiles
- [ ] Friend system
- [ ] Challenge friends

---

### Phase 7: Advanced Features (v2.0)
**Target:** June 2026+
**Goal:** Differentiate further from competitors

#### Features:
- [ ] AI pronunciation feedback (use speech recognition)
- [ ] Video lessons
- [ ] Live tutoring integration
- [ ] Certificate programs
- [ ] Company/team plans
- [ ] Advanced spaced repetition (better than SM-2)
- [ ] Personalized review sessions
- [ ] Voice AI conversation practice
- [ ] Integration with calendar/reminders

---

## 📅 Detailed Timeline (Next 8 Weeks)

### Week 1: Nov 25 - Dec 1 (THIS WEEK)
**Focus: Mini-Lessons & Core Flow**

**Monday (Nov 25)** ✅
- [x] Merge best of both branches
- [x] 4-tab structure
- [x] Safe area fixes
- [x] Practice tab enhancements

**Tuesday (Nov 26)** - TODAY
- [ ] Product roadmap planning ← DOING NOW
- [ ] Header redesign
- [ ] Mini-lesson data structure
- [ ] Mini-lesson list screen
- [ ] Mini-lesson flow implementation
- [ ] Completion screen

**Wednesday (Nov 27)**
- [ ] Add content for 1 complete stair (5 mini-lessons)
- [ ] Test mini-lesson flow end-to-end
- [ ] Fix bugs
- [ ] Polish animations

**Thursday (Nov 28)**
- [ ] Add time commitment to onboarding (min/max)
- [ ] Update Gemini AI to use time data
- [ ] Test personalization improvements

**Friday (Nov 29)**
- [ ] Complete 2nd stair with content
- [ ] Achievement system implementation
- [ ] Weekly review session

---

### Week 2: Dec 2-8
**Focus: Content Creation & Card Types**

- [ ] Complete 3rd stair with content (MVP = 3 stairs)
- [ ] Implement all 6 card types
- [ ] Audio recordings for vocabulary
- [ ] Image selection for visual cards
- [ ] Progress dashboard
- [ ] Daily goals system

---

### Week 3: Dec 9-15
**Focus: Polish & MVP Completion**

- [ ] Animations & micro-interactions
- [ ] 3D/Lottie icons implementation
- [ ] Error handling & edge cases
- [ ] Performance optimization
- [ ] Offline support (basic caching)
- [ ] Final testing
- [ ] **MVP CODE FREEZE** (Dec 15)

---

### Week 4: Dec 16-22
**Focus: Beta Testing Begins**

- [ ] Recruit 20-50 beta testers
- [ ] Set up analytics tracking
- [ ] Daily bug fixes
- [ ] User feedback collection
- [ ] Iterate on UX issues

---

### Week 5: Dec 23-29
**Focus: Beta Iteration**

- [ ] Address major feedback
- [ ] Performance improvements
- [ ] Content additions if needed
- [ ] Polish based on user data

---

### Week 6: Dec 30 - Jan 5
**Focus: Launch Prep**

- [ ] App Store submissions
- [ ] Marketing materials
- [ ] Landing page
- [ ] Social media setup
- [ ] Press kit

---

### Week 7: Jan 6-12
**Focus: Final Polish**

- [ ] App Store review fixes
- [ ] Final testing
- [ ] Launch content creation
- [ ] Influencer outreach

---

### Week 8: Jan 13-20
**Focus: LAUNCH! 🚀**

- [ ] Public launch (Jan 20)
- [ ] Monitor analytics
- [ ] Quick bug fixes
- [ ] Community engagement
- [ ] Support requests

---

## 🎯 Success Metrics

### MVP Success Criteria
- [ ] Onboarding completion rate: 70%+
- [ ] First stair completion rate: 40%+
- [ ] Average session length: 10+ minutes
- [ ] Daily active users (DAU): 50+ (first week)
- [ ] User retention (D7): 30%+
- [ ] Crash-free sessions: 99%+

### Beta Testing Goals
- [ ] 50 total beta testers
- [ ] 500+ total sessions
- [ ] 80%+ satisfaction score
- [ ] <10 critical bugs found
- [ ] Positive feedback on personalization

### Launch Goals (First Month)
- [ ] 1,000 downloads
- [ ] 300 active users
- [ ] 4.5+ star rating
- [ ] 50+ reviews
- [ ] Product Hunt Top 5 in Education

---

## 💰 Monetization Strategy (Future)

### Phase 1: Free (First 6 months)
- Focus on user acquisition
- Build community
- Gather data & feedback
- No ads, fully free

### Phase 2: Freemium (Month 7+)
**Free Tier:**
- 1 stair unlocked
- Basic cards
- Limited daily lessons

**Premium ($9.99/month or $79.99/year):**
- Unlimited stairs
- All card types
- Advanced analytics
- Practice with others
- No ads
- Priority support
- Downloadable lessons (offline)

### Phase 3: Business Plans (Year 2)
- Company/team subscriptions
- Custom content
- Analytics dashboard for managers
- Certificate programs

---

## 🛠️ Technical Roadmap

### Infrastructure
- [x] React Native + Expo
- [x] Supabase (PostgreSQL + Auth)
- [x] Gemini AI integration
- [ ] Analytics (Mixpanel or Firebase)
- [ ] Error tracking (Sentry)
- [ ] Push notifications (Expo Notifications)
- [ ] Cloud storage for audio/images (Supabase Storage)

### Performance
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Caching strategy
- [ ] Offline-first architecture

### Quality
- [ ] 80%+ test coverage
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance monitoring

---

## 🎨 Design System

### Current
- [x] Dark mode for Home tab
- [x] Light mode for Practice/Community/Profile
- [x] Indigo/purple accent colors
- [x] Consistent typography
- [x] Spacing system
- [x] Component library

### To Add
- [ ] 3D/Lottie animations
- [ ] Micro-interactions
- [ ] Celebration animations
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

---

## 📝 Content Strategy

### Initial Content (MVP)
- 3 stairs (15 mini-lessons)
- ~150 vocabulary words
- Focus: Job Interview scenarios
- Professional English

### Month 2-3
- 7 total stairs (35 mini-lessons)
- ~350 vocabulary words
- Add: Business communication
- Add: Travel scenarios

### Month 4-6
- 15 total stairs (75 mini-lessons)
- ~750 vocabulary words
- Add: Academic English
- Add: Casual conversation

---

## 🚧 Risks & Mitigation

### Risk 1: Content Creation Bottleneck
**Mitigation:**
- Use Gemini AI to generate vocabulary lists
- Crowdsource audio recordings (Fiverr, Upwork)
- Use free image libraries (Unsplash, Pexels)
- Templates for consistent quality

### Risk 2: User Engagement Drop-off
**Mitigation:**
- Strong onboarding with motivation tracking
- Daily reminders & streaks
- Social features (practice with others)
- Achievement system
- Personalized content

### Risk 3: Technical Complexity
**Mitigation:**
- Start simple, iterate
- Use proven technologies (React Native, Supabase)
- Comprehensive testing
- Modular architecture

### Risk 4: Competition (Duolingo, Babbel)
**Mitigation:**
- Focus on personalization (our strength)
- Niche down (professionals, job interviews)
- Better UX for motivation tracking
- AI-powered customization

---

## 🎓 Learning & Iteration

### Weekly Reviews
- Every Friday: Team review
- Analyze metrics
- User feedback review
- Adjust roadmap as needed

### Monthly Retrospectives
- What worked well?
- What didn't work?
- Key learnings
- Next month priorities

---

## 🤝 Team & Roles

### Current Team
- **Angel** - Product Owner, Designer
- **Claude (AI Assistant)** - Development Partner
- **Gemini AI** - Content Generation

### Future Hires (Post-Launch)
- Content creator (audio/vocabulary)
- Marketing specialist
- Customer support
- Backend engineer
- Designer

---

## 📞 Support & Resources

### Documentation
- [x] Product Roadmap (this doc)
- [x] Session Plans (daily/tomorrow plans)
- [x] Database Schema
- [x] API Documentation
- [ ] User Guides
- [ ] FAQ

### Tools
- Figma (design)
- GitHub (code)
- Supabase (backend)
- Notion/Linear (project management)
- Discord/Slack (communication)

---

## 🎯 Key Decisions

### ✅ Decided
1. **Personalization First** - Our core differentiator
2. **AI-Powered** - Use Gemini for content generation
3. **Freemium Model** - Free to start, premium later
4. **Mobile First** - iOS & Android priority
5. **Niche Focus** - Professionals & job interviews

### 🤔 To Decide
1. **Notification Strategy** - How aggressive?
2. **Social Features** - Launch timing?
3. **Pricing** - Exact premium price point?
4. **Content Quality** - AI vs. human-generated?
5. **Platform** - Web version priority?

---

## 📈 Long-Term Vision (Year 2-3)

### Year 2
- 50,000+ users
- $50K+ MRR (Monthly Recurring Revenue)
- 20+ complete learning paths
- 5 target languages
- B2B partnerships

### Year 3
- 200,000+ users
- $200K+ MRR
- Team of 10+
- Series A funding?
- Expand to corporate training

---

## 🎉 Milestones to Celebrate

- ✅ First commit
- ✅ Onboarding complete
- ✅ AI staircase generation working
- ✅ Beautiful UI implemented
- [ ] First mini-lesson complete (TODAY!)
- [ ] MVP code freeze (Dec 15)
- [ ] First beta tester signs up
- [ ] 50 beta testers
- [ ] App Store approval
- [ ] Launch day! 🚀
- [ ] 100 users
- [ ] 1,000 users
- [ ] First paying customer
- [ ] $1K MRR
- [ ] $10K MRR

---

## 📊 Appendix: Research & Inspiration

### Competitor Analysis
- **Duolingo:** Gamification, but one-size-fits-all
- **Babbel:** Better content, but expensive
- **Rosetta Stone:** Traditional, outdated UX
- **Memrise:** Good flashcards, weak structure

### Our Advantages
1. Deep personalization (motivation tracking)
2. AI-generated custom paths
3. Scenario-specific (job interviews)
4. Modern UX (dark mode, animations)
5. Time-based adaptation

---

**Last Updated:** November 26, 2025
**Next Review:** December 3, 2025
**Owner:** Angel Polanco
**Status:** Active Development 🚀
