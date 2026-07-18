const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `function CustomAudioPlayer({ src, backupAudioUrl, template, onEnded, onAlmostEnded, playlistContext, isPreview, lyricsColor, waveColor }: { src: string, backupAudioUrl?: string, template: string, onEnded?: () => void, onAlmostEnded?: () => void, playlistContext?: any, isPreview?: boolean, lyricsColor?: string, waveColor?: string }) {`;
const replacement1 = `function CustomAudioPlayer({ src, backupAudioUrl, template, onEnded, onAlmostEnded, playlistContext, isPreview, lyricsColor, waveColor, showDownload, title }: { src: string, backupAudioUrl?: string, template: string, onEnded?: () => void, onAlmostEnded?: () => void, playlistContext?: any, isPreview?: boolean, lyricsColor?: string, waveColor?: string, showDownload?: boolean, title?: string }) {`;

const target2 = `        <div className="w-20 md:w-24 flex justify-end"></div>`;
const replacement2 = `        <div className="w-20 md:w-24 flex justify-end">
           {showDownload && (
              <a 
                href={src} 
                className={\`opacity-60 hover:opacity-100 transition-all \${isLight ? 'hover:text-stone-900' : 'hover:text-white'}\`}
                title="Tải bài hát"
                onClick={(e) => {
                   e.preventDefault();
                   fetch(src)
                     .then(res => res.blob())
                     .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = \`\${title || 'song'}.mp3\`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                     })
                     .catch(() => window.open(src, '_blank'));
                }}
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </a>
           )}
        </div>`;

const target3 = `<CustomAudioPlayer src={demo.audioUrl} backupAudioUrl={demo.backupAudioUrl} template={templateType} onEnded={onEnd} onAlmostEnded={onAlmostEnded} playlistContext={playlistContext} isPreview={isPreview} lyricsColor={customConfig?.lyricsColor} waveColor={customConfig?.waveColor} />`;
const replacement3 = `<CustomAudioPlayer src={demo.audioUrl} backupAudioUrl={demo.backupAudioUrl} template={templateType} onEnded={onEnd} onAlmostEnded={onAlmostEnded} playlistContext={playlistContext} isPreview={isPreview} lyricsColor={customConfig?.lyricsColor} waveColor={customConfig?.waveColor} showDownload={!!getAdminToken() || !!getMemberToken()} title={demo.title} />`;

if (code.includes(target1) && code.includes(target2) && code.includes(target3)) {
    code = code.replace(target1, replacement1);
    code = code.replace(target2, replacement2);
    code = code.replace(target3, replacement3);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed player successfully!");
} else {
    console.log("Targets not found!");
}
