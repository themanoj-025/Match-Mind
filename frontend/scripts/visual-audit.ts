import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Define the breakpoints
const breakpoints = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
];

// Extract routes from App.tsx via simple regex or just list them here.
// For reliability in this script, we'll hardcode the static/primary ones found in App.tsx
// plus some dynamic ones with dummy IDs to see if they render without crashing.
const routes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/about',
  '/faq',
  '/404',
  '/pricing',
  '/search',
  '/dashboard',
  '/leaderboard'
];

const BASE_URL = 'http://localhost:3000';
const IS_AFTER = process.argv.includes('--after');
const AUDIT_DIR = IS_AFTER ? path.join('audit', 'after') : path.join('audit', 'before');

async function run() {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const report: any[] = [];

  for (const route of routes) {
    for (const bp of breakpoints) {
      const page = await browser.newPage({
        viewport: { width: bp.width, height: bp.height }
      });
      
      const url = `${BASE_URL}${route}`;
      console.log(`Auditing ${url} at ${bp.name} (${bp.width}px)`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        // Wait for fonts to load
        await page.evaluate(() => document.fonts.ready);
        // Additional wait for potential animations (like ticker)
        await page.waitForTimeout(500);

        const safeRouteName = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
        const filename = `${safeRouteName}-${bp.name}.png`;
        const filepath = path.join(AUDIT_DIR, filename);

        // 1. Screenshot
        await page.screenshot({ path: filepath, fullPage: true });

        // 2. Programmatic checks
        const metrics = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            headersCount: document.querySelectorAll('header, nav').length,
            tickersCount: document.querySelectorAll('.ticker, .ticker-wrap').length
          };
        });

        const overflow = metrics.scrollWidth > metrics.innerWidth;
        const duplicateHeader = metrics.headersCount > 1;

        report.push({
          route,
          breakpoint: bp.name,
          width: bp.width,
          scrollWidth: metrics.scrollWidth,
          hasHorizontalOverflow: overflow,
          headersCount: metrics.headersCount,
          duplicateHeader,
          screenshot: filepath
        });

      } catch (err) {
        console.error(`Failed on ${route} at ${bp.name}:`, err);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  // Generate markdown report
  const reportPath = IS_AFTER ? path.join('audit', 'resolution-log.md') : path.join('audit', 'defect-inventory.md');
  let md = `# Visual Audit Report (${IS_AFTER ? 'After Fixes' : 'Baseline'})\n\n`;
  md += `| Route | Breakpoint | Overflow? | Headers | Screenshot |\n`;
  md += `|---|---|---|---|---|\n`;

  for (const r of report) {
    const screenshotLink = `[Link](../${r.screenshot.replace(/\\/g, '/')})`;
    md += `| ${r.route} | ${r.breakpoint} | ${r.hasHorizontalOverflow ? 'YES' : 'NO'} (${r.scrollWidth} > ${r.width}) | ${r.headersCount} | ${screenshotLink} |\n`;
  }

  fs.writeFileSync(reportPath, md);
  console.log(`Audit complete. Report saved to ${reportPath}`);
}

run().catch(console.error);
