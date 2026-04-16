import store from './store.js';
import { mockOpportunities, fetchLiveOpportunities } from './mockData.js';
import { aiAgent } from './ai-agent.js';

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.currentFilter = 'All';
        this.viewContainer = document.getElementById('view-container');
        this.pageTitle = document.getElementById('page-title');
        this.themeToggle = document.querySelector('.theme-toggle');

        store.subscribe(() => this.updateSidebarProfile());
        this.init();
    }

    updateSidebarProfile() {
        const nameEl = document.querySelector('.profile-mini .name');
        const majorEl = document.querySelector('.profile-mini .major');
        const avatarEl = document.querySelector('.profile-mini .avatar');
        if (nameEl) nameEl.innerText = store.profile.name;
        if (majorEl) majorEl.innerText = store.profile.branch;
        if (avatarEl) {
            const initials = store.profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            avatarEl.innerText = initials;
        }
    }

    init() {
        lucide.createIcons();
        this.setupCursorTracker();
        this.setupNavigation();
        this.setupThemeToggle();
        this.renderView('dashboard');

        fetchLiveOpportunities().then(() => {
            if (window.app) {
                window.app.renderView(window.app.currentView);
            }
        });
    }

    setupCursorTracker() {
        const dot = document.getElementById('cursor-dot');
        const outline = document.getElementById('cursor-outline');
        if (!dot || !outline) return;

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            dot.style.transform = `translate(${posX - 3}px, ${posY - 3}px)`;

            outline.animate({
                transform: `translate(${posX - 20}px, ${posY - 20}px)`
            }, { duration: 450, fill: "forwards" });
        });
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const view = item.getAttribute('data-view');
                this.renderView(view);
            });
        });
    }

    setupThemeToggle() {
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            const icon = this.themeToggle.querySelector('i');
            icon.setAttribute('data-lucide', newTheme === 'light' ? 'sun' : 'moon');
            lucide.createIcons();
        });
    }

    renderView(view) {
        this.currentView = view;
        this.viewContainer.innerHTML = '';
        this.viewContainer.className = 'view-container animate-fade-in';

        // Force reflow for animation
        void this.viewContainer.offsetWidth;

        switch (view) {
            case 'dashboard':
                this.pageTitle.innerText = 'Dashboard';
                this.renderDashboard();
                break;
            case 'opportunities':
                this.pageTitle.innerText = 'Radar Feed';
                this.renderOpportunities();
                break;
            case 'learning':
                this.pageTitle.innerText = 'Skill Up Hub';
                this.renderLearning();
                break;
            case 'profile':
                this.pageTitle.innerText = 'My Profile';
                this.renderProfile();
                break;
            case 'saved':
                this.pageTitle.innerText = 'Saved Opportunities';
                this.renderSaved();
                break;
        }

        lucide.createIcons();
    }

    getRankedOpportunities() {
        const profileSkills = store.profile.skills.map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
        const profileGoals = store.profile.goals.map(g => g.trim().toLowerCase()).filter(g => g.length > 0);
        const userCgpa = parseFloat(store.profile.cgpa) || 0.0;

        let filtered = mockOpportunities;
        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(o => {
                const searchStr = (o.type + o.title + o.tags.join(' ')).toLowerCase();
                return searchStr.includes(this.currentFilter.toLowerCase());
            });
        }

        return filtered.map(opp => {
            let score = this.calculateAdvancedSemanticMatch(store.profile, opp);
            return { ...opp, dynamicScore: Math.floor(score) };
        }).sort((a, b) => b.dynamicScore - a.dynamicScore);
    }

    calculateAdvancedSemanticMatch(profile, opp) {
        let score = 40; // Base organic floor
        const title = opp.title.toLowerCase();
        const desc = (opp.description || "").toLowerCase();
        const oppTags = opp.tags.map(t => t.toLowerCase());

        const profileSkills = profile.skills.map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
        const profileGoals = profile.goals.map(g => g.trim().toLowerCase()).filter(g => g.length > 0);

        // 1. Knowledge Graph (Synonym Normalization)
        const synonymGraph = {
            'js': 'javascript', 'ts': 'typescript', 'ml': 'machine learning', 'ai': 'artificial intelligence',
            'swe': 'software engineering', 'nlp': 'natural language processing', 'cv': 'computer vision',
            'aws': 'amazon web services', 'gcp': 'google cloud', 'cs': 'computer science',
            'front end': 'frontend', 'back end': 'backend'
        };
        const normalizedSkills = profileSkills.map(s => synonymGraph[s] || s);

        // 2. Frequency & Contextual Proximity Logic (TF-IDF approximation)
        normalizedSkills.forEach(ps => {
            const cleanPs = ps.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${cleanPs}\\b`, 'gi');

            if (oppTags.includes(ps)) score += 15;
            else if (oppTags.some(t => t.includes(ps))) score += 10;

            const matches = desc.match(regex);
            if (matches) {
                // Term Frequency (Higher mentions = core priority)
                const freq = matches.length;
                score += Math.min(10 + ((freq - 1) * 5), 25);

                // Contextual Proximity (Does it appear near explicit requirements natively?)
                const requiredRegex = new RegExp(`(required|experience with|proficient in|must have|strong|knowledge of).{0,35}\\b${cleanPs}\\b`, 'i');
                if (requiredRegex.test(desc)) {
                    score += 15; // Massive +15 explicit boost for hard contextual requirements
                }
            }

            if (title.includes(ps)) score += 20; // Title matching explicitly equals absolute relevance
        });

        // 3. Trajectory Goal Mapping
        profileGoals.forEach(g => {
            if (title.includes(g)) score += 25;
            else if (opp.type.toLowerCase().includes(g)) score += 15;
            else if (desc.includes(g)) score += 10;
        });

        // 4. Strict Eligibilities & Requirements Parsing
        // A) CGPA Requirements
        const userCgpa = parseFloat(profile.cgpa) || 0.0;
        const cgpaMatch = desc.match(/(\d\.\d)\+?\s*gpa/i);
        if (cgpaMatch) {
            const reqCgpa = parseFloat(cgpaMatch[1]);
            if (userCgpa >= reqCgpa) {
                score += 15; // Passed hard eligibility requirement natively
            } else {
                score -= 50; // Massively failed structural eligibility requirement
            }
        }

        // B) Exact Hierarchy / Degree Requirements
        const userYear = store.profile.year.toLowerCase();
        const userBranch = store.profile.branch.toLowerCase();

        // Check for PhD requirement mismatch
        if (desc.includes("phd") && !userYear.includes("phd")) score -= 40;
        // Check for Masters mismatch organically
        if ((desc.includes("master's") || desc.includes("masters student") || desc.includes("grad student")) && (!userYear.includes("master") && !userYear.includes("grad"))) {
            score -= 30;
        }

        // Check if Academic Branch / Domain heavily aligns implicitly
        if (userBranch) {
            const cleanBranch = userBranch.split(' ')[0]; // E.g., 'Computer' from 'Computer Science' natively
            if (desc.includes(cleanBranch) || oppTags.some(t => t.includes(cleanBranch))) {
                score += 15; // Structural explicit domain requirement fulfilled naturally
            }
        }

        // 5. Autonomous Reinforcement Learning Variables
        if (store.preferences && store.preferences.weights) {
            oppTags.forEach(t => {
                const dynamicBoost = store.preferences.weights[t] || 0;
                score += dynamicBoost * 2; // Direct implicit ML multiplier naturally escalating arrays
            });
        }

        return Math.max(1, Math.min(score, 99)); // Hardcaps at 99 natively mimicking AI confidence margins
    }

    renderOpportunityCard(opp) {
        const isSaved = store.savedOpportunities.includes(opp.id);
        const matchColor = opp.dynamicScore > 80 ? 'var(--success)' : (opp.dynamicScore > 60 ? 'var(--warning)' : 'var(--text-tertiary)');

        return `
            <div class="card" data-id="${opp.id}">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <div style="display:flex; gap:0.5rem;">
                        <span style="background: rgba(59,130,246,0.1); color: var(--brand-primary); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.75rem; font-weight:700;">${opp.type}</span>
                        ${opp.salary && opp.salary !== 'Unknown' ? `<span style="background: rgba(16,185,129,0.1); color: var(--success); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.75rem; font-weight:700;">${opp.salary}</span>` : ''}
                    </div>
                    <button class="icon-btn save-btn" data-id="${opp.id}" style="width:32px; height:32px;">
                       <i data-lucide="bookmark" fill="${isSaved ? 'var(--brand-primary)' : 'none'}" color="${isSaved ? 'var(--brand-primary)' : 'var(--text-secondary)'}"></i>
                    </button>
                </div>
                <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:0.25rem;">${opp.title}</h3>
                <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom:0.5rem;">${opp.company} • ${opp.location}</p>
                <div style="font-size:0.75rem; color:var(--text-primary); font-weight:600; margin-bottom:1rem; display:flex; align-items:center; gap:0.25rem;">
                     <i data-lucide="calendar" style="width:14px; height:14px;"></i> Deadline: <span style="color:var(--danger);">${opp.deadline || 'Rolling Registration'}</span>
                </div>
                
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
                    ${opp.tags.map(t => `<span style="font-size:0.75rem; border:1px solid var(--border-color); padding: 0.25rem 0.5rem; border-radius: 4px;">${t}</span>`).join('')}
                </div>
                
                <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-light);">
                    <div style="display:flex; align-items:center; gap:0.5rem; font-weight:700; color:${matchColor};">
                        <i data-lucide="radar" style="width:16px; height:16px;"></i> ${opp.dynamicScore}% Match
                    </div>
                    <button class="btn btn-primary view-details-btn" data-id="${opp.id}" style="padding:0.4rem 1rem; font-size:0.75rem;">Audit & Apply</button>
                </div>
            </div>
        `;
    }

    renderFilterRibbon() {
        const filters = ['All', 'Job', 'Internship', 'Hackathon', 'Scholarship', 'Research'];
        return `
            <div class="filters-ribbon" style="display:flex; gap:0.5rem; margin-bottom: 1.5rem;">
               ${filters.map(f => `
                  <button class="btn btn-secondary filter-btn ${this.currentFilter === f ? 'active' : ''}" style="${this.currentFilter === f ? 'background:rgba(59,130,246,0.1); color:var(--brand-primary);' : ''}" data-type="${f}">${f}</button>
               `).join('')}
            </div>
        `;
    }

    renderDashboard() {
        const ranked = this.getRankedOpportunities();
        const topMatches = ranked.filter(o => o.dynamicScore > 75);

        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Welcome back, ${store.profile.name.split(' ')[0]}!</h2>
                <p class="view-subtitle">Your radar has found ${topMatches.length} highly matching opportunities today.</p>
            </div>
            
            ${this.renderFilterRibbon()}
            
            <h3 style="margin-bottom:1rem;">Top Radar Picks For You</h3>
            <div class="grid-cards" style="margin-bottom: 2rem;">
                ${topMatches.slice(0, 3).map(opp => this.renderOpportunityCard(opp)).join('')}
            </div>
        `;
        this.attachCardListeners();
    }

    renderLearning() {
        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Skill Up Hub</h2>
                <p class="view-subtitle">Discover high-quality free and paid courses mapped to your exact career trajectory.</p>
            </div>
            ${this.renderLearningHub()}
        `;
        this.attachCardListeners();
    }

    renderLearningHub() {
        if (!this.activeLearningSkill) {
            const popularSkills = ['React', 'Python', 'Machine Learning', 'Data Science', 'Node.js', 'UI/UX', 'Cloud Computing', 'Cybersecurity', 'Algorithms'];
            const profileGoals = store.profile.goals.join(' ').toLowerCase();
            let targetSkill = popularSkills.find(s => profileGoals.includes(s.toLowerCase()));
            this.activeLearningSkill = targetSkill || popularSkills[Math.floor(Math.random() * popularSkills.length)];
        }

        const encodedSkill = encodeURIComponent(this.activeLearningSkill + " full course tutorial");

        return `
            <div class="card glass-panel" style="display:flex; flex-direction:column; gap:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h4 style="color:var(--brand-secondary); display:flex; align-items:center; gap:0.5rem;"><i data-lucide="book-open"></i> Core Focus Skill: <span style="color:var(--text-primary); text-transform:capitalize;">${this.activeLearningSkill}</span></h4>
                        <p style="font-size:0.875rem; color:var(--text-secondary); margin-top:0.5rem;">Based on your career trajectory, we recommend systematically upgrading this skill. Or search for any specific custom skill right here to instantly discover curated global courses!</p>
                    </div>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <input type="text" id="custom-skill-input" placeholder="Search any skill..." class="form-input" style="padding:0.5rem; width:200px;" value="${this.activeLearningSkill !== 'React' ? this.activeLearningSkill : ''}">
                        <button class="btn btn-primary" id="search-skill-btn"><i data-lucide="search" style="width:16px; height:16px;"></i> Find Courses</button>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top:0.5rem;">
                    <a href="https://www.youtube.com/results?search_query=${encodedSkill}+highly+rated" target="_blank" class="btn btn-secondary" style="font-size:0.75rem; text-decoration:none; display:flex; align-items:center; gap:0.5rem; justify-content:center; border: 1px solid #ff000033; background: #ff00000a; color: #ff4444;">
                        <i data-lucide="youtube" style="width:16px; height:16px;"></i> High-Rated YouTube Playlists
                    </a>
                    <a href="https://www.coursera.org/search?query=${encodeURIComponent(this.activeLearningSkill + " certification")}" target="_blank" class="btn btn-secondary" style="font-size:0.75rem; text-decoration:none; display:flex; align-items:center; gap:0.5rem; justify-content:center; border: 1px solid var(--brand-primary); background: rgba(59,130,246,0.05); color: var(--brand-primary);">
                        <i data-lucide="award" style="width:16px; height:16px;"></i> Paid Global Certification
                    </a>
                    <a href="https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(this.activeLearningSkill)}" target="_blank" class="btn btn-secondary" style="font-size:0.75rem; text-decoration:none; display:flex; align-items:center; gap:0.5rem; justify-content:center; border: 1px solid var(--success); background: rgba(16,185,129,0.05); color: var(--success);">
                        <i data-lucide="code" style="width:16px; height:16px;"></i> Free Project Modules (fCC)
                    </a>
                </div>
            </div>
        `;
    }

    renderOpportunities() {
        const ranked = this.getRankedOpportunities();
        const totalMatches = ranked.length;
        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Opportunity Radar Feed</h2>
                <div class="stat-card glass-panel-subtle" style="background: rgba(14, 165, 233, 0.1); border-color: rgba(14, 165, 233, 0.3);">
                    <h3>Radar Hits</h3>
                    <div class="value" style="color: var(--brand-primary);">${totalMatches}</div>
                </div>
            </div>

            ${this.renderFilterRibbon()}
            <div class="grid-cards">
                ${ranked.map(opp => this.renderOpportunityCard(opp)).join('')}
            </div>
        `;
        this.attachCardListeners();
    }

    renderProfile() {
        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Student Profile</h2>
                <p class="view-subtitle">Configure your profile to improve radar matches.</p>
            </div>
            
            <form id="profile-form" class="card">
                <div class="grid-cards" style="grid-template-columns: 1fr 1fr; margin-bottom: 1.5rem;">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="prof-name" class="form-input" value="${store.profile.name}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">University</label>
                        <input type="text" id="prof-uni" class="form-input" value="${store.profile.university}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Branch/Major</label>
                        <input type="text" id="prof-branch" class="form-input" value="${store.profile.branch}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year of Study</label>
                        <input type="text" id="prof-year" class="form-input" value="${store.profile.year}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CGPA</label>
                        <input type="text" id="prof-cgpa" class="form-input" value="${store.profile.cgpa}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Goals (comma separated)</label>
                        <input type="text" id="prof-goals" class="form-input" value="${store.profile.goals.join(', ')}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Skills (comma separated)</label>
                    <input type="text" id="prof-skills" class="form-input" value="${store.profile.skills.join(', ')}">
                </div>

                <div class="form-group">
                    <label class="form-label">Resume / Experience Summary</label>
                    <textarea id="prof-resume" class="form-textarea">${store.profile.resumeText}</textarea>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Save Profile</button>
                    <input type="file" id="resume-upload" accept="application/pdf" style="display:none">
                    <div id="upload-btn" class="upload-placeholder" style="font-size: 0.875rem; color: var(--text-tertiary); display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                       <i data-lucide="upload-cloud"></i> Upload PDF Resume (Auto-Parse)
                    </div>
                </div>
            </form>
        `;

        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                store.saveProfile({
                    name: document.getElementById('prof-name').value,
                    university: document.getElementById('prof-uni').value,
                    branch: document.getElementById('prof-branch').value,
                    year: document.getElementById('prof-year').value,
                    cgpa: document.getElementById('prof-cgpa').value,
                    goals: document.getElementById('prof-goals').value.split(',').map(s => s.trim()),
                    skills: document.getElementById('prof-skills').value.split(',').map(s => s.trim()),
                    resumeText: document.getElementById('prof-resume').value
                });
                alert('Profile saved successfully! Radar matching logic will now use updated parameters.');
                this.updateSidebarProfile();
            });
        }

        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('resume-upload');
        if (uploadBtn && fileInput) {
            uploadBtn.onclick = () => fileInput.click();
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                uploadBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Parsing PDF...`;
                lucide.createIcons();
                try {
                    const pdfjsLib = window['pdfjs-dist/build/pdf'];
                    if (!pdfjsLib) throw new Error("PDF.js not loaded by browser");
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

                    const fileReader = new FileReader();
                    fileReader.onload = async function () {
                        const typedarray = new Uint8Array(this.result);
                        const pdf = await pdfjsLib.getDocument(typedarray).promise;
                        let fullText = "";
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            fullText += textContent.items.map(s => s.str).join(' ');
                        }
                        const resInput = document.getElementById('prof-resume');
                        resInput.value = fullText.slice(0, 5000); // 5000 chars safety
                        uploadBtn.innerHTML = `<i data-lucide="check" style="color:var(--success)"></i> Parsed Successfully!`;
                        lucide.createIcons();
                    };
                    fileReader.readAsArrayBuffer(file);
                } catch (err) {
                    console.error(err);
                    uploadBtn.innerHTML = `<i data-lucide="x" style="color:var(--danger)"></i> Parse Failed`;
                    lucide.createIcons();
                }
            });
        }
    }

    renderSaved() {
        const ranked = this.getRankedOpportunities();
        const saved = ranked.filter(o => store.savedOpportunities.includes(o.id));

        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Saved Opportunities</h2>
                <p class="view-subtitle">Opportunities you've bookmarked for later.</p>
            </div>
            ${saved.length === 0 ? '<p style="color:var(--text-tertiary)">You haven\'t saved any opportunities yet.</p>' : ''}
            <div class="grid-cards">
                ${saved.map(opp => this.renderOpportunityCard(opp)).join('')}
            </div>
        `;
        this.attachCardListeners();
    }

    attachCardListeners() {
        const saveBtns = this.viewContainer.querySelectorAll('.save-btn');
        saveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                if (store.savedOpportunities.includes(id)) {
                    store.removeOpportunity(id);
                } else {
                    store.saveOpportunity(id);
                    const opp = mockOpportunities.find(o => o.id === id);
                    if (opp) store.trackEngagement(opp.tags, 3); // High weight for explictly Saving
                }
                this.renderView(this.currentView);
            });
        });

        const detailBtns = this.viewContainer.querySelectorAll('.view-details-btn');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                this.openOpportunityDetailsModal(id);
            });
        });

        const filterBtns = this.viewContainer.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = btn.getAttribute('data-type');
                this.renderView(this.currentView);
            });
        });

        const searchBtn = this.viewContainer.querySelector('#search-skill-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const val = document.getElementById('custom-skill-input').value.trim();
                if (val) {
                    this.activeLearningSkill = val;
                    this.renderView(this.currentView);
                }
            });
            document.getElementById('custom-skill-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchBtn.click();
            });
        }
    }

    async openOpportunityDetailsModal(id) {
        store.markViewed(id);
        const opp = mockOpportunities.find(o => o.id === id);
        if (!opp) return;

        store.trackEngagement(opp.tags, 1); // Native micro-weight tracking for actively Viewing details

        const modalContainer = document.getElementById('modal-container');

        const renderModal = (auditHTML = '', draftingHTML = '') => {
            modalContainer.innerHTML = `
                <div class="modal-overlay" id="modal-${id}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div>
                                <h2 style="font-size: 1.5rem; font-weight:800">${opp.title}</h2>
                                <p style="color:var(--text-secondary)">${opp.company} • ${opp.location}</p>
                            </div>
                            <button class="icon-btn close-modal"><i data-lucide="x"></i></button>
                        </div>
                        <div class="modal-body">
                            <div style="white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6; padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; border: 1px solid var(--border-color); color: var(--text-secondary); max-height: 300px; overflow-y: auto;">${opp.description}</div>
                            <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                                ${opp.tags.map(t => `<span style="font-size:0.75rem; border:1px solid var(--border-color); padding: 0.25rem 0.5rem; border-radius: 4px;">${t}</span>`).join('')}
                            </div>
                            
                            ${auditHTML}
                            ${draftingHTML}
                        </div>
                        <div class="modal-footer">
                            <a href="${opp.source_url || opp.url || '#'}" target="_blank" class="btn btn-primary" style="background: var(--success); align-self: center; margin-right: auto; text-decoration: none;"><i data-lucide="external-link"></i> Apply Here</a>
                            <button class="btn btn-secondary run-audit-btn"><i data-lucide="sparkles" style="color:var(--brand-secondary)"></i> AI Audit</button>
                            <button class="btn btn-primary draft-letter-btn"><i data-lucide="pen-tool"></i> Draft Letter</button>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();

            modalContainer.querySelector('.close-modal').addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });

            const auditBtn = modalContainer.querySelector('.run-audit-btn');
            if (auditBtn) {
                auditBtn.addEventListener('click', async () => {
                    store.trackEngagement(opp.tags, 1); // Micro-weight for analyzing
                    auditBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Analyzing...`;
                    lucide.createIcons();
                    const result = await aiAgent.auditResume(opp, store.profile);
                    const auditH = `
                      <div class="ai-audit-box">
                         <h4 style="color:var(--brand-secondary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="sparkles"></i> AI Resume Audit (${result.matchScore}% Match)</h4>
                         <div style="margin-bottom:0.5rem"><strong>Strengths:</strong> ${result.strengths.join(', ')}</div>
                         <div style="margin-bottom:0.5rem"><strong>Weaknesses:</strong> ${result.weaknesses.join(', ')}</div>
                         <div><strong>Recommendation:</strong> ${result.recommendation}</div>
                      </div>
                   `;
                    renderModal(auditH, draftingHTML);
                });
            }

            const draftBtn = modalContainer.querySelector('.draft-letter-btn');
            if (draftBtn) {
                draftBtn.addEventListener('click', async () => {
                    store.trackEngagement(opp.tags, 4); // Extremely high-weight for explicit Action Drafting!
                    draftBtn.innerHTML = `<i data-lucide="loader" class="spin"></i> Drafting...`;
                    lucide.createIcons();
                    const letter = await aiAgent.draftCoverLetter(opp, store.profile);
                    const draftH = `
                      <div class="draft-box">
                         <strong style="color:var(--text-primary)">AI Generated Cover Letter:</strong><br><br>
                         ${letter.replace(/\\n/g, '<br>')}
                      </div>
                   `;
                    renderModal(auditHTML, draftH);
                });
            }

            modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    modalContainer.innerHTML = '';
                }
            });
        };

        renderModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
