import { useEffect, useRef } from "react";
import { fluidConfig } from "./config.js";
import { createFluidSimulation } from "./FluidSimulation.js";

export default function FluidBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.warn("Fluid background is disabled because WebGL is unavailable.");
      return undefined;
    }

    let simulation;
    let animationFrame = 0;
    let previousTime = 0;
    let previousPointer = null;
    let pointerInside = false;
    let paletteIndex = -1;
    let stopped = false;
    const pointerEvents = [];

    const resetPointer = () => {
      previousPointer = null;
      pointerInside = false;
      pointerEvents.length = 0;
    };

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!inside || !bounds.width || !bounds.height) {
        resetPointer();
        return;
      }

      const samples = event.getCoalescedEvents?.();
      for (const sample of samples?.length ? samples : [event]) {
        const point = {
          x: (sample.clientX - bounds.left) / bounds.width,
          y: 1 - (sample.clientY - bounds.top) / bounds.height,
        };
        const time = sample.timeStamp || event.timeStamp || performance.now();

        if (!previousPointer) {
          if (!pointerInside) paletteIndex = (paletteIndex + 1) % fluidConfig.colors.length;
          pointerInside = true;
          previousPointer = { ...point, time };
          continue;
        }

        const dx = point.x - previousPointer.x;
        const dy = point.y - previousPointer.y;
        const elapsed = Math.max((time - previousPointer.time) / 1000, 1 / 240);
        const distance = Math.hypot(dx * bounds.width, dy * bounds.height);

        if (distance > 0.65) {
          const segments = Math.min(4, Math.max(1, Math.ceil(distance / 26)));
          for (let i = 1; i <= segments; i += 1) {
            const t = i / segments;
            pointerEvents.push({
              x: previousPointer.x + dx * t,
              y: previousPointer.y + dy * t,
              dx: dx / segments,
              dy: dy / segments,
              elapsed: elapsed / segments,
              speed: distance / elapsed,
              color: fluidConfig.colors[paletteIndex],
            });
          }
          if (pointerEvents.length > 16) pointerEvents.splice(0, pointerEvents.length - 16);
        }
        previousPointer = { ...point, time };
      }
    };

    const onPointerOut = (event) => {
      if (!event.relatedTarget) resetPointer();
    };
    const onContextLost = (event) => {
      event.preventDefault();
      stopped = true;
      cancelAnimationFrame(animationFrame);
      console.warn("The WebGL context was lost; the fluid background has stopped.");
    };

    try {
      simulation = createFluidSimulation(canvas, gl);
    } catch (error) {
      console.warn("Fluid background could not initialize:", error);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return undefined;
    }

    const render = (time) => {
      if (stopped) return;
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.033) : 1 / 60;
      previousTime = time;
      try {
        simulation.step(dt, pointerEvents.splice(0));
      } catch (error) {
        console.error("Fluid simulation stopped after a rendering error:", error);
        stopped = true;
        simulation.dispose();
        return;
      }
      animationFrame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resetPointer);
    resizeObserver.observe(canvas);
    if (fluidConfig.pointerInteraction) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerOut, { passive: true });
      window.addEventListener("pointercancel", resetPointer, { passive: true });
      window.addEventListener("blur", resetPointer);
      document.addEventListener("visibilitychange", resetPointer);
    }
    canvas.addEventListener("webglcontextlost", onContextLost);
    animationFrame = requestAnimationFrame(render);

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      if (fluidConfig.pointerInteraction) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerout", onPointerOut);
        window.removeEventListener("pointercancel", resetPointer);
        window.removeEventListener("blur", resetPointer);
        document.removeEventListener("visibilitychange", resetPointer);
      }
      canvas.removeEventListener("webglcontextlost", onContextLost);
      simulation?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
