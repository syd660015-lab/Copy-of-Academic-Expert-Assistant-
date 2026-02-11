import React from "react";
import { AppView } from "../types";

interface LayoutProps {
  activeView: AppView;
  setActiveView: React.Dispatch<React.SetStateAction<AppView>>;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeView,
  setActiveView,
  children,
}) => {
  const navItems = [
    { label: "المساعد الذكي", value: AppView.CHAT },
    { label: "المحاضرات", value: AppView.LECTURES },
    { label: "القياس النفسي", value: AppView.MEASUREMENT },
    { label: "الاختبارات", value: AppView.QUIZ },
    { label: "قاموس المصطلحات", value: AppView.GLOSSARY },
    { label: "الألعاب التعليمية", value: AppView.GAMES },
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.title}>
          علم النفس الدينامي
        </h2>
        <p style={styles.subtitle}>
          د. أحمد حمدي عاشور الغول
        </p>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveView(item.value)}
              style={{
                ...styles.navButton,
                ...(activeView === item.value ? styles.activeButton : {}),
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Tahoma, Arial, sans-serif",
    backgroundColor: "#f4f6f9",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#1e293b",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    marginBottom: "5px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: "20px",
    fontSize: "14px",
    opacity: 0.8,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navButton: {
    padding: "10px",
    backgroundColor: "#334155",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    textAlign: "right",
    fontSize: "14px",
  },
  activeButton: {
    backgroundColor: "#3b82f6",
  },
  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },
};
