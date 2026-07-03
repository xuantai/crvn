import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

old_hint = """<p className="text-[10px] text-neutral-500 mt-1">Truy cập qua: chorus.vn/{"<phần_mở_rộng>"}</p>"""

new_hint = """<p className="text-[10px] text-neutral-500 mt-1">
                    Truy cập qua: <strong>chorus.vn/{"{phần_mở_rộng}"}</strong> HOẶC cấu hình DNS trỏ subdomain <strong>{"{phần_mở_rộng}"}.chorus.vn</strong> về IP máy chủ để dùng như trang độc lập.
                  </p>"""

code = code.replace(old_hint, new_hint)

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)

