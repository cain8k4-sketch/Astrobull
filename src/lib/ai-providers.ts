import { ASTRO_BIBLE } from "./astro-bible";
import { generateHashtags } from "./hashtags";

export type ProviderId = "grok" | "openai" | "anthropic";

export type ContentKind = "video" | "image" | "writing";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  placeholder: string;
  note: string;
  keyUrl: string;
  endpoint: string;
  model: string;
  prefixHint: string;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  grok: {
    id: "grok",
    label: "Grok (xAI)",
    placeholder: "xai-…",
    note: "Get a key at console.x.ai",
    keyUrl: "https://console.x.ai/",
    endpoint: "https://api.x.ai/v1/chat/completions",
    model: "grok-4-1-fast",
    prefixHint: "xai-",
  },
  openai: {
    id: "openai",
    label: "ChatGPT (OpenAI)",
    placeholder: "sk-…",
    note: "Get a key at platform.openai.com",
    keyUrl: "https://platform.openai.com/api-keys",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    prefixHint: "sk-",
  },
  anthropic: {
    id: "anthropic",
    label: "Claude (Anthropic)",
    placeholder: "sk-ant-…",
    note: "Get a key at console.anthropic.com",
    keyUrl: "https://console.anthropic.com/",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    prefixHint: "sk-ant-",
  },
};

export const LENGTHS: Record<ContentKind, string[]> = {
  video: ["15s", "30–60s", "2–3 min"],
  image: ["1:1 square", "16:9 poster", "9:16 story"],
  writing: ["short post", "X thread", "long-form"],
};

export function buildUserPrompt(
  kind: ContentKind,
  topic: string,
  tone: string,
  style: string,
  length: string,
  notes: string,
): string {
  const extra =
    kind === "video"
      ? "Write a ready-to-shoot short video script with HOOK, SCENE beats, on-screen text, CTA, caption. Do NOT invent random hashtags — end with: HASHTAGS: auto"
      : kind === "image"
        ? "Write image brief: title, caption, MASTER PROMPT (locked Astro Bull), NEGATIVE list. Do NOT invent random hashtags — end with: HASHTAGS: auto"
        : "Write Astro Bull writing: title, body, caption. Do NOT invent random hashtags — end with: HASHTAGS: auto";

  return [
    `Content type: ${kind}`,
    `Topic: ${topic}`,
    `Tone: ${tone}`,
    `Style: ${style}`,
    `Length: ${length}`,
    notes ? `Notes: ${notes}` : "",
    "",
    extra,
    "",
    "Hashtags will be generated automatically by the Astro Bull system after you write.",
  ]
    .filter(Boolean)
    .join("\n");
}

export interface ParsedOutput {
  title: string;
  body: string;
  caption: string;
  hashtags: string[];
}

export function parseOutput(
  kind: ContentKind | "upload",
  topic: string,
  raw: string,
  platforms?: string[],
): ParsedOutput {
  let title = `Astro Bull — ${topic.slice(0, 48)}`;
  for (const line of raw.split("\n")) {
    const tl = line.replace(/^\*\*|^#+\s*/, "").trim();
    if (/^title[:\s]/i.test(tl)) {
      const nt = tl.replace(/^title[:\s]*/i, "").trim();
      if (nt) title = nt;
    }
  }

  let caption = "";
  const ci = raw.search(/caption[:\s]/i);
  if (ci >= 0) {
    caption = raw
      .slice(ci)
      .split("\n")
      .slice(0, 3)
      .join(" ")
      .replace(/^caption[:\s]*/i, "")
      .trim();
  }
  if (!caption) {
    for (const line of raw.split("\n")) {
      if (line.trim().length > 20) {
        caption = line.trim();
        break;
      }
    }
  }

  // Strip trailing "HASHTAGS: auto" junk from body display if present
  const body = raw
    .replace(/\n*HASHTAGS:\s*auto\s*$/i, "")
    .replace(/\n*#AstroBull(\s+#\w+){0,12}\s*$/i, "")
    .trim();

  const hashtags = generateHashtags({
    topic,
    caption,
    body,
    kind,
    platforms,
    max: 12,
  });

  return {
    title,
    body,
    caption: (caption || title).slice(0, 280),
    hashtags,
  };
}

export function demoGenerate(kind: ContentKind, topic: string): string {
  if (kind === "image") {
    return `Title: Astro Bull — ${topic.slice(0, 40)}

MASTER PROMPT:
Cinematic Astro Bull, ash-grey scarred hide, long curved horns, glowing amber eyes, industrial chains, neon "99¢ beef patty" sign, slaughterhouse, film grain, blood-red and neon amber light. Topic: ${topic}

NEGATIVE: cute, kawaii, human face, different animal, soft pastel

Caption: Diamond hands. Open eyes. We are all Astro.
HASHTAGS: auto`;
  }
  if (kind === "video") {
    return `Title: Breaking the Chains — 30s

HOOK: Neon 99¢ sign. Eyes open.
SCENE 1: Astro in the cell — horns, amber eyes, chains. Topic: ${topic}
SCENE 2: Chains strain. Sign flickers. Feather glows.
SCENE 3: Motto on screen: We are all Astro.
CTA: Create free. Get featured. Get paid.
Caption: Diamond hands. Open eyes.
HASHTAGS: auto`;
  }
  return `Title: Diamond Hands in the Slaughterhouse

Astro Bull under the 99¢ neon — ash-grey, scarred, amber eyes open. Topic: ${topic}

Creators don't need to hold to build. Create free. Get featured. Get paid. Holding is optional.

Caption: Create free. Get featured. Get paid. We are all Astro.
HASHTAGS: auto`;
}

export async function callProvider(
  id: ProviderId,
  key: string,
  userPrompt: string,
): Promise<string> {
  const p = PROVIDERS[id];

  if (id === "anthropic") {
    const res = await fetch(p.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: p.model,
        max_tokens: 1200,
        system: ASTRO_BIBLE,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid Claude key.");
      throw new Error(`Claude error (${res.status})`);
    }
    const data = (await res.json()) as {
      content?: Array<{ text?: string }>;
    };
    return String(data.content?.[0]?.text || "").trim();
  }

  const res = await fetch(p.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: p.model,
      temperature: 0.7,
      messages: [
        { role: "system", content: ASTRO_BIBLE },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error(`Invalid API key for ${p.label}.`);
    if (res.status === 429) throw new Error("Rate limited — try again shortly.");
    throw new Error(`${p.label} error (${res.status})`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return String(data.choices?.[0]?.message?.content || "").trim();
}
