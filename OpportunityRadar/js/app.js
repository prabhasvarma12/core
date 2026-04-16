import store from './store.js';
import { mockOpportunities, fetchLiveOpportunities } from './mockData.js';
import { aiAgent } from './ai-agent.js';

class App {
    constructor() {
        this.currentView = 'dashboard';
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
        this.setupNavigation();
        this.setupThemeToggle();
        this.renderView('dashboard');

        fetchLiveOpportunities().then(() => {
            if (window.app) {
                window.app.renderView(window.app.currentView);
            }
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
        const profileSkills = store.profile.skills.map(s => s.toLowerCase());
        const profileGoals = store.profile.goals.map(g => g.toLowerCase());
        return mockOpportunities.map(opp => {
            let score = 50;
            const oppTags = opp.tags.map(t => t.toLowerCase());
            const matchedSkills = oppTags.filter(t => profileSkills.some(ps => t.includes(ps) || ps.includes(t)));
            score += (matchedSkills.length * 15);
            if (profileGoals.some(g => opp.title.toLowerCase().includes(g) || opp.type.toLowerCase().includes(g))) {
                score += 20;
            }
            score = Math.min(score, 99);
            return { ...opp, dynamicScore: score };
        }).sort((a, b) => b.dynamicScore - a.dynamicScore);
    }

    renderOpportunityCard(opp) {
        const isSaved = store.savedOpportunities.includes(opp.id);
        const matchColor = opp.dynamicScore > 80 ? 'var(--success)' : (opp.dynamicScore > 60 ? 'var(--warning)' : 'var(--text-tertiary)');

        return `
            <div class="card" data-id="${opp.id}">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <span style="background: rgba(59,130,246,0.1); color: var(--brand-primary); padding: 0.25rem 0.5rem; border-radius:1rem; font-size:0.75rem; font-weight:700;">${opp.type}</span>
                    <button class="icon-btn save-btn" data-id="${opp.id}" style="width:32px; height:32px;">
                       <i data-lucide="bookmark" fill="${isSaved ? 'var(--brand-primary)' : 'none'}" color="${isSaved ? 'var(--brand-primary)' : 'var(--text-secondary)'}"></i>
                    </button>
                </div>
                <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:0.25rem;">${opp.title}</h3>
                <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom:1rem;">${opp.company} • ${opp.location}</p>
                
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

    renderDashboard() {
        const ranked = this.getRankedOpportunities();
        const topMatches = ranked.filter(o => o.dynamicScore > 75);

        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Welcome back, ${store.profile.name.split(' ')[0]}!</h2>
                <p class="view-subtitle">Your radar has found ${topMatches.length} highly matching opportunities today.</p>
            </div>
            
            <h3 style="margin-bottom:1rem;">Top Radar Picks For You</h3>
            <div class="grid-cards">
                ${topMatches.slice(0, 3).map(opp => this.renderOpportunityCard(opp)).join('')}
            </div>
        `;
        this.attachCardListeners();
    }

    renderOpportunities() {
        const ranked = this.getRankedOpportunities();
        this.viewContainer.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Opportunity Radar Feed</h2>
                <p class="view-subtitle">Ranked based on your profile skills and goals.</p>
            </div>
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
                    <div class="upload-placeholder" style="font-size: 0.875rem; color: var(--text-tertiary); display:flex; align-items:center; gap:0.5rem; cursor:pointer;" onclick="alert('Resume upload will parse PDF to text automatically in final implementation.')">
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
    }

    async openOpportunityDetailsModal(id) {
        store.markViewed(id);
        const opp = mockOpportunities.find(o => o.id === id);
        if (!opp) return;

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
                            <p>${opp.description}</p>
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
