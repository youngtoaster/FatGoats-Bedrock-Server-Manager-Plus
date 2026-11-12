import React, { useState, useEffect } from 'react';
import './NoclipepeUpdateLoader.css';

/**
 * NoclipepeUpdateLoader: Recreates noclipepe's iconic animated pixel construction loading bar
 * ("I made a loading bar you can't stop watching")
 * Reference: https://designeer.xyz/finds/noclipepe-2119881447687569842
 *
 * @param {Object} props
 * @param {number} props.percent - Progress percentage (0 - 100)
 * @param {number} [props.stage=1] - Current execution stage (1-5)
 * @param {string} [props.progressText] - Live telemetry description
 * @param {string} [props.targetCommit] - Target GitHub commit hash
 */
export const NoclipepeUpdateLoader = ({
  percent = 0,
  stage = 1,
  progressText = 'Installing update...',
  targetCommit = null,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Live retro clock in top status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentDate(`${month}/${day}`);
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const roundedPercent = Math.min(100, Math.max(0, Math.round(percent)));

  // Maximum wall advancement before reaching the right site office shack
  const MAX_WALL_X = 504;
  const wallWidth = Math.max(0, Math.min(MAX_WALL_X, (roundedPercent / 100) * MAX_WALL_X));
  const frontX = wallWidth;

  // Clamped percentage box X position so it stays within capsule view
  const signX = Math.max(38, Math.min(504, frontX));

  // Dynamic phrase matching original video
  let mainPhrase = 'Installing update...';
  if (roundedPercent >= 30 && roundedPercent < 86) {
    mainPhrase = 'Almost there...';
  } else if (roundedPercent >= 86 && roundedPercent < 99) {
    mainPhrase = '99%. Any minute now.';
  } else if (roundedPercent >= 99) {
    mainPhrase = 'Almost done! Finalizing...';
  }

  const isNearingEnd = roundedPercent >= 86;
  const isComplete = roundedPercent >= 99;

  return (
    <div className="noclipepe-container">
      {/* Top Status Bar: Author credit & Live Clock */}
      <div className="noclipepe-topbar">
        <div className="noclipepe-author">
          <span style={{ opacity: 0.5 }}>by</span>
          <a
            href="https://designeer.xyz/finds/noclipepe-2119881447687569842"
            target="_blank"
            rel="noopener noreferrer"
            title="Inspired by noclipepe on Designeer"
          >
            @noclipepe
          </a>
        </div>
        <div className="noclipepe-clock">
          <span>{currentDate} {currentTime}</span>
          <div className="noclipepe-battery" title="System battery / power status">
            <div className="noclipepe-battery-fill" />
          </div>
        </div>
      </div>

      {/* Main Extruded Capsule Bezel */}
      <div className="noclipepe-capsule-bezel">
        <div className="noclipepe-viewport">
          <svg
            className="noclipepe-svg"
            viewBox="0 0 640 140"
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
          >
            <defs>
              {/* Sky Gradient */}
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5fa5e6" />
                <stop offset="65%" stopColor="#8ec4f4" />
                <stop offset="100%" stopColor="#bde0fa" />
              </linearGradient>

              {/* Pixel Brick Texture Pattern */}
              <pattern
                id="pixelBricks"
                width="16"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                {/* Mortar Background */}
                <rect width="16" height="12" fill="#d8ccb8" />
                {/* Row 1 Bricks */}
                <rect x="0" y="1" width="7" height="4" fill="#c04828" />
                <rect x="0" y="2" width="7" height="2" fill="#d25834" />
                <rect x="8" y="1" width="7" height="4" fill="#9e361c" />
                <rect x="8" y="2" width="7" height="2" fill="#bc4626" />
                {/* Row 2 Bricks (Staggered by 4px) */}
                <rect x="4" y="7" width="7" height="4" fill="#d05432" />
                <rect x="4" y="8" width="7" height="2" fill="#de6644" />
                <rect x="12" y="7" width="4" height="4" fill="#a43a1e" />
                <rect x="0" y="7" width="3" height="4" fill="#a43a1e" />
              </pattern>

              {/* Brick Wall Clip Path (Dynamic Width) */}
              <clipPath id="brickWallClip">
                <rect x="0" y="26" width={wallWidth} height="78" />
              </clipPath>
            </defs>

            {/* LAYER 0: Sky Background */}
            <rect x="0" y="0" width="640" height="140" fill="url(#skyGrad)" />

            {/* LAYER 1: Distant City Skyline Silhouettes */}
            <g opacity="0.6">
              {/* Distant building blocks */}
              <rect x="30" y="72" width="28" height="34" fill="#7888aa" />
              <rect x="58" y="65" width="22" height="41" fill="#6c7a9c" />
              <rect x="80" y="78" width="35" height="28" fill="#7888aa" />
              <rect x="135" y="68" width="30" height="38" fill="#6c7a9c" />
              <rect x="165" y="74" width="24" height="32" fill="#7888aa" />
              <rect x="210" y="62" width="36" height="44" fill="#667494" />
              <rect x="246" y="70" width="28" height="36" fill="#7888aa" />
              <rect x="310" y="66" width="32" height="40" fill="#6c7a9c" />
              <rect x="342" y="75" width="26" height="31" fill="#7888aa" />
              <rect x="390" y="63" width="34" height="43" fill="#667494" />
              <rect x="440" y="71" width="30" height="35" fill="#7888aa" />
              <rect x="590" y="68" width="40" height="38" fill="#6c7a9c" />

              {/* Scattered yellow glowing windows in buildings */}
              <rect x="64" y="72" width="3" height="3" fill="#ffea8a" />
              <rect x="70" y="78" width="3" height="3" fill="#ffea8a" />
              <rect x="142" y="76" width="3" height="3" fill="#ffea8a" />
              <rect x="220" y="70" width="3" height="3" fill="#ffea8a" />
              <rect x="228" y="80" width="3" height="3" fill="#ffea8a" />
              <rect x="320" y="74" width="3" height="3" fill="#ffea8a" />
              <rect x="402" y="72" width="3" height="3" fill="#ffea8a" />
            </g>

            {/* LAYER 2: Sun & Radiating Rays */}
            <g transform="translate(450, 34)">
              {/* Radiating 8-ray pixel sunbeams */}
              <g
                style={{
                  transformOrigin: '0 0',
                  animation: 'sunPulse 3s infinite ease-in-out',
                }}
              >
                {/* Cardinal rays */}
                <rect x="-2" y="-22" width="4" height="6" fill="#fed844" />
                <rect x="-2" y="16" width="4" height="6" fill="#fed844" />
                <rect x="-22" y="-2" width="6" height="4" fill="#fed844" />
                <rect x="16" y="-2" width="6" height="4" fill="#fed844" />
                {/* Diagonal rays */}
                <rect x="11" y="11" width="4" height="4" fill="#fed844" />
                <rect x="-15" y="11" width="4" height="4" fill="#fed844" />
                <rect x="11" y="-15" width="4" height="4" fill="#fed844" />
                <rect x="-15" y="-15" width="4" height="4" fill="#fed844" />
              </g>
              {/* Sun Body */}
              <circle cx="0" cy="0" r="11" fill="#fffbe2" stroke="#fed844" strokeWidth="3" />
            </g>

            {/* LAYER 3: Animated Pixel Clouds */}
            <g style={{ animation: 'cloudDrift1 34s linear infinite' }}>
              <rect x="-100" y="18" width="42" height="7" fill="#ffffff" rx="1" />
              <rect x="-92" y="14" width="26" height="6" fill="#ffffff" rx="1" />
              <rect x="-84" y="25" width="36" height="3" fill="#e2f0fb" />
            </g>
            <g style={{ animation: 'cloudDrift2 48s linear infinite' }}>
              <rect x="-140" y="38" width="55" height="8" fill="#ffffff" rx="1" />
              <rect x="-130" y="33" width="32" height="7" fill="#ffffff" rx="1" />
              <rect x="-120" y="46" width="45" height="3" fill="#e2f0fb" />
            </g>

            {/* Flying Birds */}
            <g style={{ animation: 'birdFly 18s linear infinite' }}>
              <path d="M70,44 Q73,41 76,44 Q79,41 82,44" stroke="#3e4a5e" strokeWidth="1.6" fill="none" />
              <path d="M88,48 Q91,45 94,48 Q97,45 100,48" stroke="#3e4a5e" strokeWidth="1.6" fill="none" />
              <path d="M80,54 Q82,52 84,54 Q86,52 88,54" stroke="#3e4a5e" strokeWidth="1.4" fill="none" />
            </g>

            {/* LAYER 4: Top Industrial Track Girder */}
            <rect x="0" y="12" width="640" height="11" fill="#2c3540" />
            <rect x="0" y="14" width="640" height="2" fill="#3f4b59" />
            {/* Rivets along the girder */}
            {Array.from({ length: 32 }).map((_, i) => (
              <rect key={i} x={i * 20 + 8} y="18" width="3" height="3" fill="#181e26" />
            ))}
            {/* Bottom track lip */}
            <rect x="0" y="23" width="640" height="3" fill="#1b2128" />

            {/* LAYER 5: Ground & Walkway Platform */}
            <rect x="0" y="104" width="640" height="3" fill="#ece4d4" />
            <rect x="0" y="107" width="640" height="15" fill="#c8beaa" />
            {/* Walkway plank seam dividers */}
            {Array.from({ length: 26 }).map((_, i) => (
              <rect key={i} x={i * 25 + 12} y="107" width="1.5" height="15" fill="#a49884" />
            ))}
            {/* Foundation beam below */}
            <rect x="0" y="122" width="640" height="18" fill="#3a3228" />
            {/* Support pilings */}
            {Array.from({ length: 13 }).map((_, i) => (
              <rect key={i} x={i * 50 + 20} y="122" width="8" height="18" fill="#262018" />
            ))}

            {/* LAYER 6: Destination Site Office Shack (At right side) */}
            <g id="siteOfficeShack">
              {/* Shack Main Teal Body */}
              <rect x="496" y="68" width="76" height="36" fill="#235c53" />
              {/* Horizontal wooden siding texture */}
              <line x1="496" y1="74" x2="572" y2="74" stroke="#1d4d46" strokeWidth="1" />
              <line x1="496" y1="80" x2="572" y2="80" stroke="#1d4d46" strokeWidth="1" />
              <line x1="496" y1="86" x2="572" y2="86" stroke="#1d4d46" strokeWidth="1" />
              <line x1="496" y1="92" x2="572" y2="92" stroke="#1d4d46" strokeWidth="1" />
              <line x1="496" y1="98" x2="572" y2="98" stroke="#1d4d46" strokeWidth="1" />

              {/* Roof overhang */}
              <polygon points="492,68 576,68 571,63 496,63" fill="#1b2128" />

              {/* Chimney */}
              <rect x="506" y="48" width="10" height="16" fill="#171d24" />
              <rect x="504" y="46" width="14" height="3" fill="#242c38" />

              {/* Animated Chimney Smoke Puffs */}
              <circle
                cx="511"
                cy="42"
                r="3.5"
                fill="#ffffff"
                style={{ animation: 'smokePuff1 2.4s infinite ease-out' }}
              />
              <circle
                cx="513"
                cy="40"
                r="4.5"
                fill="#f0f6fc"
                style={{ animation: 'smokePuff2 2.4s infinite 1.2s ease-out' }}
              />

              {/* Cute Black Cat Perched on Roof */}
              <g transform="translate(548, 55)">
                {/* Body */}
                <rect x="0" y="3" width="11" height="6" fill="#121418" rx="1.5" />
                {/* Head & Ears */}
                <rect x="7" y="1" width="6" height="6" fill="#121418" rx="1" />
                <polygon points="7,1 9,-3 10,1" fill="#121418" />
                <polygon points="11,1 12,-3 13,1" fill="#121418" />
                {/* Glowing Green Cat Eyes */}
                <circle cx="9" cy="3" r="0.8" fill="#52e488" />
                <circle cx="12" cy="3" r="0.8" fill="#52e488" />
                {/* Animated Wagging Cat Tail */}
                <path
                  d="M0,7 Q-4,5 -4,1"
                  stroke="#121418"
                  strokeWidth="1.6"
                  fill="none"
                  style={{
                    animation: 'catTailWag 2s infinite ease-in-out',
                    transformOrigin: '0 7px',
                  }}
                />
              </g>

              {/* Glowing Window */}
              <rect x="508" y="76" width="18" height="18" fill="#ffd952" stroke="#ffffff" strokeWidth="2" />
              <line x1="517" y1="76" x2="517" y2="94" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="508" y1="85" x2="526" y2="85" stroke="#ffffff" strokeWidth="1.5" />

              {/* Doorway */}
              <rect x="542" y="76" width="20" height="28" fill="#3e2316" stroke="#22120a" strokeWidth="1.5" />
              <circle cx="546" cy="90" r="1.5" fill="#f4c430" />

              {/* Safety Traffic Cones */}
              <g transform="translate(482, 92)">
                <polygon points="5,0 0,12 10,12" fill="#f45624" />
                <polygon points="4,4 2,8 8,8 6,4" fill="#ffffff" />
                <rect x="-1" y="12" width="12" height="2" fill="#181818" />
              </g>
              <g transform="translate(578, 92)">
                <polygon points="5,0 0,12 10,12" fill="#f45624" />
                <polygon points="4,4 2,8 8,8 6,4" fill="#ffffff" />
                <rect x="-1" y="12" width="12" height="2" fill="#181818" />
              </g>

              {/* Yellow Blinking Arrow (Active when >= 86%) */}
              {isNearingEnd && (
                <g
                  transform="translate(552, 38)"
                  style={{ animation: 'yellowArrowBlink 0.65s infinite ease-in-out' }}
                >
                  <polygon
                    points="0,14 -7,4 -3,4 -3,-8 3,-8 3,4 7,4"
                    fill="#ffde38"
                    stroke="#221c04"
                    strokeWidth="1.8"
                  />
                </g>
              )}
            </g>

            {/* LAYER 7: Advancing Red Brick Wall (Progress Bar Fill) */}
            <g clipPath="url(#brickWallClip)">
              <rect x="0" y="26" width="640" height="78" fill="url(#pixelBricks)" />
              {/* Dark Coping Timber Cap along Top */}
              <rect x="0" y="24" width="640" height="4" fill="#3c2214" stroke="#22120a" strokeWidth="0.8" />
              {/* Bottom Mortar Footing */}
              <rect x="0" y="102" width="640" height="2.5" fill="#582414" />
            </g>

            {/* LAYER 8: Construction Workers on Wall (At 99-100% Celebration) */}
            {isComplete && (
              <g style={{ animation: 'cheerWave 0.7s infinite ease-in-out' }}>
                {/* Cheering Worker 1 on wall top */}
                <g transform="translate(260, 5)">
                  <circle cx="8" cy="6" r="4" fill="#f4c430" />
                  <rect x="5" y="10" width="6" height="8" fill="#e85c24" />
                  <line x1="2" y1="5" x2="6" y2="10" stroke="#f4c430" strokeWidth="2" />
                  <line x1="14" y1="5" x2="10" y2="10" stroke="#f4c430" strokeWidth="2" />
                </g>
                {/* Cheering Worker 2 on wall top */}
                <g transform="translate(420, 5)">
                  <circle cx="8" cy="6" r="4" fill="#f4c430" />
                  <rect x="5" y="10" width="6" height="8" fill="#2e4c7e" />
                  <line x1="2" y1="5" x2="6" y2="10" stroke="#f4c430" strokeWidth="2" />
                  <line x1="14" y1="5" x2="10" y2="10" stroke="#f4c430" strokeWidth="2" />
                </g>
              </g>
            )}

            {/* LAYER 9: Active Construction Front Scaffolding & Worker */}
            {frontX > 6 && frontX < MAX_WALL_X && (
              <g transform={`translate(${frontX - 16}, 0)`}>
                {/* Scaffolding Platform Lattice */}
                <rect x="0" y="44" width="3" height="60" fill="#a86e2c" />
                <rect x="22" y="44" width="3" height="60" fill="#a86e2c" />
                {/* Crossbars */}
                <line x1="2" y1="50" x2="23" y2="50" stroke="#8c5820" strokeWidth="2" />
                <line x1="2" y1="74" x2="23" y2="74" stroke="#8c5820" strokeWidth="2" />
                <line x1="2" y1="52" x2="23" y2="72" stroke="#8c5820" strokeWidth="1.5" />
                <line x1="2" y1="72" x2="23" y2="52" stroke="#8c5820" strokeWidth="1.5" />
                {/* Upper Platform Plank */}
                <rect x="-3" y="42" width="30" height="3" fill="#d29648" />

                {/* Hardhat Construction Worker on Top Platform */}
                <g transform="translate(4, 21)">
                  {/* Yellow Hardhat */}
                  <rect x="4" y="0" width="9" height="5" fill="#f4c430" rx="1" />
                  <rect x="3" y="4" width="11" height="2" fill="#d8a818" />
                  {/* Face */}
                  <rect x="5" y="6" width="6" height="5" fill="#ffcf9e" />
                  {/* Orange Safety Vest */}
                  <rect x="3" y="11" width="10" height="7" fill="#e85c24" />
                  <rect x="6" y="11" width="4" height="7" fill="#f8e830" />
                  {/* Blue Pants */}
                  <rect x="4" y="18" width="4" height="5" fill="#2a4574" />
                  <rect x="9" y="18" width="4" height="5" fill="#2a4574" />
                  {/* Swinging Trowel Hand */}
                  <g
                    style={{
                      transformOrigin: '12px 13px',
                      animation: 'trowelSwing 0.75s infinite ease-in-out',
                    }}
                  >
                    <line x1="10" y1="13" x2="16" y2="10" stroke="#ffcf9e" strokeWidth="2" />
                    <polygon points="16,8 20,10 18,13" fill="#d2d8e0" stroke="#48505a" strokeWidth="0.8" />
                  </g>
                </g>
              </g>
            )}

            {/* LAYER 10: Overhead Hanging Percentage Sign */}
            <g transform={`translate(${signX}, 0)`}>
              {/* Dual steel struts from track rail */}
              <line x1="-16" y1="18" x2="-16" y2="28" stroke="#1c222c" strokeWidth="2" />
              <line x1="16" y1="18" x2="16" y2="28" stroke="#1c222c" strokeWidth="2" />
              {/* Trolley wheel brackets on the top girder */}
              <rect x="-18" y="15" width="4" height="4" fill="#10141a" />
              <rect x="14" y="15" width="4" height="4" fill="#10141a" />

              {/* Crisp White Sign Board with Bold Border */}
              <rect
                x="-30"
                y="28"
                width="60"
                height="26"
                rx="2"
                fill="#ffffff"
                stroke="#1c222c"
                strokeWidth="2.5"
              />
              {/* Retro Pixel Percentage Text */}
              <text
                x="0"
                y="46"
                textAnchor="middle"
                fill="#1c222c"
                fontSize="14"
                fontWeight="800"
                fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
                letterSpacing="-0.02em"
              >
                {roundedPercent}%
              </text>
            </g>

            {/* LAYER 11: Ground Workers & Animated Equipment */}
            <g id="groundActivity">
              {/* Cement Mixer Machine at x = 240 */}
              <g transform="translate(235, 78)">
                {/* Tripod Stand */}
                <line x1="6" y1="20" x2="0" y2="28" stroke="#2a2e38" strokeWidth="2.5" />
                <line x1="16" y1="20" x2="22" y2="28" stroke="#2a2e38" strokeWidth="2.5" />
                <line x1="11" y1="20" x2="11" y2="28" stroke="#1c2026" strokeWidth="2" />
                {/* Motor housing */}
                <rect x="-2" y="14" width="8" height="9" fill="#3a404c" rx="1" />
                {/* Vibrating Rotating Mixer Drum */}
                <g style={{ animation: 'mixerVibrate 0.25s infinite' }}>
                  <ellipse cx="12" cy="12" rx="11" ry="9" fill="#e85c24" stroke="#c04414" strokeWidth="1.5" />
                  <ellipse cx="12" cy="12" rx="7" ry="5" fill="#f4743e" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                </g>
              </g>

              {/* Walking Ground Worker with Bricks at x = 160 */}
              <g
                transform="translate(170, 77)"
                style={{ animation: 'workerWalkCycle 0.6s infinite ease-in-out' }}
              >
                {/* Helmet */}
                <rect x="4" y="0" width="8" height="4" fill="#f4c430" rx="1" />
                {/* Face */}
                <rect x="5" y="4" width="5" height="4" fill="#ffcf9e" />
                {/* Shirt */}
                <rect x="3" y="8" width="8" height="8" fill="#3a72b8" />
                {/* Legs */}
                <rect x="3" y="16" width="3" height="10" fill="#223654" />
                <rect x="8" y="16" width="3" height="10" fill="#223654" />
                {/* Stack of Red Bricks in hands */}
                <rect x="11" y="9" width="8" height="3" fill="#c04828" stroke="#682412" strokeWidth="0.5" />
                <rect x="11" y="6" width="8" height="3" fill="#c04828" stroke="#682412" strokeWidth="0.5" />
                <rect x="11" y="3" width="8" height="3" fill="#c04828" stroke="#682412" strokeWidth="0.5" />
              </g>

              {/* Second Ground Worker standing near mixer */}
              <g transform="translate(265, 78)">
                <rect x="3" y="0" width="8" height="4" fill="#f4c430" rx="1" />
                <rect x="4" y="4" width="5" height="4" fill="#ffcf9e" />
                <rect x="2" y="8" width="8" height="8" fill="#e85c24" />
                <rect x="3" y="16" width="3" height="9" fill="#263852" />
                <rect x="7" y="16" width="3" height="9" fill="#263852" />
                {/* Arm pointing / holding wrench */}
                <line x1="8" y1="12" x2="14" y2="10" stroke="#ffcf9e" strokeWidth="2" />
                <rect x="13" y="8" width="2" height="5" fill="#a4b0c0" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Dynamic Phrase & Step Telemetry Below Pill */}
      <div className="noclipepe-caption-area">
        <div className="noclipepe-main-phrase">{mainPhrase}</div>
        <div className="noclipepe-sub-telemetry">
          <span className="noclipepe-stage-badge">Stage {stage}/5</span>
          <span className="truncate" style={{ maxWidth: 360 }}>
            {progressText}
          </span>
          {targetCommit && (
            <span style={{ opacity: 0.7 }}>
              • Target: #{targetCommit.slice(0, 7)}
            </span>
          )}
          <span className="noclipepe-safe-badge">• 100% Data Preserved</span>
        </div>
      </div>
    </div>
  );
};

export default NoclipepeUpdateLoader;
