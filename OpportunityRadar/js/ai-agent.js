import { GEMINI_API_KEY } from './config.js';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 }
            })
        });

        if (!response.ok) {
            console.error("Gemini API Error", await response.text());
            return null;
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        console.error("Network or parsing error", e);
        return null;
    }
}

export const aiAgent = {
    auditResume: async (opportunity, profile) => {
        const prompt = `You are an expert tech recruiter and AI internship matchmaker.
Evaluate this student profile against this job opportunity.

--- STUDENT PROFILE ---
Name: ${profile.name}
Major: ${profile.branch} (${profile.year})
CGPA: ${profile.cgpa}
Skills: ${profile.skills.join(', ')}
Goals: ${profile.goals.join(', ')}
Resume Snippet: ${profile.resumeText}

--- JOB OPPORTUNITY ---
Title: ${opportunity.title}
Company: ${opportunity.company}
Location: ${opportunity.location}
Description: ${opportunity.description}
Keywords: ${opportunity.tags.join(', ')}

--- TASK ---
Provide a JSON response with NO markdown formatting, just the raw JSON object.
Format exactly like this example:
{
  "matchScore": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1"],
  "recommendation": "Short 1-2 sentence recommendation on what to highlight."
}
`;
        const responseText = await callGemini(prompt);

        if (!responseText) {
            return {
                matchScore: 50,
                strengths: ["API Error occurred"],
                weaknesses: ["Could not reach AI"],
                recommendation: "Please try again later or check API key."
            };
        }

        try {
            const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON", e, responseText);
            return {
                matchScore: 60,
                strengths: ["Analyzed Successfully"],
                weaknesses: ["Formatting error in response"],
                recommendation: "Gemini successfully processed the request but returned malformed JSON."
            };
        }
    },

    draftCoverLetter: async (opportunity, profile) => {
        const prompt = `Write a professional, compelling cold email or cover letter for this internship.
Do not include any placeholders like [Your Name]. Fill everything in using the provided context.

--- STUDENT PROFILE ---
Name: ${profile.name}
Major: ${profile.branch} (${profile.year})
University: ${profile.university}
CGPA: ${profile.cgpa}
Skills: ${profile.skills.join(', ')}
Resume Summary: ${profile.resumeText}

--- TARGET ---
Role: ${opportunity.title}
Company: ${opportunity.company}

Write exactly 2-3 short, modern paragraphs. Be confident, professional, and directly map the student's skills to the role. Ensure it signs off with the student's name.`;

        const responseText = await callGemini(prompt);
        if (!responseText) {
            return "API connection failed. Could not generate draft. Please check your network and Gemini API limits.";
        }
        return responseText;
    }
};
