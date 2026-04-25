import { useEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import type { dragItem } from "../types/dragType";
import { useDragEditorStore } from "../stores/useDragEditorStore";

gsap.registerPlugin(Draggable);

type ChipRefs = React.MutableRefObject<Map<string, HTMLDivElement | null>>;

export default function useDraggableChips(
  availableDrags: dragItem[],
  chipRefs: ChipRefs,
  codeAreaRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const instances: any[] = [];

    availableDrags.forEach(d => {
      const el = chipRefs.current.get(d.id);
      if (!el) return;

      gsap.set(el, { x: 0, y: 0, opacity: 1, scale: 1 });

      const created = Draggable.create(el, {
        type: "x,y",
        onDragStart: function () {
          gsap.set(el, { zIndex: 1000 });
        },
        onDragEnd: function () {
          gsap.set(el, { zIndex: "auto" });
          if (codeAreaRef.current && this.hitTest(codeAreaRef.current, "30%")) {
            gsap.to(el, {
              scale: 0,
              opacity: 0,
              duration: 0.2,
              onComplete: () => {
                useDragEditorStore.getState().addDrag(d);
              },
            });
          } else {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "back.out(1.7)" });
          }
        },
      });

      if (Array.isArray(created) && created[0]) instances.push(created[0]);
    });

    return () => {
      instances.forEach(i => i && i.kill && i.kill());
    };
  }, [availableDrags, chipRefs, codeAreaRef]);
}
