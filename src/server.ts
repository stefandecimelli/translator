import { serveDir } from "jsr:@std/http@^1.0.0/file-server";
import { translate } from "npm:@vitalets/google-translate-api@^9.2.0";

const PORT = 3000;

interface TranslationRequest {
  text: string;
  targetLanguages: string[];
}

interface TranslationResult {
  language: string;
  text: string;
  languageName: string;
}

// Language code to name mapping
const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  ar: "Arabic",
  hi: "Hindi",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  sv: "Swedish",
  da: "Danish",
  fi: "Finnish",
  no: "Norwegian",
  cs: "Czech",
  el: "Greek",
  he: "Hebrew",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  uk: "Ukrainian",
  ro: "Romanian",
  hu: "Hungarian",
  bg: "Bulgarian",
  hr: "Croatian",
  sk: "Slovak",
  sl: "Slovenian",
  lt: "Lithuanian",
  lv: "Latvian",
  et: "Estonian",
};

async function handleTranslate(req: Request): Promise<Response> {
  try {
    const body: TranslationRequest = await req.json();
    const { text, targetLanguages } = body;

    if (!text || !targetLanguages || targetLanguages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing text or target languages" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (targetLanguages.length > 4) {
      return new Response(
        JSON.stringify({ error: "Maximum 4 target languages allowed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Translate to each target language
    const translations: TranslationResult[] = await Promise.all(
      targetLanguages.map(async (lang) => {
        try {
          const result = await translate(text, { to: lang });
          return {
            language: lang,
            text: result.text,
            languageName: languageNames[lang] || lang,
          };
        } catch (error) {
          console.error(`Translation error for ${lang}:`, error);
          return {
            language: lang,
            text: `Error translating to ${languageNames[lang] || lang}`,
            languageName: languageNames[lang] || lang,
          };
        }
      })
    );

    return new Response(JSON.stringify({ translations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: "Translation failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // API endpoint for translation
  if (url.pathname === "/api/translate" && req.method === "POST") {
    const response = await handleTranslate(req);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  // Serve static files from public directory
  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const file = await Deno.readFile("./src/public/index.html");
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  if (url.pathname === "/styles.css") {
    try {
      const file = await Deno.readFile("./src/public/styles.css");
      return new Response(file, {
        headers: { "Content-Type": "text/css" },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  if (url.pathname === "/app.js") {
    try {
      const file = await Deno.readFile("./src/public/app.js");
      return new Response(file, {
        headers: { "Content-Type": "application/javascript" },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  return new Response("Not found", { status: 404 });
}

console.log(`🚀 Translation app running at http://localhost:${PORT}`);
Deno.serve({ port: PORT }, handler);

// Made with Bob
