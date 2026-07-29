function formatText(text) {
  if (!text) return null;
  const lines = text.replace(/\s+\(/g, '\n(').split('\n');
  console.log("lines:", lines);
}
formatText("Nếu Chúng Ta Chưa Từng Gặp lại ( OST Hoàng Quý Muội )");
