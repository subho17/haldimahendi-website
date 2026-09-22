import { NextRequest, NextResponse } from "next/server";

export interface BioProfileData {
  name?: string;
  gender?: string;
  age?: string | number;
  profession?: string;
  companyName?: string;
  education?: string;
  city?: string;
  country?: string;
  religion?: string;
  motherTongue?: string;
  maritalStatus?: string;
  familyValues?: string;
  familyType?: string;
  diet?: string;
}

export interface BioOption {
  id: string;
  tone: string;
  badge: string;
  bio: string;
  wordCount: number;
}

// Rich generative engine that crafts articulate, culturally respectful, natural-sounding matrimonial bios
function generateSmartBios(
  profile: BioProfileData,
  tone: string,
  keywords?: string,
  currentDraft?: string
): BioOption[] {
  const name = profile.name?.trim() || "";
  const firstName = name ? name.split(" ")[0] : "";
  const gender = profile.gender?.toLowerCase() || "";
  const isBride = gender.includes("bride") || gender.includes("woman") || gender.includes("female");
  const isGroom = gender.includes("groom") || gender.includes("man") || gender.includes("male");

  const profession = profile.profession?.trim() || "";
  const company = profile.companyName?.trim() || "";
  const education = profile.education?.trim() || "";
  const city = profile.city?.trim() || "";
  const religion = profile.religion?.trim() || "";
  const motherTongue = profile.motherTongue?.trim() || "";
  const familyValues = profile.familyValues?.trim() || "Moderate";
  const cleanKeywords = keywords?.trim() || "";

  // Helper: pick random item from array
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Contextual phrases
  const workPhrase = profession
    ? company
      ? `working as a ${profession} at ${company}`
      : `working as a ${profession}`
    : "pursuing a rewarding career";

  const eduPhrase = education ? `with a background in ${education}` : "";
  const cityPhrase = city ? `based in ${city}` : "";
  const rootsPhrase = religion && motherTongue
    ? `rooted in ${religion} (${motherTongue}) family traditions`
    : religion
    ? `rooted in ${religion} values`
    : motherTongue
    ? `from a ${motherTongue}-speaking family`
    : "grounded in strong family values";

  const customHighlightPhrase = cleanKeywords
    ? ` In my free time, I enjoy ${cleanKeywords}.`
    : "";

  const options: BioOption[] = [];

  // 1. Balanced & Genuine — randomized openings and phrasings
  const balancedOpenings = [
    firstName ? `Hi, I'm ${firstName} — ${workPhrase}${cityPhrase ? `, ${cityPhrase}` : ""}.` : `Hi! I'm a warm, grounded person ${workPhrase}${cityPhrase ? `, ${cityPhrase}` : ""}.`,
    firstName ? `I'm ${firstName}, ${cityPhrase ? `living in ${city} and` : ""} ${workPhrase}.` : `I believe in balance — between ambition and the simple joys of life.`,
    firstName ? `${firstName} here! ${workPhrase}${cityPhrase ? `, based in ${city}` : ""}.` : `A warm hello from someone who values genuine connections.`,
  ];
  const balancedMiddles = [
    eduPhrase ? `With a foundation in ${education}, I strive for excellence at work while cherishing time with loved ones.` : `I believe in striking a healthy balance between professional growth and meaningful family time.`,
    eduPhrase ? `My journey in ${education} has taught me the value of perseverance, and I bring that same energy to everything I do.` : `Every day I try to grow a little — in my career, in my relationships, and as a person.`,
    eduPhrase ? `Having studied ${education}, I've developed a passion for learning and continuous improvement.` : `I'm someone who finds joy in both hard work and quiet moments at home.`,
  ];
  const balancedValues = [
    `Raised with ${familyValues.toLowerCase()} values, I hold deep respect for our cultural traditions while embracing a progressive outlook.${customHighlightPhrase}`,
    `Growing up in a ${familyValues.toLowerCase()} household taught me the importance of empathy, respect, and togetherness.${customHighlightPhrase}`,
    `My roots in ${familyValues.toLowerCase()} family values have shaped who I am — someone who cherishes both tradition and growth.${customHighlightPhrase}`,
  ];
  const balancedPartners = [
    isBride
      ? `Seeking a thoughtful, genuine, and supportive partner to build a life filled with mutual respect, laughter, and companionship.`
      : isGroom
      ? `Looking for a caring, educated, and cheerful life partner who values family, companionship, and life's beautiful moments.`
      : `Seeking a kind, honest, and supportive life companion to share meaningful experiences with.`,
    isBride
      ? `Hoping to find someone understanding, kind, and sincere — a true partner in every sense of the word.`
      : isGroom
      ? `Looking for a warm, caring, and family-oriented partner who believes in growing together through life's journey.`
      : `Seeking someone who values genuine connection, mutual growth, and building something beautiful together.`,
  ];

  const balancedBio = [
    pick(balancedOpenings),
    pick(balancedMiddles),
    pick(balancedValues),
    pick(balancedPartners),
  ].join(" ").replace(/\s+/g, " ").trim();
  options.push({
    id: "option-balanced",
    tone: "Balanced & Genuine",
    badge: "Most Popular",
    bio: balancedBio,
    wordCount: balancedBio.split(/\s+/).length,
  });

  // 2. Modern & Career-Oriented — randomized
  const modernOpenings = [
    firstName ? `I'm ${firstName} — ambitious, driven, and passionate about making an impact.${cityPhrase ? ` Currently based in ${city}.` : ""}` : `An ambitious, goal-oriented individual ${workPhrase}${cityPhrase ? ` in ${city}` : ""}.`,
    firstName ? `${firstName} here — ${workPhrase}${cityPhrase ? `, based in ${city}` : ""}, always chasing the next big idea.` : `${workPhrase}${cityPhrase ? ` in ${city}` : ""}, driven by purpose and a desire to make a difference.`,
    firstName ? `I'm ${firstName}. ${cityPhrase ? `Living in ${city},` : ""} building a career I'm proud of while staying true to what matters.` : `Professionally driven, personally grounded — that's how I'd describe myself.`,
  ];
  const modernCareers = [
    eduPhrase ? `Education in ${education} gave me the foundation; curiosity keeps me going.` : `I thrive on challenges and believe that continuous learning is the key to growth.`,
    eduPhrase ? `My academic background in ${education} fuels my ambition to excel and innovate.` : `I'm someone who believes that growth comes from stepping outside your comfort zone.`,
    eduPhrase ? `With ${education} under my belt, I approach every challenge with confidence and creativity.` : `Excellence at work isn't just a goal — it's a habit I've cultivated over years.`,
  ];
  const modernValues = [
    `Beyond the professional grind, I cherish quiet weekends, deep conversations, and staying close to the people who matter.${customHighlightPhrase}`,
    `Work drives me, but meaningful relationships and personal growth define who I truly am.${customHighlightPhrase}`,
    `When I'm not working, you'll find me exploring new ideas, places, or simply enjoying good company.${customHighlightPhrase}`,
  ];
  const modernPartners = [
    `Seeking a partner who is intellectually curious, progressive-minded, and believes in an equal, empowering partnership.`,
    `Looking for someone who values independence, mutual respect, and building a partnership based on shared dreams.`,
    `Hoping to find a progressive, confident, and kind partner who believes in growing together as equals.`,
  ];

  const modernBio = [
    pick(modernOpenings),
    pick(modernCareers),
    pick(modernValues),
    pick(modernPartners),
  ].join(" ").replace(/\s+/g, " ").trim();
  options.push({
    id: "option-career",
    tone: "Modern & Career-Driven",
    badge: "Progressive Outlook",
    bio: modernBio,
    wordCount: modernBio.split(/\s+/).length,
  });

  // 3. Traditional & Family-Centric — randomized
  const traditionalOpenings = [
    firstName ? `Warm greetings! I'm ${firstName}${cityPhrase ? `, based in ${city}` : ""}.` : `Warm greetings from a humble, family-oriented soul.`,
    firstName ? `${firstName} here — ${rootsPhrase}${cityPhrase ? `, living in ${city}` : ""}.` : `A respectful greeting to all who value tradition and family bonds.`,
    firstName ? `I'm ${firstName}, ${cityPhrase ? `residing in ${city},` : ""} blessed with a loving family background.` : `With a heart rooted in tradition, I believe in the beauty of close-knit families.`,
  ];
  const traditionalFamilies = [
    `I come from a loving family that has always emphasized respect for elders, cultural traditions, and togetherness.${customHighlightPhrase}`,
    `Growing up in a family that values harmony and cultural heritage has made me who I am today.${customHighlightPhrase}`,
    `My family has always been my anchor — teaching me the importance of love, respect, and staying connected to our roots.${customHighlightPhrase}`,
  ];
  const traditionalWorks = [
    profession
      ? `Professionally, I am ${workPhrase}${eduPhrase ? `, having completed my ${education}` : ""}, approaching life with gratitude and purpose.`
      : `I believe in living a disciplined, cheerful, and purposeful life, guided by strong values.`,
    profession
      ? `I take pride in my work as ${profession}${eduPhrase ? `, building on my ${education}` : ""}, while keeping family at the center of everything.`
      : `With a grounded approach to life, I find fulfillment in simplicity, honesty, and hard work.`,
  ];
  const traditionalPartners = [
    isBride
      ? `Seeking a well-mannered, family-oriented, and understanding groom who cherishes both tradition and modern aspirations.`
      : isGroom
      ? `Looking for a warm, cultured, and family-loving bride who values togetherness, respect, and mutual understanding.`
      : `Seeking a companion who values family bonding, cultural integrity, and lifelong mutual care.`,
    isBride
      ? `Hoping to find a respectful, caring partner who believes in building a home filled with warmth and harmony.`
      : isGroom
      ? `Looking for a kind-hearted, family-loving partner who appreciates both tradition and the joys of modern life.`
      : `Seeking someone who values deep connections, mutual respect, and creating a loving home together.`,
  ];

  const traditionalBio = [
    pick(traditionalOpenings),
    pick(traditionalFamilies),
    pick(traditionalWorks),
    pick(traditionalPartners),
  ].join(" ").replace(/\s+/g, " ").trim();
  options.push({
    id: "option-traditional",
    tone: "Traditional & Family-Centric",
    badge: "Family & Heritage",
    bio: traditionalBio,
    wordCount: traditionalBio.split(/\s+/).length,
  });

  // 4. Short & Crisp — randomized
  const shortBios = [
    `${profession || "Professional"}${city ? ` based in ${city}` : ""}${education ? `, ${education}` : ""}. Simple living, high thinking, and strong family bonds define me.${cleanKeywords ? ` Passionate about ${cleanKeywords}.` : ""} Seeking an honest, understanding partner for a beautiful journey ahead.`,
    `${city ? `${city}-based` : "A dedicated"} ${profession || "professional"}${education ? ` with ${education}` : ""}. I believe in authenticity, growth, and meaningful connections.${cleanKeywords ? ` Love ${cleanKeywords}.` : ""} Looking for a genuine partner to share life's moments.`,
    `${profession || "Professional"}${city ? ` in ${city}` : ""}. Grounded, family-first, and always learning.${cleanKeywords ? ` Enjoying ${cleanKeywords}.` : ""} Seeking a kind, cheerful partner for a lifelong partnership.`,
  ];

  // 5. Warm & Lifestyle — randomized
  const lifestyleOpenings = [
    firstName ? `Hey there! I'm ${firstName} — ${workPhrase}${city ? ` in ${city}` : ""}.` : `Hey! I'm someone who loves life, people, and new experiences.`,
    firstName ? `${firstName} here! Life is an adventure, and I'm here to enjoy every bit of it.` : `A cheerful soul who believes every day is a chance to learn something new.`,
    firstName ? `I'm ${firstName}. ${city ? `Based in ${city},` : ""} ${workPhrase}, and loving every moment.` : `Passionate about life, curious about the world, and always ready for the next adventure.`,
  ];
  const lifestyleHobbies = [
    cleanKeywords
      ? `When I'm not working, you'll find me immersed in ${cleanKeywords}.`
      : `When I'm not working, I love exploring new places, trying new food, and spending quality time with family and friends.`,
    cleanKeywords
      ? `My world outside work revolves around ${cleanKeywords} — it keeps me grounded and inspired.`
      : `I recharge by connecting with nature, enjoying good music, and sharing laughter with loved ones.`,
    cleanKeywords
      ? `Free time means ${cleanKeywords} for me — it's where I find my joy and energy.`
      : `I believe in living fully — travel, food, music, and meaningful connections are my fuel.`,
  ];
  const lifestylePartners = [
    `Looking for someone with a positive vibe, a great sense of humor, and an adventurous spirit to explore life together!`,
    `Seeking a warm, fun-loving partner who believes in living life to the fullest and creating beautiful memories together.`,
    `Hoping to find a cheerful, open-minded companion who's ready for life's adventures — big and small.`,
  ];

  const lifestyleBio = [
    pick(lifestyleOpenings),
    pick(lifestyleHobbies),
    pick(lifestylePartners),
  ].join(" ").replace(/\s+/g, " ").trim();

  // If user explicitly requested short or lifestyle tone, swap or append accordingly
  if (tone === "concise" || tone === "short") {
    const shortBio = pick(shortBios);
    options.unshift({
      id: "option-short",
      tone: "Short & Crisp",
      badge: "Quick Read",
      bio: shortBio.trim(),
      wordCount: shortBio.trim().split(/\s+/).length,
    });
  } else if (tone === "lifestyle") {
    options.unshift({
      id: "option-lifestyle",
      tone: "Warm & Lifestyle",
      badge: "Vibrant & Cheerful",
      bio: lifestyleBio,
      wordCount: lifestyleBio.split(/\s+/).length,
    });
  }

  // If there's a genuine existing draft to polish (at least 3 words)
  const words = currentDraft ? currentDraft.trim().split(/\s+/) : [];
  if (currentDraft && words.length >= 3 && currentDraft.trim().length > 15) {
    const polishedText = polishText(currentDraft.trim());
    options.unshift({
      id: "option-polished",
      tone: "Polished Current Draft",
      badge: "Elevated Draft",
      bio: polishedText,
      wordCount: polishedText.split(/\s+/).length,
    });
  }

  return options.slice(0, 3);
}

