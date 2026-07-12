const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const missingTrans = {
  en: `"Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.": "Drag and drop to reorder. The first tab will be the default page. Supports up to 3 custom tabs.", "Lưu Menu": "Save Menu",`,
  ko: `"Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.": "드래그 앤 드롭으로 순서를 변경하세요. 첫 번째 탭이 기본 페이지가 됩니다. 최대 3개의 사용자 지정 탭을 지원합니다.", "Lưu Menu": "메뉴 저장",`,
  ja: `"Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.": "ドラッグ＆ドロップで並べ替えます。最初のタブがデフォルトページになります。最大3つのカスタムタブをサポートします。", "Lưu Menu": "メニューを保存",`,
  th: `"Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.": "ลากและวางเพื่อจัดเรียงลำดับ แท็บแรกจะเป็นหน้าเริ่มต้น รองรับแท็บกำหนดเองสูงสุด 3 แท็บ", "Lưu Menu": "บันทึกเมนู",`,
  zh: `"Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.": "拖放以重新排序。第一个选项卡将作为默认页面。最多支持3个自定义选项卡。", "Lưu Menu": "保存菜单",`
};

for (const [lang, trans] of Object.entries(missingTrans)) {
  const regex = new RegExp(`^(\\s*${lang}:\\s*\\{)(?=[\\s\\S])`, 'gm');
  let count = 0;
  content = content.replace(regex, (match, p1) => {
    count++;
    if (count <= 2) {
      return `${p1}\n    ${trans}\n`;
    }
    return match;
  });
}

content = content.replace(/"Phone Number"/g, '"Phone"');
content = content.replace(/Kéo thả để sắp xếp thứ tự ưu tiên\. Tab đầu tiên sẽ là trang hiển thị mặc định\. Hỗ trợ tạo tối đa 3 custom tab\./g, '{t("Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.")}');

fs.writeFileSync('src/App.tsx', content);
console.log('Dictionaries updated!');
