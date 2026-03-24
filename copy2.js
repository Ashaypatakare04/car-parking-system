const fs = require('fs');

try {
  console.log("Attempting copy...");
  
  const heroSrc = 'C:\\Users\\patak\\.gemini\\antigravity\\brain\\d9d6750a-a684-4254-bffe-9622064ba07c\\hero_1774360096383.png';
  const authSrc = 'C:\\Users\\patak\\.gemini\\antigravity\\brain\\d9d6750a-a684-4254-bffe-9622064ba07c\\auth_1774360564441.png';
  
  if (!fs.existsSync(heroSrc)) throw new Error("Hero source missing: " + heroSrc);
  if (!fs.existsSync(authSrc)) throw new Error("Auth source missing: " + authSrc);
  
  fs.copyFileSync(heroSrc, 'C:\\Users\\patak\\OneDrive\\Documents\\TPMS\\public\\hero.png');
  fs.copyFileSync(authSrc, 'C:\\Users\\patak\\OneDrive\\Documents\\TPMS\\public\\auth.png');
  
  console.log("Copy successful");
} catch(e) {
  console.error("ERROR COPYING:", e);
}
