const fs = require('fs');
let code = fs.readFileSync('src/components/ChorusVNLanding.tsx', 'utf8');

const search = `{t('featuresTitle')}
            </h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
              {t('featuresSub')}
            </p>`;

const replace = `{config.featuresTitle || t('featuresTitle')}
            </h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
              {config.featuresSub || t('featuresSub')}
            </p>`;

code = code.replace(search, replace);

fs.writeFileSync('src/components/ChorusVNLanding.tsx', code);
