import re

# Regex for Vietnamese characters
vi_regex = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', re.IGNORECASE)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate the start of admin dashboard
admin_start_marker = "function AdminDashboard()"
start_index = content.find(admin_start_marker)

if start_index == -1:
    print("Could not find start of admin dashboard!")
    exit(1)

pre_admin = content[:start_index]
admin_content = content[start_index:]

# 1. Attribute replacement: placeholder="Tìm kiếm..." -> placeholder={t("Tìm kiếm...")}
# Ensure the matched string doesn't cross tag boundaries < or >
def replace_attr_double(match):
    attr = match.group(1)
    val = match.group(2)
    if 't(' in val:
        return match.group(0)
    return f'{attr}={{t("{val}")}}'

admin_content_1 = re.sub(
    r'(\b\w+)=\"([^\"<>\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+[^\"<>\n]*)\"',
    replace_attr_double,
    admin_content,
    flags=re.IGNORECASE
)

# 2. Attribute replacement with single quotes: placeholder='Tìm kiếm...' -> placeholder={t("Tìm kiếm...")}
def replace_attr_single(match):
    attr = match.group(1)
    val = match.group(2)
    if 't(' in val:
        return match.group(0)
    return f'{attr}={{t("{val}")}}'

admin_content_2 = re.sub(
    r'(\b\w+)=\'([^\'<>\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+[^\'<>\n]*)\'',
    replace_attr_single,
    admin_content_1,
    flags=re.IGNORECASE
)

# 3. Plain JS strings in double quotes: "Đã có lỗi xảy ra!" -> t("Đã có lỗi xảy ra!")
# Ensure we don't match attribute quotes or across tag boundaries
def replace_js_double(match):
    before = match.group(1)
    val = match.group(2)
    if before.startswith('='):
        return match.group(0)
    if 't(' in val:
        return match.group(0)
    return f'{before}t("{val}")'

admin_content_3 = re.sub(
    r'([^=])\"([^\"<>\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+[^\"<>\n]*)\"',
    replace_js_double,
    admin_content_2,
    flags=re.IGNORECASE
)

# 4. Plain JS strings in single quotes: 'Đã có lỗi xảy ra!' -> t('Đã có lỗi xảy ra!')
def replace_js_single(match):
    before = match.group(1)
    val = match.group(2)
    if before.startswith('='):
        return match.group(0)
    if 't(' in val:
        return match.group(0)
    return f'{before}t("{val}")'

admin_content_4 = re.sub(
    r'([^=])\'([^\'<>\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+[^\'<>\n]*)\'',
    replace_js_single,
    admin_content_3,
    flags=re.IGNORECASE
)

# 5. JSX text nodes: >[Vietnamese text]< -> >{t("[Vietnamese text]")}<
def replace_jsx_text(match):
    val = match.group(1).strip()
    if not val:
        return match.group(0)
    if '{' in val or '}' in val:
        return match.group(0)
    if '<' in val or '>' in val:
        return match.group(0)
    return f'>{{t("{val}")}}<'

admin_content_5 = re.sub(
    r'>([^<>\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+[^<>\n]*)<',
    replace_jsx_text,
    admin_content_4,
    flags=re.IGNORECASE
)

# Let's save the final content back
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(pre_admin + admin_content_5)

print("Replacement complete!")
