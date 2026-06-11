import { useCallback, useEffect, useRef, useState } from "react";
import {
  useMotionValue,
  useTransform,
  useDragControls,
  animate,
} from "framer-motion";

const DEFAULT_THRESHOLD = 120;
const DEFAULT_DIRECTION_LOCK_PX = 10;
const DRAG_COMMIT_DURATION = 0.2;
const PROGRAMMATIC_COMMIT_DURATION = 0.45;

export function useSwipeGesture({
  enabled = true,
  isActive = false,
  onSwipeLeft,
  onSwipeRight,
  threshold = DEFAULT_THRESHOLD,
  directionLockPx = DEFAULT_DIRECTION_LOCK_PX,
  stackRotateOffset = 0,
}) {
  const x = useMotionValue(0);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const isCommittingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const axisLockedRef = useRef(null);

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const rotate = useTransform(() => `${rotateRaw.get() + stackRotateOffset}deg`);
  const commitSwipe = useCallback(
    async (direction, { slow = false } = {}) => {
      if (isCommittingRef.current || !enabled) return;
      isCommittingRef.current = true;
      const target = direction === "right" ? window.innerWidth : -window.innerWidth;
      await animate(x, target, {
        duration: slow ? PROGRAMMATIC_COMMIT_DURATION : DRAG_COMMIT_DURATION,
        ease: slow ? "easeInOut" : "easeIn",
      });
      if (direction === "right") {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
      x.set(0);
      isCommittingRef.current = false;
    },
    [enabled, onSwipeLeft, onSwipeRight, x]
  );

  const swipeProgrammatic = useCallback(
    (direction, options = {}) => commitSwipe(direction, options),
    [commitSwipe]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    axisLockedRef.current = null;
    const currentX = x.get();
    if (Math.abs(currentX) >= threshold) {
      commitSwipe(currentX > 0 ? "right" : "left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  }, [commitSwipe, threshold, x]);

  const handlePointerDown = useCallback(
    (event) => {
      if (!enabled || isCommittingRef.current) return;
      if (event.target.closest(".pp-action-bar")) return;
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      axisLockedRef.current = null;

      const onPointerMove = (moveEvent) => {
        const dx = moveEvent.clientX - pointerStartRef.current.x;
        const dy = moveEvent.clientY - pointerStartRef.current.y;
        if (axisLockedRef.current) return;
        if (
          Math.abs(dx) < directionLockPx &&
          Math.abs(dy) < directionLockPx
        ) {
          return;
        }
        axisLockedRef.current =
          Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        window.removeEventListener("pointermove", onPointerMove);
        if (axisLockedRef.current === "horizontal") {
          setIsDragging(true);
          dragControls.start(event);
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      const cleanup = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
      };
      window.addEventListener("pointerup", cleanup);
      window.addEventListener("pointercancel", cleanup);
    },
    [directionLockPx, dragControls, enabled]
  );

  useEffect(() => {
    if (!isActive || !enabled) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        swipeProgrammatic("right");
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        swipeProgrammatic("left");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, isActive, swipeProgrammatic]);

  const shellStyle = { x, rotate };

  const dragProps = {
    drag: enabled ? "x" : false,
    dragControls,
    dragListener: false,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.9,
    dragMomentum: false,
    onDrag: (_, info) => x.set(info.offset.x),
    onDragEnd: handleDragEnd,
    onPointerDown: handlePointerDown,
  };

  return {
    x,
    rotate,
    shellStyle,
    dragProps,
    swipeProgrammatic,
    isDragging,
    threshold,
  };
}
