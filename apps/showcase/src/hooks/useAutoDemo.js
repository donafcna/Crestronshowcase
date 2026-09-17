import { useCallback, useEffect, useRef, useState } from "react";
import { runVillaTour } from "./villaTour";
import { runOrderedDemo } from "./orderedDemo";

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
// Les parcours ordonnés sont définis dans villaTour et orderedDemo. Les
// attributs data-demo-action/source/room identifient les commandes des
// simulateurs ; les autres interfaces sont reconnues selon leurs capacités.
// ----------------------------------------------------------------------------

export const TIMING = {
  startDelay: 1800, // attente après l'affichage d'un GUI avant de commencer
  travel: 650, // durée du déplacement du curseur
  press: 160, // temps entre l'arrivée du curseur et le clic
  slider: 1000, // durée d'un glissement de fader
  hold: 260, // maintien de l'appui avant de faire glisser un fader
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
    if (token.cancelled) { resolve(); return; }
    const done = () => {
      clearTimeout(id);
      const index = token.cancels.indexOf(done);
      if (index >= 0) token.cancels.splice(index, 1);
      resolve();
    };
    const id = setTimeout(done, ms);
    token.cancels.push(done);
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
  // Un fader peut être une piste de 3 px de haut : on tolère une dimension
  // fine pour les curseurs, pas pour les boutons.
  const isSliderEl = (raw.tagName === "INPUT" && raw.type === "range") || raw.tagName === "CH5-SLIDER";
  // Use CSS size before the chassis scale: a valid 44 px control may appear
  // much smaller on a reduced desktop / tablet preview.
  if (r.width <= 0 || r.height <= 0) return false;
  const width = el.offsetWidth || r.width, height = el.offsetHeight || r.height;
  if (Math.max(width, height) < 10) return false;
  if (!isSliderEl && Math.min(width, height) < 10) return false;
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
  // A clipping ancestor (for example the bezel) can contain the target in the
  // DOM while hiding it on screen. Only the target or its children count.
  return !(el === top || el.contains(top));
};

