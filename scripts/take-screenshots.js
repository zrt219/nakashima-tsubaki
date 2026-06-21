const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://tsubaki-nakashima-ai-mdm6h8td5-zrt219s-projects.vercel.app';
const OUT_DIR = path.join(__dirname, 'public', 'docs');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PAGES = [
  { name: '01_overview_dashboard',       title: 'Executive Overview Dashboard',      path: '/' },
  { name: '02_roadmap_module',           title: 'AI Adoption Roadmap',               path: '/roadmap' },
  { name: '03_rag_knowledge_graph',      title: 'RAG Knowledge Architecture',        path: '/rag' },
  { name: '04_digital_twin_telemetry',   title: 'Digital Twin Telemetry Command',    path: '/simulator' },
  { name: '05_provenance_ledger',        title: 'Cryptographic Provenance Ledger',   path: '/ledger' },
  { name: '06_hitl_advisory',            title: 'Human-in-the-Loop Advisory',        path: '/advisory' },
  { name: '07_safety_governance',        title: 'Safety & Governance Policy Engine', path: '/governance' },
  { name: '08_purdue_architecture',      title: 'Purdue Architecture Bridge',        path: '/architecture' },
  { name: '09_kpi_oee_dashboard',        title: 'KPI & OEE Analytics Dashboard',     path: '/kpis' },
  { name: '10_qa_visual_inspection',     title: 'QA Visual Inspection Module',       path: '/qa' },
  { name: '11_cognitive_swarm',          title: 'Cognitive Swarm Multi-Agent',       path: '/cognitive-swarm' },
  { name: '12_sub_agent_panel',          title: 'TN Sub-Agent Interaction Panel',    path: '/' },
  { name: '13_module_nav_overview',      title: 'Module Navigation & Overview',      path: '/' },
  { name: '14_course_quiz_completion',   title: 'Gamified XP & Badge Completion',    path: '/' },
  { name: '15_mobile_responsive',        title: 'Mobile Responsive Layout',          path: '/' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const page_def of PAGES) {
    try {
      const isMobile = page_def.name === '15_mobile_responsive';
      const context = await browser.newContext({
        viewport: isMobile ? { width: 390, height: 844 } : { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      
      console.log(`Capturing: ${page_def.title} -> ${BASE_URL}${page_def.path}`);
      await page.goto(`${BASE_URL}${page_def.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Extra wait for animations to settle
      await page.waitForTimeout(3000);

      // For sub-agent panel, scroll to show the right panel
      if (page_def.name === '12_sub_agent_panel') {
        // The page already renders the sub-agent panel on right side
        await page.waitForTimeout(2000);
      }
      
      const outPath = path.join(OUT_DIR, `${page_def.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  ✓ Saved: ${outPath}`);
      
      await context.close();
    } catch (err) {
      console.error(`  ✗ Error capturing ${page_def.name}: ${err.message}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ All screenshots captured!');
})();
