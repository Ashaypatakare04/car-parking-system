const { exec } = require('child_process');
const fs = require('fs');

console.log('Starting npm run build test...');
exec('npx next build', (error, stdout, stderr) => {
  const result = {
    error: error ? error.message : null,
    stdout: stdout,
    stderr: stderr
  };
  fs.writeFileSync('build-result.json', JSON.stringify(result, null, 2));
  console.log('Build output written to build-result.json');
});
