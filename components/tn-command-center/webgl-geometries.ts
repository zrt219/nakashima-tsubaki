export function generateGlobe(count: number, radius = 3) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius + (Math.random() - 0.5) * 0.2; // Add some thickness
    points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    points[i * 3 + 2] = r * Math.cos(phi);
  }
  return points;
}

export function generateHelix(count: number, length = 10, radius = 2) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 20; // 10 turns
    const strand = i % 2 === 0 ? 1 : -1;
    const offset = (Math.random() - 0.5) * 0.5; // noise
    points[i * 3] = Math.cos(t + strand * Math.PI) * radius + offset;
    points[i * 3 + 1] = (i / count) * length - length / 2 + offset;
    points[i * 3 + 2] = Math.sin(t + strand * Math.PI) * radius + offset;
  }
  return points;
}

export function generateNeural(count: number) {
  const points = new Float32Array(count * 3);
  const clusters = [];
  // 15 main cluster centers
  for (let i = 0; i < 15; i++) {
    clusters.push({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
    });
  }
  for (let i = 0; i < count; i++) {
    const c = clusters[Math.floor(Math.random() * clusters.length)];
    // Random noise around cluster, or connecting lines (50% chance to be near center, 50% chance to be bridge)
    if (Math.random() > 0.2) {
      points[i * 3] = c.x + (Math.random() - 0.5) * 1.5;
      points[i * 3 + 1] = c.y + (Math.random() - 0.5) * 1.5;
      points[i * 3 + 2] = c.z + (Math.random() - 0.5) * 1.5;
    } else {
      // Background noise
      points[i * 3] = (Math.random() - 0.5) * 10;
      points[i * 3 + 1] = (Math.random() - 0.5) * 10;
      points[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
  }
  return points;
}

export function generateSpindle(count: number, chaotic = false) {
  const points = new Float32Array(count * 3);
  const ySpread = chaotic ? 6 : 4;
  for (let i = 0; i < count; i++) {
    const y = (Math.random() - 0.5) * ySpread;
    let r = 1;
    if (chaotic) {
      r = Math.random() * 2 + 0.5;
    } else {
      if (Math.abs(y) > 1.5) r = 0.5;
      else if (Math.abs(y) < 0.5) r = 1.2;
    }
    const theta = Math.random() * 2 * Math.PI;
    const radius = Math.random() * r;
    points[i * 3] = radius * Math.cos(theta);
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = radius * Math.sin(theta);
  }
  return points;
}

export function generateGrid(count: number, size = 6) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (Math.random() > 0.3) {
      // Quantize to grid
      points[i * 3] = Math.round((Math.random() - 0.5) * size);
      points[i * 3 + 1] = Math.round((Math.random() - 0.5) * size);
      points[i * 3 + 2] = Math.round((Math.random() - 0.5) * size);
      // Add tiny offset
      points[i * 3] += (Math.random() - 0.5) * 0.1;
      points[i * 3 + 1] += (Math.random() - 0.5) * 0.1;
      points[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
    } else {
      points[i * 3] = (Math.random() - 0.5) * size;
      points[i * 3 + 1] = (Math.random() - 0.5) * size;
      points[i * 3 + 2] = (Math.random() - 0.5) * size;
    }
  }
  return points;
}

export function generateOctahedron(count: number, radius = 3) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Generate point uniformly on surface of octahedron
    const face = Math.floor(Math.random() * 8);
    const signX = face & 1 ? 1 : -1;
    const signY = face & 2 ? 1 : -1;
    const signZ = face & 4 ? 1 : -1;

    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;

    points[i * 3] = u * radius * signX;
    points[i * 3 + 1] = v * radius * signY;
    points[i * 3 + 2] = w * radius * signZ;
  }
  return points;
}

export function generateShield(count: number, r1 = 2, r2 = 3) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const radius = Math.random() > 0.5 ? r1 : r2;
    points[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    points[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    points[i * 3 + 2] = radius * Math.cos(phi);
  }
  return points;
}

export function generateLattice(count: number, layers = 5, size = 6) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = Math.floor(Math.random() * layers) - Math.floor(layers / 2);
    const x = (Math.random() - 0.5) * size;
    const z = (Math.random() - 0.5) * size;
    // Emphasize grid lines on X and Z
    if (Math.random() > 0.5) {
      points[i * 3] = Math.round(x);
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = z;
    } else {
      points[i * 3] = x;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = Math.round(z);
    }
  }
  return points;
}

export function generateCylinder(count: number, radius = 2, height = 6) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = (Math.random() - 0.5) * height;
    const theta = Math.random() * 2 * Math.PI;
    const r = radius + (Math.random() - 0.5) * 0.2; // Add thickness
    points[i * 3] = r * Math.cos(theta);
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = r * Math.sin(theta);
  }
  return points;
}

export function generateTorus(count: number, R = 3, r = 1) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 * Math.PI;
    const v = Math.random() * 2 * Math.PI;
    const noiseX = (Math.random() - 0.5) * 0.2;
    const noiseY = (Math.random() - 0.5) * 0.2;
    const noiseZ = (Math.random() - 0.5) * 0.2;
    points[i * 3] = (R + r * Math.cos(v)) * Math.cos(u) + noiseX;
    points[i * 3 + 1] = r * Math.sin(v) + noiseY;
    points[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u) + noiseZ;
  }
  return points;
}
