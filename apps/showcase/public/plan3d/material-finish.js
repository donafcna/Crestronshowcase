// Static finishes baked into existing textures: no extra sampler, mesh or render pass.
// Independent seed keeps furniture placement identical to the original scene.
export function refineFabric(g, size) {
  g.fillStyle = '#d6cfc1'; g.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const warp = ((x + y) / 4) % 2 === 0;
      g.fillStyle = 'rgba(84,70,52,.12)';
      g.fillRect(x, y, 3, 3);
      g.fillStyle = 'rgba(255,253,244,.23)';
      g.fillRect(x, y, warp ? 1 : 3, warp ? 3 : 1);
    }
  }
}

export function refineStone(g, size) {
  let seed = 9021;
  const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  g.fillStyle = '#dfd6c7'; g.fillRect(0, 0, size, size);
  // Periodic mineral bands: seamless edges, low contrast instead of busy scratches.
  for (let y = 0; y < size; y++) {
    const wave = Math.sin(y / size * Math.PI * 8) * .022 + .025;
    g.fillStyle = `rgba(116,100,78,${wave})`; g.fillRect(0, y, size, 1);
  }
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size, y = rand() * size, r = .3 + rand() * 1.4;
    g.fillStyle = i % 3 ? 'rgba(110,93,69,.075)' : 'rgba(255,251,237,.22)';
    g.fillRect(x, y, r * 1.8, r);
  }
  for (let band = 0; band < 5; band++) {
    g.beginPath();
    for (let x = 0; x <= size; x += 2) {
      const a = x / size * Math.PI * 2;
      const y = size * (.1 + band * .18) + 9 * Math.sin(a + band) + 3 * Math.sin(3 * a + band);
      if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokeStyle = 'rgba(122,106,83,.09)'; g.lineWidth = 1.2; g.stroke();
  }
}

// Texture repeats twice already. One UV unit = 4 m => a 2 m material tile.
// Only existing vertex UVs change; all three wood maps stay registered.
export function scaleFloorUV(mesh) {
  const p = mesh.geometry.attributes.position, uv = mesh.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (p.getX(i) + mesh.position.x) / 4, (p.getZ(i) + mesh.position.z) / 4);
  }
  uv.needsUpdate = true;
}
