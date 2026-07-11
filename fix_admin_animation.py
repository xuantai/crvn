import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

tabs = ['demos', 'profile', 'socials', 'templates', 'security', 'reposts', 'tickets']

for tab in tabs:
    # We replace `{activeTab === 'tab' && (`
    # with `{activeTab === 'tab' && ( <motion.div key="tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">`
    content = content.replace(
        f"{{activeTab === '{tab}' && (",
        f"{{activeTab === '{tab}' && (\n            <motion.div key=\"{tab}\" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className=\"flex flex-col flex-1 min-h-0 w-full overflow-hidden\">"
    )

# Since we opened a `<motion.div>`, we need to close it.
# The tabs are sequentially ordered in the file.
# we can just find the NEXT `{activeTab === '` and insert `</motion.div>` before it.
# And for the last one ('tickets'), we insert it before `</main>`.

def add_closing_tag(c, next_tab_str):
    idx = c.find(next_tab_str)
    if idx == -1: return c
    # backtrack to find the previous `)}`
    # actually, the block always ends with `          )}\n`
    # Let's just find `          )}\n` before `idx`
    close_idx = c.rfind('          )}\n', 0, idx)
    if close_idx != -1:
        # replace `          )}\n` with `            </motion.div>\n          )}\n`
        return c[:close_idx] + '            </motion.div>\n' + c[close_idx:]
    return c

content = add_closing_tag(content, "{activeTab === 'profile' && (")
content = add_closing_tag(content, "{activeTab === 'socials' && (")
content = add_closing_tag(content, "{activeTab === 'templates' && (")
content = add_closing_tag(content, "{activeTab === 'security' && (")
content = add_closing_tag(content, "{activeTab === 'reposts' && (")
content = add_closing_tag(content, "{activeTab === 'tickets' && (")
content = add_closing_tag(content, "</main>")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Wrapped tabs in motion.div")
