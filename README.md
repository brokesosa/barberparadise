# App web via QR code (Firebase)

Une petite app web statique (HTML/CSS/JS) qui s’ouvre via un lien dans un QR code et enregistre les réponses dans **Firebase Firestore**.

## Champs

- Nom, Prénom, Téléphone, Email
- Réseaux sociaux : TikTok, Instagram, Facebook
- Question : **Que souhaiterais-tu améliorer ?**

## Mise en route (Firebase)

1. Crée un projet sur la console Firebase.
2. Ajoute une application Web.
3. Active **Firestore Database** (mode production).
4. Copie la config Firebase dans `firebase-config.js`.

## Règles Firestore (simple)

Pour un petit formulaire public, le minimum est d’autoriser uniquement la création de documents (pas de lecture publique).

Exemple (à adapter) :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{docId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

## Hébergement : GitHub Pages, ça suffit ?

Oui **si** ton app reste une page statique (ce projet) et que tu acceptes que le formulaire soit public.

- **GitHub Pages** : ok pour servir les fichiers (gratuit/simple). Firestore fonctionnera depuis le navigateur.
- **Firebase Hosting** : souvent plus propre (HTTPS, même écosystème, facile si tu ajoutes plus tard des fonctions/rewrites).

## QR code

Génère un QR code qui pointe vers l’URL de déploiement (GitHub Pages ou Firebase Hosting).

