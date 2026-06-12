import React, { useMemo } from "react";
import { getStackRotateOffset, VISIBLE_STACK_DEPTH } from "./getStackRotateOffset";
import "./FeedStack.css";

function DefaultEmpty() {
  return (
    <div className="pp-feed-stack__empty">
      <h1 className="pp-feed-stack__empty-title">
        no more candidates, come back later!
      </h1>
    </div>
  );
}

function FeedStack({
  items = [],
  isLoading = false,
  isEmpty = false,
  renderCard,
  loadingSlot,
  emptySlot,
  className = "",
}) {
  const visibleItems = useMemo(() => items.slice(-VISIBLE_STACK_DEPTH), [items]);

  const rootClass = ["pp-feed-stack", className].filter(Boolean).join(" ");

  if (isLoading) {
    return loadingSlot ?? null;
  }

  if (isEmpty) {
    return <div className={rootClass}>{emptySlot ?? <DefaultEmpty />}</div>;
  }

  return (
    <div className={rootClass}>
      <div className="pp-feed-stack__cards">
        {visibleItems.map((item, visibleIndex) => {
          const itemIndex = items.length - visibleItems.length + visibleIndex;
          const isFront = visibleIndex === visibleItems.length - 1;
          const stackIndex = visibleItems.length - 1 - visibleIndex;
          const stackRotateOffset = getStackRotateOffset(itemIndex, isFront);

          return renderCard(item, {
            stackIndex,
            isFront,
            itemIndex,
            stackRotateOffset,
          });
        })}
      </div>
    </div>
  );
}

export default FeedStack;
