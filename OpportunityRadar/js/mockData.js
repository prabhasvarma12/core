export let mockOpportunities = [
    {
        id: 'opp-job1',
        title: 'Junior Software Engineer',
        company: 'LinkedIn Sourced: TechCorp',
        type: 'Job',
        location: 'Remote / Global',
        deadline: 'Rolling Continuous',
        tags: ['Job', 'Software', 'Full-time', 'React', 'Node.js'],
        description: 'We are hiring a Junior Software Developer to join our core engineering team. You will be building scalable APIs and responsive frontend systems locally and abroad.',
        matchScore: 95
    },
    {
        id: 'opp-job2',
        title: 'Python Backend Developer',
        company: 'Indeed Sourced: DataStream Corp',
        type: 'Job',
        location: 'Hybrid',
        deadline: '30th June 2026',
        tags: ['Job', 'Python', 'Backend', 'Full-time'],
        description: 'Looking for a Python developer experienced in Django/FastAPI and SQL databases to architect complex data pipelines and build robust backend systems natively.',
        matchScore: 88
    },
    {
        id: 'opp-tworks',
        title: 'Hardware Innovation Hackathon',
        company: 'T-Works Telangana',
        type: 'Hackathon',
        location: 'Hyderabad, Telangana',
        deadline: '15th May 2026',
        tags: ['Hardware', 'IoT', 'Prototyping', 'Telangana'],
        description: 'T-Works is hosting a massive hardware hackathon. Build the next generation of IoT devices with access to 3D printers and laser cutters.',
        matchScore: 90
    },
    {
        id: 'opp-iit',
        title: 'Summer Research Fellowship',
        company: 'IIT Hyderabad & NIT Warangal',
        type: 'Research',
        location: 'IIT Hyderabad Campus',
        deadline: '30th April 2026',
        tags: ['Research', 'AI', 'Machine Learning', 'Academic'],
        description: 'Join the premier AI research lab at IIT Hyderabad for a summer internship working on NLP and Computer Vision models.',
        matchScore: 85
    },
    {
        id: 'opp-buddy',
        title: 'Reliance Foundation Scholarship 2026',
        company: 'Buddy4Study Platform',
        type: 'Scholarship',
        location: 'Online',
        deadline: '20th August 2026',
        tags: ['Scholarship', 'Funding', 'Merit-Based'],
        description: 'Apply for the Reliance Foundation undergraduate scholarship. Eligibility requires a CGPA of 3.0+ and demonstrable financial need.',
        matchScore: 70
    },
    {
        id: 'opp-unstop',
        title: 'Smart India Hackathon 2026',
        company: 'Unstop',
        type: 'Hackathon',
        location: 'Hybrid',
        deadline: '1st June 2026',
        tags: ['Hackathon', 'Software', 'India', 'Innovation'],
        description: 'Compete in the largest national hackathon focusing on civic technology and public infrastructure improvement.',
        matchScore: 80
    }
];

export const fetchLiveOpportunities = async () => {
    try {
        const response = await fetch('js/liveData.json');
        if (response.ok) {
            const liveData = await response.json();
            if (liveData && liveData.length > 0) {
                // Safely merge live array with the localized specific targets recursively to bypass generic scraping blocks!
                mockOpportunities = [...liveData, ...mockOpportunities];
                console.log("Dynamically loaded", liveData.length, "live opportunities merged with offline guarantees!");
            }
        }
    } catch (e) {
        console.warn("No 'js/liveData.json' found, utilizing offline mocked array.", e);
    }
};
