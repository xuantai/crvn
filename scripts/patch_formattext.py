import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

old_format = """function formatText(text: string | null | undefined, disableLinks = false) {
  if (!text) return null;
  const lines = text.replace(/\s+\(/g, '\\n(').split('\\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = line.split(/(\s*,\s*|\s*&\s*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {segments.map((segment, segIdx) => {
              const isSeparator = /^(\s*,\s*|\s*&\s*)$/.test(segment);
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
              
              const parts = segment.split(/(A\.C Xuân Tài|AC Xuân Tài)/gi);
              return (
                <React.Fragment key={`${lineIdx}-${segIdx}`}>
                  {parts.map((part, i) => {
                    const lower = part.toLowerCase();
                    if (lower === 'a.c xuân tài' || lower === 'ac xuân tài') {
                      if (disableLinks) {
                        return <span key={`${lineIdx}-${segIdx}-${i}`}>{part}</span>;
                      }
                      return (
                        <a key={`${lineIdx}-${segIdx}-${i}`} href="https://acxuantai.com" target="_blank" rel="noreferrer" className="transition-colors hover:opacity-80">
                          {part}
                        </a>
                      );
                    }
                    return <span key={`${lineIdx}-${segIdx}-${i}`}>{part}</span>;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}"""

new_format = """function formatText(text: string | null | undefined, disableLinks = false) {
  if (!text) return null;
  const lines = text.replace(/\s+\(/g, '\\n(').split('\\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = line.split(/(\s*,\s*|\s*&\s*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {segments.map((segment, segIdx) => {
              const isSeparator = /^(\s*,\s*|\s*&\s*)$/.test(segment);
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

code = code.replace(old_format, new_format)

with open('src/App.tsx', 'w') as f:
    f.write(code)

