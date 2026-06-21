const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const URLs = [
  { name: 'digital_twin_animation', url: 'http://localhost:3000/digital-twin' },
  { name: 'simulator_animation', url: 'http://localhost:3000/simulator' }
];

async function main() {
  console.log('Starting browser to record videos...');
  const browser = await chromium.launch({ headless: true });
  
  for (const item of URLs) {
    const videoDir = path.join(__dirname, '..', 'public', 'docs');
    const context = await browser.newContext({
      recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } }
    });
    
    const page = await context.newPage();
    console.log(`Navigating to ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    
    console.log(`Recording 5 seconds for ${item.name}...`);
    await page.waitForTimeout(5000); // Record for 5 seconds
    
    await context.close(); // Closing context saves the video
    
    // Find the newest webm file in the directory
    const files = fs.readdirSync(videoDir)
      .filter(f => f.endsWith('.webm'))
      .map(f => ({ name: f, time: fs.statSync(path.join(videoDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);
      
    if (files.length > 0) {
      const videoPath = path.join(videoDir, files[0].name);
      const gifPath = path.join(videoDir, `${item.name}.gif`);
      
      console.log(`Converting to GIF: ${gifPath}...`);
      // Use ffmpeg to convert to gif. Scale to 800px width for reasonable file size.
      // Filter: scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse
      try {
        execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${gifPath}"`, { stdio: 'inherit' });
        console.log(`Created ${item.name}.gif`);
        // Clean up webm
        fs.unlinkSync(videoPath);
      } catch (e) {
        console.error('Error generating gif', e.message);
      }
    }
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
