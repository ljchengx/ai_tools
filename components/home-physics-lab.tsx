"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Body, Engine as MatterEngine } from "matter-js";

import { toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

import { ToolIcon } from "./tool-icon";

interface PhysicsScene {
  bodies: Map<ToolSlug, Body>;
  engine: MatterEngine;
}

interface DragState {
  body: Body;
  pointerId: number;
  startX: number;
  startY: number;
  dragged: boolean;
}

const STATIC_POSITIONS = [
  { left: "12%", top: "24%", rotate: "-3deg" },
  { left: "48%", top: "18%", rotate: "2deg" },
  { left: "72%", top: "42%", rotate: "-2deg" },
  { left: "28%", top: "58%", rotate: "3deg" },
  { left: "56%", top: "68%", rotate: "-1deg" },
] as const;

export function HomePhysicsLab({ placement = "section" }: { placement?: "hero" | "section" }) {
  const reducedMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const entityRefs = useRef(new Map<ToolSlug, HTMLAnchorElement>());
  const sceneRef = useRef<PhysicsScene | null>(null);
  const matterRef = useRef<typeof import("matter-js") | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef<ToolSlug | null>(null);
  const visibleRef = useRef(false);
  const documentVisibleRef = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const [sceneVersion, setSceneVersion] = useState(0);
  const [physicsReady, setPhysicsReady] = useState(false);

  const buildScene = useCallback(() => {
    const Matter = matterRef.current;
    const stage = stageRef.current;
    if (!Matter || !stage || reducedMotion) {
      return;
    }

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }

    const compact = width < 680;
    const entityWidth = compact ? 132 : 184;
    const entityHeight = compact ? 56 : 66;
    const wallSize = 80;
    const desktopSpawnX = [0.36, 0.48, 0.59, 0.42, 0.55] as const;
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: compact ? 0.62 : 0.78, scale: 0.001 },
      enableSleeping: true,
    });
    const bodies = new Map<ToolSlug, Body>();

    toolDefinitions.forEach((tool, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = compact
        ? width * (column === 0 ? 0.3 : 0.7)
        : width * desktopSpawnX[index];
      const y = compact ? 46 + row * 56 : 28 - index * 72;
      const body = Matter.Bodies.rectangle(x, y, entityWidth, entityHeight, {
        angle: ((index % 3) - 1) * 0.045,
        chamfer: { radius: 6 },
        density: 0.0014,
        friction: 0.42,
        frictionAir: 0.018,
        restitution: 0.28,
        sleepThreshold: 80,
        label: tool.slug,
      });
      Matter.Body.setAngularVelocity(body, ((index % 2 === 0 ? 1 : -1) * (index + 1)) / 900);
      bodies.set(tool.slug, body);
    });

    const boundaries = [
      Matter.Bodies.rectangle(width / 2, height + wallSize / 2 - 4, width + wallSize * 2, wallSize, { isStatic: true }),
      Matter.Bodies.rectangle(-wallSize / 2 + 4, height / 2, wallSize, height * 2, { isStatic: true }),
      Matter.Bodies.rectangle(width + wallSize / 2 - 4, height / 2, wallSize, height * 2, { isStatic: true }),
    ];

    Matter.Composite.add(engine.world, [...bodies.values(), ...boundaries]);
    sceneRef.current = { bodies, engine };
    setPhysicsReady(true);
  }, [reducedMotion]);

  const resetScene = useCallback(() => {
    const Matter = matterRef.current;
    if (sceneRef.current && Matter) {
      Matter.Engine.clear(sceneRef.current.engine);
      Matter.Composite.clear(sceneRef.current.engine.world, false, true);
    }
    sceneRef.current = null;
    dragRef.current = null;
    suppressClickRef.current = null;
    setPhysicsReady(false);
    buildScene();
    setSceneVersion((version) => version + 1);
  }, [buildScene]);

  useEffect(() => {
    if (reducedMotion) {
      setPhysicsReady(false);
      return;
    }

    let cancelled = false;
    import("matter-js").then((Matter) => {
      if (cancelled) {
        return;
      }
      matterRef.current = Matter;
      buildScene();
    });

    return () => {
      cancelled = true;
      const Matter = matterRef.current;
      if (sceneRef.current && Matter) {
        Matter.Engine.clear(sceneRef.current.engine);
        Matter.Composite.clear(sceneRef.current.engine.world, false, true);
      }
      sceneRef.current = null;
      matterRef.current = null;
    };
  }, [buildScene, reducedMotion]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      previousTimeRef.current = null;
    }, { threshold: 0.08 });
    observer.observe(stage);

    const handleVisibility = () => {
      documentVisibleRef.current = document.visibilityState === "visible";
      previousTimeRef.current = null;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const animate = (time: number) => {
      const Matter = matterRef.current;
      const scene = sceneRef.current;
      if (Matter && scene && visibleRef.current && documentVisibleRef.current) {
        const previous = previousTimeRef.current ?? time - 1000 / 60;
        const delta = Math.min(time - previous, 1000 / 30);
        Matter.Engine.update(scene.engine, delta);

        scene.bodies.forEach((body, slug) => {
          const element = entityRefs.current.get(slug);
          if (element) {
            element.style.transform = `translate3d(${body.position.x}px, ${body.position.y}px, 0) translate(-50%, -50%) rotate(${body.angle}rad)`;
          }
        });
        previousTimeRef.current = time;
      }
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion, sceneVersion]);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    let resizeTimer: number | null = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(resetScene, 180);
    });
    observer.observe(stage);

    return () => {
      observer.disconnect();
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, [reducedMotion, resetScene]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLAnchorElement>, slug: ToolSlug) => {
    const Matter = matterRef.current;
    const body = sceneRef.current?.bodies.get(slug);
    if (!Matter || !body || reducedMotion) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    Matter.Sleeping.set(body, false);
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
    Matter.Body.setStatic(body, true);
    dragRef.current = {
      body,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragged: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    const Matter = matterRef.current;
    const stage = stageRef.current;
    const drag = dragRef.current;
    if (!Matter || !stage || !drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const bounds = stage.getBoundingClientRect();
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    drag.dragged ||= distance > 6;
    Matter.Body.setPosition(drag.body, {
      x: Math.max(32, Math.min(bounds.width - 32, event.clientX - bounds.left)),
      y: Math.max(28, Math.min(bounds.height - 28, event.clientY - bounds.top)),
    });
  };

  const releaseBody = (event: ReactPointerEvent<HTMLAnchorElement>, slug: ToolSlug) => {
    const Matter = matterRef.current;
    const drag = dragRef.current;
    if (!Matter || !drag || drag.pointerId !== event.pointerId) {
      return;
    }

    Matter.Body.setStatic(drag.body, false);
    Matter.Sleeping.set(drag.body, false);
    if (drag.dragged) {
      suppressClickRef.current = slug;
    }
    dragRef.current = null;
  };

  return (
    <section className={`zhiye-physics-lab zhiye-physics-lab--${placement}`} aria-labelledby="physics-lab-title">
      {placement === "section" ? (
        <header className="zhiye-physics-lab__header">
          <div>
            <p>知页实验台</p>
            <h2 id="physics-lab-title">让零散任务，找到自己的位置。</h2>
          </div>
          {!reducedMotion ? (
            <button type="button" onClick={resetScene} aria-label="重置实验台" title="重置实验台">
              <RotateCcw aria-hidden="true" size={18} strokeWidth={1.7} />
            </button>
          ) : null}
        </header>
      ) : (
        <h2 className="sr-only" id="physics-lab-title">知页工具实验台</h2>
      )}

      <div
        ref={stageRef}
        className={`zhiye-physics-lab__stage ${physicsReady ? "is-ready" : "is-static"}`}
        aria-label="可拖拽的知页工具"
      >
        {placement === "hero" && !reducedMotion ? (
          <button className="zhiye-physics-lab__reset" type="button" onClick={resetScene} aria-label="重置实验台" title="重置实验台">
            <RotateCcw aria-hidden="true" size={17} strokeWidth={1.7} />
          </button>
        ) : null}
        <div className="zhiye-physics-lab__baseline" aria-hidden="true" />
        {toolDefinitions.map((tool, index) => {
          const staticPosition = STATIC_POSITIONS[index];
          const style = {
            "--static-left": staticPosition.left,
            "--static-top": staticPosition.top,
            "--static-rotate": staticPosition.rotate,
          } as CSSProperties;

          return (
            <Link
              key={tool.slug}
              ref={(element) => {
                if (element) {
                  entityRefs.current.set(tool.slug, element);
                } else {
                  entityRefs.current.delete(tool.slug);
                }
              }}
              href={`/tools/${tool.slug}`}
              className={`zhiye-physics-entity zhiye-physics-entity--${tool.accent}`}
              style={style}
              draggable={false}
              aria-label={`打开${tool.title}`}
              onPointerDown={(event) => handlePointerDown(event, tool.slug)}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => releaseBody(event, tool.slug)}
              onPointerCancel={(event) => releaseBody(event, tool.slug)}
              onClick={(event) => {
                if (suppressClickRef.current === tool.slug) {
                  event.preventDefault();
                  suppressClickRef.current = null;
                }
              }}
            >
              <span><ToolIcon name={tool.icon} size={20} strokeWidth={1.55} /></span>
              <strong>{tool.shortTitle}</strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
