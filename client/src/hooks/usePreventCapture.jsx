import { useEffect } from "react";

export const usePreventCapture = () => {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for print, save, etc.
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "p":
          case "s":
          case "c":
            e.preventDefault();
            break;
          default:
            break;
        }
      }

      // Prevent PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
      }
    };

    // Disable text selection
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);

      // Re-enable text selection
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);
};
