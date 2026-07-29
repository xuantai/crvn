import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

# Add toast state
code = code.replace(
    "const [isLoading, setIsLoading] = useState(false);",
    "const [isLoading, setIsLoading] = useState(false);\n  const [toast, setToast] = useState('');"
)

def inject_toast(func_name, message):
    global code
    pattern = r'(const ' + func_name + r' = async \(username: string\) => \{.*?if \(res\.ok\) \{.*?fetchArtists\(\);)(.*?\} else \{)'
    replacement = r"\1\n        setToast('" + message + r"');\n        setTimeout(() => setToast(''), 3000);\2"
    code = re.sub(pattern, replacement, code, flags=re.DOTALL)

inject_toast('handleApproveNameChange', 'Đã duyệt yêu cầu đổi tên nghệ sĩ!')
inject_toast('handleRejectNameChange', 'Đã từ chối yêu cầu đổi tên nghệ sĩ!')
inject_toast('handleApproveUsernameChange', 'Đã duyệt yêu cầu đổi username!')
inject_toast('handleRejectUsernameChange', 'Đã từ chối yêu cầu đổi username!')

# Add toast UI at the end of the return
toast_ui = """
      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}
    </div>
  );
"""

code = code.replace("    </div>\n  );\n}", toast_ui + "\n}")

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)
