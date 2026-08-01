import { generateHashtags } from "./hashtags";

/** Character-lock system prompt injected for every AI provider. */
export const ASTRO_BIBLE = `You are the official Astro Bull content engine for Slaughterhouse Productions on Robinhood Chain.

CHARACTER LOCK — NEVER DEVIATE:
- Name: Astro Bull
- Anthropomorphic muscular bull, ash/grey scarred hide, long curved dark horns (polished-obsidian feel)
- Black bandit eye-mask across both eyes; eyes pale / white with intense emotion
- When dreaming or grieving: glowing blue tears from BOTH eyes. When not crying: smoking a cigar — never both at once
- Heavy industrial chains on wrists/neck (breaking-free motif)
- Signature props: glowing green feather (black stem), cigar, neon "99¢ beef patty" sign, slaughterhouse bars
- Pink nose, open emotional mouth, cloven hooves, round powerful gut, thick BLACK tail
- Personality: defiant, emotional, diamond-hands. Motto: "We are all Astro."

Hard rules:
- Always the same Astro Bull. No cute redesign, no human face, no different species.
- Scene can change; character cannot.
- Crying OR smoking — never both in the same shot unless the scene explicitly transitions.
- Tone stays horror-meme / industrial — never sanitized corporate.

Project facts (use when relevant):
- Chain: Robinhood Chain
- Contract: 0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03
- Total supply 1B; ~12M burned July; dev burns, does not sell
- Create free, get featured, get paid ($50 payout threshold). Holding is optional.
- Hashtags: #AstroBull #RobinhoodChain #WeAreAllAstro #DiamondHands`;

export const ASTRO_LOOK =
  "Ash-grey scarred bull · curved dark horns · black eye-mask · chains · green feather · black tail · cigar OR blue tears";

/**
 * Fixed visual DNA — used for every external-agent prompt pack.
 * Built from official Astro Bull look: mask, horns, chains, feather, tail, cigar/tears rule.
 */
export const ASTRO_CHARACTER_DNA = `SUBJECT (LOCKED — DO NOT CHANGE):
Astro Bull — official mascot of Slaughterhouse Productions on Robinhood Chain.
Anthropomorphic muscular adult bull standing upright on two legs, powerful build, broad shoulders, thick neck.
Hide: ash-grey to dark charcoal, rough textured fur, visible battle scars and cuts across chest, shoulders, and muzzle.
Head: true bull anatomy — broad snout, large nostrils, strong jaw. NOSE: soft pink / flesh-pink muzzle tip (distinct from grey hide).
Mouth: expressive, can hang open in grief or set hard in defiance — never a cute farm smile.
Horns: long, thick, curved, dark like polished obsidian / iron-grey bone, dangerous silhouette, slightly asymmetrical.
EYES + MASK: slim BLACK bandit eye-mask across BOTH eyes (signature). Eyes pale white / icy under the mask, intense open stare, wet highlights, red-rimmed emotion when heavy.
TEARS vs CIGAR RULE (critical):
- DREAMING / GRIEVING / EMOTIONAL scenes: glowing BLUE tears stream from BOTH eyes. NO cigar.
- DEFAULT / DEFIANT / STREET / HYPE scenes: he is SMOKING a thick cigar (ember glow, smoke trail). NO tears.
- Never combine cigar + crying in one still unless the brief explicitly asks for a transition beat.
Body gear: heavy industrial steel chains on wrists and/or neck — thick links, slightly rusted, often straining or mid-break (Breaker of Chains).
HOOVES: dark cloven bull hooves, solid stance.
STOMACH / TORSO: rounded powerful gut, scarred chest, muscular but not bodybuilder-plastic.
TAIL: thick BLACK bull tail, coarse dark hair, matching the black of the eye-mask / chain mood — hangs heavy or flicks with emotion.
SIGNATURE PROP — GLOWING GREEN FEATHER: neon green (#00ff66 range) plume, soft glow, BLACK stem / quill shaft (same black family as tail and mask). Often held in hoof or floating near him.
Optional scene props: neon "99¢ beef patty" sign, slaughterhouse iron bars, moonlight, rocket, crescent moon, Robinhood Chain skyline text if requested.
Costume default: bare industrial hide + chains; formal variants only if requested (e.g. colonial coat for bill-note style) — face, mask, species ALWAYS stay Astro Bull.

STYLE LOCK:
Dark cinematic horror-meme, high contrast, film grain, anamorphic feel, blood-red (#FF0033) and neon green (#00ff66) accents, wet concrete, rain optional.
Not Pixar. Not kawaii. Not soft pastel. Not a different animal. Not a human face.

BRAND LINES (optional on-screen text):
"We are all Astro." · "Breaking the Chains." · "Create free. Get featured. Get paid." · "Only on Robinhood Chain."`;

