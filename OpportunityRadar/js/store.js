// Local store for managing states
const savedProfile = localStorage.getItem('opRadar_profile');
const savedOpportunities = localStorage.getItem('opRadar_saved');

const store = {
    profile: savedProfile ? JSON.parse(savedProfile) : {
        name: 'Student User',
        university: 'State University',
        branch: 'Computer Science',
        year: 'Junior',
        cgpa: '3.8',
        skills: ['JavaScript', 'React', 'Python', 'Machine Learning', 'Data Analysis'],
        goals: ['Find a Summer Internship', 'Gain practical AI experience'],
        resumeText: 'Experienced computer science student with a passion for web development and AI.'
    },
    savedOpportunities: savedOpportunities ? JSON.parse(savedOpportunities) : [],
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

    markViewed(id) {
        if (!this.engagementData.viewedIds.includes(id)) {
            this.engagementData.viewedIds.push(id);
        }
    }
};

export default store;
