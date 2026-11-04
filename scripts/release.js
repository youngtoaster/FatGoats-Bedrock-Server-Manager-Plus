/**
 * Automated Release Script for FatGoats Bedrock Server Manager+
 * Compiles EXEs, syncs website, tags release, pushes, and uploads executables to GitHub Releases.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const version = pkg.version;
const tagName = `v${version}`;

function run(cmd, cwd = ROOT_DIR) {
  console.log(`\n> ${cmd} (in ${path.relative(ROOT_DIR, cwd) || '.'})`);
  return execSync(cmd, { cwd, stdio: 'inherit', windowsHide: true });
}

function getGitCmd() {
  const candidates = [
    'git',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\IDE\\CommonExtensions\\Microsoft\\TeamFoundation\\Team Explorer\\Git\\cmd\\git.exe',
  ];
  for (const c of candidates) {
    try {
      execSync(`"${c}" --version`, { stdio: 'ignore', windowsHide: true });
      return c;
    } catch (_) {}
  }
  return 'git';
}

async function main() {
  console.log('========================================================');
  console.log(` Publishing Release: ${tagName} (v${version})`);
  console.log('========================================================');

  // Ensure git directory is in PATH for gh CLI
  const gitCmd = getGitCmd();
  const gitDir = path.dirname(gitCmd);
  if (!process.env.PATH.includes(gitDir)) {
    process.env.PATH = `${gitDir}${path.delimiter}${process.env.PATH}`;
  }

  // 1. Build Client
  console.log('\n[1/6] Building Production React Frontend...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run(`${npmCmd} run build`, path.join(ROOT_DIR, 'client'));

  // 2. Sync Website files to client/website
  console.log('\n[2/6] Syncing Showcase Website assets...');
  const websiteSrc = path.join(ROOT_DIR, 'website');
  const websiteDest = path.join(ROOT_DIR, 'client', 'website');
  if (!fs.existsSync(websiteDest)) fs.mkdirSync(websiteDest, { recursive: true });
  fs.cpSync(websiteSrc, websiteDest, { recursive: true });

  // 3. Compile Native Windows Executables
  console.log('\n[3/6] Compiling Native Windows Executables...');
  const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
  if (!fs.existsSync(cscPath)) {
    throw new Error(`C# compiler not found at ${cscPath}`);
  }

  // Compile Tray Launcher
  console.log(' -> Compiling BedrockServerManager.exe...');
  run(
    `"${cscPath}" /target:winexe /out:"${path.join(ROOT_DIR, 'BedrockServerManager.exe')}" /win32icon:"${path.join(ROOT_DIR, 'tray', 'app.ico')}" /r:System.dll,System.Drawing.dll,System.Windows.Forms.dll,System.Core.dll "${path.join(ROOT_DIR, 'tray', 'Program.cs')}"`
  );

  // Compile Setup Installer
  console.log(' -> Compiling BedrockServerManager-Setup.exe...');
  run(
    `"${cscPath}" /target:winexe /out:"${path.join(ROOT_DIR, 'BedrockServerManager-Setup.exe')}" /win32icon:"${path.join(ROOT_DIR, 'tray', 'app.ico')}" /r:System.dll,System.Drawing.dll,System.Windows.Forms.dll,System.Core.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll "${path.join(ROOT_DIR, 'installer', 'Installer.cs')}"`
  );

  // 4. Git Stage & Commit
  console.log('\n[4/6] Staging files and creating release tag...');
  const git = getGitCmd();
  run(`"${git}" add -A`);

  try {
    run(`"${git}" commit -m "chore(release): ${tagName} with precompiled native executables"`);
  } catch (_) {
    console.log('Working tree clean or already committed.');
  }

  // Tag release
  try {
    run(`"${git}" tag -a ${tagName} -m "Release ${tagName}"`);
  } catch (_) {
    console.log(`Tag ${tagName} already exists locally.`);
  }

  // 5. Git Push
  console.log('\n[5/6] Pushing to GitHub...');
  run(`"${git}" push origin main`);
  run(`"${git}" push origin ${tagName}`);

  // 6. Create / Update GitHub Release with Assets
  console.log('\n[6/6] Uploading executables to GitHub Releases...');
  const setupExe = path.join(ROOT_DIR, 'BedrockServerManager-Setup.exe');
  const trayExe = path.join(ROOT_DIR, 'BedrockServerManager.exe');

  const releaseTitle = `${tagName} - FatGoats Bedrock Server Manager+`;
  const releaseNotes = `### FatGoats Bedrock Server Manager+ ${tagName}

#### Pre-built Native Windows Executables:
- **BedrockServerManager-Setup.exe**: Interactive Windows setup installer with prerequisite verification, desktop shortcuts, native tray watchdog, and in-place safe updater.
- **BedrockServerManager.exe**: Lightweight standalone Windows system tray watchdog launcher.

#### What's New in ${tagName}:
- **9-Pass UI Audit & Unslop Redesign**: Applied the strict 9-pass Unslop UI engineering standard across the showcase landing page and administrative console.
- **Disciplined Graphite Neutral Hierarchy**: Consolidated all palette surfaces onto a disciplined Graphite dark ramp (\`#0f0f10\`, \`#141415\`, \`#19191b\`, \`#232325\`) with subtle 8% hairlines (\`rgba(237, 237, 237, 0.08)\`) and high-contrast typography (\`#ffffff\`, \`#ededed\`).
- **Complete Elimination of AI Slop**: Stripped all decorative ambient blur orbs, infinite pulsing keyframes, uppercase tracked badges, and marketing buzzwords. Replaced with quiet, tactile controls and 140ms ease-out transitions.
- **100% Unified Lucide Line Icons**: Replaced all remaining raw emojis across the interface with crisp, tactile Lucide SVG icons.
- **Authentic BDS Process Supervisor Moment**: Real-time unbuffered ANSI stdout terminal stream and live telemetry gauges (20.0 TPS, CPU jitter, memory allocation).
- **1-Click Direct Player Moderation**: Instant 20 HP health restorations, food saturation replenishments, zero-delay administrative kicks, and persistent SQLite bans.
- **1-Click Addon Auto-Installer Pipeline**: Drag-and-drop \`.mcaddon\`, \`.mcpack\`, and \`.zip\` archive unpacker with UUID manifest inspection, companion BP/RP routing, and active world registration in under 1 second.
- **Pre-Compiled Native Windows Binaries**: Freshly compiled native C# executables (\`BedrockServerManager-Setup.exe\` and \`BedrockServerManager.exe\`) uploaded directly to this release.

#### Core Capabilities:
- **Direct Real-Time BDS Process Engine**: Spawns and supervises \`bedrock_server.exe\` with unbuffered IPC pipes, crash watchdog, and automated restarts.
- **World Importer & Generator**: \`.mcworld\` zip importer with LevelDB detection, and seed-based world generator.
- **Playit Zero-Port Tunneling**: Integrated Playit tunnel allocating global public Bedrock IP/port to bypass CGNAT and strict routers without opening ports.
- **MCXboxBroadcast Friend Bridging**: Native Xbox Live friend bridging allowing console players on Xbox Series X/S, PlayStation, and Nintendo Switch to join directly from their Friends tab without DNS tricks.
- **LevelDB Safe Snapshot Engine**: Automated LevelDB snapshots using official Mojang \`save hold\` and \`save query\` chunk-freezing protocol.
`;

  try {
    // Attempt release create
    run(
      `gh release create ${tagName} "${setupExe}" "${trayExe}" --title "${releaseTitle}" --notes "${releaseNotes.replace(/"/g, '\\"')}"`
    );
    console.log(`\n🎉 Successfully published GitHub Release ${tagName} with executables!`);
  } catch (err) {
    console.log('\nRelease may already exist, attempting asset upload...');
    try {
      run(`gh release upload ${tagName} "${setupExe}" "${trayExe}" --clobber`);
      console.log(`\n🎉 Successfully uploaded executables to GitHub Release ${tagName}!`);
    } catch (uploadErr) {
      console.error('\n⚠️ Could not upload via gh CLI:', uploadErr.message);
    }
  }
}

main().catch((err) => {
  console.error('\n❌ Release failed:', err);
  process.exit(1);
});
