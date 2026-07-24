# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and hiring managers evaluating Joshua for software engineering roles. They arrive with limited time, want to assess skills and experience quickly, and need a clear path to make contact.

## Product Purpose

A personal portfolio site for Joshua, hosted at mininoob.github.io (GitHub Pages). Success means a visiting recruiter forms a credible, positive impression of Joshua as a software engineer and reaches out.

## Positioning

Software engineer working in virtual reality and game development (confirmed by Joshua). The portfolio should position for software engineering roles with VR/game dev as the distinguishing strength.

## Operating Context

- Static site served by GitHub Pages from this repository (Mininoob.github.io, `main` branch).
- Visitors likely arrive from a resume link, GitHub profile, or application; often on desktop but mobile must work.

## Capabilities and Constraints

- Must be publishable as a static site (GitHub Pages; no server-side runtime).
- Confirmed skills (union of both resumes, 2026-07): Languages — C, C++, C#, Rust, Swift, Java, Python, JavaScript, TypeScript, x86 assembly. Tools — Git, Unity 3D, Vulkan, Docker, React, ROS, SwiftUI, Tauri, FastAPI, Blender, 3ds Max, MATLAB, MySQL, MongoDB, Wireshark, Ghidra, IDA Pro, Sleuth Kit, Autopsy (Rust/Swift/Vulkan/Tauri/FastAPI confirmed via personal projects).
- Education: University of Texas at San Antonio, B.S. Computer Science (Honors, 3.5 GPA), minor in cyber security & digital forensics, 2023. Based in Texas, US.
- Display preference (user, 2026-07): the formal education entry (school/degree/GPA) is NOT listed on the site; location (Texas, US) shows only in the footer. The study emphasis IS displayed: cyber operations, cyber security, and digital forensics appear as Systems capability rows plus a "formally trained in…" line.
- **Project Wildfire** (user-provided, 2026-07): Microsoft HoloLens firefighting tool — simulates wildfires from real GIS, vegetation, and weather data with plume simulation to project fire spread/path for firefighting support. Attribution confirmed by Joshua: done with UTSA SAVE Lab and NASA MIRO CAMEE, around 2022 (site tags it "research · UTSA SAVE Lab × NASA MIRO CAMEE · 2022").
- CACI internship projects (user-provided detail, 2026-07): **ACND** — real-time cyber defense dashboard; AI model trained to detect and mitigate attacks on HMI/SCADA/PLC infrastructure in real time. **Cityblock** — digital-twin security platform spinning up virtual environments for simulation/pen-testing, emulating hardware with VMs or linking live hardware with real-time data. **Lego Digital Twin** — photogrammetry-captured live Lego environment in Unity 3D synced to real PLC data (STEM outreach with Port San Antonio).
- Personal project (user-provided, 2026-07): **Polymage** — custom C++/Vulkan game engine powering a multiplayer open-world voxel mage game (towns, cities, dungeons, co-op boss fights). In development; no public link yet. Docked in Bay P-01.
- Personal project (user-provided, 2026-07, detail updated): **Pinq** — local-first sticky-note & personal knowledge app (Rust, Tauri 2, TypeScript, SolidJS, SQLite), cross-platform Windows/macOS. Always-on-top transparent notes, screen-edge pull-to-create gesture, virtual-desktop awareness, searchable note library; Rust core + SolidJS frontend. Offline-first sync engine: append-only action log, version-vector delta exchange, conflict-safe merging with no central server. E2E-encrypted P2P sync over LAN: mDNS discovery, SPAKE2 pairing with safety-number verification, Ed25519 device identities, ChaCha20-Poly1305 payload encryption, optional encrypted relay for off-network sync, cryptographic device eviction via space-key rotation. Near-realtime co-editing via encrypted presence protocol (eager push path, ~15s worst-case → sub-second propagation). On-device semantic tag/related-note suggestions with local ONNX embedding model — note content never leaves the machine. Platform-level fixes: macOS keyboard-focus loss (makeKeyAndOrderFront: semantics), dual-stack IPv4/IPv6 listener gaps, OS keychain identity handling. Docked in Bay P-02 (condensed).
- Personal project (user-provided, 2026-07): **OriginalCopy** — photobooth platform, full-stack (iOS + backend + web), built and shipped end to end. SwiftUI/iOS booth app (MVVM, live camera capture, image processing, Epson ePOS thermal receipt printing, offline-resilient telemetry sync with retry); FastAPI backend (SQLAlchemy + SQLite, versioned HTTP/JSON REST API, device enrollment, media uploads, telemetry, multi-tenant owner accounts, token+password auth across five access roles); server-rendered mobile-friendly guest claim & gallery pages (view/save/share/download photos & recap videos, password-gated public event galleries); vanilla JS operator dashboard (live booth health, activity feeds, usage stats, media/claim management, remote command push). Production forensics: made claim/telemetry endpoints idempotent to kill duplicate-request 500s, fixed inflated download metric. Deployed via Docker Compose behind Caddy (auto-TLS/HSTS) + nginx, release-based symlink-swap deploys with instant rollback on self-managed Linux. Docked in Bay P-03 (condensed).
- Resume: published 2026-07 at /JoshuaLe_Resume.pdf (phone-free version provided by Joshua from ~/Resumes/JoshuaLe_Resume.pdf; lists Houston, Texas + email only).
- Open decisions (do not invent): public links for Polymage, Pinq, and OriginalCopy.

