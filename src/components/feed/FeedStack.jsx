import React, { useMemo } from "react";
import { getStackRotateOffset } from "./getStackRotateOffset";
import "./FeedStack.css";

function DefaultLoading() {
  return (
    <div className="pp-feed-stack__loading">
      <div
        className="pp-feed-stack__spinner"
        role="status"
        aria-label="Loading candidates"
      />
      <h1 className="pp-feed-stack__loading-title">Gathering Candidates...</h1>
    </div>
  );
}

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
  const visibleItems = useMemo(() => {
    if (items.length <= 1) return items;
    return items.slice(-2);
  }, [items]);

  const rootClass = ["pp-feed-stack", className].filter(Boolean).join(" ");

  if (isLoading) {
    return <div className={rootClass}>{loadingSlot ?? <DefaultLoading />}</div>;
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
          const stackIndex = isFront ? 0 : 1;
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
