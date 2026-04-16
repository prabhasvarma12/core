// Local store for managing states
const store = {
    profile: {
        name: 'Student User',
        university: 'State University',
        branch: 'Computer Science',
        year: 'Junior',
        cgpa: '3.8',
        skills: ['JavaScript', 'React', 'Python', 'Machine Learning', 'Data Analysis'],
        goals: ['Find a Summer Internship', 'Gain practical AI experience'],
        resumeText: 'Experienced computer science student with a passion for web development and AI. Built multiple open-source projects including a task manager using React and a sentiment analysis model using Python. Coursework includes Data Structures, Algorithms, Machine Learning.'
    },
    savedOpportunities: [],
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
        this.notify();
    },

    saveOpportunity(id) {
        if (!this.savedOpportunities.includes(id)) {
            this.savedOpportunities.push(id);
            this.notify();
        }
    },

    removeOpportunity(id) {
        this.savedOpportunities = this.savedOpportunities.filter(oppId => oppId !== id);
        this.notify();
    },

    markViewed(id) {
        if (!this.engagementData.viewedIds.includes(id)) {
            this.engagementData.viewedIds.push(id);
        }
    }
};

export default store;