## Brand Commitments

- Presents under Joshua's real name: **Joshua M Le**. "Mininoob" is the GitHub handle, not the site identity.
- Pinned aesthetic direction (user-stated): classic terminal-style emulation with a cyber/hacking vibe, steered toward a research / simulation register — VR, games, and simulation character over pure retro nostalgia. This is a binding preference for the portfolio's visual world.
- No logo or other binding brand assets exist yet.

## Evidence on Hand

- Resume (provided 2026-07, at ~/Downloads/Software-Engineer-Joshua-Le-ALL-Points.pdf; not committed to the repo). Confirmed work: CACI International — Software Engineer (2024–present, medical triage simulator) and SE Intern (2022–2024, Unity digital-twin security platform, React security dashboard); UTSA SAVE Lab — Graduate Researcher (2022–2023): cybersickness dataset from participants walking a procedurally generated VR maze for 10 minutes (gaze, heart rate, and more — the "Mazed and Confused" 2024 dataset), predictive model >90% accuracy; the resume's "Unity AR emergency-response app" line is deliberately NOT shown on Module 06 (user removed it — that work is represented by Project Wildfire, Module 04); NASA MIRO CAMEE — Undergraduate Researcher (2020–2022): (a) autonomous rover + drone LiDAR terrain-mapping platform, (b) coastal reconnaissance with the V-RBNN algorithm — LiDAR data + sensor fusion in C++/Python/ROS (two separate modules on the site); FIRST Tech Challenge robotics mentor (2021–2026, concluded).
- Publications: 2025 (IEEE) "Predicting and Explaining Cognitive Load, Attention, and Working Memory in Virtual Multitasking"; 2024 "Mazed and Confused: A Dataset of Cybersickness, Working Memory, Mental Load, Physical Load, and Attention During a Real Walking Task in VR".
- Second resume provided 2026-07 (~/Downloads/Uploaded resume (2).pdf, also contains phone number): adds Java/MATLAB/Sleuth Kit/Autopsy, B.S. + 3.5 GPA, IEEE venue, AR plume/fire simulation detail, FIRST Tech Challenge mentorship facts ($10K equipment, five-student team, regional qualification). CACI intern start date confirmed as March 2022 by the final published resume; site says "2022–2024".
- GitHub account: Mininoob. Display preference (user, 2026-07): GitHub link removed from the site (account is sparse); do not re-add without asking. Employer/research projects have no public links; do not invent any.

## Product Principles

1. Credibility over flash: every claim on the site must be true and backed by real work.
2. Fast evaluation: a recruiter should grasp who Joshua is and what they do within seconds of landing.
3. Clear path to contact: reaching Joshua is never more than one obvious step away.
4. Real work leads: featured projects, once chosen, carry the persuasion — not adjectives.
