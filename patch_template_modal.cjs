const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `function TemplatePickerModal({ 
  configs, 
  onSelect, 
  onClose, 
  previewSongId,
  previewData,
  defaultTemplateId
}: { 
  configs: TemplateConfig[], 
  onSelect: (id: string) => void, 
  onClose: () => void,
  previewSongId: string,
  previewData?: any,
  defaultTemplateId?: string
}) {
  const { t } = useAdminTranslation();`;

const replacement1 = `function TemplatePickerModal({ 
  configs, 
  onSelect, 
  onClose, 
  previewSongId,
  previewData,
  defaultTemplateId
}: { 
  configs: TemplateConfig[], 
  onSelect: (id: string) => void, 
  onClose: () => void,
  previewSongId: string,
  previewData?: any,
  defaultTemplateId?: string
}) {
  const { t } = useAdminTranslation();
  const { landingConfig } = useContext(LanguageContext);`;

code = code.replace(target1, replacement1);

const buttonTarget = `                  <button type="button" key={c.id} onClick={() => setSelectedId(c.id)} className={\`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors \${selectedId === c.id ? 'border-stone-900 bg-stone-50 font-bold' : 'border-transparent bg-white hover:bg-stone-100'}\`}>
                      {t(c.name)}
                  </button>`;
                  
const buttonReplacement = `                  <button type="button" key={c.id} onClick={() => setSelectedId(c.id)} className={\`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors flex justify-between items-center \${selectedId === c.id ? 'border-stone-900 bg-stone-50 font-bold' : 'border-transparent bg-white hover:bg-stone-100'}\`}>
                      <span>{t(c.name)}</span>
                      {landingConfig?.templateVip?.[c.id] && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 ml-2">VIP</span>
                      )}
                  </button>`;
                  
code = code.replace(buttonTarget, buttonReplacement);
                  
fs.writeFileSync('src/App.tsx', code);
