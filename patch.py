import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

custom_save = """  const handleCustomSave = async (payload: any) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedData = await res.json();
        setData(updatedData);
        setToast(t("Đã lưu thông tin thành công!"));
        setTimeout(() => setToast(''), 3000);
      } else {
        setToast(t("Lỗi khi lưu thông tin!"));
        setTimeout(() => setToast(''), 3000);
      }
    } catch (e) {
      setToast(t("Lỗi kết nối máy chủ!"));
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleProfileSave = async"""

content = content.replace("  const handleProfileSave = async", custom_save)

with open('src/App.tsx', 'w') as f:
    f.write(content)
