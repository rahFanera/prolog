# Enquête policière

Une application interactive pour explorer et comprendre la logique de l'inférence et du raisonnement dans un contexte d'enquête. Basée sur React, cette application permet de simuler des scénarios d'enquête en ajustant des faits et des preuves pour déterminer la culpabilité de différents suspects.

## Fonctionnalités principales

  * **Sélection de Suspects et de Crimes** : Choisissez un suspect et un crime pour une enquête ciblée.
  * **Gestion des Faits et Preuves** : Activez ou désactivez les faits et les preuves (motifs, présence sur les lieux, empreintes, etc.) pour voir comment ils influencent le verdict.
  * **Verdict Dynamique** : L'application évalue la culpabilité en temps réel en fonction des faits présentés, affichant un verdict clair de "Coupable" ou "Non coupable".
  * **Explications des Règles** : Comprenez la logique derrière chaque verdict grâce à une section dédiée qui détaille les conditions nécessaires (règles logiques `ET` et `OU`) pour chaque crime.
  * **Aperçu Rapide** : Visualisez d'un coup d'œil le statut de culpabilité de tous les suspects pour le crime sélectionné.
  * **Réinitialisation Facile** : Un bouton permet de revenir à l'état initial des faits pour recommencer l'enquête.

## Comment fonctionne l'inférence ?

L'application utilise des **règles d'inférence** simples pour déterminer la culpabilité.

  * Pour les crimes d'**assassinat** et de **vol**, la culpabilité est établie si **toutes** les conditions suivantes sont remplies :

      * Le suspect a un motif (`has_motive`).
      * Le suspect était près de la scène de crime (`was_near_crime_scene`).
      * Le suspect a des empreintes digitales sur l'arme (`has_fingerprint_on_weapon`).

  * Pour le crime d'**escroquerie**, la culpabilité est établie si le suspect a un motif (`has_motive`) **ET** si **au moins une** des conditions suivantes est remplie :

      * Le suspect a une transaction bancaire liée au crime (`has_bank_transaction`).
      * Le suspect possède une fausse identité (`owns_fake_identity`).

## Technologies utilisées

  * **React** : Bibliothèque JavaScript pour l'interface utilisateur.
  * **TypeScript** : Ajoute des types statiques pour une meilleure maintenabilité du code.
  * **Framer Motion** : Utilisé pour les animations fluides et les transitions.
  * **Tailwind CSS** : Framework CSS pour un style rapide et réactif.
  * **Lucide React** : Bibliothèque d'icônes.

### Équipe du Projet
- 1173 H-F  RAZAFIMAMY Antonino Iraky Ny Avo
- 1214 H-F  ANDRIANATOAVINA Nicolas Delon
- 1215 H-F  RAKOTONIAINA Njakatsarovana Luc Daniel
- 1220 H-F  RAJOMA Nomenjanahary Claudiana
- 1238 H-F  ARISOAMAHAFALY Andriamilantoniaina Marie Anna
- 1254 H-F  RAVOSON Andriamiharimanana
- 1300 H-F  RAHERINDRAINY Fanera Eugene
- 1301 H-F  RANDRIANTSIFERANA Todisoa Jean Paul