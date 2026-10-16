import { useEffect } from "react";

const client = import.meta.env.VITE_ADSENSE_CLIENT;

function loadAdSense() {
  if (!client || document.querySelector("script[data-merge-drop-adsense]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  script.crossOrigin = "anonymous";
  script.dataset.mergeDropAdsense = "true";
  document.head.appendChild(script);
}

export function AdsenseAuto() {
  useEffect(() => loadAdSense(), []);
  return null;
}

export function AdsenseSlot({ slot, format = "auto" }) {
  useEffect(() => {
    if (!client || !slot || document.querySelector("script[data-merge-drop-adsense]")) return;
    loadAdSense();
  }, [slot]);

  useEffect(() => {
    if (!client || !slot) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) { /* bloqueador ou script ainda carregando */ }
  }, [slot]);

  if (!client || !slot) return null;
  return <ins className="adsbygoogle" style={{ display: "block", minHeight: 90 }} data-ad-client={client} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />;
}
