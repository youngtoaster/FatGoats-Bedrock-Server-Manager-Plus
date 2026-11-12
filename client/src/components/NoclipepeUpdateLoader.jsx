import React, { useState, useEffect } from 'react';
import './NoclipepeUpdateLoader.css';

/**
 * NoclipepeUpdateLoader: Authentic recreation of noclipepe's iconic animated pixel construction loading bar
 * ("I made a loading bar you can't stop watching")
 * Features the active worker crew laying bricks, carrying supplies, mortaring, tapping mallets,
 * and a condensed single-line stage pipeline directly below the building UI.
 *
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
  const MAX_WALL_X = 496;
  const wallWidth = Math.max(0, Math.min(MAX_WALL_X, (roundedPercent / 100) * MAX_WALL_X));
  const frontX = wallWidth;

  // Clamped percentage box X position so it stays within capsule view
  const signX = Math.max(40, Math.min(488, frontX));

  // Dynamic phrase matching original video
  let mainPhrase = 'Laying the foundation...';
  if (roundedPercent >= 20 && roundedPercent < 55) {
    mainPhrase = 'Assembling code updates...';
  } else if (roundedPercent >= 55 && roundedPercent < 86) {
    mainPhrase = 'Almost there...';
  } else if (roundedPercent >= 86 && roundedPercent < 99) {
    mainPhrase = '99%. Any minute now.';
  } else if (roundedPercent >= 99) {
    mainPhrase = 'Wall complete! Finalizing...';
  }

  const isNearingEnd = roundedPercent >= 86;
  const isComplete = roundedPercent >= 99;

  // Stages configuration for condensed pipeline status rail
  const pipelineStages = [
    { num: 1, label: 'Backup' },
    { num: 2, label: 'Sync Git' },
    { num: 3, label: 'Packages' },
    { num: 4, label: 'Client' },
    { num: 5, label: 'Binaries' },
  ];

  // Runner path limits
  const runnerMinX = Math.max(16, frontX + 22);
  const runnerMaxX = 472;
  const showRunner = !isComplete && (runnerMaxX - runnerMinX > 32);

  // Cement mixer placement
  const mixerX = frontX < 330 ? Math.max(frontX + 68, 240) : 440;

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

              {/* Scattered yellow glowing windows */}
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
              <g
                style={{
                  transformOrigin: '0 0',
                  animation: 'sunPulse 3s infinite ease-in-out',
                }}
              >
                <rect x="-2" y="-22" width="4" height="6" fill="#fed844" />
                <rect x="-2" y="16" width="4" height="6" fill="#fed844" />
                <rect x="-22" y="-2" width="6" height="4" fill="#fed844" />
                <rect x="16" y="-2" width="6" height="4" fill="#fed844" />
                <rect x="11" y="11" width="4" height="4" fill="#fed844" />
                <rect x="-15" y="11" width="4" height="4" fill="#fed844" />
                <rect x="11" y="-15" width="4" height="4" fill="#fed844" />
                <rect x="-15" y="-15" width="4" height="4" fill="#fed844" />
              </g>
              <circle cx="0" cy="0" r="11" fill="#fffbe2" stroke="#fed844" strokeWidth="3" />
            </g>

            {/* LAYER 3: Animated Pixel Clouds & Flying Birds */}
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
            <g style={{ animation: 'birdFly 18s linear infinite' }}>
              <path d="M70,44 Q73,41 76,44 Q79,41 82,44" stroke="#3e4a5e" strokeWidth="1.6" fill="none" />
              <path d="M88,48 Q91,45 94,48 Q97,45 100,48" stroke="#3e4a5e" strokeWidth="1.6" fill="none" />
              <path d="M80,54 Q82,52 84,54 Q86,52 88,54" stroke="#3e4a5e" strokeWidth="1.4" fill="none" />
            </g>

            {/* LAYER 4: Top Industrial Track Girder */}
            <rect x="0" y="12" width="640" height="11" fill="#2c3540" />
            <rect x="0" y="14" width="640" height="2" fill="#3f4b59" />
            {Array.from({ length: 32 }).map((_, i) => (
              <rect key={i} x={i * 20 + 8} y="18" width="3" height="3" fill="#181e26" />
            ))}
            <rect x="0" y="23" width="640" height="3" fill="#1b2128" />

            {/* LAYER 5: Ground & Walkway Platform */}
            <rect x="0" y="104" width="640" height="3" fill="#ece4d4" />
            <rect x="0" y="107" width="640" height="15" fill="#c8beaa" />
            {Array.from({ length: 26 }).map((_, i) => (
              <rect key={i} x={i * 25 + 12} y="107" width="1.5" height="15" fill="#a49884" />
            ))}
            <rect x="0" y="122" width="640" height="18" fill="#3a3228" />
            {Array.from({ length: 13 }).map((_, i) => (
              <rect key={i} x={i * 50 + 20} y="122" width="8" height="18" fill="#262018" />
            ))}

            {/* LAYER 6: Destination Site Office Shack (At right side) */}
            <g id="siteOfficeShack">
              <rect x="496" y="68" width="76" height="36" fill="#235c53" />
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

              {/* Chimney Smoke */}
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

              {/* Cat on Roof */}
              <g transform="translate(548, 55)">
                <rect x="0" y="3" width="11" height="6" fill="#121418" rx="1.5" />
                <rect x="7" y="1" width="6" height="6" fill="#121418" rx="1" />
                <polygon points="7,1 9,-3 10,1" fill="#121418" />
                <polygon points="11,1 12,-3 13,1" fill="#121418" />
                <circle cx="9" cy="3" r="0.8" fill="#52e488" />
                <circle cx="12" cy="3" r="0.8" fill="#52e488" />
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
                {/* Cat Heart on complete */}
                {isComplete && (
                  <path
                    d="M6,-8 A2,2 0 0,0 2,-8 A2,2 0 0,0 0,-6 Q0,-4 4,-1 Q8,-4 8,-6 A2,2 0 0,0 6,-8 Z"
                    fill="#ff4060"
                    style={{ animation: 'heartFloat 1.2s infinite ease-in-out' }}
                  />
                )}
              </g>

              {/* Window & Door */}
              <rect x="508" y="76" width="18" height="18" fill="#ffd952" stroke="#ffffff" strokeWidth="2" />
              <line x1="517" y1="76" x2="517" y2="94" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="508" y1="85" x2="526" y2="85" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="542" y="76" width="20" height="28" fill="#3e2316" stroke="#22120a" strokeWidth="1.5" />
              <circle cx="546" cy="90" r="1.5" fill="#f4c430" />

              {/* Traffic Cones */}
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
              <rect x="0" y="24" width="640" height="4" fill="#3c2214" stroke="#22120a" strokeWidth="0.8" />
              <rect x="0" y="102" width="640" height="2.5" fill="#582414" />
            </g>

            {/* STAGGERED BRICK EDGE & ACTIVE MORTAR BED (Laying Bricks Visual) */}
            {frontX > 4 && frontX < MAX_WALL_X && (
              <g>
                {/* Wet mortar seam */}
                <rect x={frontX - 2} y="26" width="3" height="78" fill="#e2d8c6" opacity="0.9" />
                {/* Alternating brick tooth protrusions (Authentic masonry bond) */}
                <rect x={frontX - 6} y="26" width="10" height="11" fill="#c04828" stroke="#7a2a16" strokeWidth="0.8" />
                <rect x={frontX - 2} y="38" width="8" height="11" fill="#a43a1e" stroke="#7a2a16" strokeWidth="0.8" />
                <rect x={frontX - 6} y="50" width="10" height="11" fill="#d05432" stroke="#7a2a16" strokeWidth="0.8" />
                <rect x={frontX - 2} y="62" width="8" height="11" fill="#c04828" stroke="#7a2a16" strokeWidth="0.8" />
                <rect x={frontX - 6} y="74" width="10" height="11" fill="#9e361c" stroke="#7a2a16" strokeWidth="0.8" />
                <rect x={frontX - 2} y="86" width="8" height="14" fill="#b84224" stroke="#7a2a16" strokeWidth="0.8" />

                {/* Ghost brick where Mason 1 is dropping next brick */}
                <rect
                  x={frontX + 4}
                  y="26"
                  width="14"
                  height="11"
                  fill="rgba(192, 72, 40, 0.35)"
                  stroke="#fed844"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                  className="noclipepe-ghost-brick"
                />
              </g>
            )}

            {/* LAYER 8: Active Construction Scaffolding & Masons (Moving with frontX) */}
            {frontX > 4 && frontX < MAX_WALL_X + 10 && (
              <g transform={`translate(${Math.max(6, Math.min(476, frontX - 6))}, 0)`}>
                {/* Wooden Scaffolding Framework */}
                <rect x="0" y="32" width="3.5" height="72" fill="#8c5820" />
                <rect x="28" y="32" width="3.5" height="72" fill="#8c5820" />
                <line x1="2" y1="38" x2="29" y2="38" stroke="#724416" strokeWidth="2" />
                <line x1="2" y1="70" x2="29" y2="70" stroke="#724416" strokeWidth="2" />
                {/* Cross Bracing */}
                <line x1="2" y1="40" x2="28" y2="68" stroke="#724416" strokeWidth="1.5" />
                <line x1="2" y1="68" x2="28" y2="40" stroke="#724416" strokeWidth="1.5" />
                <line x1="2" y1="72" x2="28" y2="100" stroke="#724416" strokeWidth="1.5" />
                <line x1="2" y1="100" x2="28" y2="72" stroke="#724416" strokeWidth="1.5" />
                {/* Platform Planks */}
                <rect x="-4" y="36" width="38" height="4" fill="#cb9448" stroke="#5a3610" strokeWidth="0.5" />
                <rect x="-4" y="68" width="38" height="4" fill="#cb9448" stroke="#5a3610" strokeWidth="0.5" />
                {/* Ready-mix Mortar Bucket & Spare Bricks on Deck */}
                <rect x="20" y="30" width="7" height="6" fill="#3a404c" rx="1" />
                <rect x="21" y="28" width="5" height="2" fill="#d8ccb8" />
                <rect x="-2" y="32" width="6" height="4" fill="#c04828" stroke="#5a1808" strokeWidth="0.5" />

                {/* MASON 1: Top Bricklayer Laying Bricks on the Wall */}
                <g transform="translate(2, 12)">
                  {/* Hardhat */}
                  <rect x="4" y="0" width="10" height="5" fill="#f4c430" rx="1" />
                  <rect x="3" y="4" width="12" height="2" fill="#d8a818" />
                  {/* Face with safety glasses */}
                  <rect x="5" y="6" width="7" height="5" fill="#ffcf9e" />
                  <rect x="9" y="8" width="3" height="2" fill="#1c222c" />
                  {/* Safety Vest */}
                  <rect x="3" y="11" width="11" height="8" fill="#e85c24" />
                  <rect x="6" y="11" width="4" height="8" fill="#f8e830" />
                  {/* Pants */}
                  <rect x="4" y="19" width="4" height="6" fill="#243c66" />
                  <rect x="9" y="19" width="4" height="6" fill="#243c66" />
                  {/* Left hand holding ready brick */}
                  <rect x="-2" y="14" width="6" height="3" fill="#c04828" stroke="#5a1808" strokeWidth="0.5" />
                  {/* Animated Trowel Arm Smoothing Mortar */}
                  <g className="noclipepe-trowel-arm">
                    <line x1="12" y1="14" x2="19" y2="12" stroke="#ffcf9e" strokeWidth="2.4" />
                    <polygon points="19,10 25,12 21,15" fill="#d8e2ec" stroke="#333d48" strokeWidth="0.8" />
                  </g>
                  {/* Active Placed Brick lowering into wall */}
                  <rect
                    x="20"
                    y="13"
                    width="11"
                    height="4"
                    fill="#c04828"
                    stroke="#7a2a16"
                    strokeWidth="0.6"
                    className="noclipepe-placing-brick"
                  />
                  {/* Mortar Sparks popping */}
                  <g className="noclipepe-mortar-sparks">
                    <rect x="22" y="9" width="2" height="2" fill="#ffffff" />
                    <rect x="27" y="12" width="2" height="2" fill="#fed844" />
                    <rect x="24" y="15" width="2" height="2" fill="#ffffff" />
                  </g>
                </g>

                {/* MASON 2: Mid-Level Assistant Tapping with Rubber Mallet */}
                <g transform="translate(6, 44)">
                  {/* Hardhat */}
                  <rect x="4" y="0" width="9" height="5" fill="#f4c430" rx="1" />
                  <rect x="3" y="4" width="11" height="2" fill="#d8a818" />
                  {/* Face */}
                  <rect x="5" y="6" width="6" height="5" fill="#ffcf9e" />
                  {/* Work Shirt */}
                  <rect x="3" y="11" width="10" height="8" fill="#2d4a68" />
                  {/* Pants */}
                  <rect x="4" y="19" width="4" height="6" fill="#5c442a" />
                  <rect x="8" y="19" width="4" height="6" fill="#5c442a" />
                  {/* Mallet arm tapping vertical joint */}
                  <g className="noclipepe-mallet-arm">
                    <line x1="10" y1="13" x2="17" y2="11" stroke="#ffcf9e" strokeWidth="2.2" />
                    <rect x="16" y="8" width="5" height="7" fill="#181818" rx="1" />
                  </g>
                </g>
              </g>
            )}

            {/* LAYER 9: Ground Construction Zone & Active Workers */}
            <g id="groundCrew">
              {/* Supply Depot Pallet of Red Bricks near Shack */}
              <g transform="translate(470, 96)">
                {/* Wooden Pallet */}
                <rect x="0" y="7" width="22" height="3" fill="#8c5820" />
                <rect x="2" y="10" width="3" height="2" fill="#5a3610" />
                <rect x="10" y="10" width="3" height="2" fill="#5a3610" />
                <rect x="18" y="10" width="3" height="2" fill="#5a3610" />
                {/* Brick Stacks */}
                <rect x="2" y="3" width="9" height="4" fill="#c04828" stroke="#5a1808" strokeWidth="0.5" />
                <rect x="11" y="3" width="9" height="4" fill="#c04828" stroke="#5a1808" strokeWidth="0.5" />
                <rect x="5" y="-1" width="9" height="4" fill="#d05432" stroke="#5a1808" strokeWidth="0.5" />
                {/* Portland Cement Bag */}
                <rect x="-10" y="3" width="8" height="7" fill="#e2d8c6" stroke="#9a8c78" strokeWidth="0.6" rx="1" />
                <rect x="-8" y="5" width="4" height="3" fill="#f4c430" />
              </g>

              {/* Cement Mixer & Operator */}
              <g transform={`translate(${mixerX}, 77)`}>
                {/* Tripod Stand */}
                <line x1="6" y1="20" x2="0" y2="28" stroke="#2a2e38" strokeWidth="2.5" />
                <line x1="16" y1="20" x2="22" y2="28" stroke="#2a2e38" strokeWidth="2.5" />
                <line x1="11" y1="20" x2="11" y2="28" stroke="#1c2026" strokeWidth="2" />
                <rect x="-2" y="14" width="8" height="9" fill="#3a404c" rx="1" />
                {/* Vibrating Mixer Drum */}
                <g className="noclipepe-mixer-vibrate">
                  <ellipse cx="12" cy="12" rx="11" ry="9" fill="#e85c24" stroke="#c04414" strokeWidth="1.5" />
                  <ellipse cx="12" cy="12" rx="7" ry="5" fill="#f4743e" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                </g>
                {/* Mixer Operator with Shovel */}
                <g transform="translate(24, 0)">
                  <rect x="3" y="0" width="8" height="4" fill="#f4c430" rx="1" />
                  <rect x="4" y="4" width="5" height="4" fill="#ffcf9e" />
                  <rect x="2" y="8" width="8" height="8" fill="#3a5a80" />
                  <rect x="3" y="16" width="3" height="11" fill="#243448" />
                  <rect x="7" y="16" width="3" height="11" fill="#243448" />
                  {/* Shovel in hand */}
                  <g className="noclipepe-shovel-swing">
                    <line x1="-3" y1="12" x2="5" y2="14" stroke="#8c5820" strokeWidth="1.8" />
                    <polygon points="-7,11 -3,10 -3,14 -7,13" fill="#6a7888" stroke="#333d48" strokeWidth="0.8" />
                  </g>
                </g>
              </g>

              {/* GROUND WORKER 1: The Brick Carrier Running Back & Forth */}
              {showRunner && (
                <g
                  className="noclipepe-brick-runner"
                  style={{
                    '--runner-start': `${runnerMinX}px`,
                    '--runner-end': `${runnerMaxX}px`,
                  }}
                >
                  <rect x="4" y="0" width="8" height="4" fill="#f4c430" rx="1" />
                  <rect x="5" y="4" width="5" height="4" fill="#ffcf9e" />
                  <rect x="3" y="8" width="8" height="8" fill="#e85c24" />
                  <rect x="5" y="8" width="3" height="8" fill="#f8e830" />
                  {/* Legs */}
                  <rect x="3" y="16" width="3" height="11" fill="#223654" className="noclipepe-leg-left" />
                  <rect x="8" y="16" width="3" height="11" fill="#223654" className="noclipepe-leg-right" />
                  {/* Stack of Red Bricks carried in hands */}
                  <g className="noclipepe-carried-bricks">
                    <rect x="9" y="8" width="8" height="3" fill="#c04828" stroke="#682412" strokeWidth="0.5" />
                    <rect x="9" y="5" width="8" height="3" fill="#c04828" stroke="#682412" strokeWidth="0.5" />
                    <rect x="9" y="2" width="8" height="3" fill="#c04828" stroke="#682412" strokeWidth="0.5" />
                  </g>
                </g>
              )}
            </g>

            {/* LAYER 10: Overhead Hanging Percentage Sign */}
            <g transform={`translate(${signX}, 0)`}>
              <line x1="-16" y1="18" x2="-16" y2="28" stroke="#1c222c" strokeWidth="2" />
              <line x1="16" y1="18" x2="16" y2="28" stroke="#1c222c" strokeWidth="2" />
              <rect x="-18" y="15" width="4" height="4" fill="#10141a" />
              <rect x="14" y="15" width="4" height="4" fill="#10141a" />

              {/* Crisp White Sign Board with Bold Border */}
              <rect
                x="-32"
                y="28"
                width="64"
                height="26"
                rx="2"
                fill={isComplete ? '#ecfdf5' : '#ffffff'}
                stroke={isComplete ? '#10b981' : '#1c222c'}
                strokeWidth="2.5"
              />
              <text
                x="0"
                y="46"
                textAnchor="middle"
                fill={isComplete ? '#047857' : '#1c222c'}
                fontSize="14"
                fontWeight="800"
                fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
                letterSpacing="-0.02em"
              >
                {isComplete ? '100% ✓' : `${roundedPercent}%`}
              </text>
            </g>

            {/* LAYER 11: 100% Complete Celebration Fireworks & Cheering Crew */}
            {isComplete && (
              <g className="noclipepe-celebration">
                {/* Cheering Worker on Wall Top */}
                <g transform="translate(240, 5)" className="noclipepe-cheer-worker">
                  <circle cx="8" cy="6" r="4" fill="#f4c430" />
                  <rect x="5" y="10" width="6" height="8" fill="#e85c24" />
                  <line x1="2" y1="4" x2="6" y2="10" stroke="#f4c430" strokeWidth="2" />
                  <line x1="14" y1="4" x2="10" y2="10" stroke="#f4c430" strokeWidth="2" />
                </g>
                {/* Cheering Worker on Scaffold */}
                <g transform="translate(420, 5)" className="noclipepe-cheer-worker">
                  <circle cx="8" cy="6" r="4" fill="#f4c430" />
                  <rect x="5" y="10" width="6" height="8" fill="#2e4c7e" />
                  <line x1="2" y1="4" x2="6" y2="10" stroke="#f4c430" strokeWidth="2" />
                  <line x1="14" y1="4" x2="10" y2="10" stroke="#f4c430" strokeWidth="2" />
                </g>
                {/* Colorful Confetti */}
                <rect x="180" y="15" width="3" height="3" fill="#f43f5e" className="noclipepe-confetti-1" />
                <rect x="220" y="25" width="3" height="3" fill="#10b981" className="noclipepe-confetti-2" />
                <rect x="290" y="18" width="3" height="3" fill="#38bdf8" className="noclipepe-confetti-3" />
                <rect x="360" y="22" width="3" height="3" fill="#facc15" className="noclipepe-confetti-1" />
                <rect x="440" y="14" width="3" height="3" fill="#a855f7" className="noclipepe-confetti-2" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Dynamic Phrase & Condensed 5-Stage Pipeline Status Rail Directly Below Viewport */}
      <div className="noclipepe-caption-area">
        <div className="noclipepe-main-phrase">{mainPhrase}</div>

        {/* Condensed Pipeline Rail (Single unified sleek row replacing separate bulky bars) */}
        <div className="noclipepe-pipeline-rail">
          {pipelineStages.map((stg) => {
            const isDone = stage > stg.num || roundedPercent >= stg.num * 20;
            const isActive = stage === stg.num && !isDone;
            return (
              <div
                key={stg.num}
                className={`noclipepe-rail-step ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
              >
                <span className="noclipepe-rail-dot">
                  {isDone ? '✓' : stg.num}
                </span>
                <span className="noclipepe-rail-label">{stg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Live Sub-Telemetry */}
        <div className="noclipepe-sub-telemetry">
          <span className="noclipepe-stage-badge">Stage {stage}/5</span>
          <span className="noclipepe-progress-detail" title={progressText}>
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
