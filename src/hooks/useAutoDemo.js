import { useCallback, useEffect, useRef, useState } from "react";

// ----------------------------------------------------------------------------
// Démo automatique d'une interface.
//
// Parcourt le GUI affiché dans l'appareil comme le ferait un visiteur : un
// curseur animé se déplace sur les boutons, les presse, fait glisser les
// curseurs, change de pièce (liste de navigation détectée automatiquement),
// puis recommence dans la pièce suivante. Quand toutes les pièces ont été
// visitées, `onCycleEnd` est appelé (le Showcase passe alors au support ou au
// projet suivant).
//
// Fonctionne aussi bien avec les simulateurs React qu'avec une interface CH5
// réelle embarquée dans une iframe de même origine (ch5-button, onclick…).
//
// Aucune connaissance du GUI n'est nécessaire : les éléments cliquables sont
// découverts dans le DOM. Un élément peut être exclu avec l'attribut
// `data-demo-ignore`, et un conteneur de pièces forcé avec `data-demo-nav`.
// ----------------------------------------------------------------------------

export const TIMING = {
  startDelay: 1800, // attente après l'affichage d'un GUI avant de commencer
  afterRoom: 2400, // pause après un changement de pièce
  travel: 650, // durée du déplacement du curseur
  press: 160, // temps entre l'arrivée du curseur et le clic
  afterAction: 1900, // pause après chaque action
  actionsPerRoom: [4, 6], // nombre d'actions par pièce (min, max)
  maxRooms: 6, // pièces visitées au maximum par GUI
  slider: 900, // durée d'un glissement de curseur
};

const CLICKABLE_SELECTOR = [
  "button",
  '[role="button"]',
  "ch5-button",
  "ch5-slider",
  'input[type="range"]',
  'input[type="checkbox"]',
  "[onclick]",
  "[data-demo-click]",
  ".btn",
  '[class*="btn"]',
  '[class*="button"]',
  '[class*="tile"]',
  '[class*="toggle"]',
  '[class*="scene"]',
  '[class*="chip"]',
  '[class*="preset"]',
  '[class*="tab"]',
].join(",");

const NAV_RE = /room|piece|pièce|nav|tab|menu|zone|floor|etage|page|selector|deck|space|espace|sidebar/i;
const EXCLUDE_RE =
  /fullscreen|plein[- ]?écran|exit|quit|close|fermer|logout|déconn|lang|settings|réglage|config|cog|gear|param|alarm|alarme|arm|armer|sos|urgence|emergency|delete|suppr|reset|shutdown|power-all|tout éteindre|demo-ignore/i;
const EXCLUDE_TEXT_RE = /^(⚙|✕|×|x)$|plein écran|fullscreen|quitter|déconnexion|logout|armer|désarmer|alarme|sos|urgence|panic/i;

const sleep = (ms, token) =>
  new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    token.cancels.push(() => {
      clearTimeout(id);
      resolve();
    });
  });

// Élément réellement dessiné / cliquable : un <ch5-button> a pointer-events:
// none et délègue tout à son <button> interne.
const hitEl = (el) => (el.tagName === "CH5-BUTTON" ? el.querySelector("button") || el : el);

const classString = (el) =>
  `${el.getAttribute?.("class") || ""} ${el.getAttribute?.("customclass") || el.getAttribute?.("customClass") || ""} ${
    el.id || ""
  } ${el.tagName === "CH5-BUTTON" ? el.firstElementChild?.getAttribute?.("class") || "" : ""}`;

const isVisible = (raw, win) => {
  const el = hitEl(raw);
  const r = el.getBoundingClientRect();
  if (r.width < 10 || r.height < 10) return false;
  const cs = win.getComputedStyle(el);
  if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
  if (cs.pointerEvents === "none") return false;
  // Rogné par un conteneur défilant / masqué ?
  const vw = win.innerWidth;
  const vh = win.innerHeight;
  if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) return false;
  return true;
};

const isCovered = (raw, doc) => {
  const el = hitEl(raw);
  const r = el.getBoundingClientRect();
  const top = doc.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  if (!top) return true;
  return !(el === top || el.contains(top) || top.contains(el));
};

