"use client";

import { useState, useEffect } from "react";
import { Joyride, STATUS } from "react-joyride";
import type { EventData } from "react-joyride";

const TOUR_KEY = "donkeygpt_tour_seen";

const steps = [
  {
    target: "[data-tour='new-chat']",
    title: "Start a New Chat",
    content: "Click here anytime to start a fresh conversation with DonkeyGPT.",
    skipBeacon: true,
  },
  {
    target: "[data-tour='suggestions']",
    title: "Quick Question Starters",
    content: "Click any of these to instantly ask a question — they shuffle every visit!",
    skipBeacon: true,
  },
  {
    target: "[data-tour='simplicity-toggle']",
    title: "Control the Complexity",
    content: "Adjust how simply DonkeyGPT explains things — from child-friendly to expert level.",
    skipBeacon: true,
  },
  {
    target: "[data-tour='chat-input']",
    title: "Ask Anything",
    content: "Type your question here. No judgment, no jargon — just clear answers.",
    skipBeacon: true,
  },
];

export default function ChatTour({ forceStart = false }: { forceStart?: boolean }) {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (forceStart) {
      setRun(true);
      return;
    }
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      // Small delay so the UI has fully rendered before tour starts
      const t = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceStart]);

  const handleEvent = ({ status }: EventData) => {
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(TOUR_KEY, "true");
      setRun(false);
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      options={{
        primaryColor: "#634629",
        overlayColor: "rgba(0,0,0,0.45)",
        zIndex: 10000,
        showProgress: true,
        buttons: ["back", "skip", "primary"],
      }}
      styles={{
        buttonPrimary: {
          backgroundColor: "#634629",
          borderRadius: "12px",
          padding: "8px 20px",
          fontWeight: 600,
          fontSize: "13px",
        },
        buttonBack: {
          color: "#634629",
          fontWeight: 600,
          fontSize: "13px",
        },
        buttonSkip: {
          color: "#9ca3af",
          fontSize: "12px",
        },
        tooltip: {
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: "20px 24px",
        },
        tooltipContent: {
          fontSize: "13px",
          color: "#4f453c",
          lineHeight: "1.5",
        },
      }}
    />
  );
}
