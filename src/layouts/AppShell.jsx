import React from "react";
import { Outlet } from "react-router-dom";
import { BottomNavBar } from "../components/nav";
import "./AppShell.css";

function AppShell({ showChatBadge = false }) {
  return (
    <div className="pp-app-shell">
      <main className="pp-app-shell__main">
        <Outlet />
      </main>
      <BottomNavBar showChatBadge={showChatBadge} />
    </div>
  );
}

export default AppShell;
