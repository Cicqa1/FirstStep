import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());

  // Initialize Gemini if apiKey is provided
  const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  
  let ai: any = null;
  if (hasApiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini client successfully initialized");
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
    }
  } else {
    console.log("Running in rich fallback mode (GEMINI_API_KEY is not configured yet)");
  }

  // --- API ROUTE: Transform Draft data to polished CV ---
  app.post("/api/generate-cv", async (req, res) => {
    try {
      const { name, email, phone, education, projects, activities, skills } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // If we don't have Gemini active (fallback mode)
      if (!ai) {
        // Construct clean, polished version dynamically using intelligent rule-based templates
        const cleanName = name.trim();
        const cleanEmail = email ? email.trim() : "";
        const cleanPhone = phone ? phone.trim() : "";
        
        // Only write summary if there are details to base it on
        const hasDetails = (education && education.trim().length > 0) || 
                           (projects && projects.trim().length > 0) || 
                           (activities && activities.trim().length > 0) || 
                           (skills && skills.trim().length > 0);
        
        const summaryText = hasDetails 
          ? `ვარ მოტივირებული სტუდენტი, რომელიც ორიენტირებული ვარ პრაქტიკული უნარების განვითარებაზე და მზად ვარ პირველი პროფესიული გამოწვევებისთვის საინტერესო ორგანიზაციაში.`
          : "";
        
        const polishedEducation = education && education.trim().length > 0 
          ? `${education.trim()}`
          : "";

        // Parse messy projects and write professional bullet points
        let polishedProjects = "";
        if (projects && projects.trim().length > 0) {
          const lines = projects.split('\n').filter((l: string) => l.trim().length > 0);
          polishedProjects = lines.map((line: string) => {
            const raw = line.trim().replace(/^•\s*/, '').replace(/^-\s*/, '');
            return `• ${raw}`;
          }).join('\n');
        }

        // Parse activities
        let polishedActivities = "";
        if (activities && activities.trim().length > 0) {
          const lines = activities.split('\n').filter((l: string) => l.trim().length > 0);
          polishedActivities = lines.map((line: string) => `• ${line.trim().replace(/^•\s*/, '').replace(/^-\s*/, '')}`).join('\n');
        }

        // Parse skills
        let skillList: string[] = [];
        if (skills && skills.trim().length > 0) {
          skillList = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        }

        return res.json({
          success: true,
          isMock: true,
          summary: summaryText,
          education: polishedEducation,
          projects: polishedProjects,
          activities: polishedActivities,
          skills: skillList
        });
      }

      // If we have real Gemini client active
      const prompt = `
You are an expert ATS-focused recruiter specializing in the Georgian student market and startup-ready CV formatting.
Create an elite, ATS-friendly professional CV based on the Georgian student's raw or draft inputs below:

Name: ${name}
Email: ${email}
Phone: ${phone}
Education: ${education}
Projects & Cases: ${projects}
Activities: ${activities}
Skills: ${skills}

CRITICAL REQUIREMENT (Don't Write Things I Didn't Write):
- Only format/polish what the student actually entered or provided.
- If a draft input field (e.g. Education, Projects & Cases, Activities, Skills, Phone, Email) is blank or missing, DO NOT manufacture or invent fake credentials/accomplishments/text for that field! Output a completely empty string ("") or an empty array ([]) for that field in the JSON structure.
- Do NOT add any fake universities (like BTU), fake degrees, fake student clubs, fake companies, fake locations, or fake skills that were not mentioned.

Analyze the input text and generate a polished, highly professional CV profile entirely in GT-standard Georgian language.
CRITICAL REQUIREMENT (Grammatical Perspective):
- You MUST write the entire CV consistently in the FIRST-PERSON ('პირველ პირში') singular perspective (e.g. "ვარ", "მაქვს", "დავაპროექტე", "შევქმენი", "გავაანალიზე", "მონაწილეობა მივიღე"). 
- Do NOT mix first-person and third-person (e.g., do NOT start with "სტუდენტი, რომელიც ორიენტირებულია" and then write "დავაპროექტე"). Write both the summary and sections in the first-person (e.g., "ვარ მოტივირებული სტუდენტი, რომელიც ორიენტირებული ვარ...").

Your outputs should look like they were written by a professional CV writer focusing on turning academic knowledge into first-job potential.
- summary should be written consistently in the first-person ("მე" - e.g., "ვარ მოტივირებული სტუდენტი...", "მსურს განვავითარო...") and be highly motivating, professional, and explain how the student's projects prove their readiness (leave empty string if no relevant details are provided).
- education should structure degrees, GPA (if any), and university names gracefully.
- projects should turn raw notes into high-impact, professional bullet points starting with strong action verbs in the first-person (e.g., "დავაპროექტე", "შევიმუშავე", "განვახორციელე", "გავაანალიზე") and formatted cleanly (using '\\n' for new lines).
- activities should polish student clubs, hackathons, or general academic engagements into strong indicators of leadership or teamwork in the first person (e.g., "მონაწილეობა მივიღე", "ვხელმძღვანელობდი").
- skills should be returned as a clean array of standard professional skill badges.

You must output valid JSON following the schema precisely.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional recruiting assistant for Georgia who NEVER invents or fabricates fake university credentials, mock projects, or accomplishments that the user didn't write. You write exclusively in the first-person singular perspective (პირველი პირის მხოლობითი რიცხვი, მე) to maintain perfect grammatical consistency throughout the whole resume.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              education: { type: Type.STRING },
              projects: { type: Type.STRING },
              activities: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "education", "projects", "activities", "skills"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);

      return res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error("Gemini CV Builder Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate CV using AI" });
    }
  });

  // --- API ROUTE: Match CV with Vacancies ---
  app.post("/api/match-jobs", async (req, res) => {
    try {
      const { cvData } = req.body;

      if (!cvData) {
        return res.status(400).json({ error: "cvData is required" });
      }

      const vacancies = [
        { id: "tbc", company: "TBC Bank", role: "Junior Data Analyst", targetSkills: ["Python", "Excel", "SQL"] },
        { id: "galt", company: "Galt & Taggart", role: "Business Analyst Intern", targetSkills: ["Excel", "Research"] },
        { id: "wissol", company: "Wissol Group", role: "Marketing Intern", targetSkills: ["Social Media", "Canva"] },
        { id: "epam", company: "EPAM Georgia", role: "Junior Frontend Developer", targetSkills: ["React", "JavaScript"] },
        { id: "sweeft", company: "Sweeft Digital", role: "Junior Backend Developer", targetSkills: ["Python", "Django"] },
        { id: "redberry", company: "Redberry", role: "Junior UX/UI Designer", targetSkills: ["Figma", "Wireframing"] },
        { id: "tegeta", company: "Tegeta Motors", role: "HR Intern", targetSkills: ["Communication", "MS Office"] },
        { id: "space", company: "Space International", role: "Digital Marketing Intern", targetSkills: ["SEO", "Analytics"] },
        { id: "psp", company: "PSP Pharmaceuticals", role: "Junior Data Specialist", targetSkills: ["Excel", "SQL"] },
        { id: "co_fund", company: "Georgian Co-Investment Fund", role: "Finance Intern", targetSkills: ["Excel", "Financial Modeling"] }
      ];

      // Safe static matched fallback if no API key is specified
      if (!ai) {
        const skillsString = (cvData.skills || []).join(", ").toLowerCase();
        
        const staticMatches = vacancies.map((vac) => {
          let matchPercent = vac.id === "tbc" ? 92 : vac.id === "epam" ? 90 : vac.id === "galt" ? 85 : 75;
          const matchedSkills: string[] = [];
          const missingSkills: string[] = [];

          vac.targetSkills.forEach((skill) => {
            if (skillsString.includes(skill.toLowerCase())) {
              matchedSkills.push(skill);
            } else {
              missingSkills.push(skill);
            }
          });

          // Recalculate based on real skills presence to make it extremely alive and interactive!
          const matchRatio = matchedSkills.length / vac.targetSkills.length;
          if (matchedSkills.length > 0) {
            matchPercent = Math.min(99, Math.max(65, Math.round(55 + (matchRatio * 44))));
          } else {
            matchPercent = Math.min(74, Math.max(50, Math.round(50 + Math.random() * 15)));
          }

          let tip = "";
          if (vac.id === "tbc") {
            tip = missingSkills.includes("SQL") 
              ? "თიბისისთვის რეკომენდებულია SQL-თან მუშაობის მაგალითის ჩვენება." 
              : "თქვენი უნარები კარგად ემთხვევა პოზიციას! გირჩევთ ხაზი გაუსვათ პორტფოლიოს.";
          } else if (vac.id === "epam") {
            tip = missingSkills.includes("React") 
              ? "EPAM-ის ფრონტენდ პოზიციისთვის აუცილებელია React-ის პროექტის CV-ში დამატება." 
              : "კარგი თავსებადობაა! დაურთეთ თქვენი GitHub ან პორტფოლიოს ბმული CV-ს.";
          } else {
            tip = missingSkills.length > 0 
              ? `რეკომენდებულია დაეუფლოთ ${missingSkills.slice(0, 1).join("")}-ს ამ პოზიციაზე განაცხადის შეტანამდე.`
              : "თქვენი პროფილი სრულად მზადაა ამ ვაკანსიისთვის. გააგზავნეთ განაცხადი!";
          }

          return {
            id: vac.id,
            matchPercent,
            matchedSkills,
            missingSkills,
            tip
          };
        });

        return res.json({ success: true, isMock: true, matches: staticMatches });
      }

      // If we have Gemini: calculate actual, intelligent job match percentage
      const prompt = `
You are an advanced AI job matching system for students in Georgia. 
Analyze this student CV:
Summary: ${cvData.summary}
Education: ${cvData.education}
Projects & Experience: ${cvData.projects}
Activities: ${cvData.activities}
Skills: ${cvData.skills ? cvData.skills.join(", ") : "None specified"}

Compare this CV with each of the following vacancies:
${JSON.stringify(vacancies)}

For each vacancy, evaluate their suitability and output:
- "id": must match one of ("tbc", "galt", "wissol", "epam", "sweeft", "redberry", "tegeta", "space", "psp", "co_fund")
- "matchPercent": an integer between 50 and 99 reflecting how related their CV and skills are to the role.
- "matchedSkills": array of targetSkills found in their skills, summary or projects.
- "missingSkills": array of targetSkills the applicant is missing or should focus on.
- "tip": 1 short, actionable recommendation in Georgian (max 15 words) on how they can improve their chances for this specific job (e.g. adding a specific project type, getting a certificate, etc.).

Output a JSON array with exactly 10 matching vacancies in this order.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                matchPercent: { type: Type.INTEGER },
                matchedSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                missingSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                tip: { type: Type.STRING }
              },
              required: ["id", "matchPercent", "matchedSkills", "missingSkills", "tip"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      const result = JSON.parse(responseText);
      return res.json({ success: true, matches: result });
    } catch (error: any) {
      console.error("Gemini Job Matcher Error:", error);
      res.status(500).json({ error: error.message || "Failed to calculate job matches" });
    }
  });

  // --- Serve Vite in Dev, fallback to static dist folder in Prod ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
