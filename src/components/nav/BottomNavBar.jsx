import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAuth } from "../../context/AuthContext";
import "./BottomNavBar.css";

const TABS = [
  { id: "home", label: "Home", path: "/feed", match: (p) => p === "/feed" },
  { id: "rooms", label: "Rooms", path: "/rooms", match: (p) => p === "/rooms" },
  { id: "chat", label: "Chat", path: "/chat", match: (p) => p === "/chat" },
  {
    id: "profile",
    label: "Profile",
    path: "/viewProfile",
    match: (p) => p === "/viewProfile" || p === "/editProfile",
  },
];

const ICONS = {
  home: { filled: HomeIcon, outlined: HomeOutlinedIcon },
  rooms: { filled: GroupsIcon, outlined: GroupsOutlinedIcon },
  chat: { filled: ChatBubbleIcon, outlined: ChatBubbleOutlinedIcon },
  profile: { filled: PersonIcon, outlined: PersonOutlineIcon },
};

function BottomNavBar({ showChatBadge = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dockRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorX, setIndicatorX] = useState(0);

  const activeTab =
    TABS.find((t) => t.match(location.pathname))?.id ?? "home";

  const moveIndicator = useCallback(() => {
    const btn = tabRefs.current[activeTab];
    if (!btn) return;
    setIndicatorX(btn.offsetLeft);
  }, [activeTab]);

  useEffect(() => {
    moveIndicator();
    window.addEventListener("resize", moveIndicator);
    return () => window.removeEventListener("resize", moveIndicator);
  }, [moveIndicator]);

  function triggerSpring() {
    const dock = dockRef.current;
    if (!dock) return;
    dock.classList.remove("is-bouncing");
    void dock.offsetWidth;
    dock.classList.add("is-bouncing");
    const onEnd = () => dock.classList.remove("is-bouncing");
    dock.addEventListener("animationend", onEnd, { once: true });
  }

  function handleTabClick(tab) {
    if (tab.id === activeTab) return;
    if (tab.id === "profile") {
      if (!user?.id) return;
      navigate(`/viewProfile?id=${user.id}`);
    } else {
      navigate(tab.path);
    }
    triggerSpring();
  }

  return (
    <div className="pp-bottom-nav-wrap">
      <nav
        ref={dockRef}
        className="pp-bottom-nav"
        aria-label="Bottom navigation"
      >
        <div
          className="pp-bottom-nav__indicator"
          aria-hidden="true"
          style={{ transform: `translateX(${indicatorX}px)` }}
        />
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = isActive
            ? ICONS[tab.id].filled
            : ICONS[tab.id].outlined;
          const chatLabel =
            tab.id === "chat" && showChatBadge
              ? "Chat, unread messages"
              : tab.label;

          return (
            <button
              key={tab.id}
              type="button"
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              className="pp-bottom-nav__tab"
              aria-label={chatLabel}
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleTabClick(tab)}
            >
              <Icon aria-hidden="true" />
              {tab.id === "chat" && showChatBadge && (
                <span className="pp-bottom-nav__badge" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNavBar;
