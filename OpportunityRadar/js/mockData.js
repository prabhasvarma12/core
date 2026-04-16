export let mockOpportunities = [
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
