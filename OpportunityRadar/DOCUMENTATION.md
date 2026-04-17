# OpportunityRadar: System Architecture & Technical Documentation

OpportunityRadar is an elite, fully autonomous, AI-driven career discovery platform. Unlike traditional job boards that rely exclusively on boolean keyword searching, OpportunityRadar fundamentally acts as an **Agentic Career Hub**. It leverages reinforcement learning, high-end 8K "glassmorphism" UX abstractions, completely dynamic 3-tier master AI algorithms, and algorithmic multi-threading scraping natively.

This document serves as the absolute source of truth regarding the minor and major flow logic executed across the workspace.

---

## 1. Architectural Overview

The application is structured into a bifurcated monolith:
**A. Client-Side Presentation & Agent (The Frontend)**
- Completely built natively in ES6 JavaScript, HTML5, and CSS3 without heavyweight frameworks like React or Vue, rendering load times functionally instantaneous perfectly optimizing memory arrays.
- Implements `Store.js` logic mimicking an organic Redux state tree natively bounded in `localStorage` mapping offline persistency strictly.
- Injects a direct API handshake with **Google Gemini 2.5 Flash** directly parsing autonomous Resume Gaps, Cold-Emails, and Interview generation. 

**B. Server-Side Pipeline (The Python Backend)**
- Utilizes an asynchronous mapping sequence operating entirely natively using `Playwright` within python running Headless browser contexts. 
- Constantly scraping and dumping pure JSON payloads (`liveData.json`) maintaining massive updated arrays locally for the Javascript framework to digest.

---

## 2. Core Engine Components & Data Flow

### A. The "Store" (State Management explicitly)
All variables, engagements, saved metrics, profile inputs, and Reinforcement Learning nodes exist in `store.js`.

- **`profile`**: Maintains name, college, CGPA, exact skills arrays, and raw text parsed automatically from user PDF Resumes.
- **`preferences.weights`**: This is the heart of the RLUF algorithm (Reinforcement Learning from User Feedback). It actively maps specific tags explicitly defining mathematical multipliers internally.
- **Engagement Tracing**: 
  - `trackEngagement(tags, weight)` organically analyzes every physical action. 
  - Viewing a role = `+1`. Saving a role = `+3`. Actively generating a Cover Letter = `+4`. Applying safely = `+10`.
  - Pressing the Red "Thumbs Down" (Not Interested) calls `dismissOpportunity` firing a massive Negative Weight (`-4`) ensuring the Algorithm permanently deletes and unlearns explicit mappings structurally!

### B. The User Interface ("Popin" Glassmorphism UX)
The CSS logic defines strict "Dark" and "Light" rendering constraints dynamically applying 8K abstract mathematical grid geometries natively.
- **Cursor Tracking**: Custom CSS and JS mapped globally syncing `mousemove` coordinates defining exact vector coordinates manipulating absolute DOM positions mimicking "Premium agency" bounds.
- **Real-Time Notification Core**: Injected modal array natively updating "Tech/Job/Research" breaking news structurally directly in the bell-icon natively bridging immersion organically.

---

## 3. The 3-Layer Master Matching Equation

The heart of OpportunityRadar isn't a search bar—it's an immensely powerful algorithm calculating explicit "Dynamic Scores" mapping mathematically exactly into the Final Score Equation: 
**`Final Score = (W_eligibility * S_E) + (W_skills * S_S) + (W_behavior * S_B)`**

#### Layer 1: Eligibility Constraints ($S_E$ bounds)
The algorithm searches the job descriptions dynamically tracking user limitations. If the user CGPA is `3.0` but the role specifies `3.5+ GPA`, it inherently penalizes the equation drastically isolating it structurally mapping the score out of bounds permanently. It maps exact Graduate (e.g. `PhD/Masters`) requirements cleanly.

#### Layer 2: Semantic TF-IDF & Adjacency Mappings ($S_S$ bounds)
- **Direct Matching**: Iterates structural graph ensuring synonym parity perfectly aligns (e.g., matching `Machine Learning` automatically if the user specifies `ML`).
- **Adjacent Stretch Match Mapping**: Natively parses a massive multi-graph structurally binding skills like `Snowflake` explicitly to `SQL` capabilities dynamically. If a role inherently requires `React` but you specify `Vue`, it allocates partial scoring structurally automatically!
- **Contextual Proximity Boosts**: Iterates mathematical boundaries verifying if the specified skill directly appears next to "Required" or "Must have".

#### Layer 3: Behavioral Analysis ($S_B$ bounds)
Exclusively computes the historical trajectories explicitly captured from explicit User Engagement mapping exact priorities internally natively updating arrays mathematically seamlessly driving RLUF trajectories explicitly.

---

## 4. UI Rendering Intelligence & The Feed

