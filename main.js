/* Joshua M Le — Simulation Console
   Everything on screen is generated here, live. No libraries. */
(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Boot sequence — authored, skippable, once per session
     ============================================================ */
  const boot = document.getElementById("boot");
  const bootLog = document.getElementById("boot-log");
  const bootSkip = document.getElementById("boot-skip");

  const BOOT_LINES = [
    "JML/OS v1.0 · simulation console",
    "> integrity check ............... OK",
    "> gpu adapter ................... QUERYING",
    "> modules: render input comms ... LOADED",
    "> subject ....................... LE, JOSHUA M",
    "> role .......................... SOFTWARE ENGINEER",
    "> domains ....................... VR / GAMES / SIMULATION",
    "> generating world ..............",
  ];

  let bootDone = false;
  function endBoot() {
    if (bootDone) return;
    bootDone = true;
    boot.classList.remove("active");
    boot.classList.add("done");
    boot.setAttribute("aria-hidden", "true");
    try { sessionStorage.setItem("jml-booted", "1"); } catch (_) {}
    document.removeEventListener("keydown", bootKey);
  }
  function bootKey(e) { if (e.key === "Escape") endBoot(); }

  const seen = (() => {
    try { return sessionStorage.getItem("jml-booted") === "1"; } catch (_) { return false; }
  })();

  if (!reduceMotion && !seen) {
    boot.classList.add("active");
    boot.setAttribute("aria-hidden", "false");
    bootSkip.addEventListener("click", endBoot);
    document.addEventListener("keydown", bootKey);

    let li = 0, ci = 0, acc = "";
    const t0 = performance.now();
    (function typeBoot(now) {
      if (bootDone) return;
      // type speed: whole sequence lands in ~2.8s
      const target = Math.min(((now - t0) / 2800) * totalChars(), totalChars());
      while (charCount() < target && li < BOOT_LINES.length) {
        const line = BOOT_LINES[li];
        if (ci < line.length) { acc += line[ci++]; }
        else { acc += "\n"; li++; ci = 0; }
      }
      bootLog.textContent = acc;
      if (li >= BOOT_LINES.length) { setTimeout(endBoot, 420); return; }
      requestAnimationFrame(typeBoot);
    })(t0);

    function totalChars() {
      return BOOT_LINES.reduce((n, l) => n + l.length + 1, 0);
    }
    function charCount() { return acc.length; }
  }

  /* ============================================================
     Live scene — WebGL wireframe terrain + stars + icosahedron
     ============================================================ */
  const canvas = document.getElementById("sim");
  const modeEl = document.getElementById("t-mode");
  let gl = null;
  try {
    gl = canvas.getContext("webgl", { antialias: true, alpha: true });
  } catch (_) { gl = null; }

  const DPR = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0;

  function resize() {
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    const res = document.getElementById("t-res");
    if (res) res.textContent = `${W}×${H}`;
  }
  addEventListener("resize", resize);
  resize();

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p));
    }
    return p;
  }

  let drawScene = null;

  if (gl) {
    try {
      /* ---------- shared transform: rotate globe, tilt, project ---------- */
      const XFORM = `
        vec3 xform(vec3 a, float time, out float face) {
          float r = 0.7 + time * 0.06;
          float c = cos(r), s = sin(r);
          vec3 p = vec3(c*a.x + s*a.z, a.y, -s*a.x + c*a.z);
          float ct = cos(0.42), st = sin(0.42);
          p = vec3(p.x, ct*p.y - st*p.z, st*p.y + ct*p.z);
          face = p.z;
          return p;
        }
        uniform float u_yoff;
        vec4 project(vec3 p, vec2 view) {
          vec3 w = p * 1.18 + vec3(0.0, u_yoff, 0.0);
          float depth = 3.2 - w.z;
          return vec4(w.x * 1.9 / depth / view.x, w.y * 1.9 / depth, 0.5, 1.0);
        }
      `;

      /* ---------- stars ---------- */
      const STAR_VS = `
        precision highp float;
        attribute vec3 a_star;
        uniform float u_time;
        varying float v_a;
        void main() {
          v_a = 0.35 + 0.65 * (0.5 + 0.5 * sin(u_time * 0.7 + a_star.z * 6.2831));
          gl_Position = vec4(a_star.x, a_star.y, 0.9, 1.0);
          gl_PointSize = 1.0 + 1.6 * fract(a_star.z * 7.31);
        }
      `;
      const STAR_FS = `
        precision highp float;
        varying float v_a;
        void main() { gl_FragColor = vec4(0.75, 0.95, 0.95, v_a * 0.8); }
      `;
      const NSTARS = 220;
      const stars = [];
      let sSeed = 12345;
      const rand = () => (sSeed = (sSeed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < NSTARS; i++)
        stars.push(rand() * 2 - 1, rand() * 2 - 1, rand());
      const starProg = program(STAR_VS, STAR_FS);
      const sb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stars), gl.STATIC_DRAW);
      const sStar = gl.getAttribLocation(starProg, "a_star");
      const sTime = gl.getUniformLocation(starProg, "u_time");

      /* ---------- the Earth, as data: 2-degree land bitmask (Natural Earth 110m) ---------- */
      const LAND_B64 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf4AP/AAAAAAAAAAAAAAAAAAAAAAAAX/z///+AAAAAAAABAAAAAAAAAAAAAYd8P///wAA+AAAAAA8AAAAAAAAAAAwAnw////4AAIAAAAAAGAAAAAAAAAAADivwAf//wAAAAADAAf/wAHYAAAAAADoi3sAP//gAAAAAMAD///sAAAAgBgACfwz/AD/+gAAAwAEHf///+/8gBAP/7/nJdjwD/+AAAH/AA7f///////f4P//////h8H/gAAAf/6//f////////Mf/////9H4D8AeAA+ev///////////AP/////4A0B4AAAD5/////////////Af3////gHgA4AAAH5///////////LwAHgH///gHkAAAAAH4/////////+CIAABAB///4D+AAAAGCx/////////4A8AAIAAf///n/gAAAOCD/////////wA4AAAAAf///n/wAAAbP///////////AgAAAAAP/////wAAADf//////////9AAAAAAAF////0YAAAB///////////9AAAAAAAD////8EAAAB///////////5AAAAAAAD////2AAAAB/f5fP//////wAAAAAAAD////gAAAAfxnwPP//////jAAAAAAAD////AAAAAPCb3/n/////+CAAAAAAAD///8AAAAAfALf/n////+ECAAAAAAAB///8AAAAAGHQP/n/////mMAAAAAAAA///8AAAAAH+Ai///////E8AAAAAAAAf//wAAAAAP/AA///////BgAAAAAAAAP//gAAAAAf/73///////gAAAAAAAAAD/AQAAAAAf////f/////gAAAAAAAAAF+AQAAAAB///+/n/////AAAAAAAAAAC+AAAAAAB///+f0H////AAAAAAAAAAAeAwAAAAD////f/B///8gAAAAAAAAAAeGEAAAAH////v+B/z/AAAAAAAAAAAAPMAgAAAD////n+A/B+gAAAAAAAAAAAD8AAAAAD////n4AeB/AgAAAAAAAAAAAPAAAAAH////3gAcAfAgAAAAAAAAAAADAAAAAD////6AAcAfggAAAAAAAAAAABDwAAAD////8wAMATAIAAAAAAAAAAAAr/AAAB/////gAKASAAAAAAAAAAAAAAH/gAAA/////gACAAAIAAAAAAAAAAAAH/8AAAaH///AAAAsGAAAAAAAAAAAAAH/+AAAAB//+AAAAUOAAAAAAAAAAAAAP/+AAAAB//8AAAAYegAAAAAAAAAAAAP//gAAAD//4AAAAMeBgAAAAAAAAAAAP//8AAAB//wAAAAGdiuAAAAAAAAAAAf///AAAA//wAAAACAQHgAAAAAAAAAAP///gAAA//wAAAABwAHwgAAAAAAAAAH///AAAA//wAAAAACIDQIAAAAAAAAAH//+AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//wgAAAAAPxgBAAAAAAAAAA//8AAAA//jgAAAAAf5gAAAAAAAAAAAf/8AAAA//DgAAAAAf/gAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/wAAAAf/DAAAAAH//4AAAAAAAAAAAf/AAAAAf+CAAAAAH//8AAAAAAAAAAAf/AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/gAAAAAAAAAAAAACAH4AIAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB+AAAAAAAAAAAAAAAAAAAGAAAAAAAAB6AAAAAAAAAAAAAAAAAwAMAAAAAAAAA8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAACAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAeAAIP+f/gAAAAAAAAAAAMAAAAAAABP/+H//////AAAAAAAAAAA+AAAAAf////8////////AAAAAAAOEAPAAAB///////////////gAAAP//T//8AAAH//////////////+AAAH/////4AAAH///////////////8AAE//////4ABw////////////////8AAAD//////gCA////////////////wAAAf/////////////////////////+A/4A///////////////////////////////////////////////////////////////////////////////////////";
      const latLonToXYZ = (lat, lon) => {
        const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
        const cl = Math.cos(la);
        return [cl * Math.sin(lo), Math.sin(la), cl * Math.cos(lo)];
      };
      const bin = atob(LAND_B64);
      const dotArr = [];
      for (let r = 0; r < 90; r++) {
        for (let c = 0; c < 180; c++) {
          const i = r * 180 + c;
          if (bin.charCodeAt(i >> 3) & (128 >> (i & 7))) {
            dotArr.push(...latLonToXYZ(89 - r * 2 + (rand() - 0.5) * 1.4, -179 + c * 2 + (rand() - 0.5) * 1.4));
          }
        }
      }
      const NDOTS = dotArr.length / 3;

      const DOT_VS = `
        precision highp float;
        attribute vec3 a_pos;
        uniform float u_time;
        uniform vec2 u_view;
        uniform float u_dpr;
        varying float v_face;
        ${XFORM}
        void main() {
          vec3 p = xform(a_pos, u_time, v_face);
          gl_Position = project(p, u_view);
          gl_PointSize = (1.0 + 1.6 * smoothstep(-1.0, 1.0, v_face)) * u_dpr;
        }
      `;
      const DOT_FS = `
        precision highp float;
        varying float v_face;
        void main() {
          float a = mix(0.05, 0.42, smoothstep(-0.35, 0.5, v_face));
          gl_FragColor = vec4(0.263, 0.945, 0.894, a);
        }
      `;
      const dotProg = program(DOT_VS, DOT_FS);
      const db = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, db);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dotArr), gl.STATIC_DRAW);
      const dPos = gl.getAttribLocation(dotProg, "a_pos");
      const dTime = gl.getUniformLocation(dotProg, "u_time");
      const dView = gl.getUniformLocation(dotProg, "u_view");
      const dDpr = gl.getUniformLocation(dotProg, "u_dpr");
      const dYoff = gl.getUniformLocation(dotProg, "u_yoff");

      /* ---------- network routes between hubs ---------- */
      const CYAN = [0.263, 0.945, 0.894], AMBER = [1.0, 0.706, 0.329], MAGENTA = [1.0, 0.239, 0.627];
      const HUBS = {
        sat: [29.4, -98.5],  sfo: [37.8, -122.4], dca: [38.9, -77.0],
        gru: [-23.5, -46.6], lhr: [51.5, -0.1],   fra: [50.1, 8.7],
        jnb: [-26.2, 28.0],  dxb: [25.2, 55.3],   bom: [19.1, 72.9],
        sin: [1.35, 103.8],  hnd: [35.7, 139.7],  icn: [37.6, 127.0],
        syd: [-33.9, 151.2], kef: [64.1, -21.9],
      };
      const ROUTES = [
        ["sat", "sfo", CYAN], ["sat", "dca", CYAN], ["sat", "gru", CYAN],
        ["sat", "lhr", AMBER], ["sat", "hnd", CYAN], ["sat", "sin", CYAN],
        ["sat", "dxb", CYAN], ["dca", "lhr", CYAN], ["lhr", "fra", CYAN],
        ["lhr", "jnb", CYAN], ["fra", "bom", CYAN], ["bom", "sin", CYAN],
        ["sin", "syd", CYAN], ["hnd", "icn", CYAN], ["sfo", "hnd", AMBER],
        ["gru", "jnb", CYAN], ["kef", "lhr", CYAN], ["dxb", "icn", MAGENTA],
      ];
      const slerp = (a, b, t) => {
        const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
        const th = Math.acos(d);
        if (th < 1e-4) return a.slice();
        const s = Math.sin(th);
        const k1 = Math.sin((1 - t) * th) / s, k2 = Math.sin(t * th) / s;
        return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
      };
      const SEG = 44;
      const arcArr = [];
      ROUTES.forEach(([a, b, col], ri) => {
        const A = latLonToXYZ(...HUBS[a]), B = latLonToXYZ(...HUBS[b]);
        const th = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
        const lift = 0.04 + 0.20 * (th / Math.PI);
        const phase = (ri * 0.61803) % 1;
        let prev = null;
        for (let i = 0; i <= SEG; i++) {
          const t = i / SEG;
          const p = slerp(A, B, t);
          const k = 1 + lift * Math.sin(Math.PI * t);
          const v = [p[0] * k, p[1] * k, p[2] * k, t, phase, col[0], col[1], col[2]];
          if (prev) arcArr.push(...prev, ...v);
          prev = v;
        }
      });
      const NARCV = arcArr.length / 8;

      const ARC_VS = `
        precision highp float;
        attribute vec3 a_pos;
        attribute vec2 a_meta;
        attribute vec3 a_col;
        uniform float u_time;
        uniform vec2 u_view;
        varying float v_face; varying float v_t; varying float v_ph; varying vec3 v_col;
        ${XFORM}
        void main() {
          vec3 p = xform(a_pos, u_time, v_face);
          gl_Position = project(p, u_view);
          v_t = a_meta.x; v_ph = a_meta.y; v_col = a_col;
        }
      `;
      const ARC_FS = `
        precision highp float;
        uniform float u_time;
        varying float v_face; varying float v_t; varying float v_ph; varying vec3 v_col;
        void main() {
          float p1 = fract(u_time * 0.10 + v_ph);
          float p2 = fract(-u_time * 0.085 + v_ph * 1.61);
          float g = exp(-pow((v_t - p1) * 22.0, 2.0)) + exp(-pow((v_t - p2) * 22.0, 2.0));
          float face = mix(0.10, 1.0, smoothstep(-0.3, 0.4, v_face));
          gl_FragColor = vec4(v_col, (0.09 + g * 0.85) * face);
        }
      `;
      const arcProg = program(ARC_VS, ARC_FS);
      const ab = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, ab);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arcArr), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(arcProg, "a_pos");
      const aMeta = gl.getAttribLocation(arcProg, "a_meta");
      const aCol = gl.getAttribLocation(arcProg, "a_col");
      const aTime = gl.getUniformLocation(arcProg, "u_time");
      const aView = gl.getUniformLocation(arcProg, "u_view");
      const aYoff = gl.getUniformLocation(arcProg, "u_yoff");

      /* ---------- hub nodes ---------- */
      const nodeArr = [];
      Object.keys(HUBS).forEach((k, i) => {
        const p = latLonToXYZ(...HUBS[k]);
        const col = k === "sat" ? AMBER : CYAN;
        nodeArr.push(p[0], p[1], p[2], col[0], col[1], col[2], (i * 0.37) % 1);
      });
      const NNODES = nodeArr.length / 7;
      const NODE_VS = `
        precision highp float;
        attribute vec3 a_pos;
        attribute vec3 a_col;
        attribute float a_ph;
        uniform float u_time;
        uniform vec2 u_view;
        uniform float u_dpr;
        varying float v_face; varying vec3 v_col;
        ${XFORM}
        void main() {
          vec3 p = xform(a_pos * 1.005, u_time, v_face);
          gl_Position = project(p, u_view);
          float pulse = 0.5 + 0.5 * sin(u_time * 2.0 + a_ph * 6.2831);
          gl_PointSize = (4.0 + 3.0 * pulse) * u_dpr * smoothstep(-0.2, 0.3, v_face);
          v_col = a_col;
        }
      `;
      const NODE_FS = `
        precision highp float;
        varying float v_face; varying vec3 v_col;
        void main() {
          vec2 d = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.08, length(d)) * smoothstep(-0.15, 0.35, v_face);
          gl_FragColor = vec4(v_col, a * 0.9);
        }
      `;
      const nodeProg = program(NODE_VS, NODE_FS);
      const nb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, nb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nodeArr), gl.STATIC_DRAW);
      const nPos = gl.getAttribLocation(nodeProg, "a_pos");
      const nCol = gl.getAttribLocation(nodeProg, "a_col");
      const nPh = gl.getAttribLocation(nodeProg, "a_ph");
      const nTime = gl.getUniformLocation(nodeProg, "u_time");
      const nView = gl.getUniformLocation(nodeProg, "u_view");
      const nDpr = gl.getUniformLocation(nodeProg, "u_dpr");
      const nYoff = gl.getUniformLocation(nodeProg, "u_yoff");

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      if (modeEl) modeEl.textContent = "WEBGL";

      drawScene = (t) => {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const aspect = W / H;
        const yOff = aspect < 0.8 ? -0.78 : -0.46;

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(starProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, sb);
        gl.enableVertexAttribArray(sStar);
        gl.vertexAttribPointer(sStar, 3, gl.FLOAT, false, 0, 0);
        gl.uniform1f(sTime, t);
        gl.drawArrays(gl.POINTS, 0, NSTARS);

        gl.useProgram(dotProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, db);
        gl.enableVertexAttribArray(dPos);
        gl.vertexAttribPointer(dPos, 3, gl.FLOAT, false, 0, 0);
        gl.uniform1f(dTime, t);
        gl.uniform2f(dView, aspect, 1.0);
        gl.uniform1f(dDpr, DPR);
        gl.uniform1f(dYoff, yOff);
        gl.drawArrays(gl.POINTS, 0, NDOTS);

        // routes and nodes glow additively, like light on glass
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.useProgram(arcProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, ab);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(aMeta);
        gl.vertexAttribPointer(aMeta, 2, gl.FLOAT, false, 32, 12);
        gl.enableVertexAttribArray(aCol);
        gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 32, 20);
        gl.uniform1f(aTime, t);
        gl.uniform2f(aView, aspect, 1.0);
        gl.uniform1f(aYoff, yOff);
        gl.drawArrays(gl.LINES, 0, NARCV);

        gl.useProgram(nodeProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, nb);
        gl.enableVertexAttribArray(nPos);
        gl.vertexAttribPointer(nPos, 3, gl.FLOAT, false, 28, 0);
        gl.enableVertexAttribArray(nCol);
        gl.vertexAttribPointer(nCol, 3, gl.FLOAT, false, 28, 12);
        gl.enableVertexAttribArray(nPh);
        gl.vertexAttribPointer(nPh, 1, gl.FLOAT, false, 28, 24);
        gl.uniform1f(nTime, t);
        gl.uniform2f(nView, aspect, 1.0);
        gl.uniform1f(nDpr, DPR);
        gl.uniform1f(nYoff, yOff);
        gl.drawArrays(gl.POINTS, 0, NNODES);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      };
    } catch (err) {
      gl = null; // shader failure → 2D fallback
    }
  }

  /* ---------- 2D fallback: starfield + horizon ---------- */
  if (!gl) {
    const ctx = canvas.getContext("2d");
    if (modeEl) modeEl.textContent = "2D";
    const stars2d = [];
    for (let i = 0; i < 140; i++)
      stars2d.push({ x: Math.random(), y: Math.random() * 0.7, p: Math.random() });
    drawScene = (t) => {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(190,240,240,0.8)";
      stars2d.forEach(s => {
        const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t + s.p * 6.28));
        ctx.globalAlpha = a;
        ctx.fillRect(s.x * W, s.y * H, 1.5, 1.5);
      });
      ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
      g.addColorStop(0, "rgba(67,241,228,0)");
      g.addColorStop(1, "rgba(67,241,228,0.10)");
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);
    };
  }

  /* boot log tells the truth: report the adapter the page actually got */
  BOOT_LINES[2] = "> gpu adapter ................... " + (gl ? "WEBGL" : "CANVAS-2D");
  BOOT_LINES[7] = "> generating world .............. OK";

  /* ============================================================
     Scroller — sine-wave marquee
     ============================================================ */
  const track = document.getElementById("scroller-track");
  let chars = [];
  if (track && !reduceMotion) {
    const text = track.textContent;
    track.textContent = "";
    const frag = document.createDocumentFragment();
    // duplicate for seamless loop
    for (let rep = 0; rep < 2; rep++) {
      for (const ch of text) {
        const s = document.createElement("span");
        s.textContent = ch === " " ? " " : ch;
        frag.appendChild(s);
      }
    }
    track.appendChild(frag);
    chars = Array.from(track.children);
  }
  let trackW = 0;
  function measureTrack() { trackW = track ? track.scrollWidth / 2 : 0; }
  if (track) { measureTrack(); addEventListener("resize", measureTrack); }

  /* ============================================================
     Telemetry
     ============================================================ */
  const fpsEl = document.getElementById("t-fps");
  const timeEl = document.getElementById("t-time");
  let frames = 0, fpsLast = performance.now();

  /* ============================================================
     Main loop
     ============================================================ */
  const start = performance.now();
  let sineOK = innerWidth > 720;
  addEventListener("resize", () => { sineOK = innerWidth > 720; });

  // keep the world alive but quiet behind content
  function applyDim() {
    const dim = Math.max(0.38, 1 - (scrollY / Math.max(H, 1)) * 0.75);
    canvas.style.opacity = dim.toFixed(2);
  }

  function frame(now) {
    const t = (now - start) / 1000;

    if (drawScene && !reduceMotion) drawScene(t);
    applyDim();

    if (track && trackW > 0 && !reduceMotion) {
      const x = -((t * 90) % trackW);
      track.style.transform = `translateX(${x}px)`;
      if (sineOK && chars.length) {
        for (let i = 0; i < chars.length; i++) {
          chars[i].style.transform =
            `translateY(${(Math.sin(t * 2.2 + i * 0.28) * 5).toFixed(1)}px)`;
        }
      }
    }

    frames++;
    if (now - fpsLast >= 1000) {
      if (fpsEl) fpsEl.textContent = String(frames);
      frames = 0;
      fpsLast = now;
    }
    if (timeEl) {
      const s = Math.floor(t);
      timeEl.textContent =
        String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    // one composed still frame; telemetry shows a static state
    const still = () => { if (drawScene) drawScene(8); };
    still();
    applyDim();
    addEventListener("resize", still);
    addEventListener("scroll", applyDim, { passive: true });
    if (fpsEl) fpsEl.textContent = "--";
  } else {
    requestAnimationFrame(frame);
  }
})();
