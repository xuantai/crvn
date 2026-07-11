import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";

// 1. Extract unique Vietnamese strings from App.tsx's admin section (lines 6452 to the end)
const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const adminStartMarker = "function AdminDashboard()";
const startIndex = content.indexOf(adminStartMarker);
if (startIndex === -1) {
    console.error("Could not find start of admin dashboard!");
    process.exit(1);
}

const adminContent = content.slice(startIndex);

const uniqueStrings = new Set<string>();

// Simple regex matches for t("...") and t('...') inside adminContent
const tDoubleQuotesRegex = /t\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*\)/g;
let match;
while ((match = tDoubleQuotesRegex.exec(adminContent)) !== null) {
    const val = match[1].trim();
    if (viRegex.test(val)) {
        uniqueStrings.add(val);
    }
}

const tSingleQuotesRegex = /t\(\s*'([^'\\]*(?:\\.[^'\\]*)*)'\s*\)/g;
while ((match = tSingleQuotesRegex.exec(adminContent)) !== null) {
    const val = match[1].trim();
    if (viRegex.test(val)) {
        uniqueStrings.add(val);
    }
}

const tTicksRegex = /t\(\s*`([^`\\]*(?:\\.[^`\\]*)*)`\s*\)/g;
while ((match = tTicksRegex.exec(adminContent)) !== null) {
    const val = match[1].trim();
    if (viRegex.test(val)) {
        uniqueStrings.add(val);
    }
}

// Additional line-by-line fallback scan
const lines = adminContent.split('\n');
for (const line of lines) {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        continue;
    }
    // Match standard t("...")
    const m1 = line.match(/t\(\s*"([^"]+)"\s*\)/g);
    if (m1) {
        for (const item of m1) {
            const innerMatch = item.match(/t\(\s*"([^"]+)"\s*\)/);
            if (innerMatch && innerMatch[1]) {
                const val = innerMatch[1].trim();
                if (viRegex.test(val)) uniqueStrings.add(val);
            }
        }
    }
    // Match standard t('...')
    const m2 = line.match(/t\(\s*'([^']+)'\s*\)/g);
    if (m2) {
        for (const item of m2) {
            const innerMatch = item.match(/t\(\s*'([^']+)'\s*\)/);
            if (innerMatch && innerMatch[1]) {
                const val = innerMatch[1].trim();
                if (viRegex.test(val)) uniqueStrings.add(val);
            }
        }
    }
}

const stringsList = Array.from(uniqueStrings).sort();
console.log(`Extracted ${stringsList.length} unique strings for translation.`);

if (stringsList.length === 0) {
    console.log("No strings found to translate.");
    process.exit(0);
}

// 2. Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not available in environment.");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
        headers: {
            'User-Agent': 'aistudio-build',
        }
    }
});

const batchSize = 50;
const translatedDict: Record<string, Record<string, string>> = {
    en: {},
    ko: {},
    ja: {},
    th: {},
    zh: {}
};

async function translateAll() {
    const totalBatches = Math.ceil(stringsList.length / batchSize);
    
    for (let i = 0; i < stringsList.length; i += batchSize) {
        const batch = stringsList.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        console.log(`Translating batch ${batchNum} of ${totalBatches}...`);
        
        const prompt = `
You are a highly precise translator specializing in music streaming, artist management, and demo music dashboards.
Translate the following list of Vietnamese strings into 5 languages:
- en (English)
- ko (Korean)
- ja (Japanese)
- th (Thai)
- zh (Chinese)

Here is the list of Vietnamese strings to translate:
${JSON.stringify(batch, null, 2)}

Format the output strictly as a JSON object with keys: "en", "ko", "ja", "th", "zh".
Each key should map to an object where the key is the exact original Vietnamese string and the value is the translated string.
Do not wrap in any markdown formatting other than raw JSON.
`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            en: { type: Type.OBJECT },
                            ko: { type: Type.OBJECT },
                            ja: { type: Type.OBJECT },
                            th: { type: Type.OBJECT },
                            zh: { type: Type.OBJECT }
                        },
                        required: ["en", "ko", "ja", "th", "zh"]
                    }
                }
            });
            
            const text = response.text?.trim() || "";
            const parsed = JSON.parse(text);
            
            for (const lang of ["en", "ko", "ja", "th", "zh"]) {
                if (parsed[lang]) {
                    Object.assign(translatedDict[lang], parsed[lang]);
                }
            }
        } catch (error) {
            console.error(`Error during batch translation ${batchNum}:`, error);
            process.exit(1);
        }
    }
    
    // 3. Merge with existing adminTranslations in App.tsx
    const startTransMarker = "const adminTranslations";
    const startTrans = content.indexOf(startTransMarker);
    if (startTrans === -1) {
        console.error("Could not find const adminTranslations in App.tsx!");
        process.exit(1);
    }
    
    const endTransMarker = "const useAdminTranslation";
    const endTrans = content.indexOf(endTransMarker);
    if (endTrans === -1) {
        console.error("Could not find const useAdminTranslation in App.tsx!");
        process.exit(1);
    }
    
    const adminTransBlock = content.slice(startTrans, endTrans);
    
    const langs = ["vi", "en", "ko", "ja", "th", "zh"];
    const langDicts: Record<string, Record<string, string>> = {
        vi: {}, en: {}, ko: {}, ja: {}, th: {}, zh: {}
    };
    
    for (const l of langs) {
        const langStart = adminTransBlock.indexOf(`${l}: {`);
        if (langStart === -1) continue;
        
        let bracketCount = 0;
        let langEnd = -1;
        const prefixLen = `${l}: {`.length;
        
        for (let charIdx = langStart + prefixLen; charIdx < adminTransBlock.length; charIdx++) {
            const char = adminTransBlock[charIdx];
            if (char === '{') {
                bracketCount++;
            } else if (char === '}') {
                if (bracketCount === 0) {
                    langEnd = charIdx;
                    break;
                } else {
                    bracketCount--;
                }
            }
        }
        
        if (langEnd !== -1) {
            const langSub = adminTransBlock.slice(langStart, langEnd + 1);
            // Extract all key value pairs using regex
            const pairRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
            let pairMatch;
            while ((pairMatch = pairRegex.exec(langSub)) !== null) {
                const k = pairMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                const v = pairMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                langDicts[l][k] = v;
            }
        }
    }
    
    // Update with our new translations
    for (const lang of ["en", "ko", "ja", "th", "zh"]) {
        Object.assign(langDicts[lang], translatedDict[lang]);
    }
    
    // Auto populate vi translations to themselves
    for (const str of stringsList) {
        langDicts["vi"][str] = str;
    }
    
    // Re-build the adminTranslations block
    let newBlock = "const adminTranslations: Record<string, Record<string, string>> = {\n";
    for (const l of langs) {
        newBlock += `  ${l}: {\n`;
        const sortedKeys = Object.keys(langDicts[l]).sort();
        sortedKeys.forEach((k, idx) => {
            const v = langDicts[l][k] || k;
            const kEsc = k.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            const vEsc = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            const comma = idx < sortedKeys.length - 1 ? "," : "";
            newBlock += `    "${kEsc}": "${vEsc}"${comma}\n`;
        });
        if (l === "zh") {
            newBlock += "  }\n";
        } else {
            newBlock += "  },\n";
        }
    }
    newBlock += "};\n\n";
    
    const finalContent = content.slice(0, startTrans) + newBlock + content.slice(endTrans);
    
    fs.writeFileSync('src/App.tsx', finalContent, 'utf-8');
    console.log("Translations successfully integrated into App.tsx!");
}

translateAll();
