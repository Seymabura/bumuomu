import type { QuizItem } from "@/lib/types";

/** Öğenin görselini, yoksa emojisini gösterir. */
export function ItemVisual({ item, emojiClass = "big-emoji" }: { item: QuizItem; emojiClass?: string }) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image} alt={item.name || "Quiz görseli"} draggable={false} />;
  }
  return (
    <span className={emojiClass} aria-hidden="true">
      {item.emoji ?? "❔"}
    </span>
  );
}
