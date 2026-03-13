import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { FIREBASE_CONFIG } from "./firebase-config.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
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

const form = document.getElementById("proForm");
const statusEl = document.getElementById("proStatus");
const submitBtn = document.getElementById("proSubmitBtn");
const consentEl = document.getElementById("consentPro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus(statusEl, null, "");

  const fd = new FormData(form);
  const nom = normalizeText(fd.get("nom"));
  const entreprise = normalizeText(fd.get("entreprise"));
  const telephone = normalizePhone(fd.get("telephone"));
  const email = normalizeText(fd.get("email"));
  const typeActivite = normalizeText(fd.get("typeActivite"));
  const marquesActuelles = normalizeText(fd.get("marquesActuelles"));
  const experienceBP = normalizeText(fd.get("experienceBP"));
  const attentes = normalizeText(fd.get("attentes"));
  const consent = consentEl?.checked === true;

  if (
    !nom ||
    !entreprise ||
    !telephone ||
    !email ||
    !typeActivite ||
    !marquesActuelles ||
    !attentes
  ) {
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
      type: "pro",
      nom,
      entreprise,
      telephone,
      email,
      questions: {
        typeActivite,
        marquesActuelles,
        experienceBP,
        attentes,
      },
      consentement: {
        accepte: true,
        texte:
          "J’accepte que mes informations soient utilisées afin d’être recontacté(e) par Barber Paradise dans le cadre d’une relation commerciale (emails, offres, informations produits).",
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
    setStatus(statusEl, "ok", "Merci ! Votre demande a bien été envoyée.");
  } catch (err) {
    console.error(err);
    setStatus(
      statusEl,
      "err",
      "Erreur d’envoi. Vérifiez la configuration Firebase et les règles Firestore."
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer";
  }
}
);

