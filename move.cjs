const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const startMatch = '            {/* Studio Picture Frames Wall Showcase for Musician Theme */}';
const endMatch = '            })()}';
const idx1 = content.indexOf(startMatch);
const idx2 = content.indexOf(endMatch, idx1) + endMatch.length;
const chunk = content.substring(idx1, idx2);
content = content.substring(0, idx1) + content.substring(idx2);

// We want to find the exact closing tags of the header box section.
// The code looks like this:
//           </div>
//         </section>
const insertIdx = content.indexOf('          </div>\n        </section>');
if (insertIdx !== -1) {
  content = content.substring(0, insertIdx + 17) + '\n\n' + chunk + '\n\n' + content.substring(insertIdx + 17);
  fs.writeFileSync('src/App.tsx', content);
  console.log('SUCCESS');
} else {
  // Try CRLF
  const insertIdx2 = content.indexOf('          </div>\r\n        </section>');
  if (insertIdx2 !== -1) {
    content = content.substring(0, insertIdx2 + 18) + '\r\n\r\n' + chunk + '\r\n\r\n' + content.substring(insertIdx2 + 18);
    fs.writeFileSync('src/App.tsx', content);
    console.log('SUCCESS');
  } else {
    console.log('FAILED TO FIND');
  }
}
