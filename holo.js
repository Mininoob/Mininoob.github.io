/* Project holograms: wireframe models drawn live in WebGL, one per project.
   Geometry is generated here in code; nothing is loaded from a file. */
(() => {
  "use strict";

  const canvas = document.getElementById("holo-canvas");
  const stage = document.querySelector(".holo-stage");
  if (!canvas || !stage) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Geometry helpers. Every model is a list of line segments,
     each vertex carrying x, y, z and a glow flag (0 or 1).
     Models live in roughly -1..1 and stand on y = -1.
     ============================================================ */
  const seg = (V, g, a, b) => V.push(a[0], a[1], a[2], g, b[0], b[1], b[2], g);

  function ringPts(cx, cy, cz, r, n, plane, phase) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2 + (phase || 0);
      const c = Math.cos(t) * r, s = Math.sin(t) * r;
      if (plane === "xz") p.push([cx + c, cy, cz + s]);
      else if (plane === "xy") p.push([cx + c, cy + s, cz]);
      else p.push([cx, cy + s, cz + c]);
    }
    return p;
  }

  function chain(V, g, pts, close) {
    for (let i = 0; i < pts.length - 1; i++) seg(V, g, pts[i], pts[i + 1]);
    if (close && pts.length > 2) seg(V, g, pts[pts.length - 1], pts[0]);
  }

  const circle = (V, g, cx, cy, cz, r, n, plane) =>
    chain(V, g, ringPts(cx, cy, cz, r, n, plane), true);

  function boxEdges(V, g, cx, cy, cz, hx, hy, hz) {
    const c = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
      c.push([cx + sx * hx, cy + sy * hy, cz + sz * hz]);
    // index pairs for the 12 edges of the cube
    const E = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
    for (const [a, b] of E) seg(V, g, c[a], c[b]);
  }

  function rect(V, g, x0, y0, x1, y1, z) {
    chain(V, g, [[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]], true);
  }

  function roundedRect(cx, cy, z, hw, hh, r, per) {
    const pts = [];
    const corners = [[hw - r, hh - r, 0], [-hw + r, hh - r, Math.PI / 2],
                     [-hw + r, -hh + r, Math.PI], [hw - r, -hh + r, -Math.PI / 2]];
    for (const [ox, oy, a0] of corners)
      for (let i = 0; i <= per; i++) {
        const t = a0 + (i / per) * (Math.PI / 2);
        pts.push([cx + ox + Math.cos(t) * r, cy + oy + Math.sin(t) * r, z]);
      }
    return pts;
  }

  function arcPts(cx, cy, cz, r, a0, a1, n, plane) {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const t = a0 + (a1 - a0) * (i / n);
      const c = Math.cos(t) * r, s = Math.sin(t) * r;
      if (plane === "xy") p.push([cx + c, cy + s, cz]);
      else if (plane === "xz") p.push([cx + c, cy, cz + s]);
      else p.push([cx, cy + s, cz + c]);
    }
    return p;
  }

  /* ============================================================
     The five models
     ============================================================ */

  function mPolymage(V) {
    // pointed hat
    const brim = ringPts(0, 0.46, 0, 0.5, 7, "xz");
    const base = ringPts(0, 0.5, 0, 0.36, 7, "xz");
    chain(V, 0, brim, true);
    chain(V, 0, base, true);
    for (const p of base) seg(V, 0, p, [0, 1.02, 0]);
    for (let i = 0; i < brim.length; i++) seg(V, 0, brim[i], base[i]);
    // head
    boxEdges(V, 0, 0, 0.26, 0, 0.17, 0.16, 0.15);
    // robe, a seven sided skirt
    const sh = ringPts(0, 0.08, 0, 0.27, 7, "xz");
    const mid = ringPts(0, -0.42, 0, 0.4, 7, "xz");
    const hem = ringPts(0, -0.96, 0, 0.56, 7, "xz");
    chain(V, 0, sh, true); chain(V, 0, mid, true); chain(V, 0, hem, true);
    for (let i = 0; i < 7; i++) { seg(V, 0, sh[i], mid[i]); seg(V, 0, mid[i], hem[i]); }
    // arm reaching to the staff
    seg(V, 0, [0.2, 0.02, 0.05], [0.47, 0.22, 0.12]);
    // staff and orb
    seg(V, 0, [0.54, -0.95, 0.12], [0.54, 0.74, 0.12]);
    const o = [0.54, 0.88, 0.12];
    circle(V, 1, o[0], o[1], o[2], 0.18, 11, "xy");
    circle(V, 1, o[0], o[1], o[2], 0.18, 11, "xz");
    circle(V, 1, o[0], o[1], o[2], 0.18, 11, "zy");
    // sparks around the orb
    for (let i = 0; i < 5; i++) {
      const t = (i / 5) * Math.PI * 2;
      const r0 = 0.22, r1 = 0.3;
      seg(V, 1, [o[0] + Math.cos(t) * r0, o[1] + Math.sin(t) * r0, o[2]],
                [o[0] + Math.cos(t) * r1, o[1] + Math.sin(t) * r1, o[2]]);
    }
  }

  function mPinq(V) {
    // the sticky note mascot: rounded square with a face
    const hw = 0.72, hh = 0.72, r = 0.2;
    const front = roundedRect(0, 0.02, 0.1, hw, hh, r, 4);
    const back = roundedRect(0, 0.02, -0.1, hw, hh, r, 4);
    chain(V, 0, front, true);
    chain(V, 0, back, true);
    for (let i = 0; i < front.length; i += 2) seg(V, 0, front[i], back[i]);
    // eyes
    circle(V, 1, -0.26, 0.2, 0.11, 0.08, 9, "xy");
    circle(V, 1, 0.26, 0.2, 0.11, 0.08, 9, "xy");
    // smile
    chain(V, 1, arcPts(0, 0.02, 0.11, 0.26, -Math.PI * 0.82, -Math.PI * 0.18, 9, "xy"), false);
    // the curled corner, lifting off the sheet
    const curl = [];
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const a = t * Math.PI * 1.3;
      curl.push([0.72 - 0.34 * t - 0.1 * Math.sin(a),
                 -0.7 + 0.3 * t,
                 0.1 + 0.26 * Math.sin(a)]);
    }
    chain(V, 1, curl, false);
    for (let i = 0; i < curl.length; i += 3)
      seg(V, 1, curl[i], [curl[i][0], curl[i][1] - 0.16, curl[i][2] * 0.55]);
    // a second note behind, offset
    const ghost = roundedRect(-0.1, 0.12, -0.26, hw * 0.92, hh * 0.92, r, 3);
    chain(V, 0, ghost, true);
  }

  function mOriginalCopy(V) {
    // tall rounded cabinet, built from a front and back profile
    const hw = 0.36, hh = 0.8, hz = 0.27, r = 0.12;
    const front = roundedRect(0, -0.1, hz, hw, hh, r, 3);
    const back = roundedRect(0, -0.1, -hz, hw, hh, r, 3);
    chain(V, 0, front, true);
    chain(V, 0, back, true);
    for (let i = 0; i < front.length; i++) seg(V, 0, front[i], back[i]);
    // the screen, inset into the front face
    const bez = roundedRect(0, 0.02, hz + 0.012, hw - 0.07, hh - 0.26, 0.08, 3);
    chain(V, 0, bez, true);
    const scr = roundedRect(0, 0.02, hz + 0.022, hw - 0.1, hh - 0.3, 0.06, 3);
    chain(V, 1, scr, true);
    for (let i = 0; i < bez.length; i += 2) seg(V, 0, bez[i], scr[i]);
    // camera above the screen
    circle(V, 1, 0, hh - 0.32, hz + 0.03, 0.035, 8, "xy");
    // print slot near the bottom of the front
    rect(V, 1, -0.17, -0.74, 0.17, -0.63, hz + 0.012);
    rect(V, 0, -0.2, -0.78, 0.2, -0.59, hz + 0.004);
    seg(V, 0, [-0.17, -0.74, hz + 0.012], [-0.17, -0.74, hz - 0.05]);
    seg(V, 0, [0.17, -0.74, hz + 0.012], [0.17, -0.74, hz - 0.05]);
    seg(V, 0, [-0.17, -0.63, hz + 0.012], [-0.17, -0.63, hz - 0.05]);
    seg(V, 0, [0.17, -0.63, hz + 0.012], [0.17, -0.63, hz - 0.05]);
  }

  function mPerform(V) {
    const shrink = (q, f) => {
      const c = [0, 1, 2].map(k => (q[0][k] + q[1][k] + q[2][k] + q[3][k]) / 4);
      return q.map(p => [0, 1, 2].map(k => c[k] + (p[k] - c[k]) * f));
    };

    // open book resting at the base
    const by = -0.78, bw = 0.98, bd = 0.52, lift = 0.28;
    for (const sgn of [-1, 1]) {
      const sp0 = [0, by, -bd], sp1 = [0, by, bd];
      const op0 = [sgn * bw, by + lift, -bd * 0.9];
      const op1 = [sgn * bw, by + lift, bd * 0.9];
      chain(V, 0, [sp0, op0, op1, sp1], true);
      // the block of pages under the top sheet
      for (let i = 1; i <= 3; i++) {
        const d = -i * 0.045;
        seg(V, 0, [op0[0], op0[1] + d, op0[2]], [op1[0], op1[1] + d, op1[2]]);
        seg(V, 0, [op0[0], op0[1] + d, op0[2]], [0, by + d, -bd]);
        seg(V, 0, [op1[0], op1[1] + d, op1[2]], [0, by + d, bd]);
      }
      // lines of print
      for (let i = 1; i <= 4; i++) {
        const t = i / 5.2;
        const y = by + lift * t;
        seg(V, 0, [sgn * bw * t, y, -bd * 0.62], [sgn * bw * t, y, bd * 0.62]);
      }
    }
    seg(V, 1, [0, by, -bd], [0, by, bd]);

    // the foldable, opened like a book above it
    const py = 0.3, pw = 0.5, pd = 0.34, rise = 0.26;
    for (const sgn of [-1, 1]) {
      const quad = [[0, py, -pd], [sgn * pw, py + rise, -pd],
                    [sgn * pw, py + rise, pd], [0, py, pd]];
      chain(V, 0, quad, true);
      // slim body depth
      const under = quad.map(p => [p[0], p[1] - 0.035, p[2]]);
      chain(V, 0, under, true);
      for (let i = 0; i < 4; i++) seg(V, 0, quad[i], under[i]);
      // the panel of screen
      const scr = shrink(quad, 0.86);
      chain(V, 1, scr, true);
      // interface lines running across the panel
      for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const a = [scr[0][0] + (scr[1][0] - scr[0][0]) * t,
                   scr[0][1] + (scr[1][1] - scr[0][1]) * t,
                   scr[0][2] + (scr[1][2] - scr[0][2]) * t];
        const b = [scr[3][0] + (scr[2][0] - scr[3][0]) * t,
                   scr[3][1] + (scr[2][1] - scr[3][1]) * t,
                   scr[3][2] + (scr[2][2] - scr[3][2]) * t];
        seg(V, 0, a, b);
      }
    }
    // hinge and crease
    seg(V, 1, [0, py, -pd], [0, py, pd]);
    seg(V, 0, [0, py - 0.035, -pd], [0, py - 0.035, pd]);
  }

  function mVobViewer(V) {
    // body, wider at the back where the disc sits, tapering to the lens
    const frontZ = 0.26, rearZ = -0.58;
    const fp = [[-0.2, 0.22, frontZ], [0.2, 0.22, frontZ], [0.2, -0.24, frontZ], [-0.2, -0.24, frontZ]];
    const rp = [[-0.29, 0.3, rearZ], [0.29, 0.3, rearZ], [0.29, -0.3, rearZ], [-0.29, -0.3, rearZ]];
    chain(V, 0, fp, true);
    chain(V, 0, rp, true);
    for (let i = 0; i < 4; i++) seg(V, 0, fp[i], rp[i]);

    // the lens barrel, the part everyone recognises
    const lz = [0.26, 0.46, 0.64, 0.78], lr = [0.27, 0.26, 0.24, 0.21];
    for (let i = 0; i < lz.length; i++)
      circle(V, i === lz.length - 1 ? 1 : 0, 0, 0.0, lz[i], lr[i], 16, "xy");
    for (let i = 0; i < 10; i++) {
      const t = (i / 10) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
      seg(V, 0, [c * lr[0], sn * lr[0], lz[0]], [c * lr[3], sn * lr[3], lz[3]]);
    }
    circle(V, 1, 0, 0, 0.8, 0.13, 12, "xy");
    circle(V, 1, 0, 0, 0.82, 0.06, 10, "xy");

    // microphone and shoe along the top
    for (let i = 0; i < 5; i++) {
      const z = 0.12 - i * 0.07;
      seg(V, 0, [-0.12, 0.235 + (0.08 * (0.12 - z)) / 0.7, z], [0.12, 0.235 + (0.08 * (0.12 - z)) / 0.7, z]);
    }

    // viewfinder sitting up at the back
    boxEdges(V, 0, 0, 0.4, -0.45, 0.1, 0.09, 0.17);
    circle(V, 1, 0, 0.4, -0.63, 0.07, 10, "xy");

    // flip out screen, hinged on the left and turned toward you
    const a = 1.2, sw = 0.54, sh = 0.32, hx = -0.2, hz2 = -0.1;
    const h0 = [hx, 0.08, hz2], h1 = [hx, 0.08 - 2 * sh, hz2];
    const e0 = [hx - Math.cos(a) * sw, 0.08, hz2 + Math.sin(a) * sw];
    const e1 = [e0[0], h1[1], e0[2]];
    const quad = [h0, e0, e1, h1];
    chain(V, 0, quad, true);
    const inner = quad.map((p, i) => {
      const c = [(h0[0] + e0[0] + e1[0] + h1[0]) / 4, (h0[1] + h1[1]) / 2, (h0[2] + e0[2] + e1[2] + h1[2]) / 4];
      return [c[0] + (p[0] - c[0]) * 0.82, c[1] + (p[1] - c[1]) * 0.78, c[2] + (p[2] - c[2]) * 0.82];
    });
    chain(V, 1, inner, true);
    // the little button column beside the screen
    for (let i = 0; i < 3; i++) {
      const t = 0.22 + i * 0.26;
      const bx = e0[0] + (h0[0] - e0[0]) * 0.06;
      const bz = e0[2] + (h0[2] - e0[2]) * 0.06;
      circle(V, 0, bx, 0.08 - 2 * sh * t, bz, 0.035, 8, "xy");
    }

    // disc door on the right flank
    circle(V, 0, 0.26, 0.0, -0.22, 0.2, 14, "zy");

    // grip strap on the right
    chain(V, 0, arcPts(0.24, -0.02, -0.18, 0.3, -Math.PI * 0.42, Math.PI * 0.42, 8, "zy"), false);

    // the mini disc, standing beside the camera
    const dc = [0.72, -0.34, 0.1], tilt = 0.34;
    const place = (r, t) => [dc[0] + Math.cos(t) * r,
                             dc[1] + Math.sin(t) * r * Math.cos(tilt),
                             dc[2] + Math.sin(t) * r * Math.sin(tilt)];
    for (const [r, g] of [[0.27, 0], [0.23, 0], [0.08, 1]]) {
      const pts = [];
      for (let i = 0; i < 22; i++) pts.push(place(r, (i / 22) * Math.PI * 2));
      chain(V, g, pts, true);
    }
    for (let i = 0; i < 10; i++) {
      const t = (i / 10) * Math.PI * 2;
      seg(V, 0, place(0.08, t), place(0.23, t));
    }
  }

  const BUILDERS = [mPolymage, mPinq, mOriginalCopy, mPerform, mVobViewer];

  function pad(V) {
    for (const r of [0.42, 0.58, 0.72]) circle(V, 0, 0, -1.0, 0, r, 40, "xz");
    for (let i = 0; i < 12; i++) {
      const t = (i / 12) * Math.PI * 2;
      seg(V, i % 3 === 0 ? 1 : 0,
          [Math.cos(t) * 0.72, -1.0, Math.sin(t) * 0.72],
          [Math.cos(t) * 0.82, -1.0, Math.sin(t) * 0.82]);
    }
  }

  /* ============================================================
     WebGL
     ============================================================ */
  let gl = null;
  try { gl = canvas.getContext("webgl", { antialias: true, alpha: true }); } catch (_) {}
  if (!gl) { stage.classList.add("holo-off"); return; }

  const VS = `
    precision highp float;
    attribute vec3 a_pos;
    attribute float a_glow;
    uniform float u_spin, u_tilt, u_aspect, u_glitch;
    varying float v_y, v_depth, v_glow;
    void main() {
      float c = cos(u_spin), s = sin(u_spin);
      vec3 p = vec3(c * a_pos.x + s * a_pos.z, a_pos.y, -s * a_pos.x + c * a_pos.z);
      float ct = cos(u_tilt), st = sin(u_tilt);
      p = vec3(p.x, ct * p.y - st * p.z, st * p.y + ct * p.z);
      p.x += sin(a_pos.y * 30.0 + u_glitch * 40.0) * u_glitch * 0.25;
      v_y = a_pos.y; v_depth = p.z; v_glow = a_glow;
      float d = 3.3 - p.z;
      gl_Position = vec4(p.x * 2.35 / d / u_aspect, (p.y + 0.06) * 2.35 / d, 0.5, 1.0);
    }`;

  const FS = `
    precision highp float;
    uniform float u_time, u_fade;
    varying float v_y, v_depth, v_glow;
    void main() {
      float scan = 0.78 + 0.22 * sin(v_y * 30.0 - u_time * 4.0);
      float sweep = smoothstep(0.16, 0.0, abs(fract(v_y * 0.42 - u_time * 0.22) - 0.5));
      float depth = mix(0.52, 1.0, smoothstep(-1.3, 1.1, v_depth));
      float flick = 0.93 + 0.07 * sin(u_time * 29.0) * sin(u_time * 7.3);
      vec3 base = vec3(0.263, 0.945, 0.894);
      vec3 col = mix(base, vec3(0.82, 1.0, 0.99), v_glow * 0.75 + sweep * 0.5);
      float a = (0.62 + 0.38 * v_glow) * scan * depth * flick * u_fade + sweep * 0.35 * u_fade;
      gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (_) { stage.classList.add("holo-off"); return; }

  const aPos = gl.getAttribLocation(prog, "a_pos");
  const aGlow = gl.getAttribLocation(prog, "a_glow");
  const uSpin = gl.getUniformLocation(prog, "u_spin");
  const uTilt = gl.getUniformLocation(prog, "u_tilt");
  const uAspect = gl.getUniformLocation(prog, "u_aspect");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uFade = gl.getUniformLocation(prog, "u_fade");
  const uGlitch = gl.getUniformLocation(prog, "u_glitch");

  function upload(builder) {
    const V = [];
    builder(V);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(V), gl.STATIC_DRAW);
    return { buf, count: V.length / 4 };
  }
  const MODELS = BUILDERS.map(upload);
  const PAD = upload(pad);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const DPR = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    const r = stage.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width * DPR));
    canvas.height = Math.max(1, Math.floor(r.height * DPR));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener("resize", resize);
  resize();

  function draw(m, spin, tilt, fade, glitch, t) {
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aGlow);
    gl.vertexAttribPointer(aGlow, 1, gl.FLOAT, false, 16, 12);
    gl.uniform1f(uSpin, spin); gl.uniform1f(uTilt, tilt);
    gl.uniform1f(uAspect, canvas.width / canvas.height);
    gl.uniform1f(uTime, t); gl.uniform1f(uFade, fade); gl.uniform1f(uGlitch, glitch);
    gl.drawArrays(gl.LINES, 0, m.count);
  }

  /* ============================================================
     Carousel state and wiring
     ============================================================ */
  const tabs = [...document.querySelectorAll(".holo-tabs [role=tab]")];
  const panels = [...document.querySelectorAll(".holo-panel")];
  const idxEl = document.getElementById("holo-idx");
  const nameEl = document.getElementById("holo-name");
  const total = tabs.length;

  let index = 0, shown = 0;          // shown lags index during the swap
  let fade = 1, fadeDir = 0, glitch = 0;
  let spin = 0.6, spinVel = 0, dragging = false, lastX = 0;

  function setIndex(i, focusTab) {
    i = (i + total) % total;
    if (i === index) return;
    index = i;
    fadeDir = -1;
    glitch = 0.5;
    tabs.forEach((t, n) => {
      t.setAttribute("aria-selected", String(n === i));
      t.tabIndex = n === i ? 0 : -1;
    });
    panels.forEach((p, n) => { p.hidden = n !== i; });
    if (idxEl) idxEl.textContent = String(i + 1).padStart(2, "0");
    if (nameEl) nameEl.textContent = tabs[i].textContent.toUpperCase();
    if (focusTab) tabs[i].focus();
    if (reduceMotion) { shown = i; fade = 1; fadeDir = 0; glitch = 0; render(0); }
  }

  tabs.forEach((t, n) => t.addEventListener("click", () => setIndex(n)));
  document.querySelector(".holo-prev").addEventListener("click", () => setIndex(index - 1));
  document.querySelector(".holo-next").addEventListener("click", () => setIndex(index + 1));

  const tablist = document.querySelector(".holo-tabs");
  tablist.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { setIndex(index + 1, true); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { setIndex(index - 1, true); e.preventDefault(); }
    else if (e.key === "Home") { setIndex(0, true); e.preventDefault(); }
    else if (e.key === "End") { setIndex(total - 1, true); e.preventDefault(); }
  });

  // drag the hologram to turn it
  if (!reduceMotion) {
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true; lastX = e.clientX; spinVel = 0;
      canvas.setPointerCapture(e.pointerId);
      stage.classList.add("holo-grabbing");
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      spin += dx * 0.009; spinVel = dx * 0.009;
    });
    const release = (e) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("holo-grabbing");
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
  }

  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 })
      .observe(stage);
  }

  const start = performance.now();
  function render(t) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    draw(PAD, spin * 0.25, 0.42, 0.5 * fade + 0.25, 0, t);
    draw(MODELS[shown], spin, 0.42, fade, glitch, t);
  }

  function frame(now) {
    const t = (now - start) / 1000;
    if (visible) {
      if (!dragging) {
        spin += 0.0055 + spinVel;
        spinVel *= 0.93;
      }
      if (fadeDir < 0) {
        fade -= 0.085;
        if (fade <= 0) { fade = 0; shown = index; fadeDir = 1; }
      } else if (fadeDir > 0) {
        fade += 0.07;
        if (fade >= 1) { fade = 1; fadeDir = 0; }
      }
      glitch *= 0.86;
      if (glitch < 0.002) glitch = 0;
      render(t);
    }
    requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    spin = 0.6;
    render(0);
    addEventListener("resize", () => { resize(); render(0); });
  } else {
    requestAnimationFrame(frame);
  }
})();
