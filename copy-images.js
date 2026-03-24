const fs = require('fs');
try {
  fs.copyFileSync('C:\\Users\\patak\\.gemini\\antigravity\\brain\\d9d6750a-a684-4254-bffe-9622064ba07c\\hero_1774356689582.png', 'C:\\Users\\patak\\OneDrive\\Documents\\TPMS\\public\\hero.png');
  fs.copyFileSync('C:\\Users\\patak\\.gemini\\antigravity\\brain\\d9d6750a-a684-4254-bffe-9622064ba07c\\auth_1774356849418.png', 'C:\\Users\\patak\\OneDrive\\Documents\\TPMS\\public\\auth.png');
  console.log('Done copying images.');
} catch (e) {
  console.error(e);
}
