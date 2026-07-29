const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf-8');

// 1. Add state for globalLayoutSections
if (!code.includes('const [globalLayoutSections')) {
  code = code.replace(
    `const [featuresSub, setFeaturesSub] = useState('');`,
    `const [featuresSub, setFeaturesSub] = useState('');\n  const [globalLayoutSections, setGlobalLayoutSections] = useState<string[]>(['title', 'spotify', 'vault', 'mv']);`
  );
}

// 2. Fetch globalLayoutSections
if (!code.includes('setGlobalLayoutSections(data.globalLayoutSections')) {
  code = code.replace(
    `setMenuBioVi(data.menuBioVi || 'Tiểu Sử');`,
    `setMenuBioVi(data.menuBioVi || 'Tiểu Sử');\n        setGlobalLayoutSections(data.globalLayoutSections || ['title', 'spotify', 'vault', 'mv']);`
  );
}

// 3. Save globalLayoutSections
if (code.includes('menuVaultVi,')) {
  code = code.replace(
    `menuVaultVi,\n          menuAboutVi,\n          menuBioVi`,
    `menuVaultVi,\n          menuAboutVi,\n          menuBioVi,\n          globalLayoutSections`
  );
}

// 4. Import GripVertical and add drag logic
if (!code.includes('import { GripVertical }')) {
  code = code.replace(
    `import { Play, Pause, X, Edit, Trash, Plus, Upload, CheckCircle2, ChevronLeft, ChevronRight, Lock, Key, Copy, Eye, EyeOff, Layout, Globe, Activity, Headphones, Share2, Server, Save, Mail, FileText, Type, LayoutTemplate, Send, Database, Image as ImageIcon, MessageSquare } from 'lucide-react';`,
    `import { Play, Pause, X, Edit, Trash, Plus, Upload, CheckCircle2, ChevronLeft, ChevronRight, Lock, Key, Copy, Eye, EyeOff, Layout, Globe, Activity, Headphones, Share2, Server, Save, Mail, FileText, Type, LayoutTemplate, Send, Database, Image as ImageIcon, MessageSquare, GripVertical } from 'lucide-react';`
  );
}

// 5. Add Drag Handlers
const dragLogic = `
  const getLayoutSectionName = (sec: string) => {
    if (sec === 'title') return "Tiêu Đề (Tên & Giới thiệu ngắn)";
    if (sec === 'spotify') return "Spotify Playlist / Album";
    if (sec === 'vault') return "Kho Nhạc (Danh sách Đề mô / Ra Rồi)";
    if (sec === 'mv') return "MV Đã Phát Hành (YouTube Videos)";
    return sec;
  };
  const handleDragStartLayout = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDropLayout = (e: any, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;
    const newList = [...globalLayoutSections];
    const draggedItem = newList[dragIndex];
    newList.splice(dragIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    setGlobalLayoutSections(newList);
  };
`;

if (!code.includes('handleDragStartLayout')) {
  code = code.replace(
    `const fetchSentMails = async () => {`,
    dragLogic + `\n  const fetchSentMails = async () => {`
  );
}

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
console.log("Patched states and handlers");
