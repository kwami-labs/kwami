import "./chunk-BUSYA2B4.js";

// ../node_modules/simplex-noise/dist/esm/simplex-noise.js
var SQRT3 = Math.sqrt(3);
var SQRT5 = Math.sqrt(5);
var F2 = 0.5 * (SQRT3 - 1);
var G2 = (3 - SQRT3) / 6;
var F3 = 1 / 3;
var G3 = 1 / 6;
var F4 = (SQRT5 - 1) / 4;
var G4 = (5 - SQRT5) / 20;
var fastFloor = (x) => Math.floor(x) | 0;
var grad2 = new Float64Array([
  1,
  1,
  -1,
  1,
  1,
  -1,
  -1,
  -1,
  1,
  0,
  -1,
  0,
  1,
  0,
  -1,
  0,
  0,
  1,
  0,
  -1,
  0,
  1,
  0,
  -1
]);
var grad3 = new Float64Array([
  1,
  1,
  0,
  -1,
  1,
  0,
  1,
  -1,
  0,
  -1,
  -1,
  0,
  1,
  0,
  1,
  -1,
  0,
  1,
  1,
  0,
  -1,
  -1,
  0,
  -1,
  0,
  1,
  1,
  0,
  -1,
  1,
  0,
  1,
  -1,
  0,
  -1,
  -1
]);
var grad4 = new Float64Array([
  0,
  1,
  1,
  1,
  0,
  1,
  1,
  -1,
  0,
  1,
  -1,
  1,
  0,
  1,
  -1,
  -1,
  0,
  -1,
  1,
  1,
  0,
  -1,
  1,
  -1,
  0,
  -1,
  -1,
  1,
  0,
  -1,
  -1,
  -1,
  1,
  0,
  1,
  1,
  1,
  0,
  1,
  -1,
  1,
  0,
  -1,
  1,
  1,
  0,
  -1,
  -1,
  -1,
  0,
  1,
  1,
  -1,
  0,
  1,
  -1,
  -1,
  0,
  -1,
  1,
  -1,
  0,
  -1,
  -1,
  1,
  1,
  0,
  1,
  1,
  1,
  0,
  -1,
  1,
  -1,
  0,
  1,
  1,
  -1,
  0,
  -1,
  -1,
  1,
  0,
  1,
  -1,
  1,
  0,
  -1,
  -1,
  -1,
  0,
  1,
  -1,
  -1,
  0,
  -1,
  1,
  1,
  1,
  0,
  1,
  1,
  -1,
  0,
  1,
  -1,
  1,
  0,
  1,
  -1,
  -1,
  0,
  -1,
  1,
  1,
  0,
  -1,
  1,
  -1,
  0,
  -1,
  -1,
  1,
  0,
  -1,
  -1,
  -1,
  0
]);
function createNoise2D(random = Math.random) {
  const perm = buildPermutationTable(random);
  const permGrad2x = new Float64Array(perm).map((v) => grad2[v % 12 * 2]);
  const permGrad2y = new Float64Array(perm).map((v) => grad2[v % 12 * 2 + 1]);
  return function noise2D(x, y) {
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    const s = (x + y) * F2;
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = ii + perm[jj];
      const g0x = permGrad2x[gi0];
      const g0y = permGrad2y[gi0];
      t0 *= t0;
      n0 = t0 * t0 * (g0x * x0 + g0y * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = ii + i1 + perm[jj + j1];
      const g1x = permGrad2x[gi1];
      const g1y = permGrad2y[gi1];
      t1 *= t1;
      n1 = t1 * t1 * (g1x * x1 + g1y * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = ii + 1 + perm[jj + 1];
      const g2x = permGrad2x[gi2];
      const g2y = permGrad2y[gi2];
      t2 *= t2;
      n2 = t2 * t2 * (g2x * x2 + g2y * y2);
    }
    return 70 * (n0 + n1 + n2);
  };
}
function createNoise3D(random = Math.random) {
  const perm = buildPermutationTable(random);
  const permGrad3x = new Float64Array(perm).map((v) => grad3[v % 12 * 3]);
  const permGrad3y = new Float64Array(perm).map((v) => grad3[v % 12 * 3 + 1]);
  const permGrad3z = new Float64Array(perm).map((v) => grad3[v % 12 * 3 + 2]);
  return function noise3D(x, y, z) {
    let n0, n1, n2, n3;
    const s = (x + y + z) * F3;
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const k = fastFloor(z + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;
    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0)
      n0 = 0;
    else {
      const gi0 = ii + perm[jj + perm[kk]];
      t0 *= t0;
      n0 = t0 * t0 * (permGrad3x[gi0] * x0 + permGrad3y[gi0] * y0 + permGrad3z[gi0] * z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0)
      n1 = 0;
    else {
      const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1]];
      t1 *= t1;
      n1 = t1 * t1 * (permGrad3x[gi1] * x1 + permGrad3y[gi1] * y1 + permGrad3z[gi1] * z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0)
      n2 = 0;
    else {
      const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2]];
      t2 *= t2;
      n2 = t2 * t2 * (permGrad3x[gi2] * x2 + permGrad3y[gi2] * y2 + permGrad3z[gi2] * z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0)
      n3 = 0;
    else {
      const gi3 = ii + 1 + perm[jj + 1 + perm[kk + 1]];
      t3 *= t3;
      n3 = t3 * t3 * (permGrad3x[gi3] * x3 + permGrad3y[gi3] * y3 + permGrad3z[gi3] * z3);
    }
    return 32 * (n0 + n1 + n2 + n3);
  };
}
function createNoise4D(random = Math.random) {
  const perm = buildPermutationTable(random);
  const permGrad4x = new Float64Array(perm).map((v) => grad4[v % 32 * 4]);
  const permGrad4y = new Float64Array(perm).map((v) => grad4[v % 32 * 4 + 1]);
  const permGrad4z = new Float64Array(perm).map((v) => grad4[v % 32 * 4 + 2]);
  const permGrad4w = new Float64Array(perm).map((v) => grad4[v % 32 * 4 + 3]);
  return function noise4D(x, y, z, w) {
    let n0, n1, n2, n3, n4;
    const s = (x + y + z + w) * F4;
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const k = fastFloor(z + s);
    const l = fastFloor(w + s);
    const t = (i + j + k + l) * G4;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const W0 = l - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;
    const w0 = w - W0;
    let rankx = 0;
    let ranky = 0;
    let rankz = 0;
    let rankw = 0;
    if (x0 > y0)
      rankx++;
    else
      ranky++;
    if (x0 > z0)
      rankx++;
    else
      rankz++;
    if (x0 > w0)
      rankx++;
    else
      rankw++;
    if (y0 > z0)
      ranky++;
    else
      rankz++;
    if (y0 > w0)
      ranky++;
    else
      rankw++;
    if (z0 > w0)
      rankz++;
    else
      rankw++;
    const i1 = rankx >= 3 ? 1 : 0;
    const j1 = ranky >= 3 ? 1 : 0;
    const k1 = rankz >= 3 ? 1 : 0;
    const l1 = rankw >= 3 ? 1 : 0;
    const i2 = rankx >= 2 ? 1 : 0;
    const j2 = ranky >= 2 ? 1 : 0;
    const k2 = rankz >= 2 ? 1 : 0;
    const l2 = rankw >= 2 ? 1 : 0;
    const i3 = rankx >= 1 ? 1 : 0;
    const j3 = ranky >= 1 ? 1 : 0;
    const k3 = rankz >= 1 ? 1 : 0;
    const l3 = rankw >= 1 ? 1 : 0;
    const x1 = x0 - i1 + G4;
    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;
    const x2 = x0 - i2 + 2 * G4;
    const y2 = y0 - j2 + 2 * G4;
    const z2 = z0 - k2 + 2 * G4;
    const w2 = w0 - l2 + 2 * G4;
    const x3 = x0 - i3 + 3 * G4;
    const y3 = y0 - j3 + 3 * G4;
    const z3 = z0 - k3 + 3 * G4;
    const w3 = w0 - l3 + 3 * G4;
    const x4 = x0 - 1 + 4 * G4;
    const y4 = y0 - 1 + 4 * G4;
    const z4 = z0 - 1 + 4 * G4;
    const w4 = w0 - 1 + 4 * G4;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (t0 < 0)
      n0 = 0;
    else {
      const gi0 = ii + perm[jj + perm[kk + perm[ll]]];
      t0 *= t0;
      n0 = t0 * t0 * (permGrad4x[gi0] * x0 + permGrad4y[gi0] * y0 + permGrad4z[gi0] * z0 + permGrad4w[gi0] * w0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (t1 < 0)
      n1 = 0;
    else {
      const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]];
      t1 *= t1;
      n1 = t1 * t1 * (permGrad4x[gi1] * x1 + permGrad4y[gi1] * y1 + permGrad4z[gi1] * z1 + permGrad4w[gi1] * w1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (t2 < 0)
      n2 = 0;
    else {
      const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]];
      t2 *= t2;
      n2 = t2 * t2 * (permGrad4x[gi2] * x2 + permGrad4y[gi2] * y2 + permGrad4z[gi2] * z2 + permGrad4w[gi2] * w2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (t3 < 0)
      n3 = 0;
    else {
      const gi3 = ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]];
      t3 *= t3;
      n3 = t3 * t3 * (permGrad4x[gi3] * x3 + permGrad4y[gi3] * y3 + permGrad4z[gi3] * z3 + permGrad4w[gi3] * w3);
    }
    let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (t4 < 0)
      n4 = 0;
    else {
      const gi4 = ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]];
      t4 *= t4;
      n4 = t4 * t4 * (permGrad4x[gi4] * x4 + permGrad4y[gi4] * y4 + permGrad4z[gi4] * z4 + permGrad4w[gi4] * w4);
    }
    return 27 * (n0 + n1 + n2 + n3 + n4);
  };
}
function buildPermutationTable(random) {
  const tableSize = 512;
  const p = new Uint8Array(tableSize);
  for (let i = 0; i < tableSize / 2; i++) {
    p[i] = i;
  }
  for (let i = 0; i < tableSize / 2 - 1; i++) {
    const r = i + ~~(random() * (256 - i));
    const aux = p[i];
    p[i] = p[r];
    p[r] = aux;
  }
  for (let i = 256; i < tableSize; i++) {
    p[i] = p[i - 256];
  }
  return p;
}
export {
  buildPermutationTable,
  createNoise2D,
  createNoise3D,
  createNoise4D
};
//# sourceMappingURL=simplex-noise.js.map
