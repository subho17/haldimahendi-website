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

  // 1. Balanced & Genuine (Warm, well-rounded, popular choice)
  const balancedIntro = firstName
    ? `Hello! I'm ${firstName}, ${workPhrase}${cityPhrase ? `, ${cityPhrase}` : ""}.`
    : `Hello! I am a warm, easy-going person ${workPhrase}${cityPhrase ? `, currently ${cityPhrase}` : ""}.`;

  const balancedMiddle = eduPhrase
    ? ` Having completed my ${education}, I value both professional aspirations and a peaceful personal life.`
    : ` I believe in striking a healthy balance between ambitious professional aspirations and meaningful family time.`;

  const balancedValues = ` Raised with ${familyValues.toLowerCase()} values, I have deep respect for our cultural roots while holding a progressive outlook towards life.${customHighlightPhrase}`;

  const balancedPartner = isBride
    ? ` Looking for an understanding, genuine, and supportive partner with whom I can build a joyful life filled with mutual respect, laughter, and friendship.`
    : isGroom
    ? ` Looking for an educated, caring, and cheerful life partner who values family, mutual companionship, and sharing life's beautiful moments together.`
    : ` Looking for a kind, honest, and supportive life companion to share a meaningful and happy journey with.`;

  const balancedBio = `${balancedIntro}${balancedMiddle}${balancedValues}${balancedPartner}`.trim();
  options.push({
    id: "option-balanced",
    tone: "Balanced & Genuine",
    badge: "Most Popular",
    bio: balancedBio,
    wordCount: balancedBio.split(/\s+/).length,
  });

  // 2. Modern & Career-Oriented (Ambitious, progressive, equal partnership)
  const modernIntro = firstName
    ? `I'm ${firstName} — an ambitious and forward-thinking individual ${workPhrase}${cityPhrase ? ` in ${city}` : ""}.`
    : `An ambitious, goal-oriented professional ${workPhrase}${cityPhrase ? ` in ${city}` : ""}.`;

  const modernCareer = eduPhrase
    ? ` Education (${education}) and constant personal growth are very important to me.`
    : ` Continuous learning and excellence in my career are deeply motivating for me.`;

  const modernValues = ` While I am driven at work, I equally value quiet weekends, meaningful conversations, and staying grounded with loved ones.${customHighlightPhrase}`;

  const modernPartner = ` Seeking a partner who is intellectually curious, progressive-minded, and believes in an equal, empowering partnership built on mutual respect and shared dreams.`;

  const modernBio = `${modernIntro}${modernCareer}${modernValues}${modernPartner}`.trim();
  options.push({
    id: "option-career",
    tone: "Modern & Career-Driven",
    badge: "Progressive Outlook",
    bio: modernBio,
    wordCount: modernBio.split(/\s+/).length,
  });

  // 3. Traditional & Family-Centric (Respectful, close-knit, warm traditions)
  const traditionalIntro = firstName
    ? `Warm greetings! I am ${firstName}, ${cityPhrase ? `residing in ${city}` : ""}.`
    : `Warm greetings!`;

  const traditionalFamily = ` I come from a close-knit, loving family ${rootsPhrase}. I have been brought up with deep respect for elders, cultural values, and harmonious family traditions.`;

  const traditionalWork = profession
    ? ` Professionally, I am ${workPhrase}${eduPhrase ? ` after completing my ${education}` : ""}, keeping a grounded approach to life.`
    : ` I believe in living a disciplined, cheerful, and purposeful life.`;

  const traditionalPartner = isBride
    ? ` Looking for a well-mannered, family-oriented, and understanding groom who cherishes family unity and traditional warmth alongside modern aspirations.${customHighlightPhrase}`
    : isGroom
    ? ` Looking for an affectionate, cultured, and family-loving bride who appreciates togetherness, mutual understanding, and warmth in a marriage.${customHighlightPhrase}`
    : ` Looking for a companion who values family bonding, cultural integrity, and lifelong mutual care.${customHighlightPhrase}`;

  const traditionalBio = `${traditionalIntro}${traditionalFamily}${traditionalWork}${traditionalPartner}`.trim();
  options.push({
    id: "option-traditional",
    tone: "Traditional & Family-Centric",
    badge: "Family & Heritage",
    bio: traditionalBio,
    wordCount: traditionalBio.split(/\s+/).length,
  });

  // 4. Short & Crisp (Concise, high-impact)
  const shortIntro = `${profession || "Professional"}${city ? ` based in ${city}` : ""}${education ? `, ${education}` : ""}.`;
  const shortValues = ` Believer in simple living, high thinking, and strong family bonds.${cleanKeywords ? ` Passionate about ${cleanKeywords}.` : ""}`;
  const shortPartner = ` Seeking an honest, understanding, and cheerful partner to embark on a beautiful lifelong journey together.`;
  const shortBio = `${shortIntro}${shortValues}${shortPartner}`.trim();

  // If user explicitly requested short or lifestyle tone, swap or append accordingly
  if (tone === "concise" || tone === "short") {
    options.unshift({
      id: "option-short",
      tone: "Short & Crisp",
      badge: "Quick Read",
      bio: shortBio,
      wordCount: shortBio.split(/\s+/).length,
    });
  } else if (tone === "lifestyle") {
    const lifestyleIntro = firstName
      ? `Hey there! I'm ${firstName}, ${workPhrase}${city ? ` in ${city}` : ""}.`
      : `Hey there! I am an energetic, cheerful person ${workPhrase}.`;
    const lifestyleHobby = cleanKeywords
      ? ` Outside of work, my world revolves around ${cleanKeywords}.`
      : ` Outside of work, I love exploring new places, good food, music, and spending quality time with family and friends.`;
    const lifestylePartner = ` Looking for someone with a positive vibe, good sense of humor, and an adventurous spirit to explore life together hand-in-hand!`;
    const lifestyleBio = `${lifestyleIntro}${lifestyleHobby}${lifestylePartner}`.trim();

    options.unshift({
      id: "option-lifestyle",
      tone: "Warm & Lifestyle",
      badge: "Vibrant & Cheerful",
      bio: lifestyleBio,
      wordCount: lifestyleBio.split(/\s+/).length,
    });
  }

  // If there's an existing draft to polish
  if (currentDraft && currentDraft.trim().length > 10) {
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
    } = body;

    // First try external LLM if available with short timeout
    const apiKey = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY;
    const isNvidia = !process.env.OPENAI_API_KEY && !!process.env.NVIDIA_API_KEY;
    const baseUrl = isNvidia
      ? (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1")
      : "https://api.openai.com/v1";
    const model = isNvidia
      ? (process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b")
      : "gpt-4o-mini";

    if (apiKey) {
      try {
        const promptSystem = `You are an expert matrimonial profile consultant for HaldiMehendi. 
Your task is to write 3 distinct, charming, culturally respectful, and authentic matrimonial bios in English for an Indian matrimonial platform.
Rules:
- Output valid JSON only, exactly matching this schema:
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

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
            temperature: 0.7,
            max_tokens: 650,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (aiRes.ok) {
          const data = await aiRes.json();
          const content = data.choices?.[0]?.message?.content?.trim() || "";
          // Extract JSON if wrapped in code blocks
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed.options) && parsed.options.length > 0) {
              return NextResponse.json({
                success: true,
                options: parsed.options,
                source: "ai",
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
