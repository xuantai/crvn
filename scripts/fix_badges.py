import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Fix Trending</> -> Trending</span></span></>
text = text.replace('Trending</>', 'Trending</span></span></>')
text = text.replace('Views</>', 'Views</span></span></>')

# Fix Streams           </h4> -> Streams</span></span>           </h4>
text = re.sub(r'Streams(\s*</h4>)', r'Streams</span></span>\1', text)
text = re.sub(r'Videos(\s*</h4>)', r'Videos</span></span>\1', text)

# Also fix the <span className="text-[7.5px] ..."></span> YOUTUBE </div>
# The </span> was appended inside the tag, making the text outside!
# So we want to move the text inside.
# Wait, my previous `recover.py` appended </span> to the END of the line containing `<span`.
# So it looks like: <span ...></span>
# And the next line is `YOUTUBE`
# I can just remove the </span> from the <span line and put it after the text line.
# Actually, I can just do a regex for those specific badge blocks.

# Let's fix the empty </span> in the badges manually via regex
badge_labels = ["YOUTUBE", "TIKTOK", "SPOTIFY", "ZING MP3"]
for label in badge_labels:
    # We look for <span className="text-[7.5px] ... block" style={{ marginRight: '-0.1em' }}></span>\n               LABEL
    pattern = r'(<span className="text-\[7\.5px\].*?)\s*</span>(\s*' + label + r')'
    text = re.sub(pattern, r'\1>\2</span>', text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

