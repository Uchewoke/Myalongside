// Provider-agnostic raster image generation for the AI Graphic Designer agent.
// The Anthropic API does NOT generate raster images, so ad visuals are produced
// by a dedicated image provider. Configure via IMAGE_PROVIDER env var.
//
//   IMAGE_PROVIDER=openai   -> uses OpenAI gpt-image-1 (needs OPENAI_API_KEY)
//   IMAGE_PROVIDER=google   -> uses Google Imagen via Gemini API (needs GOOGLE_API_KEY)
//
// Both return a base64 PNG data URL so the frontend can render + download it directly.

export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

export interface GeneratedImage {
  dataUrl: string; // data:image/png;base64,....
  provider: string;
  prompt: string;
}

interface OpenAIImageGenerationResponse {
  data?: Array<{
    b64_json?: string;
  }>;
}

interface GoogleImagenResponse {
  predictions?: Array<{
    bytesBase64Encoded?: string;
  }>;
}

const PROVIDER = process.env.IMAGE_PROVIDER ?? "openai";

export async function generateImage(prompt: string, size: ImageSize = "1024x1024"): Promise<GeneratedImage> {
  switch (PROVIDER) {
    case "google":
      return generateWithGoogle(prompt, size);
    case "openai":
    default:
      return generateWithOpenAI(prompt, size);
  }
}

// --- OpenAI gpt-image-1 ---------------------------------------------------
async function generateWithOpenAI(prompt: string, size: ImageSize): Promise<GeneratedImage> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY for IMAGE_PROVIDER=openai.");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size,
      n: 1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI image error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as OpenAIImageGenerationResponse;
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data.");
  return { dataUrl: `data:image/png;base64,${b64}`, provider: "openai", prompt };
}

// --- Google Imagen (via Gemini API) --------------------------------------
async function generateWithGoogle(prompt: string, size: ImageSize): Promise<GeneratedImage> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_API_KEY for IMAGE_PROVIDER=google.");

  const aspect = size === "1024x1536" ? "3:4" : size === "1536x1024" ? "4:3" : "1:1";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: aspect },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Imagen error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as GoogleImagenResponse;
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Google Imagen returned no image data.");
  return { dataUrl: `data:image/png;base64,${b64}`, provider: "google", prompt };
}