const isExcluded = (el) => {
  if (el.closest("[data-demo-ignore]")) return true;
  // Contenus défilants (bandeau d'actualités, carrousel) : cibles mouvantes.
  if (el.closest('[class*="marquee"],[class*="ticker"],[class*="carousel"],marquee')) return true;
  if (el.disabled) return true;
  if (EXCLUDE_RE.test(classString(el))) return true;
  const label = (el.getAttribute?.("label") || el.getAttribute?.("aria-label") || el.textContent || "").trim();
  if (label.length > 0 && label.length < 60 && EXCLUDE_TEXT_RE.test(label)) return true;
  return false;
};

// Renvoie { doc, win, root, iframe } pour le GUI affiché : soit le contenu de
// l'iframe (interface CH5 réelle), soit le canvas React.
const resolveGui = (stage) => {
  const screen = stage.querySelector(".device-screen") || stage;
  const iframe = screen.querySelector("iframe");
  if (iframe) {
    try {
      const doc = iframe.contentDocument;
      if (doc && doc.readyState === "complete" && doc.body) {
        return { doc, win: iframe.contentWindow, root: doc.body, iframe };
      }
    } catch {
      /* iframe d'une autre origine : pas de démo possible */
    }
    return null;
  }
  return { doc: stage.ownerDocument, win: window, root: screen, iframe: null };
};

const collect = (gui) => {
  const { root, doc, win } = gui;
  const seen = new Set();
  const all = [];
  root.querySelectorAll(CLICKABLE_SELECTOR).forEach((el) => {
    // Un ch5-button contient un <button> : on garde l'élément externe.
    if (el.closest("ch5-button") && el.tagName !== "CH5-BUTTON") return;
    // Un bouton imbriqué dans un autre cliquable : garder le plus interne (déjà ajouté après).
    if (seen.has(el)) return;
    if (isExcluded(el)) return;
    if (!isVisible(el, win)) return;
    if (isCovered(el, doc)) return;
    seen.add(el);
    all.push(el);
  });
  // Retirer les conteneurs qui englobent d'autres candidats (ex. une carte
  // cliquable contenant des boutons).
  const leaves = all.filter((el) => !all.some((o) => o !== el && el.contains(o)));

  // Groupe de navigation (pièces) : le plus grand groupe d'éléments frères
  // dont la classe évoque une navigation, ou marqué data-demo-nav.
  const forced = root.querySelector("[data-demo-nav]");
  let nav = [];
  if (forced) {
    nav = leaves.filter((el) => forced.contains(el));
  } else {
    const groups = new Map();
    leaves.forEach((el) => {
      const key = el.parentElement;
      if (!key) return;
      const looksNav = NAV_RE.test(classString(el)) || NAV_RE.test(classString(key)) || NAV_RE.test(classString(key.parentElement || key));
      if (!looksNav) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    let best = [];
    groups.forEach((g) => {
      if (g.length >= 3 && g.length > best.length) best = g;
    });
    nav = best;
  }
  const navSet = new Set(nav);
  const actions = leaves.filter((el) => !navSet.has(el));
  return { nav, actions };
};

// L'élément est-il bien dans l'écran de l'appareil (et pas parti hors champ) ?
const insideScreen = (el, gui, stage) => {
  const screen = stage.querySelector(".device-screen") || stage;
  const sr = screen.getBoundingClientRect();
  const { x, y } = centerOf(el, gui);
  return x >= sr.left && x <= sr.right && y >= sr.top && y <= sr.bottom;
};

// Coordonnées (fenêtre principale) du centre d'un élément, iframe comprise.
const centerOf = (raw, gui) => {
  const el = raw.tagName ? hitEl(raw) : raw;
  const r = el.getBoundingClientRect();
  let x = r.left + r.width / 2;
  let y = r.top + r.height / 2;
  if (gui.iframe) {
    const fr = gui.iframe.getBoundingClientRect();
    const scale = gui.win.innerWidth ? fr.width / gui.win.innerWidth : 1;
    x = fr.left + x * scale;
    y = fr.top + y * scale;
  }
  return { x, y };
};

const fire = (el, type, init, view) => {
  const Ctor =
    type.startsWith("pointer") && typeof view.PointerEvent === "function"
      ? view.PointerEvent
      : type.startsWith("touch")
        ? null
        : view.MouseEvent;
  if (!Ctor) return;
  el.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, composed: true, view, ...init }));
};

