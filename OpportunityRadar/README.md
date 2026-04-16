# OpportunityRadar - Architecture & Workflow Guide

Welcome to the technical deep-dive of the OpportunityRadar project. This document serves to explain the entire system architecture, data workflows, frontend mechanics, and backend machine learning principles utilized locally to power the AI Career Agent platform.

## 1. System Overview & Tech Stack
OpportunityRadar is built utilizing an extremely lightweight, high-performance "vanilla" architecture specifically optimized for speed and complete customization.

* **Frontend:** Vanilla HTML5, CSS3 (Glassmorphism design language), ES6 Javascript Modules.
* **Backend:** Python 3.
* **Data Persistence:** Local Storage Graph (Frontend), SQLite3 Database (Backend).
* **Machine Learning & AI:** Google Gemini Flash API (`ai-agent.js`).
* **Web Automation / Scraper:** `playwright` Heads-up Chromium parsing.

---

## 2. Core Features
1. **Radar Dashboard:** Evaluates opportunities implicitly and returns exclusively mathematically matched jobs.
2. **Dynamic Scraper Array:** Bypasses conventional anti-bot architectures via stealth scraping across global platforms like LinkedIn and Indeed natively.
3. **Skill Up / Learning Hub:** A dynamic module tracking missing keywords locally (like "React" or "Python") and mapping explicit Youtube/Coursera API URLs dynamically to them.
4. **Reinforcement Engine:** Locally learns directly from what cards you interact with. If you "View", "Save", or "Draft AI Letters" heavily favoring `Machine Learning` nodes over `Python` nodes, the local JSON structure actively scales its algorithms explicitly forcing ML listings to priority visibility organically.
5. **AI Auditing:** Direct integration with Google Gemini via `pdf.js` that ingests user resumes arrays, validates it against live job descriptors, and generates structured weaknesses, strengths, and fully customized cover letters explicitly.

---

## 3. Data Workflow Mechanics

The data architecture operates on a strict Dual-Layer strategy to ensure instant responsiveness without being throttled by global internet requests conditionally.

### Phase A: Background Ingestion (Python)
1. You run `python backend/dynamic_scraper.py`.
2. Python launches a headless browser, stealthily spoofing interaction behaviors (scrolling, resting coordinates naturally) to bypass native LinkedIn & Indeed Captchas.
3. The raw DOM arrays are cleaned via structured Regex schemas explicitly to index deadlines, roles, and structural tags natively.
4. The database is updated (via `sqlite3`) and an aggregated `liveData.json` index is exported recursively directly into the frontend cache memory explicitly.

### Phase B: Frontend Mapping (Javascript)
1. You navigate to the Frontend Web Server natively using Node.js (`http-server`) or Python's HTTP host.
2. The `app.js` system imports native Offline Fallback schemas locally (`mockData.js`), merging them automatically alongside the imported `liveData.json` arrays natively.
3. The Javascript mapping algorithm queries your LocalStorage cache (`store.profile`) and natively ranks 100+ opportunities simultaneously explicitly in nanosecond benchmarks, calculating penalties (like mismatched CGPA) versus bonuses (skill overlap logic arrays).

---

## 4. Reinforcement Algorithm Internals
The ranking engine (`getRankedOpportunities` natively mapped in `app.js`) does NOT exclusively rely on static tagging natively. 
It relies on live active interactions.

* When an opportunity is saved, a native array hook loops across its attached tags natively (e.g. `['Python', 'Developer']`), instantly adding a `+3` coefficient into the `store.preferences` graph in memory.
* When executing an AI Audit natively, an exponential scaling coefficient `+4` is instantly appended natively.
* During the very next loop parsing event across the array, your Dashboard queries the array multiplying base overlaps by the exact custom localized weight parameters dynamically.

**End Result:** The more you use OpportunityRadar natively, the faster its engine forces optimized structural matching arrays cleanly prioritizing your exact organic interests explicitly natively!