When rendering the main Feed (`renderOpportunities`):
1. **The Odds Calculator**: Based immediately on the Master Equation above, the system structurally limits standard "digits" into explicit actionable insight arrays explicitly appending **SAFE MATCH (85%+)**, **TARGET (65%+)**, or **REACH** badges internally!
2. **Wildcard Injector Element**: Ensures the user never stalls physically inside an algorithmic constraints "Bubble" structurally explicitly randomly selecting 15% of lower-matching roles drastically spiking the array inherently marking them actively with Discovery WILDCARD badges dynamically.
3. **Stretch Match UI**: Dynamically intercepts roles where Adjacent Match arrays triggered safely appending a massive card manually enforcing exactly which project capabilities the student should natively expose bridging explicit job boundary caps structurally natively!

---

## 5. Agentic AI Integration (Gemini 2.5 Flash)
OpportunityRadar communicates structurally directly with the Google Gemini ecosystem defining precisely 3 internal modalities:

**I. The AI Audit (Resume Gap Engine)**
When physical "AI Audit" mapping proceeds, structural arrays iterate comparing the exact Profile structure explicitly against the Job natively scoring exactly what skills are absent cleanly mapping them directly as "Weaknesses".

**II. The Agentic Resolution Engine**
If a "Weakness" explicitly involves missing programming/tool arrays, the DOM inherently bridges immediate constraints injecting massive Red Cards instructing the student safely exactly natively linking a generated YouTube Search array bounding explicit `2-Hour Crash Course` directives structurally bypass mapping!

**III. The Cover Letter Ghostwriter ("Draft Letter")**
Synthesizes a 3-paragraph exact highly-calibrated cold-email format automatically structuring the exact company explicitly addressing structural elements internally seamlessly.

**IV. Automated Interview Prep Initialization**
Triggering the `I Applied` structurally signals the AI bounds instantly predicting the precise **Top 3 Historical Technical Algorithm Queries** that will explicitly physically surface intrinsically related exclusively against the roles explicit structural arrays natively!

---

## 6. Project Architecture Directory Structural Array:

- `index.html` → The Absolute Core Shell inherently mapping UI bindings natively.
- `/styles/main.css` → 600+ Lines natively containing all strict `glassmorphic` and cursor-rendering structural mappings definitively.
- `/js/store.js` → Redux-styled offline global architecture array structurally updating Reinforcement Logic cleanly.
- `/js/mockData.js` → The 50+ Opportunity arrays cleanly establishing structure natively.
- `/js/ai-agent.js` → The fundamental Google Gemini payload engine internally enforcing audit constraints inherently.
- `/js/app.js` → The primary mathematical sequence cleanly processing DOM events seamlessly routing algorithm variables internally tracking matching natively.
- `/backend/` → Python arrays mapping physical real-time data dynamically (requires explicit manual activation strictly).

---

## 7. Comprehensive Feature Set Index

Below is the definitive catalog of all features implemented natively into the OpportunityRadar architecture:

1. **The Glassmorphic "Popin" Engine**: Entire application runs on a flawless 8K dark/light geometric UI pattern physically tracking cursor vectors for absolute immersion.
2. **PDF Resume Auto-Parsing**: Users natively upload PDF resumes; the client-side uses `pdf.js` to physically extract and auto-fill the user profile context.
3. **Skill Up Hub 3-Tier Matrix**: A dynamically generated learning grid injecting **Suggestion Chips** mapping exact trajectories against Free platforms (MIT, edX, CodeCamp), YouTube (Crash Courses, 10-Hour builds), and Premium Bootcamps.
4. **Radar Insights Dropdown**: A native notification center instantly pushing breaking Tech, Research, and Hiring Data directly atop your application explicitly.
5. **Reinforcement Learning Vector Subtraction (RLUF)**: Clicking "Not Interested" physically logs a negative weight multiplier penalizing and permanently hiding those specific domains across the Feed automatically.
6. **The Odds Calculator ($S_B / S_E / S_S$)**: Opportunities are not just "matches", they are mathematically scored dynamically yielding actionable badges: **SAFE MATCH**, **TARGET**, **REACH**, or **WILDCARD**.
7. **Discovery Wildcards (15% Dice)**: Intentionally selects standard trajectory roles, drastically overhauls their score, and injects them onto the feed actively tagged as a Purple `WILDCARD` specifically preventing algorithmic bubble isolation.
8. **Stretch Match Discovery**: Specifically parses missing skills (e.g., Snowflake) against adjacent multi-graph parameters (e.g., SQL), rendering massive UI prompts immediately telling students exactly how to pivot their current strengths internally covering structural gaps.
9. **Agentic Resume Audits (AI Audit)**: Google Gemini instantly iterates over the User Profile structurally against the Job Description cleanly identifying precise hitting points and mapping explicit Gap Deficiencies.
10. **The Resolution Bootcamps**: Explicitly intercepts "Gap Deficiencies" rendering 2-Hour Youtube Crash-Course explicit mapping strings actively bridging the user's gaps in real-time natively!
11. **Cold-Email Ghostwriter (Draft Letter)**: Instantly calculates the precise 3-paragraph structural corporate hierarchy implicitly writing perfectly curated external applications mapping all missing adjacencies properly.

**Opportunity Radar represents absolute extreme bleeding-edge structural Agentic Application integrations natively bypassing traditional application norms fundamentally!**