const press = (el, gui) => {
  const target = hitEl(el);
  const r = target.getBoundingClientRect();
  const init = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0, buttons: 1, pointerId: 1, pointerType: "mouse", isPrimary: true };
  fire(target, "pointerdown", init, gui.win);
  fire(target, "mousedown", init, gui.win);
  fire(target, "pointerup", { ...init, buttons: 0 }, gui.win);
  fire(target, "mouseup", { ...init, buttons: 0 }, gui.win);
  if (typeof target.click === "function") target.click();
  else fire(target, "click", { ...init, buttons: 0 }, gui.win);
  if (target !== el && typeof el.click === "function") el.click();
};

const setRangeValue = (input, value, win) => {
  const proto = win.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(input, String(value));
  else input.value = String(value);
  input.dispatchEvent(new win.Event("input", { bubbles: true }));
  input.dispatchEvent(new win.Event("change", { bubbles: true }));
};

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Choisit des actions variées : pas deux fois le même parent de suite.
const pickActions = (actions, count) => {
  const pool = shuffle(actions);
  const chosen = [];
  let lastParent = null;
  for (const el of pool) {
    if (chosen.length >= count) break;
    if (el.parentElement === lastParent && pool.length > count) continue;
    chosen.push(el);
    lastParent = el.parentElement;
  }
  return chosen;
};

const randomBetween = ([min, max]) => min + Math.floor(Math.random() * (max - min + 1));