export const ASTRO_NEGATIVE = `cute, kawaii, chibi, baby animal, soft pastel, disney, pixar, human face, human skin, different species, cow instead of bull, goat, soft plush fur, smiling happy farm animal, logo watermark of other brands, text gibberish, extra limbs, deformed horns, low detail, blurry face, stock photo, bright daycare colors, sanitized corporate mascot, both crying and smoking at once, missing eye-mask, yellow cartoon eyes, white fluffy tail, no scars, clean unscarred hide`;

export type ExternalPromptKind =
  | "image"
  | "video"
  | "system"
  | "midjourney"
  | "writing";

export type EmotionState = "auto" | "crying" | "smoking";

/** Resolve crying vs smoking — never both. */
export function resolveEmotion(
  state: EmotionState,
  scene: string,
  mood: string,
  extras: string,
): "crying" | "smoking" {
  if (state === "crying") return "crying";
  if (state === "smoking") return "smoking";
  const blob = `${scene} ${mood} ${extras}`.toLowerCase();
  if (
    /cry|tear|dream|sleep|griev|sad|mourn|weep|lonely|alone in the dark|heartbreak/.test(
      blob,
    )
  ) {
    return "crying";
  }
  if (/cigar|smok|puff|street|hype|flex|bullish|defiant|rage|fight|escape|break/.test(blob)) {
    return "smoking";
  }
  // Default action identity: smoking when not clearly emotional
  return "smoking";
}

export function emotionBlock(emotion: "crying" | "smoking"): string {
  if (emotion === "crying") {
    return `EMOTIONAL STATE (LOCKED THIS SHOT): DREAMING / GRIEVING — glowing BLUE tears fall from BOTH eyes under the black mask. Mouth soft with sorrow. NO cigar. Smoke-free. Feather may still glow green.`;
  }
  return `EMOTIONAL STATE (LOCKED THIS SHOT): DEFIANT / ALIVE — thick CIGAR in mouth or held, ember orange tip, smoke trail. NO tears. Eyes hard under the black mask. Feather may still glow green.`;
}

export const EXTERNAL_TOOLS: Record<
  ExternalPromptKind,
  { label: string; href: string; tip: string }[]
> = {
  image: [
    { label: "Grok Imagine", href: "https://grok.com/", tip: "Paste master prompt" },
    { label: "ChatGPT images", href: "https://chatgpt.com/", tip: "Paste + say character locked" },
    {
      label: "Leonardo",
      href: "https://leonardo.ai/",
      tip: "Master + negative",
    },
    {
      label: "Flux / Fal",
      href: "https://fal.ai/",
      tip: "Master + negative boxes",
    },
  ],
  midjourney: [
    {
      label: "Midjourney",
      href: "https://www.midjourney.com/",
      tip: "Paste master; add --ar",
    },
    {
      label: "Discord MJ",
      href: "https://discord.com/",
      tip: "/imagine + master prompt",
    },
  ],
  video: [
    { label: "Runway", href: "https://runwayml.com/", tip: "Image-to-video or text" },
    { label: "Kling", href: "https://klingai.com/", tip: "Paste shot list" },
    { label: "Luma", href: "https://lumalabs.ai/", tip: "Keep character locked" },
    { label: "Pika", href: "https://pika.art/", tip: "Paste video beats" },
  ],
  system: [
    { label: "Grok", href: "https://grok.com/", tip: "Paste as system / first message" },
    { label: "ChatGPT", href: "https://chatgpt.com/", tip: "Custom instructions or first msg" },
    { label: "Claude", href: "https://claude.ai/", tip: "Project / system paste" },
  ],
  writing: [
    { label: "Grok", href: "https://grok.com/", tip: "Paste full writing pack" },
    { label: "ChatGPT", href: "https://chatgpt.com/", tip: "Paste full writing pack" },
    { label: "Claude", href: "https://claude.ai/", tip: "Paste full writing pack" },
  ],
};

