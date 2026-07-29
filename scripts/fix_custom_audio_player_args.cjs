const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `function CustomAudioPlayer({ src, backupAudioUrl, template, onEnded, onAlmostEnded, playlistContext, isPreview, lyricsColor, waveColor, showDownload, title }: { src: string, backupAudioUrl?: string, template: string, onEnded?: () => void, onAlmostEnded?: () => void, playlistContext?: any, isPreview?: boolean, lyricsColor?: string, waveColor?: string, showDownload?: boolean, title?: string }) {`;

const replacement = `function CustomAudioPlayer({ src, backupAudioUrl, template, onEnded, onAlmostEnded, playlistContext, isPreview, lyricsColor, waveColor, showDownload, title, singer, isReleased }: { src: string, backupAudioUrl?: string, template: string, onEnded?: () => void, onAlmostEnded?: () => void, playlistContext?: any, isPreview?: boolean, lyricsColor?: string, waveColor?: string, showDownload?: boolean, title?: string, singer?: string, isReleased?: boolean }) {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed CustomAudioPlayer args");
} else {
    console.log("Target not found");
}
