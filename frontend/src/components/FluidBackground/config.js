export const fluidConfig = {
  // Simulation quality
  simResolution: 128,
  dyeResolution: 1440,

  // Fluid behavior
  densityDissipation: 2.2,
  velocityDissipation: 0.65,
  pressure: 0.1,
  pressureIterations: 20,
  curl: 2.8,
  initialSplatInterval: 0.4,

  // Mouse interaction
  pointerInteraction: true,
  splatRadius: 0.55,
  splatForce: 4500,

  // Rendering
  shading: true,

  // Background
  background: {
    r: 0,
    g: 0,
    b: 0,
  },

  // Only these three colors
  colors: [
    {
      r: 0.32,
      g: 0.05,
      b: 0.55,
    },
    {
      r: 0.02,
      g: 0.16,
      b: 0.55,
    },
    {
      r: 0.02,
      g: 0.42,
      b: 0.22,
    },
  ],
};