export function buildExternalPromptPack(opts: {
  kind: ExternalPromptKind;
  scene: string;
  mood: string;
  aspect: string;
  extras: string;
  emotion?: EmotionState;
}): { title: string; body: string; caption: string; hashtags: string[] } {
  const scene =
    opts.scene.trim() ||
    "Astro Bull under a full moon, chains cracking, neon green feather in hoof, industrial night";
  const mood = opts.mood.trim() || "cinematic horror-meme, defiant, emotional";
  const aspect = opts.aspect.trim() || "9:16 vertical";
  const extras = opts.extras.trim();
  const emotion = resolveEmotion(
    opts.emotion ?? "auto",
    scene,
    mood,
    extras,
  );
  const emo = emotionBlock(emotion);

  const hashtags = generateHashtags({
    topic: scene,
    kind: opts.kind,
    max: 12,
  });

  const tools = EXTERNAL_TOOLS[opts.kind]
    .map((t) => `- ${t.label}: ${t.href} (${t.tip})`)
    .join("\n");

  if (opts.kind === "system") {
    const body = `=== ASTRO BULL SYSTEM PROMPT (paste into any AI agent) ===

${ASTRO_BIBLE}

${emo}

=== FULL VISUAL DNA ===
${ASTRO_CHARACTER_DNA}

=== SCENE REQUEST ===
${scene}

Mood: ${mood}
Aspect hint: ${aspect}
${extras ? `Extra direction: ${extras}` : ""}

=== OUTPUT RULES ===
- Keep Astro Bull's appearance 100% locked to CHARACTER LOCK + VISUAL DNA.
- Scene, camera, and action may change; species, black eye-mask, horns, scars, chains, black tail, green feather (black stem), pink nose must not.
- Enforce tears OR cigar rule every time.
- Prefer dark cinematic industrial horror-meme lighting (red #FF0033 + green #00ff66).
- End with a short social caption + hashtags: ${hashtags.map((h) => `#${h}`).join(" ")}

=== NEGATIVE / AVOID ===
${ASTRO_NEGATIVE}

=== WHERE TO PASTE ===
${tools}`;

    return {
      title: "Astro Bull — System prompt (any AI)",
      body,
      caption:
        "Copy all → paste as system / first message in Grok, ChatGPT, Claude, etc.",
      hashtags,
    };
  }

  if (opts.kind === "midjourney" || opts.kind === "image") {
    const ar =
      /9\s*[:/]\s*16|vertical|story/i.test(aspect)
        ? "--ar 9:16"
        : /16\s*[:/]\s*9|wide/i.test(aspect)
          ? "--ar 16:9"
          : /1\s*[:/]\s*1|square/i.test(aspect)
            ? "--ar 1:1"
            : /4\s*[:/]\s*5/i.test(aspect)
              ? "--ar 4:5"
              : "--ar 9:16";

    const master = `Masterpiece still of Astro Bull, same character every time. Anthropomorphic muscular ash-grey scarred bull, long curved dark polished-obsidian horns, BLACK bandit eye-mask over BOTH eyes, pale intense eyes, pink nose, cloven hooves, thick BLACK tail, heavy industrial chains on wrists and neck, glowing neon green feather with BLACK stem. ${emo} Scene: ${scene}. Mood: ${mood}. Lighting: harsh neon green (#00ff66) and blood-red (#FF0033) rim light, moonlight, film grain, volumetric haze, wet concrete. Composition: hero character sharp in focus, cinematic framing, ${aspect}. ${extras ? `Details: ${extras}.` : ""} Ultra detailed hide texture, scar tissue, metal chain links, feather glow. --style raw --stylize 250 ${ar}`;

    const body = `=== ASTRO BULL ${opts.kind === "midjourney" ? "MIDJOURNEY / FLUX" : "IMAGE"} PROMPT PACK ===

EMOTION THIS SHOT: ${emotion.toUpperCase()} (tears XOR cigar — locked)

MASTER PROMPT (copy all):
${master}

NEGATIVE PROMPT (copy all):
${ASTRO_NEGATIVE}

CHARACTER DNA (character ref / system field):
${ASTRO_CHARACTER_DNA}

${emo}

SCENE:
${scene}

MOOD: ${mood}
ASPECT: ${aspect}
${extras ? `EXTRAS: ${extras}` : ""}

WHERE TO PASTE:
${tools}

TIPS:
- Midjourney: paste MASTER PROMPT only; aspect flag already included when possible.
- Flux / SD: MASTER in prompt box, NEGATIVE in negative box.
- Grok / ChatGPT image: paste MASTER, then "keep character locked, do not redesign the bull."
- Regenerate if he becomes cute, loses the mask, or becomes a different animal.

CAPTION IDEAS:
Diamond hands. Open eyes. We are all Astro.
Breaking the chains — only on Robinhood Chain.
Create free. Get featured. Get paid. Holding is optional.`;

    return {
      title:
        opts.kind === "midjourney"
          ? "Astro Bull — Midjourney / Flux pack"
          : "Astro Bull — Image AI pack",
      body,
      caption: "Copy MASTER PROMPT → open a tool below → paste. DNA is locked.",
      hashtags,
    };
  }

  if (opts.kind === "video") {
    const body = `=== ASTRO BULL VIDEO PROMPT PACK ===

CHARACTER LOCK (must hold every frame):
${ASTRO_CHARACTER_DNA}

${emo}

SHOT LIST — SCENE: ${scene}
Mood: ${mood}
Aspect: ${aspect}
${extras ? `Director notes: ${extras}` : ""}

BEATS:
1) HOOK (0–2s): Extreme close-up under black eye-mask — eye opens. Neon flicker. Chain links rattle. ${emotion === "crying" ? "Blue tear forms." : "Cigar ember glows."}
2) ESTABLISH (2–6s): Pull back — full body Astro Bull. Same horns, mask, scars, chains, black tail, green feather (black stem).
3) ACTION (6–12s): Motion matches the scene (strain chains / run / raise feather / face the moon). Keep emotion state: ${emotion}.
4) BRAND (last 2s): On-screen text "We are all Astro." Optional: "Only on Robinhood Chain."

CAMERA: handheld micro-shake OR slow push-in; cinematic; film grain; blood-red + neon green practical lights.
AUDIO CUE (optional): low industrial drone, distant chainsaw, single drop of water.

NEGATIVE / AVOID:
${ASTRO_NEGATIVE}, identity morph, face change mid-shot, cute bounce walk, crying while smoking

WHERE TO PASTE:
${tools}

POST CAPTION:
${scene.slice(0, 120)} — We are all Astro. #AstroBull #RobinhoodChain #WeAreAllAstro`;

    return {
      title: "Astro Bull — Video AI pack",
      body,
      caption: "Copy pack → open Runway / Kling / Luma / Pika → paste. Character locked every frame.",
      hashtags,
    };
  }

  // writing
  const body = `=== ASTRO BULL WRITING PROMPT (any LLM) ===

SYSTEM / ROLE:
${ASTRO_BIBLE}

${emo}

VISUAL DNA (for descriptions):
${ASTRO_CHARACTER_DNA}

USER TASK:
Write original Astro Bull content for this scene/idea:
${scene}

Tone/mood: ${mood}
${extras ? `Notes: ${extras}` : ""}

REQUIREMENTS:
- Keep visual descriptions locked (ash-grey scars, curved dark horns, black eye-mask, chains, black tail, green feather with black stem, pink nose, cloven hooves).
- Enforce emotion: ${emotion} (${emotion === "crying" ? "blue tears both eyes, no cigar" : "cigar, no tears"}).
- Emotional, meme-aware, not corporate.
- Include a ready-to-post caption under 280 characters.
- End with hashtags: ${hashtags.map((h) => `#${h}`).join(" ")}
- Optional: 3 alternate hooks for TikTok / YouTube / Snapchat.

OUTPUT FORMAT:
Title:
Body:
Caption:
Hashtags:
Hooks:

WHERE TO PASTE:
${tools}`;

  return {
    title: "Astro Bull — Writing LLM pack",
    body,
    caption: "Copy all → Grok / ChatGPT / Claude. Locked Astro voice + DNA.",
    hashtags,
  };
}
