const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const searchState = `  const [feature4Title, setFeature4Title] = useState('');
  const [feature4Desc, setFeature4Desc] = useState('');`;

const replaceState = `  const [feature4Title, setFeature4Title] = useState('');
  const [feature4Desc, setFeature4Desc] = useState('');
  const [featuresTitle, setFeaturesTitle] = useState('');
  const [featuresSub, setFeaturesSub] = useState('');`;

code = code.replace(searchState, replaceState);

const searchFetch = `          setFeature4Title(data.feature4Title || '');
          setFeature4Desc(data.feature4Desc || '');`;

const replaceFetch = `          setFeature4Title(data.feature4Title || '');
          setFeature4Desc(data.feature4Desc || '');
          setFeaturesTitle(data.featuresTitle || 'Được thiết kế cho trải nghiệm đỉnh cao');
          setFeaturesSub(data.featuresSub || 'Tích hợp những công nghệ hiện đại nhất để tối ưu hóa quy trình phân phối và lưu trữ nội bộ.');`;

code = code.replace(searchFetch, replaceFetch);

const searchSave = `          feature4Title, feature4Desc,`;

const replaceSave = `          feature4Title, feature4Desc,
          featuresTitle, featuresSub,`;

code = code.replace(searchSave, replaceSave);

const searchForm = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-800">
                  <div className="md:col-span-2 mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tính năng nổi bật 1</h4>
                  </div>`;

const replaceForm = `                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-neutral-800">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tiêu đề phần tính năng (Features Title)
                    </label>
                    <input 
                      type="text" 
                      value={featuresTitle} 
                      onChange={e => setFeaturesTitle(e.target.value)} 
                      className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Mô tả phần tính năng (Features Sub)
                    </label>
                    <textarea 
                      value={featuresSub} 
                      onChange={e => setFeaturesSub(e.target.value)} 
                      className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm h-20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-800">
                  <div className="md:col-span-2 mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tính năng nổi bật 1</h4>
                  </div>`;

code = code.replace(searchForm, replaceForm);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
