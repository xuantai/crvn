const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Inject landingConfig into AdminCreateDemo
code = code.replace(
  'function AdminCreateDemo() {\n  const { t } = useAdminTranslation();',
  'function AdminCreateDemo() {\n  const { t } = useAdminTranslation();\n  const { landingConfig } = useContext(LanguageContext);'
);

// Inject landingConfig into AdminEditDemo
code = code.replace(
  'function AdminEditDemo() {\n  const { t } = useAdminTranslation();',
  'function AdminEditDemo() {\n  const { t } = useAdminTranslation();\n  const { landingConfig } = useContext(LanguageContext);'
);

// Replace translateTemplateName calls
code = code.replace(/translateTemplateName\(c\.name \|\| String\(c\.id\)\)/g, 'translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id))');
code = code.replace(/translateTemplateName\(defaultNames\[i - 1\]\)/g, 'translateTemplateName(defaultNames[i - 1], landingConfig?.templateNames, String(i))');
code = code.replace(/translateTemplateName\(exist\.name \|\| String\(i\)\)/g, 'translateTemplateName(exist.name || String(i), landingConfig?.templateNames, String(i))');

fs.writeFileSync('src/App.tsx', code);
