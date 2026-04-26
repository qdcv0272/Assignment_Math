import { useEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import type { dragItem } from "../types/dragType";
import { useDragEditorStore } from "../stores/useDragEditorStore";

gsap.registerPlugin(Draggable);

type ChipRefs = React.MutableRefObject<Map<string, HTMLDivElement | null>>;

export default function useDraggableChips(
  drags: dragItem[],
  chipRefs: ChipRefs, // 드래그 아이템들의 ref를 저장하는 Map
  codeAreaRef: React.RefObject<HTMLDivElement | null> // 코드 영역에 대한 ref
) {
  function setZindex(el: HTMLDivElement, zIndex: number | string) {
    gsap.set(el, { zIndex });
  }

  useEffect(() => {
    const instances: any[] = []; // Draggable 저장

    // 드래그 아이템마다 Draggable 생성
    drags.forEach(d => {
      const el = chipRefs.current.get(d.id);
      if (!el) return;

      gsap.set(el, { x: 0, y: 0, opacity: 1, scale: 1 });

      const created = Draggable.create(el, {
        type: "x,y",
        onDragStart: () => {
          setZindex(el, 1000);
        },
        onDragEnd: function () {
          setZindex(el, "auto");
          if (codeAreaRef.current && this.hitTest(codeAreaRef.current, "30%")) {
            console.log("드롭됨");
            gsap.to(el, {
              scale: 0,
              opacity: 0,
              duration: 0.2,
              onComplete: () => {
                useDragEditorStore.getState().addDrag(d);
              },
            });
          } else {
            gsap.to(el, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "back.out(1.7)",
            });
          }
        },
      });

      if (Array.isArray(created) && created[0]) instances.push(created[0]); // Draggable.create는 배열을 반환하므로 첫 번째 요소를 사용
    });

    return () => {
      instances.forEach(i => i && i.kill && i.kill()); // 컴포넌트 언마운트 시 Draggable 인스턴스 정리
    };
  }, [drags, chipRefs, codeAreaRef]);
}
