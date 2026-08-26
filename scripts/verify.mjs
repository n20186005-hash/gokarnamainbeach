import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const fail = (msg) => { console.error(`✗ ${msg}`); process.exitCode = 1; };
const ok = (msg) => console.log(`✓ ${msg}`);
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const pkg = JSON.parse(read('package.json'));
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const floating = Object.entries(allDeps).filter(([, v]) => /^(\^|~|>|<|=|\*|latest|workspace:)/.test(v) || /\bx\b/i.test(v));
if (floating.length) fail(`依赖存在浮动版本: ${floating.map(([k,v]) => `${k}@${v}`).join(', ')}`); else ok('package.json 依赖均为精确版本');
if (!/^pnpm@\d+\.\d+\.\d+$/.test(pkg.packageManager || '')) fail('packageManager 未固定完整 pnpm 版本'); else ok(`packageManager=${pkg.packageManager}`);
if (!/^\d+\.\d+\.\d+$/.test(pkg.engines?.node || '')) fail('engines.node 未固定完整版本'); else ok(`Node=${pkg.engines.node}`);
if (read('.node-version').trim() !== pkg.engines.node) fail('.node-version 与 engines.node 不一致'); else ok('.node-version 与 engines.node 一致');

const astroConfig = read('astro.config.mjs');
if (!astroConfig.includes("const SITE = '';")) fail('Astro site 配置不是单一可空入口'); else ok('生产域名只有一个可空配置入口');
if (!astroConfig.includes('SITE ? [sitemap()] : []')) fail('sitemap 未按 site 是否存在进行条件启用'); else ok('sitemap 在 site 为空时禁用');

const sourceFiles = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    ent.isDirectory() ? walk(full) : sourceFiles.push(full);
  }
}
walk(root);
const forbidden = ['example' + '.com', 'local' + 'host', 'chrome-' + 'extension://'];
let found = [];
for (const f of sourceFiles) {
  const ext = path.extname(f);
  if (!['.astro','.ts','.mjs','.css','.json','.jsonc','.md','.txt','.svg','.yaml','.yml'].includes(ext)) continue;
  const s = fs.readFileSync(f, 'utf8');
  for (const token of forbidden) if (s.includes(token)) found.push(`${path.relative(root,f)}:${token}`);
}
if (found.length) fail(`发现禁用占位/协议: ${found.join(', ')}`); else ok('源码未发现禁用占位域名或浏览器扩展协议');

const index = read('src/pages/index.astro');
const required = ['ಇತಿಹಾಸ ಮತ್ತು ಪರಂಪರೆ','ಟಿಕೆಟ್ / ವೆಚ್ಚ','ಪಾರ್ಕಿಂಗ್','ಸಮೀಪದ ಆಹಾರ','ವಿವರವಾದ ಸಾರಿಗೆ','ಸಮೀಪದ ಆಕರ್ಷಣೆಗಳು','ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು','ಗೂಗಲ್'];
const missing = required.filter((x) => !index.includes(x));
if (missing.length) fail(`主页缺少关键板块: ${missing.join(', ')}`); else ok('主页关键内容板块齐全');
if (!index.includes('!1skn!2sin') || !index.includes('!5m2!1skn!2sin')) fail('Google Maps 嵌入未切换 Kannada/India 参数'); else ok('Google Maps 嵌入已切换 Kannada/India 参数');
if (!index.includes("'@type': 'FAQPage'")) fail('缺少 FAQPage 结构化数据'); else ok('FAQPage 结构化数据存在');
if (!index.includes("'TouristAttraction', 'LocalBusiness'")) fail('缺少 TouristAttraction/LocalBusiness 结构化数据'); else ok('景点结构化数据存在');

for (const p of ['src/pages/privacy.astro','src/pages/terms.astro','src/pages/cookies.astro']) {
  if (!fs.existsSync(path.join(root,p))) fail(`缺少独立二级页 ${p}`);
}
ok('隐私、条款、Cookie 均为独立路由文件');

const layout = read('src/layouts/BaseLayout.astro');
if (!layout.includes("prefs.analytics !== true") || !layout.includes('G-HXM22WWPKP')) fail('GA4 未按分析同意状态门控'); else ok('GA4 仅在分析同意后加载');

const ws = path.join(root, 'pnpm-workspace.yaml');
if (fs.existsSync(ws)) {
  const y = fs.readFileSync(ws,'utf8');
  if (!/packages:\s*\n\s*-\s*['\"]?\.['\"]?/.test(y)) fail('pnpm-workspace.yaml packages 未包含当前包');
} else ok('单包项目未创建 pnpm-workspace.yaml');

const wrangler = read('wrangler.jsonc');
if (!wrangler.includes('\"main\": \"@astrojs/cloudflare/entrypoints/server\"')) fail('Wrangler 未使用 Astro Cloudflare 当前统一入口'); else ok('Wrangler 使用 Astro Cloudflare 当前统一入口');

if (process.exitCode) process.exit(process.exitCode);
console.log('\n静态项目约束检查通过。');