function polishText(raw: string): string {
  let cleaned = raw
    .replace(/\s+/g, " ")
    .replace(/([.!?])\s*([a-z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`)
    .trim();

  // Ensure starts capitalized
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Ensure ends with punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profile = {},
      tone = "balanced",
      keywords = "",
      currentDraft = "",
      attempt = 1,
    } = body;

    // Try external LLM if available — supports OpenAI, NVIDIA, and Gemini
    const openaiKey = process.env.OPENAI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const llmProvider = openaiKey ? 'openai' : nvidiaKey ? 'nvidia' : geminiKey ? 'gemini' : null;

    // Style variation instructions per attempt — each regeneration gets a fresh creative direction
    const variationInstructions: Record<number, string> = {
      1: `Write each bio with a WARM, CONVERSATIONAL tone — like talking to a friend. Use natural flowing sentences. Focus on emotional connection.`,
      2: `Write each bio with a BOLD, CONFIDENT tone — highlight achievements, ambitions, and what makes this person stand out. Use strong, declarative sentences.`,
      3: `Write each bio with a STORYTELLING approach — paint a picture of daily life, small moments, and what matters most. Use vivid, descriptive language.`,
      4: `Write each bio with a MINIMALIST style — short punchy sentences, clean structure, powerful words. Less is more. Focus on impact.`,
      5: `Write each bio with a POETIC, LITERARY tone — elegant phrasing, beautiful metaphors, sophisticated vocabulary. Make it feel like a personal essay.`,
      6: `Write each bio with a HUMOROUS, WITTY approach — light-hearted, charming, personality-forward. Show character through subtle humor.`,
      7: `Write each bio with a SPIRITUAL, VALUE-DRIVEN tone — emphasize inner qualities, life philosophy, and what truly matters in a partnership.`,
      8: `Write each bio with an ADVENTUROUS, FREE-SPIRITED vibe — travel, exploration, trying new things, living life fully. Energetic and optimistic.`,
    };
    const styleHint = variationInstructions[attempt] || variationInstructions[((attempt - 1) % 8) + 1];

    const promptSystem = `You are an expert matrimonial profile consultant for HaldiMehendi. 
Your task is to write 3 DISTINCT, charming, culturally respectful, and authentic matrimonial bios in English for an Indian matrimonial platform.

CRITICAL RULES FOR VARIATION:
- Each regeneration MUST feel completely different from any previous version.
- Vary the opening hook: sometimes a greeting, sometimes a statement, sometimes a question, sometimes a scene-setting line.
- Vary sentence structure: mix short punchy sentences with longer flowing ones.
- Vary the emotional angle: warmth, ambition, humor, storytelling, elegance — depending on the style.
- NEVER repeat the same phrases, sentence patterns, or opening lines.
- Each bio should feel like it was written by a different person.

Style direction for this attempt: ${styleHint}

Output valid JSON only, exactly matching this schema:
{
  "options": [
    {
      "id": "opt1",
      "tone": "Balanced & Genuine",
      "badge": "Most Popular",
      "bio": "string",
      "wordCount": 50
    },
    {
      "id": "opt2",
      "tone": "Modern & Career-Driven",
      "badge": "Progressive Outlook",
      "bio": "string",
      "wordCount": 55
    },
    {
      "id": "opt3",
      "tone": "Traditional & Family-Centric",
      "badge": "Family & Heritage",
      "bio": "string",
      "wordCount": 60
    }
  ]
}
- Keep each bio between 40 to 85 words.
- Do NOT use cheesy or generic clichés.
- Highlight candidate's education, profession, city, and family values naturally.
- Tone requested by user: ${tone}.
${keywords ? `Include these personal interests/keywords: ${keywords}.` : ""}
${currentDraft ? `Current user draft to refine: "${currentDraft}".` : ""}`;

    const userPrompt = `Profile details:
Name: ${profile.name || "Not specified"}
Gender: ${profile.gender || "Not specified"}
Age: ${profile.age || "Not specified"}
Profession: ${profile.profession || "Not specified"}
Company: ${profile.companyName || "Not specified"}
Education: ${profile.education || "Not specified"}
City: ${profile.city || "Not specified"}
Religion: ${profile.religion || "Not specified"}
Mother Tongue: ${profile.motherTongue || "Not specified"}
Family Values: ${profile.familyValues || "Moderate"}
Diet: ${profile.diet || "Not specified"}`;

    if (llmProvider) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        let aiContent = "";

        if (llmProvider === 'gemini') {
          // Gemini API — different format from OpenAI/NVIDIA
          const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${promptSystem}\n\n${userPrompt}` }] }],
                generationConfig: { temperature: 0.7 + Math.min(attempt * 0.05, 0.3), maxOutputTokens: 650 },
              }),
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);
          if (geminiRes.ok) {
            const data = await geminiRes.json();
            aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          }
        } else {
          // OpenAI or NVIDIA — same chat completions format
          const isNvidia = llmProvider === 'nvidia';
          const baseUrl = isNvidia
            ? (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1")
            : "https://api.openai.com/v1";
          const model = isNvidia
            ? (process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b")
            : "gpt-4o-mini";
          const apiKey = isNvidia ? nvidiaKey : openaiKey;

          const aiRes = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: promptSystem },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.7 + Math.min(attempt * 0.05, 0.3),
              max_tokens: 650,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (aiRes.ok) {
            const data = await aiRes.json();
            aiContent = data.choices?.[0]?.message?.content?.trim() || "";
          }
        }

        if (aiContent) {
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed.options) && parsed.options.length > 0) {
              return NextResponse.json({
                success: true,
                options: parsed.options,
                source: "ai",
                provider: llmProvider,
              });
            }
          }
        }
      } catch {
        // Fallback gracefully to smart engine
      }
    }

    // Seamless Smart Generative Engine Fallback
    const fallbackOptions = generateSmartBios(profile, tone, keywords, currentDraft);

    return NextResponse.json({
      success: true,
      options: fallbackOptions,
      source: "engine",
    });
  } catch (error) {
    console.error("AI Bio generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate bio options. Please try again.",
      },
      { status: 500 }
    );
  }
}