// Bouton déjà actif / sélectionné (pièce courante, scène en cours, source en
// lecture, onglet ouvert…) : un vrai utilisateur n'appuie pas dessus.
const ACTIVE_RE = /(^|[\s-])(active|selected|current|checked|pressed)([\s-]|$)|ch5-button--selected|is-active|is-selected/i;
const isAlreadyActive = (el) => {
  if (el.getAttribute?.("aria-pressed") === "true" || el.getAttribute?.("aria-selected") === "true") return true;
  if (el.getAttribute?.("aria-current") && el.getAttribute("aria-current") !== "false") return true;
  if (el.tagName === "CH5-BUTTON") {
    if (el.getAttribute("selected") === "true") return true;
    const inner = el.querySelector("button");
    if (inner && /ch5-button--selected|active/i.test(inner.getAttribute("class") || "")) return true;
  }
  if (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio") && el.checked) return true;
  return ACTIVE_RE.test(classString(el));
};

const isExcluded = (el) => {
  if (el.closest("[data-demo-ignore]")) return true;
  if (isAlreadyActive(el)) return true;
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
      if (doc && doc.readyState !== "loading" && doc.body) {
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

// Conversion d'un point (coordonnées du document du GUI) vers la fenêtre
// principale — même formule que centerOf, pour un point arbitraire.
const toPagePoint = (x, y, gui) => {
  if (!gui.iframe) return { x, y };
  const fr = gui.iframe.getBoundingClientRect();
  const scale = gui.win.innerWidth ? fr.width / gui.win.innerWidth : 1;
  return { x: fr.left + x * scale, y: fr.top + y * scale };
};

// Centre exact du curseur (thumb) d'un <input type="range"> pour une valeur
// donnée : le thumb se déplace entre thumbW/2 et width - thumbW/2.
const rangeThumbPoint = (input, value) => {
  const r = input.getBoundingClientRect();
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
  const vertical = r.height > r.width;
  // Largeur du thumb : celle de la piste si elle est épaisse, sinon ~18 px
  // (valeur usuelle des thumbs personnalisés en CSS).
  const across = vertical ? r.width : r.height;
  const thumb = across >= 12 ? Math.min(across, 22) : 18;
  if (vertical) {
    return { x: r.left + r.width / 2, y: r.bottom - thumb / 2 - (r.height - thumb) * pct };
  }
  return { x: r.left + thumb / 2 + (r.width - thumb) * pct, y: r.top + r.height / 2 };
};

// Glissement souris réel (mousedown → mousemove… → mouseup) sur un élément
// — utilisé pour les curseurs CH5 (noUiSlider) et les faders sur mesure.
const dragPointer = async (handle, from, to, gui, steps, token, onStep) => {
  const doc = gui.doc;
  const base = { button: 0, pointerId: 1, pointerType: "mouse", isPrimary: true };
  fire(handle, "pointerdown", { ...base, clientX: from.x, clientY: from.y, buttons: 1 }, gui.win);
  fire(handle, "mousedown", { ...base, clientX: from.x, clientY: from.y, buttons: 1 }, gui.win);
  for (let i = 1; i <= steps; i++) {
    if (token.cancelled) break;
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    const target = doc.elementFromPoint(x, y) || handle;
    fire(target, "pointermove", { ...base, clientX: x, clientY: y, buttons: 1 }, gui.win);
    fire(target, "mousemove", { ...base, clientX: x, clientY: y, buttons: 1 }, gui.win);
    onStep?.(x, y);
    await sleep(TIMING.slider / steps, token);
  }
  const target = doc.elementFromPoint(to.x, to.y) || handle;
  fire(target, "pointerup", { ...base, clientX: to.x, clientY: to.y, buttons: 0 }, gui.win);
  fire(target, "mouseup", { ...base, clientX: to.x, clientY: to.y, buttons: 0 }, gui.win);
};

const setRangeValue = (input, value, win) => {
  const proto = win.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(input, String(value));
  else input.value = String(value);
  input.dispatchEvent(new win.Event("input", { bubbles: true }));
  input.dispatchEvent(new win.Event("change", { bubbles: true }));
};

export const useAutoDemo = ({ enabled, running, stageRef, guiKey, onCycleEnd, onUserActivity, villaDevice, villaSessionRef }) => {
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false, pulse: 0, pressed: false });
  const tokenRef = useRef(null);
  const onCycleEndRef = useRef(onCycleEnd);
  const onActivityRef = useRef(onUserActivity);
  onCycleEndRef.current = onCycleEnd;
  onActivityRef.current = onUserActivity;

  const cancel = useCallback(() => {
    const tok = tokenRef.current;
    if (tok) {
      tok.cancelled = true;
      tok.cancels.slice().forEach((fn) => fn());
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
    const targetPoint = (el, gui) => {
      if (el.tagName === "INPUT" && el.type === "range") {
        const p = rangeThumbPoint(el, Number(el.value || el.min || 0));
        return toPagePoint(p.x, p.y, gui);
      }
      if (el.tagName === "CH5-SLIDER") {
        const handle = el.querySelector(".noUi-handle, [class*='handle'], [class*='thumb']");
        if (handle) return centerOf(handle, gui);
      }
      return centerOf(el, gui);
    };

    const moveTo = async (el, gui, deadline = Infinity) => {
      if (!insideScreen(el, gui, stage)) return false;
      const { x, y } = targetPoint(el, gui);
      setCursor((c) => ({ ...c, x, y, visible: true }));
      await sleep(Math.max(0, Math.min(TIMING.travel, deadline - performance.now())), token);
      if (token.cancelled) return false;
      await sleep(Math.max(0, Math.min(TIMING.press, deadline - performance.now())), token);
      if (token.cancelled || !el.isConnected || !insideScreen(el, gui, stage)) return false;
      return true;
    };

    const act = async (el, gui) => {
      const isRange = el.tagName === "INPUT" && el.type === "range";
      const isCh5Slider = el.tagName === "CH5-SLIDER";

      if (isRange) {
        // Appui, maintien, puis glissement du thumb jusqu'à la nouvelle valeur.
        const min = Number(el.min || 0);
        const max = Number(el.max || 100);
        const from = Number(el.value || min);
        const to =
          from > (min + max) / 2
            ? min + (max - min) * (0.15 + Math.random() * 0.25)
            : min + (max - min) * (0.6 + Math.random() * 0.35);
        setCursor((c) => ({ ...c, pulse: c.pulse + 1, pressed: true }));
        await sleep(TIMING.hold, token);
        const steps = 20;
        for (let i = 1; i <= steps; i++) {
          if (token.cancelled) break;
          const v = from + ((to - from) * i) / steps;
          setRangeValue(el, Math.round(v), gui.win);
          const p = rangeThumbPoint(el, Number(el.value));
          const { x, y } = toPagePoint(p.x, p.y, gui);
          setCursor((c) => ({ ...c, x, y }));
          await sleep(TIMING.slider / steps, token);
        }
        setCursor((c) => ({ ...c, pressed: false }));
        return;
      }

      if (isCh5Slider) {
        // Curseur CH5 (noUiSlider) : vrai glissement de la poignée.
        const handle = el.querySelector(".noUi-handle, [class*='handle'], [class*='thumb']");
        const track = el.querySelector(".noUi-base, .noUi-target") || el;
        if (handle) {
          const hr = handle.getBoundingClientRect();
          const tr = track.getBoundingClientRect();
          const vertical = tr.height > tr.width;
          const from = { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 };
          const pct = vertical ? 1 - (from.y - tr.top) / (tr.height || 1) : (from.x - tr.left) / (tr.width || 1);
          const targetPct = pct > 0.5 ? 0.15 + Math.random() * 0.25 : 0.6 + Math.random() * 0.35;
          const to = vertical
            ? { x: from.x, y: tr.bottom - tr.height * targetPct }
            : { x: tr.left + tr.width * targetPct, y: from.y };
          setCursor((c) => ({ ...c, pulse: c.pulse + 1, pressed: true }));
          await sleep(TIMING.hold, token);
          const join = el.getAttribute("sendeventonchange");
          // CH5 ignores some synthetic drags. In the showcase, publish the same
          // analog join as the real fader so its feedback and the 3D volume agree.
          await dragPointer(handle, from, to, gui, 20, token, (x, y) => {
            if (gui.win.Villa?.ready && join) {
              const ratio = Math.max(0, Math.min(1, vertical ? (tr.bottom - y) / tr.height : (x - tr.left) / tr.width));
              const min = Number(el.getAttribute("min") || 0), max = Number(el.getAttribute("max") || 65535);
              gui.win.CrComLib.publishEvent("n", join, Math.round(min + ratio * (max - min)));
            }
            const p = toPagePoint(x, y, gui);
            setCursor((c) => ({ ...c, x: p.x, y: p.y }));
          });
          setCursor((c) => ({ ...c, pressed: false }));
          return;
        }
        setCursor((c) => ({ ...c, pulse: c.pulse + 1 }));
        press(el, gui);
        return;
      }

      // Bouton : appui bref (visuel enfoncé pendant ~120 ms).
      setCursor((c) => ({ ...c, pulse: c.pulse + 1, pressed: true }));
      press(el, gui);
      await sleep(120, token);
      setCursor((c) => ({ ...c, pressed: false }));
    };

    const run = async () => {
      if (!villaDevice) await sleep(TIMING.startDelay, token);
      if (token.cancelled) return;

      // Attendre que le GUI soit prêt (iframe chargée / simulateur monté).
      // Une interface CH5 réelle charge plusieurs Mo (bibliothèque, thèmes,
      // polices) : on patiente jusqu'à 45 s avant de passer à la suite.
      let gui = null;
      for (let i = 0; i < 180 && !token.cancelled; i++) {
        gui = resolveGui(stage);
        if (gui && collect(gui).actions.length >= 3 && (!villaDevice || (gui.win.Villa?.ready && gui.doc.URL.includes(villaDevice === "phone" ? "/iphone.html" : "/index.html")))) break;
        gui = null;
        await sleep(250, token);
      }
      if (!gui || token.cancelled) {
        if (!token.cancelled) onCycleEndRef.current?.();
        return;
      }

      if (villaDevice) {
        const complete = await runVillaTour({ gui, device: villaDevice, sessionRef: villaSessionRef, token, sleep, moveTo, act, setCursor, visible: (el, g) => isVisible(el, g.win) && !isCovered(el, g.doc) });
        if (complete && !token.cancelled) onCycleEndRef.current?.();
        return;
      }
      const complete = await runOrderedDemo({ gui, token, sleep, moveTo, act,
        visible: (el, g) => isVisible(el, g.win) && !isCovered(el, g.doc) });
      if (complete && !token.cancelled) onCycleEndRef.current?.();
    };

    run().catch((err) => console.warn("Auto-demo stopped", err));
    return cancel;
  }, [enabled, running, guiKey, stageRef, cancel, villaDevice, villaSessionRef]);

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
