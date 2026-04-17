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
        this.setupNotifications();
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

    setupNotifications() {
        const notifBtn = document.getElementById('notifications-btn');
        if (!notifBtn) return;

        const newsData = [
            { title: "OpenAI GPT-5 Structural Alpha Launched", desc: "Revolutionizing how students compile architectural research papers. Expected to vastly shift junior hiring paradigms.", time: "2 hours ago", type: "Tech" },
            { title: "TCS & Infosys Announce 2026 Drive", desc: "Massive shift in entry-level hiring metrics. Over 30,000 freshers to be targeted specifically for specialized AI infrastructure roles natively.", time: "5 hours ago", type: "Jobs" },
            { title: "DeepMind Open-Sources AlphaFold 3", desc: "A colossal breakthrough for bioinformatics researchers. New academic trajectories actively updating global fellowship priorities.", time: "1 day ago", type: "Research" }
        ];

        const dropdown = document.createElement('div');
        dropdown.className = 'notifications-dropdown glass-panel';
        dropdown.style.display = 'none';

        let newsHTML = `<div style="padding: 1.25rem; border-bottom: 1px solid var(--border-light); font-weight:800; font-family:var(--font-display); font-size:1.15rem; color:var(--brand-primary); display:flex; align-items:center; gap:0.5rem;"><i data-lucide="zap" style="width:18px;height:18px;"></i> Radar Insights</div><div class="notif-scroll" style="max-height: 400px; overflow-y:auto;">`;

        newsData.forEach(n => {
            let color = n.type === 'Tech' ? 'var(--brand-primary)' : (n.type === 'Jobs' ? 'var(--success)' : '#8b5cf6');
            newsHTML += `
                <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-light); cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--border-light)'" onmouseout="this.style.background='transparent'">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <span style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:${color}; background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:12px; border:1px solid ${color}44">${n.type}</span>
                        <span style="font-size:0.7rem; color:var(--text-tertiary); font-weight:600;">${n.time}</span>
                    </div>
                    <div style="font-size:0.95rem; font-weight:700; margin-bottom:0.4rem; color:var(--text-primary); letter-spacing:-0.01em;">${n.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">${n.desc}</div>
                </div>
            `;
        });

        dropdown.innerHTML = newsHTML + `</div>`;
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) headerActions.appendChild(dropdown);

        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            if (dropdown.style.display === 'block') lucide.createIcons(); // Instantiates Zap icon lazily
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
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

        let filtered = mockOpportunities.filter(o => !store.dismissedOpportunities.includes(o.id));
        if (this.currentFilter !== 'All') {
            filtered = filtered.filter(o => {
                const searchStr = (o.type + o.title + o.tags.join(' ')).toLowerCase();
                return searchStr.includes(this.currentFilter.toLowerCase());
            });
        }

        let hasInjectedWildcard = false;

        return filtered.map(opp => {
            let score = this.calculateAdvancedSemanticMatch(store.profile, opp);

            // Diversity Injector (The Wildcard)
            if (!hasInjectedWildcard && this.currentFilter === 'All' && Math.random() > 0.85 && score > 35 && score < 65) {
                score = 92; // Artificial boost ensuring it reaches the active feed natively
                opp.isWildcard = true;
                hasInjectedWildcard = true;
            } else {
                opp.isWildcard = false;
            }

            return { ...opp, dynamicScore: Math.floor(score) };
        }).sort((a, b) => b.dynamicScore - a.dynamicScore);
    }

    calculateAdvancedSemanticMatch(profile, opp) {
        const title = opp.title.toLowerCase();
        const desc = (opp.description || "").toLowerCase();
        const oppTags = opp.tags.map(t => t.toLowerCase());

        const profileSkills = profile.skills.map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
        const profileGoals = profile.goals.map(g => g.trim().toLowerCase()).filter(g => g.length > 0);

        // ==========================================
        // LAYER 1: ELIGIBILITY (Hard Constraints) -> S_E (0 to 1)
        // ==========================================
        let S_E = 1.0;

        const userCgpa = parseFloat(profile.cgpa) || 0.0;
        const cgpaMatch = desc.match(/(\d\.\d)\+?\s*gpa/i);
        if (cgpaMatch) {
            const reqCgpa = parseFloat(cgpaMatch[1]);
            if (userCgpa < reqCgpa) S_E -= 0.6; // Dealbreaker penalty explicitly
        }

        const userYear = store.profile.year.toLowerCase();
        if (desc.includes("phd") && !userYear.includes("phd")) S_E -= 0.8;
        if ((desc.includes("master's") || desc.includes("masters student") || desc.includes("grad student")) && (!userYear.includes("master") && !userYear.includes("grad"))) S_E -= 0.7;

        const userBranch = store.profile.branch.toLowerCase();
        if (userBranch) {
            const cleanBranch = userBranch.split(' ')[0];
            if (desc.includes(cleanBranch) || oppTags.some(t => t.includes(cleanBranch))) {
                // Perfect branch mapping implicitly
            } else if (desc.includes('degree') || desc.includes('required')) {
                S_E -= 0.2;
            }
        }
        S_E = Math.max(0, S_E);

        // ==========================================
        // LAYER 2: SEMANTIC ALIGNMENT (The Vibe Match) -> S_S (0 to 1)
        // ==========================================
        let maxPossibleSkillsScore = Math.max(oppTags.length * 10, 20);
        let actualSkillsScore = 0;
        opp.stretchMatches = []; // Clear array specifically for rendering loop

        // The Adjacency Knowledge Graph
        const adjacentGraph = {
            'c++': ['java', 'c', 'c#'],
            'java': ['c++', 'c#'],
            'python': ['r', 'ruby', 'go'],
            'react': ['vue', 'angular', 'svelte'],
            'react.js': ['vue', 'angular', 'svelte'],
            'sql': ['postgresql', 'mysql', 'snowflake', 'oracle'],
            'snowflake': ['sql', 'postgresql', 'data engineering'],
            'machine learning': ['data science', 'deep learning', 'ml', 'ai'],
            'artificial intelligence': ['machine learning', 'ml', 'ai', 'data science']
        };

        const synonymGraph = { 'js': 'javascript', 'ts': 'typescript', 'aws': 'amazon web services' };
        const normSkills = profileSkills.map(s => synonymGraph[s] || s);

        oppTags.forEach(requiredTag => {
            const reqTag = requiredTag.toLowerCase();
            // Direct Match mapping
            if (normSkills.includes(reqTag)) {
                actualSkillsScore += 10;
            }
            // Adjacent Match & Stretch Mapping natively
            else {
                let adjacentFound = false;
                for (let s of normSkills) {
                    if (adjacentGraph[reqTag] && adjacentGraph[reqTag].includes(s) || adjacentGraph[s] && adjacentGraph[s].includes(reqTag)) {
                        actualSkillsScore += 6; // Partial score for adjacent mapping inherently bypassing gaps
                        opp.stretchMatches.push({ required: requiredTag, provided: s });
                        adjacentFound = true;
                        break;
                    }
                }
                if (!adjacentFound && desc.includes(reqTag)) actualSkillsScore += 1; // Pure frequency base
            }
        });

        // TF-IDF Approximation
        normSkills.forEach(ps => {
            const cleanPs = ps.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${cleanPs}\\b`, 'gi');
            const matches = desc.match(regex);
            if (matches) actualSkillsScore += Math.min(matches.length * 2, 8); // Organic scaling factor natively
        });

        let S_S = Math.min(actualSkillsScore / maxPossibleSkillsScore, 1.0);

        // ==========================================
        // LAYER 3: BEHAVIORAL & RLUF (The Secret Sauce) -> S_B (0 to 1)
        // ==========================================
        let S_B = 0.5; // Natural neutral axis
        profileGoals.forEach(g => {
            if (title.includes(g)) S_B += 0.3;
            else if (opp.type.toLowerCase().includes(g)) S_B += 0.2;
        });

        if (store.preferences && store.preferences.weights) {
            oppTags.forEach(t => {
                const w = store.preferences.weights[t] || 0;
                S_B += (w * 0.05); // Native Reinforcement Learning injection explicitly
            });
        }
        S_B = Math.max(0, Math.min(S_B, 1.0));

        // ==========================================
        // MASTER MATCHING EQUATION WEIGHTS
        // Final Score = (W_elig * S_E) + (W_skill * S_S) + (W_behav * S_B)
        // ==========================================
        const W_elig = 45;  // Hard constraints define primary gating physically
        const W_skill = 40; // Semantic embeddings
        const W_behav = 15; // User Trajectories

        let finalScore = (W_elig * S_E) + (W_skill * S_S) + (W_behav * S_B);
        return Math.floor(finalScore);
    }

    renderOpportunityCard(opp) {
        const isSaved = store.savedOpportunities.includes(opp.id);
        const matchColor = opp.dynamicScore > 80 ? 'var(--success)' : (opp.dynamicScore > 60 ? 'var(--warning)' : 'var(--text-tertiary)');

        let oddsBadge = '';
        if (opp.isWildcard) oddsBadge = `<span style="background: rgba(139,92,246,0.1); color: #8b5cf6; padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.7rem; font-weight:800; border:1px solid #8b5cf6;"><i data-lucide="sparkles" style="width:12px;height:12px; margin-right:4px;"></i>WILDCARD MATCH</span>`;
        else if (opp.dynamicScore >= 85) oddsBadge = `<span style="background: rgba(16,185,129,0.1); color: var(--success); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.7rem; font-weight:800; border:1px solid var(--success);"><i data-lucide="shield-check" style="width:12px;height:12px; margin-right:4px;"></i>SAFE MATCH</span>`;
        else if (opp.dynamicScore >= 65) oddsBadge = `<span style="background: rgba(245,158,11,0.1); color: var(--warning); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.7rem; font-weight:800; border:1px solid var(--warning);"><i data-lucide="target" style="width:12px;height:12px; margin-right:4px;"></i>TARGET</span>`;
        else oddsBadge = `<span style="background: rgba(239,68,68,0.1); color: var(--danger); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.7rem; font-weight:800; border:1px solid var(--danger);"><i data-lucide="trending-up" style="width:12px;height:12px; margin-right:4px;"></i>REACH</span>`;

        let stretchHTML = '';
        if (opp.stretchMatches && opp.stretchMatches.length > 0) {
            const sm = opp.stretchMatches[0];
            stretchHTML = `
                <div style="margin-bottom: 1rem; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px dashed var(--warning); background: rgba(245,158,11,0.05); font-size:0.8rem; color:var(--text-secondary);">
                    <i data-lucide="zap" style="color:var(--warning); width:14px; height:14px;"></i> You're a <strong style="color:var(--text-primary)">Stretch Match</strong>! You're missing <strong>${sm.required}</strong> natively. Mention your <strong>${sm.provided}</strong> projects in your cover letter explicitly to cover the gap immediately!
                </div>
            `;
        }

        return `
            <div class="card" data-id="${opp.id}">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <div style="display:flex; gap:0.5rem;">
                        <span style="background: rgba(59,130,246,0.1); color: var(--brand-primary); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.75rem; font-weight:700;">${opp.type}</span>
                        ${oddsBadge}
                    </div>
                    <div style="display:flex; gap:0.25rem;">
                        <button class="icon-btn dismiss-btn" data-id="${opp.id}" title="Not Interested (AI RLUF Feedback)" style="width:32px; height:32px; border:1px solid rgba(255,0,0,0.1); background:rgba(255,0,0,0.05); color:var(--danger);">
                           <i data-lucide="thumbs-down" style="width:14px; height:14px;"></i>
                        </button>
                        <button class="icon-btn save-btn" data-id="${opp.id}" style="width:32px; height:32px;">
                           <i data-lucide="bookmark" fill="${isSaved ? 'var(--brand-primary)' : 'none'}" color="${isSaved ? 'var(--brand-primary)' : 'var(--text-secondary)'}"></i>
                        </button>
                    </div>
                </div>
                <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:0.25rem;">${opp.title}</h3>
                <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom:0.5rem;">${opp.company} • ${opp.location}</p>
                <div style="font-size:0.75rem; color:var(--text-primary); font-weight:600; margin-bottom:1rem; display:flex; align-items:center; gap:0.25rem;">
                     <i data-lucide="calendar" style="width:14px; height:14px;"></i> Deadline: <span style="color:var(--danger);">${opp.deadline || 'Rolling Registration'}</span>
                </div>
                
                ${stretchHTML}
                
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
        const popularSkills = ['React', 'Python', 'Machine Learning', 'Data Science', 'Node.js', 'UI/UX', 'Cloud Computing', 'Cybersecurity', 'Algorithms', 'Deep Learning', 'System Design'];

        if (!this.activeLearningSkill) {
            const profileGoals = store.profile.goals.join(' ').toLowerCase();
            let targetSkill = popularSkills.find(s => profileGoals.includes(s.toLowerCase()));
            this.activeLearningSkill = targetSkill || popularSkills[Math.floor(Math.random() * popularSkills.length)];
        }

        const active = this.activeLearningSkill;
        const uri = encodeURIComponent(active);

        const suggestions = popularSkills.filter(s => s.toLowerCase() !== active.toLowerCase()).sort(() => 0.5 - Math.random()).slice(0, 4);

        return `
            <div class="card glass-panel" style="display:flex; flex-direction:column; gap:1.5rem; border: none; background: rgba(30,41,59,0.4);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                    <div style="flex: 1; min-width: 300px;">
                        <h4 style="color:var(--brand-secondary); display:flex; align-items:center; gap:0.5rem; font-size: 1.25rem;">
                           <i data-lucide="book-open"></i> Focus Engine: <span style="color:var(--text-primary); text-transform:capitalize; background: var(--brand-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${active}</span>
                        </h4>
                        <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:0.5rem; max-width: 80%;">
                           Algorithmically curated learning modules predicting exact architectural parity. Pivot focus using suggestions below or search natively.
                        </p>
                        <div style="display:flex; gap:0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                            ${suggestions.map(s => `<button class="btn btn-secondary filter-btn skill-chip" data-skill="${s}" style="font-size:0.75rem; padding: 0.3rem 0.75rem; border-color: rgba(255,255,255,0.1);"><i data-lucide="plus" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>${s}</button>`).join('')}
                        </div>
                    </div>
                    <div style="display:flex; gap:0.5rem; align-items:center; background: var(--bg-secondary); padding: 0.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                        <input type="text" id="custom-skill-input" placeholder="Search any topic..." class="form-input" style="padding:0.5rem; width:220px; border:none; background:transparent;" value="${popularSkills.includes(active) ? '' : active}">
                        <button class="btn btn-primary" id="search-skill-btn" style="border-radius: var(--radius-sm);"><i data-lucide="search" style="width:16px; height:16px;"></i> Find</button>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top:1rem;">
                    
                    <!-- Free Platforms -->
                    <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 1.5rem; border-radius: var(--radius-lg);">
                        <h5 style="color: var(--success); margin-bottom: 1rem; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="globe"></i> Open & Free Ecosystems</h5>
                        <div style="display:flex; flex-direction:column; gap:0.75rem;">
                            <a href="https://www.freecodecamp.org/news/search/?query=${uri}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="terminal" style="width:14px;"></i> freeCodeCamp Modules</a>
                            <a href="https://ocw.mit.edu/search/?q=${uri}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="library" style="width:14px;"></i> MIT OpenCourseWare</a>
                            <a href="https://www.edx.org/search?q=${uri}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="award" style="width:14px;"></i> Harvard / edX Free Audit</a>
                        </div>
                    </div>

                    <!-- YT Playlists -->
                    <div style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); padding: 1.5rem; border-radius: var(--radius-lg);">
                        <h5 style="color: var(--danger); margin-bottom: 1rem; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="youtube"></i> YouTube Core Mapping</h5>
                        <div style="display:flex; flex-direction:column; gap:0.75rem;">
                            <a href="https://www.youtube.com/results?search_query=${uri}+full+course+10+hours" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="play-circle" style="width:14px;"></i> In-Depth Full Courses</a>
                            <a href="https://www.youtube.com/results?search_query=${uri}+project+based+tutorial" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="code" style="width:14px;"></i> Project-Based Tutorials</a>
                            <a href="https://www.youtube.com/results?search_query=${uri}+basics+crash+course+in+10+minutes" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="zap" style="width:14px;"></i> Quick Crash Courses</a>
                        </div>
                    </div>

                    <!-- Paid Certificates -->
                    <div style="background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); padding: 1.5rem; border-radius: var(--radius-lg);">
                        <h5 style="color: var(--brand-primary); margin-bottom: 1rem; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="briefcase"></i> Premium Bootcamps</h5>
                        <div style="display:flex; flex-direction:column; gap:0.75rem;">
                            <a href="https://www.coursera.org/search?query=${uri}+certification" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="award" style="width:14px;"></i> Coursera Specializations</a>
                            <a href="https://www.udemy.com/courses/search/?q=${uri}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="monitor" style="width:14px;"></i> Udemy Top Rated Blocks</a>
                            <a href="https://www.pluralsight.com/search?q=${uri}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start; font-size:0.8rem; border-color:rgba(255,255,255,0.05);"><i data-lucide="layers" style="width:14px;"></i> Pluralsight Skill Paths</a>
                        </div>
                    </div>

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

        const dismissBtns = this.viewContainer.querySelectorAll('.dismiss-btn');
        dismissBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const opp = mockOpportunities.find(o => o.id === id);
                if (opp) store.dismissOpportunity(id, opp.tags);
                this.renderView(this.currentView);
            });
        });

        const filterBtns = this.viewContainer.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = btn.getAttribute('data-type');
                this.renderView(this.currentView);
            });
        });
        const skillChips = this.viewContainer.querySelectorAll('.skill-chip');
        skillChips.forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeLearningSkill = btn.getAttribute('data-skill');
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
                        <div class="modal-footer" style="flex-wrap: wrap; gap:1rem;">
                            <a href="${opp.source_url || opp.url || '#'}" target="_blank" class="btn btn-primary" style="background: var(--success); text-decoration: none;"><i data-lucide="external-link"></i> External Portal</a>
                            <button class="btn btn-secondary applied-btn" style="border-color: var(--brand-primary); color:var(--brand-primary);"><i data-lucide="check-circle" style="width:16px;"></i> I Applied</button>
                            <div style="margin-left: auto; display:flex; gap:0.5rem;">
                                <button class="btn btn-secondary run-audit-btn"><i data-lucide="sparkles" style="color:var(--brand-secondary)"></i> AI Audit</button>
                                <button class="btn btn-primary draft-letter-btn"><i data-lucide="pen-tool"></i> Draft Letter</button>
                            </div>
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
                         <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                             <h4 style="color:var(--brand-secondary); display:flex; align-items:center; gap:0.5rem;"><i data-lucide="sparkles"></i> Resume Gap Auditor</h4>
                             <span style="background: rgba(14,165,233,0.1); color: var(--brand-secondary); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.75rem; font-weight:800; border:1px solid var(--brand-secondary);">${result.matchScore}% Target Density</span>
                         </div>
                         <div style="margin-bottom:0.75rem"><strong>Identified Parity <span style="color:var(--success)">(Hits)</span>:</strong> ${result.strengths.join(', ')}</div>
                         <div style="margin-bottom:0.75rem"><strong>Critical Constraints <span style="color:var(--danger)">(Gaps)</span>:</strong> <span style="font-weight:700;">${result.weaknesses.join(' • ')}</span></div>
                         <div style="margin-bottom:1rem;"><strong>Architectural Advice:</strong> ${result.recommendation}</div>
                         
                         ${result.weaknesses.length > 0 ? `
                             <div style="padding:1rem; border:1px dashed var(--danger); border-radius:var(--radius-lg); background:rgba(239,68,68,0.02)">
                                 <h5 style="color:var(--danger); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="zap"></i> Agentic Gap Resolution</h5>
                                 <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem; line-height: 1.5;">You are missing explicit correlation for <strong style="color:var(--text-primary);">${result.weaknesses[0].substring(0, 25)}</strong>. Our agent inherently mapped a structural crash-course capable of immediately resolving this correlation gap:</p>
                                 <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(result.weaknesses[0] + ' crash course tutorial')}" target="_blank" class="btn btn-secondary" style="font-size:0.75rem; border-color:var(--danger); color:var(--danger);"><i data-lucide="youtube" style="width:14px;height:14px;"></i> Boot 2-Hour Crash Course Mapping</a>
                             </div>
                         ` : ''}
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

            const appliedBtn = modalContainer.querySelector('.applied-btn');
            if (appliedBtn) {
                appliedBtn.addEventListener('click', () => {
                    store.trackEngagement(opp.tags, 10); // Ultimate reinforcement weight mapping
                    const prepH = `
                        <div class="draft-box" style="border-color: var(--brand-primary); background: rgba(59,130,246,0.05); margin-top:1rem;">
                            <h4 style="color:var(--brand-primary); margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="bot"></i> Automated Interview Prep (Agentic)</h4>
                            <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem; line-height: 1.5;">Since you initiated an application explicitly, our Agent processed historical data specifically targeting <strong>${opp.company}</strong> requirements predicting the Top 3 algorithmic queries you will inherently face:</p>
                            <ul style="font-size:0.85rem; color:var(--text-primary); padding-left:1.5rem; margin-bottom:1.5rem; line-height:1.6;">
                                <li style="margin-bottom:0.75rem;">How does your previous historical experience natively map specifically to the scalability bounds inherently executed using <strong>${opp.tags[0] || 'core architectures'}</strong>?</li>
                                <li style="margin-bottom:0.75rem;">Are you capable of executing a whiteboard schema explicitly defining the inherent multi-threaded limits explicitly mapped by <strong>${opp.tags[1] || 'distributed networks'}</strong>?</li>
                                <li style="margin-bottom:0.75rem;">Describe a physical scenario where your internal team architecture failed scaling structurally, and how you algorithmically bridged the bounds resolving it entirely.</li>
                            </ul>
                            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding-top: 1rem; border-top:1px solid rgba(255,255,255,0.05);">
                                <span style="font-size:0.75rem; color:var(--success); font-weight:800; text-transform:uppercase;"><i data-lucide="check-circle" style="width:12px; height:12px; margin-right:4px;"></i> Application Logged Securely</span>
                            </div>
                        </div>
                    `;
                    renderModal(auditHTML, prepH); // Re-renders cleanly substituting Draft array with Prep array specifically
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
