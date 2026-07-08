sed -i -e "s/lower.includes(\"rap\");/lower.includes(\"rap\") || lower.includes(\"intro\") || lower.includes(\"outro\");/g" src/App.tsx
sed -i -e '/else if (lower.includes("rap")) annotation = "Rap";/a\        else if (lower.includes("intro")) annotation = "Intro";\n        else if (lower.includes("outro")) annotation = "Outro";' src/App.tsx
