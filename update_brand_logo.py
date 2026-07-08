import re

with open('patch_brand_ui.txt', 'r') as f:
    patch = f.read()

with open('src/App.tsx', 'r') as f:
    content = f.read()

# The block starts with `<div>\n                        <label className="block text-sm font-bold text-stone-700 mb-2">Logo đối tác (Upload)</label>`
# and ends with `</button>\n                          </div>\n                        </div>\n                      </div>`

pattern = re.compile(r'<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Logo đối tác \(Upload\)</label>\s*<div className="flex items-center gap-4">.*?Chọn logo\s*</button>\s*</div>\s*</div>\s*</div>', re.DOTALL)

new_content, count = pattern.subn(patch, content)
print(f"Replaced {count} instances")

with open('src/App.tsx', 'w') as f:
    f.write(new_content)
