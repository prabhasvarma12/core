// Local store for managing states
const savedProfile = localStorage.getItem('opRadar_profile');
const savedOpportunities = localStorage.getItem('opRadar_saved');
const savedPrefs = localStorage.getItem('opRadar_prefs');

const store = {
    profile: savedProfile ? JSON.parse(savedProfile) : {
        name: 'Student User',
        university: 'State University',
        branch: 'Computer Science',
        year: 'Junior',
        cgpa: '9.1',
        skills: ['JavaScript', 'React', 'Python', 'Machine Learning', 'Data Analysis'],
        goals: ['Find a Summer Internship', 'Gain practical AI experience'],
        resumeText: 'Experienced computer science student with a passion for web development and AI.'
    },
    savedOpportunities: savedOpportunities ? JSON.parse(savedOpportunities) : [],
    dismissedOpportunities: localStorage.getItem('opRadar_dismissed') ? JSON.parse(localStorage.getItem('opRadar_dismissed')) : [],
    preferences: savedPrefs ? JSON.parse(savedPrefs) : { weights: {} },
    engagementData: {
        viewedIds: [],
        appliedIds: []
    },
    listeners: [],

    subscribe(callback) {
        this.listeners.push(callback);
    },

    notify() {
        this.listeners.forEach(cb => cb(this));
    },

    saveProfile(newProfile) {
        this.profile = { ...this.profile, ...newProfile };
        localStorage.setItem('opRadar_profile', JSON.stringify(this.profile));
        this.notify();
    },

    saveOpportunity(id) {
        if (!this.savedOpportunities.includes(id)) {
            this.savedOpportunities.push(id);
            localStorage.setItem('opRadar_saved', JSON.stringify(this.savedOpportunities));
            this.notify();
        }
    },

    removeOpportunity(id) {
        this.savedOpportunities = this.savedOpportunities.filter(oppId => oppId !== id);
        localStorage.setItem('opRadar_saved', JSON.stringify(this.savedOpportunities));
        this.notify();
    },

    dismissOpportunity(id, tags) {
        if (!this.dismissedOpportunities.includes(id)) {
            this.dismissedOpportunities.push(id);
            localStorage.setItem('opRadar_dismissed', JSON.stringify(this.dismissedOpportunities));
            this.trackEngagement(tags, -4); // Negative vector subtraction for implicit Reinforcement Learning
            this.notify();
        }
    },

    markViewed(id) {
        if (!this.engagementData.viewedIds.includes(id)) {
            this.engagementData.viewedIds.push(id);
        }
    },

    trackEngagement(tags, weightInt) {
        if (!this.preferences) this.preferences = { weights: {} };
        tags.forEach(t => {
            const tag = t.toLowerCase();
            this.preferences.weights[tag] = (this.preferences.weights[tag] || 0) + weightInt;
        });
        localStorage.setItem('opRadar_prefs', JSON.stringify(this.preferences));
        // We do not strictly need to notify() every micro-engagement to prevent aggressive re-renders,
        // but the data will be used on the next natural render cycle!
    }
};

export default store;
