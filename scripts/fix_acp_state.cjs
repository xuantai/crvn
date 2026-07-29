const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const target = `  const [activeTab, setActiveTab] = useState<'artists' | 'landing' | 'tickets'>('artists');`;
const replace = `  const [actionConfirm, setActionConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'artists' | 'landing' | 'tickets'>('artists');`;

if (code.includes(target) && !code.includes('actionConfirm:')) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
  console.log('Fixed state in ACPControlPanel');
} else {
  console.log('State target not found or already injected');
}
