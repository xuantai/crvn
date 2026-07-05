const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';

const startIndex = code.indexOf(startMarker) + startMarker.length;
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

let formContent = code.substring(startIndex, endIndex);

// Split formContent into blocks based on <div> or structural elements. 
// It's tricky to parse HTML with regex, so I'll find specific blocks using string indices.

function extractBlock(startStr, nextStrOrRegex) {
    let startIdx = formContent.indexOf(startStr);
    if (startIdx === -1) return null;
    let endIdx;
    
    // go backward to the enclosing <div>
    startIdx = formContent.lastIndexOf('<div>', startIdx);
    if (startIdx === -1) startIdx = formContent.lastIndexOf('<div', startIdx);

    if (typeof nextStrOrRegex === 'string') {
        endIdx = formContent.indexOf(nextStrOrRegex, startIdx);
    } else {
        const match = nextStrOrRegex.exec(formContent.substring(startIdx));
        if (match) {
            endIdx = startIdx + match.index;
        } else {
            endIdx = -1;
        }
    }
    
    if (endIdx === -1) {
        // Just take a reasonable chunk or fail
        return null;
    }
    
    const block = formContent.substring(startIdx, endIdx);
    // Erase the block from formContent to avoid extracting it again
    formContent = formContent.slice(0, startIdx) + formContent.slice(endIdx);
    return block;
}

const blocks = {};

blocks.pageTitle = extractBlock('<label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website</label>', /<div[^>]*>\s*<label[^>]*>Tên nghệ sĩ/);
blocks.artistName = extractBlock('<label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ</label>', /<div[^>]*>\s*<label[^>]*>Username \(Phần mở rộng\)/);
blocks.username = extractBlock('<label className="block text-sm font-bold text-stone-700 mb-2">Username (Phần mở rộng)</label>', /<div[^>]*>\s*<label[^>]*>Giới thiệu ngắn/);
blocks.artistBio = extractBlock('<label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn</label>', /<div className="flex flex-col gap-3">/);

// The flex-col gap-3 contains both checkboxes
const autoSwitchIdx = formContent.indexOf('<div className="flex flex-col gap-3">');
const tabsIdx = formContent.indexOf('<div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">');
if (autoSwitchIdx !== -1 && tabsIdx !== -1) {
    blocks.checkboxes = formContent.substring(autoSwitchIdx, tabsIdx);
    formContent = formContent.slice(0, autoSwitchIdx) + formContent.slice(tabsIdx);
}

const tabsStartIdx = formContent.indexOf('<div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">');
const avatarStartIdx = formContent.indexOf('<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ');
// wait, the Avatar label might be different
const avatarLabelIdx = formContent.indexOf('<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ</label>');
let avatarActualStart = formContent.lastIndexOf('<div', avatarLabelIdx);

if (tabsStartIdx !== -1 && avatarActualStart !== -1) {
    blocks.tabNames = formContent.substring(tabsStartIdx, avatarActualStart);
    formContent = formContent.slice(0, tabsStartIdx) + formContent.slice(avatarActualStart);
}

const bgImgStart = formContent.indexOf('<div className="border border-stone-200 rounded-3xl p-5 bg-white shadow-sm">');
if (bgImgStart !== -1) {
    // avatar goes up to bgImgStart
    const avStart = formContent.lastIndexOf('<div', formContent.indexOf('<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ</label>'));
    blocks.avatar = formContent.substring(avStart, bgImgStart);
    formContent = formContent.slice(0, avStart) + formContent.slice(bgImgStart);
}

const gridColsStart = formContent.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
if (gridColsStart !== -1) {
    // bg image goes up to gridColsStart
    const bgStart = formContent.indexOf('<div className="border border-stone-200 rounded-3xl p-5 bg-white shadow-sm">');
    blocks.bgImage = formContent.substring(bgStart, gridColsStart);
    formContent = formContent.slice(0, bgStart) + formContent.slice(gridColsStart);
}

const ytStart = formContent.indexOf('<div>\n                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Playlist YouTube');
if (ytStart === -1) {
    console.log("Could not find Youtube field");
} else {
    // favicon goes up to ytStart
    // wait, there's a <hr> before youtube
    let hrIdx = formContent.lastIndexOf('<hr', ytStart);
    if (hrIdx === -1) hrIdx = ytStart;
    
    const fvStart = formContent.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
    blocks.favicon = formContent.substring(fvStart, hrIdx);
    formContent = formContent.slice(0, fvStart) + formContent.slice(hrIdx);
}

// Whatever is left in formContent is the rest (YouTube, Spotify, password, domain, submit button, and </form>)
// Actually we need to pull out the domain and bottom fields or just insert our reordered fields at the beginning of the remaining formContent.

// Let's reconstruct the form content!
// Top: 
// 1. Giới thiệu ngắn
// 2. Tên Nghệ sĩ
// 3. Username
// 4. Avatar
// 5. bgImage
// 6. favicon
// 7. pageTitle

// Bottom (to put right before submit button):
// checkboxes
// tabNames

const topContent = [
    blocks.artistBio,
    blocks.artistName,
    blocks.username,
    blocks.avatar,
    blocks.bgImage,
    blocks.favicon,
    blocks.pageTitle
].join('\\n');

const bottomFields = [
    blocks.checkboxes,
    blocks.tabNames
].join('\\n');

// The rest of the form (YouTube, Spotify, Password, Custom Domain, Submit Button, etc)
// We need to find the Submit button part and insert bottomFields right above it.
let remaining = formContent;
const submitIdx = remaining.indexOf('<div className="flex items-center gap-4 border-t border-stone-200 pt-6 mt-2">');

if (submitIdx !== -1) {
    const beforeSubmit = remaining.substring(0, submitIdx);
    const afterSubmit = remaining.substring(submitIdx);
    remaining = beforeSubmit + '\\n' + bottomFields + '\\n' + afterSubmit;
} else {
    console.log("Could not find submit button block");
}

const newFormContent = '\\n' + topContent + '\\n' + remaining;
const newCode = code.substring(0, startIndex) + newFormContent + code.substring(endIndex);

fs.writeFileSync('src/App.tsx', newCode);
console.log("Form successfully reordered");

