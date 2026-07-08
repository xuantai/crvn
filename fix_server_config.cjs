const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const searchDefault = `  feature4Title: "Bố cục mang đậm dấu ấn cá nhân",
  feature4Desc: "Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.",`;

const replaceDefault = `  feature4Title: "Bố cục mang đậm dấu ấn cá nhân",
  feature4Desc: "Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.",
  featuresTitle: "Được thiết kế cho trải nghiệm đỉnh cao",
  featuresSub: "Tích hợp những công nghệ hiện đại nhất để tối ưu hóa quy trình phân phối và lưu trữ nội bộ.",`;

code = code.replace(searchDefault, replaceDefault);

const searchPost = `      feature3Title, feature3Desc, feature4Title, feature4Desc,
      cloudSyncEnabled, systemIp,`;

const replacePost = `      feature3Title, feature3Desc, feature4Title, feature4Desc,
      featuresTitle, featuresSub,
      cloudSyncEnabled, systemIp,`;

code = code.replace(searchPost, replacePost);

const searchUpdate = `    landingConfig.feature4Title = feature4Title !== undefined ? feature4Title : landingConfig.feature4Title;
    landingConfig.feature4Desc = feature4Desc !== undefined ? feature4Desc : landingConfig.feature4Desc;`;

const replaceUpdate = `    landingConfig.feature4Title = feature4Title !== undefined ? feature4Title : landingConfig.feature4Title;
    landingConfig.feature4Desc = feature4Desc !== undefined ? feature4Desc : landingConfig.feature4Desc;
    landingConfig.featuresTitle = featuresTitle !== undefined ? featuresTitle : landingConfig.featuresTitle;
    landingConfig.featuresSub = featuresSub !== undefined ? featuresSub : landingConfig.featuresSub;`;

code = code.replace(searchUpdate, replaceUpdate);

fs.writeFileSync('server.ts', code);
