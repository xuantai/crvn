const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  'const [roles, setRoles] = useState<any[]>([]);',
  'const [roles, setRoles] = useState<any[]>([]);\n  const [vouchers, setVouchers] = useState<any[]>([]);'
);

code = code.replace(
  "fetch('/api/acp/roles', {",
  "fetch('/api/acp/vouchers', {\n        headers: { 'Authorization': `Bearer ${token}` }\n      })\n        .then(res => res.json())\n        .then(data => {\n          if (Array.isArray(data)) setVouchers(data);\n        })\n        .catch(() => {});\n\n      fetch('/api/acp/roles', {"
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