export const useAutoDemo = ({ enabled, running, stageRef, guiKey, onCycleEnd, onUserActivity }) => {
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false, pulse: 0 });
  const tokenRef = useRef(null);
  const onCycleEndRef = useRef(onCycleEnd);
  const onActivityRef = useRef(onUserActivity);
  onCycleEndRef.current = onCycleEnd;
  onActivityRef.current = onUserActivity;

  const cancel = useCallback(() => {
    const tok = tokenRef.current;
    if (tok) {
      tok.cancelled = true;
      tok.cancels.forEach((fn) => fn());
      tok.cancels = [];
    }
    tokenRef.current = null;
    setCursor((c) => ({ ...c, visible: false }));
  }, []);

  // ---- Écoute des actions réelles de l'utilisateur (isTrusted) --------------
  useEffect(() => {
    if (!enabled) return;
    const stage = stageRef.current;
    if (!stage) return;
    const handler = (e) => {
      if (!e.isTrusted) return;
      if (e.target?.closest?.(".demo-toolbar")) return; // la barre d'outils gère elle-même
      onActivityRef.current?.();
    };
    const targets = [stage];
    const iframe = stage.querySelector(".device-screen iframe");
    let iframeDoc = null;
    const attachIframe = () => {
      try {
        iframeDoc = iframe?.contentDocument || null;
        if (iframeDoc) ["pointerdown", "keydown", "wheel"].forEach((ev) => iframeDoc.addEventListener(ev, handler, true));
      } catch {
        /* autre origine */
      }
    };
    targets.forEach((t) => ["pointerdown", "keydown", "wheel"].forEach((ev) => t.addEventListener(ev, handler, true)));
    if (iframe) {
      attachIframe();
      iframe.addEventListener("load", attachIframe);
    }
    return () => {
      targets.forEach((t) => ["pointerdown", "keydown", "wheel"].forEach((ev) => t.removeEventListener(ev, handler, true)));
      if (iframe) iframe.removeEventListener("load", attachIframe);
      try {
        if (iframeDoc) ["pointerdown", "keydown", "wheel"].forEach((ev) => iframeDoc.removeEventListener(ev, handler, true));
      } catch {
        /* ignore */
      }
    };
  }, [enabled, stageRef, guiKey]);

  // ---- Boucle de démonstration -----------------------------------------------
  useEffect(() => {
    if (!enabled || !running) {
      cancel();
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    const token = { cancelled: false, cancels: [] };
    tokenRef.current = token;

    // Déplace le curseur ; renvoie false si la cible n'est plus à l'écran.
    const moveTo = async (el, gui) => {
      if (!insideScreen(el, gui, stage)) return false;
      const { x, y } = centerOf(el, gui);
      setCursor((c) => ({ ...c, x, y, visible: true }));
      await sleep(TIMING.travel, token);
      if (token.cancelled) return false;
      await sleep(TIMING.press, token);
      if (token.cancelled || !el.isConnected || !insideScreen(el, gui, stage)) return false;
      return true;
    };

    const act = async (el, gui) => {
      setCursor((c) => ({ ...c, pulse: c.pulse + 1 }));
      const isRange = el.tagName === "INPUT" && el.type === "range";
      const isCh5Slider = el.tagName === "CH5-SLIDER";
      if (isRange) {
        const min = Number(el.min || 0);
        const max = Number(el.max || 100);
        const from = Number(el.value || min);
        const to = from > (min + max) / 2 ? min + (max - min) * (0.15 + Math.random() * 0.25) : min + (max - min) * (0.6 + Math.random() * 0.35);
        const steps = 18;
        for (let i = 1; i <= steps; i++) {
          if (token.cancelled) return;
          const v = from + ((to - from) * i) / steps;
          setRangeValue(el, Math.round(v), gui.win);
          const r = el.getBoundingClientRect();
          const pct = (v - min) / (max - min || 1);
          const knob = { left: r.left + r.width * pct, top: r.top + r.height / 2 };
          const { x, y } = centerOf({ getBoundingClientRect: () => ({ left: knob.left, top: knob.top, width: 0, height: 0 }) }, gui);
          setCursor((c) => ({ ...c, x, y }));
          await sleep(TIMING.slider / steps, token);
        }
        return;
      }
      if (isCh5Slider) {
        press(el, gui);
        return;
      }
      press(el, gui);
    };

    const run = async () => {
      await sleep(TIMING.startDelay, token);
      if (token.cancelled) return;

      // Attendre que le GUI soit prêt (iframe chargée / simulateur monté).
      let gui = null;
      for (let i = 0; i < 40 && !token.cancelled; i++) {
        gui = resolveGui(stage);
        if (gui && collect(gui).actions.length > 0) break;
        gui = null;
        await sleep(250, token);
      }
      if (!gui || token.cancelled) {
        if (!token.cancelled) onCycleEndRef.current?.();
        return;
      }

      const { nav } = collect(gui);
      // Sans liste de pièces détectée : deux séries d'actions sur le même écran.
      const rooms = nav.length ? nav.slice(0, TIMING.maxRooms) : [null, null];

      for (const room of rooms) {
        if (token.cancelled) return;
        if (room && room.isConnected) {
          const ok = await moveTo(room, gui);
          if (token.cancelled) return;
          if (ok) {
            await act(room, gui);
            await sleep(TIMING.afterRoom, token);
            if (token.cancelled) return;
          }
        }
        const fresh = collect(gui);
        const navSet = new Set(fresh.nav);
        const actions = fresh.actions.filter((el) => !navSet.has(el));
        const chosen = pickActions(actions, randomBetween(TIMING.actionsPerRoom));
        for (const el of chosen) {
          if (token.cancelled) return;
          if (!el.isConnected) continue;
          // L'élément peut avoir disparu (changement d'écran) : re-vérifier.
          if (!isVisible(el, gui.win) || isCovered(el, gui.doc)) continue;
          const ok = await moveTo(el, gui);
          if (token.cancelled) return;
          if (!ok) continue;
          await act(el, gui);
          await sleep(TIMING.afterAction, token);
        }
      }
      if (!token.cancelled) {
        setCursor((c) => ({ ...c, visible: false }));
        await sleep(600, token);
        if (!token.cancelled) onCycleEndRef.current?.();
      }
    };

    run().catch((err) => console.warn("Auto-demo stopped", err));
    return cancel;
  }, [enabled, running, guiKey, stageRef, cancel]);

  return { cursor };
};

// Est-on sur un PC (souris + écran suffisamment large) ?
export const isDesktopPointer = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 900;
  } catch {
    return window.innerWidth >= 900;
  }
};
