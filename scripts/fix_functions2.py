import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

def formatText_new():
    return """function formatText(text: string | null | undefined, disableLinks = false) {
  if (!text) return null;
  const lines = text.replace(/\\s+\\(/g, '\\n(').split('\\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = line.split(/(\\s*,\\s*|\\s*&\\s*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {segments.map((segment, segIdx) => {
              const isSeparator = /^(\\s*,\\s*|\\s*&\\s*)$/.test(segment);
              if (isSeparator) {
                return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
              }
              
              const isSecret = segment.toLowerCase().includes("secret");
              if (isSecret) {
                return (
                  <span 
                    key={`${lineIdx}-${segIdx}`}
                    className="select-none filter blur-[4.5px] cursor-help inline-block bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mx-0.5" 
                    title="Nghệ sĩ bí mật"
                  >
                    {segment}
                  </span>
                );
              }
              
              return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}"""

# Since regex is hard, let's just find the start and end string
start_idx = text.find('function formatText(')
end_idx = text.find('function renderArtistNameWithLinks(')

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + formatText_new() + "\n\n" + text[end_idx:]

    with open('src/App.tsx', 'w') as f:
        f.write(text)
    print("Fixed formatText")
else:
    print("Could not find bounds")

