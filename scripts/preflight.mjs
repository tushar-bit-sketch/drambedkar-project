const [major, minor] = process.versions.node.split('.').map(Number);
const supportedNode = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22;
if (!supportedNode) {
  throw new Error(`Node.js 20.19+ or 22.12+ is required; detected ${process.version}.`);
}
console.log(`Node.js ${process.version}: ok`);
