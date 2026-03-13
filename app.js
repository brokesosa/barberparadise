import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { FIREBASE_CONFIG } from "./firebase-config.js";

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeUrl(value) {
  const v = normalizeText(value);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function isLikelyPhone(value) {
  const v = normalizePhone(value);
  const digits = v.replace(/[^\d+]/g, "");
  return digits.length >= 8;
}

function setStatus(el, type, msg) {
  el.classList.remove("ok", "err");
  if (type) el.classList.add(type);
  el.textContent = msg || "";
}

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const form = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const consentEl = document.getElementById("consent");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus(statusEl, null, "");

  const fd = new FormData(form);
  const nom = normalizeText(fd.get("nom"));
  const prenom = normalizeText(fd.get("prenom"));
  const telephone = normalizePhone(fd.get("telephone"));
  const email = normalizeText(fd.get("email"));
  const tiktok = normalizeUrl(fd.get("tiktok"));
  const instagram = normalizeUrl(fd.get("instagram"));
  const facebook = normalizeUrl(fd.get("facebook"));
  const ameliorer = normalizeText(fd.get("ameliorer"));
  const consent = consentEl?.checked === true;

  if (!nom || !prenom || !telephone || !email || !ameliorer) {
    setStatus(statusEl, "err", "Merci de remplir tous les champs obligatoires.");
    return;
  }
  if (!consent) {
    setStatus(
      statusEl,
      "err",
      "Merci de cocher la case d’acceptation pour pouvoir envoyer."
    );
    return;
  }
  if (!isLikelyPhone(telephone)) {
    setStatus(statusEl, "err", "Le téléphone semble invalide.");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setStatus(statusEl, "err", "L’email semble invalide.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi…";

  try {
    await addDoc(collection(db, "submissions"), {
      nom,
      prenom,
      telephone,
      email,
      reseaux: {
        tiktok,
        instagram,
        facebook,
      },
      ameliorer,
      consentement: {
        accepte: true,
        texte:
          "J’accepte que mes informations soient utilisées afin d’être recontacté(e) et de recevoir des emails d’informations (et/ou offres) liés à ma demande.",
        collectedAt: serverTimestamp(),
      },
      meta: {
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || "",
        url: location.href,
      },
    });

    form.reset();
    setStatus(statusEl, "ok", "Merci ! Ton message a bien été envoyé.");
  } catch (err) {
    console.error(err);
    setStatus(
      statusEl,
      "err",
      "Erreur d’envoi. Vérifie la config Firebase et les règles Firestore."
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer";
  }
});

