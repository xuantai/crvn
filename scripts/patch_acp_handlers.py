import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

new_logic = """  const handleApproveNameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi tên này?')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${acpToken}`
        },
        body: JSON.stringify({ originalUsername: username, approveNameChange: true })
      });
      if (res.ok) {
        setToast('Đã duyệt đổi tên!');
        setTimeout(() => setToast(''), 3000);
        fetchArtists();
      }
    } catch (err) {}
  };

  const handleRejectNameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi tên này?')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${acpToken}`
        },
        body: JSON.stringify({ originalUsername: username, rejectNameChange: true })
      });
      if (res.ok) {
        setToast('Đã từ chối đổi tên!');
        setTimeout(() => setToast(''), 3000);
        fetchArtists();
      }
    } catch (err) {}
  };

  const handleApproveUsernameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi username này? Sẽ thay đổi đường dẫn của nghệ sĩ!')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${acpToken}`
        },
        body: JSON.stringify({ originalUsername: username, approveUsernameChange: true })
      });
      if (res.ok) {
        setToast('Đã duyệt đổi Username!');
        setTimeout(() => setToast(''), 3000);
        fetchArtists();
      }
    } catch (err) {}
  };

  const handleRejectUsernameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi username này?')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${acpToken}`
        },
        body: JSON.stringify({ originalUsername: username, rejectUsernameChange: true })
      });
      if (res.ok) {
        setToast('Đã từ chối đổi Username!');
        setTimeout(() => setToast(''), 3000);
        fetchArtists();
      }
    } catch (err) {}
  };"""

code = re.sub(
    r'  const handleApproveNameChange = async \(username: string\) => \{.*?    \} catch \(err\) \{\}\n  \};',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)
