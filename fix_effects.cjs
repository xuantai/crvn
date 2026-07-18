const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newEffectsCode = `
function AutumnLeavesEffect() {
  const leaves = ['🍂', '🍁', '🍃', '🌾'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-xl sm:text-2xl animate-snow will-change-transform drop-shadow-md mix-blend-overlay"
          style={{
            left: \`\${Math.random() * 100}%\`,
            top: \`\${Math.random() * 100 - 20}%\`,
            animationDuration: \`\${Math.random() * 10 + 15}s\`,
            animationDelay: \`\${Math.random() * -20}s\`,
            fontSize: \`\${Math.random() * 1 + 0.8}rem\`
          }}
        >
          {leaves[i % leaves.length]}
        </div>
      ))}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(217,91,22,0.2),transparent_60%)] mix-blend-screen opacity-50 animate-[pulse_6s_ease-in-out_infinite]"></div>
    </div>
  );
}

function PastelShapesEffect() {
  const shapes = [
    'rounded-full bg-pink-400', 
    'rounded-none bg-yellow-400 rotate-45', 
    'rounded-full bg-blue-400',
    'rounded-[50%_0_50%_0] bg-purple-400'
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
      {Array.from({ length: 25 }).map((_, i) => (
        <div 
          key={i} 
          className={\`absolute animate-float-shape opacity-60 \${shapes[i % shapes.length]}\`}
          style={{
            left: \`\${Math.random() * 100}%\`,
            top: \`\${Math.random() * 100}%\`,
            width: \`\${Math.random() * 15 + 10}px\`,
            height: \`\${Math.random() * 15 + 10}px\`,
            animationDuration: \`\${Math.random() * 8 + 6}s\`,
            animationDelay: \`\${Math.random() * -10}s\`
          }}
        />
      ))}
    </div>
  );
}
`;

const insertAfterStr = `function FireworksEffect() {`;
// find where to insert the new components
code = code.replace(insertAfterStr, newEffectsCode + '\n' + insertAfterStr);

// add to the render loop
const renderLoopTarget1 = `{templateType === '18' && <FireworksEffect />}`;
const renderLoopReplace1 = `{templateType === '18' && <FireworksEffect />}\n        {templateType === '19' && <AutumnLeavesEffect />}\n        {templateType === '20' && <PastelShapesEffect />}`;
code = code.replace(renderLoopTarget1, renderLoopReplace1);

// since there are two places where it is rendered (one for main app, one for preview?) let's just replace all occurrences
code = code.replace(renderLoopTarget1, renderLoopReplace1);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated effects");
