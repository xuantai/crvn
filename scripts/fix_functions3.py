import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

def renderArtistNameWithLinks_new():
    return """function renderArtistNameWithLinks(text: string | null | undefined, systemArtists: any[]) {
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

              // Match in systemArtists
              const trimmedName = segment.trim();
              const matchedArtist = systemArtists.find(
                a => a.artistName && a.artistName.trim().toLowerCase() === trimmedName.toLowerCase()
              );

              if (matchedArtist) {
                // Construct link
                const isProduction = window.location.hostname.includes('chorus.vn');
                let href = `/${matchedArtist.extension}`;
                let isExternal = false;

                if (matchedArtist.hasExternalWebsite && matchedArtist.externalWebsiteUrl) {
                  const cleanUrl = matchedArtist.externalWebsiteUrl.trim().replace(/^https?:\\/\\//i, '');
                  href = `https://${cleanUrl}`;
                  isExternal = true;
                } else if (matchedArtist.customDomain) {
                  const cleanUrl = matchedArtist.customDomain.trim().replace(/^https?:\\/\\//i, '');
                  href = `https://${cleanUrl}`;
                  isExternal = true;
                } else if (isProduction) {
                  href = `https://${matchedArtist.extension}.chorus.vn`;
                  isExternal = true;
                }

                if (isExternal) {
                  return (
                    <a 
                      key={`${lineIdx}-${segIdx}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="artist-link-cool cursor-pointer text-inherit inline-flex items-baseline"
                    >
                      {segment}
                    </a>
                  );
                } else {
                  return (
                    <Link 
                      key={`${lineIdx}-${segIdx}`}
                      to={href}
                      className="artist-link-cool cursor-pointer text-inherit inline-flex items-baseline"
                    >
                      {segment}
                    </Link>
                  );
                }
              }

              return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}"""

start_idx = text.find('function renderArtistNameWithLinks(')
end_idx = text.find('// Global styles added in index.css')

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + renderArtistNameWithLinks_new() + "\n\n" + text[end_idx:]
    with open('src/App.tsx', 'w') as f:
        f.write(text)
    print("Fixed renderArtistNameWithLinks")
else:
    print("Could not find bounds for renderArtistNameWithLinks")

