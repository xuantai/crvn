import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

new_logic = """  const handleCancelRequest = async (type: 'name' | 'username') => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;
    try {
      const res = await fetch('/api/profile/cancel-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        setToast('Đã hủy yêu cầu!');
        setTimeout(() => setToast(''), 3000);
        loadData();
      }
    } catch (e) {}
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {"""

code = re.sub(
    r'  const handleProfileSave = async \(e: React\.FormEvent<HTMLFormElement>\) => \{',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(code)
