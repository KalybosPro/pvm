# 🧰 PHP Version Manager (PVM)

[![npm version](https://img.shields.io/npm/v/php-version-manager.svg)](https://www.npmjs.com/package/php-version-manager)
[![Build](https://img.shields.io/github/actions/workflow/status/tonusername/php-version-manager/ci.yml?branch=main)](https://github.com/tonusername/php-version-manager/actions)
[![License](https://img.shields.io/npm/l/php-version-manager.svg)](LICENSE)

**PVM** est un gestionnaire de versions PHP (comme nvm pour Node.js ou fvm pour Flutter) écrit en TypeScript.  
Il te permet d’installer, gérer et utiliser différentes versions de PHP par projet, en utilisant [`php-build`](https://github.com/php-build/php-build).

---

## 🚀 **Fonctionnalités**

✅ Installer n’importe quelle version de PHP via `php-build`  
✅ Utiliser une version spécifique par projet (`.pvmrc`)  
✅ Exécuter des scripts PHP avec la version du projet  
✅ Lister les versions installées  
✅ Compatible **macOS, Linux et Windows** (mode zip Windows)

---

## 📦 **Installation**

### 🔷 **Prérequis**

- [php-build](https://github.com/php-build/php-build) installé.

```bash
git clone https://github.com/php-build/php-build ~/.php-build
```

- `curl`, `make`, `gcc` et outils de compilation PHP installés sur ton système.

---

### 🔷 **Via npm (global)**

```bash
npm install -g @kalybos/pvm
```

Cela ajoutera la commande `pvm` globalement.

---

## 📝 **Usage**

```bash
pvm help
```

### 🔧 **Commandes principales**

| Commande                        | Description                                       |
|---------------------------------|---------------------------------------------------|
| `pvm install <version>`        | Installe une version PHP via `php-build`.         |
| `pvm uninstall <version>`      | Désinstalle une version PHP.                      |
| `pvm use <version>`            | Utilise une version PHP pour ce projet.           |
| `pvm current`                  | Affiche la version PHP actuelle du projet.        |
| `pvm env`                      | Affiche la commande export PATH pour shell.       |
| `pvm exec <args...>`           | Exécute une commande PHP avec la version du projet. |
| `pvm list`                     | Liste les versions PHP installées.                |
| `pvm help`                     | Affiche cette aide.                              |

---

### 💻 **Exemple complet**

```bash
pvm install 8.2.20
pvm use 8.2.20
eval "$(pvm env)"
php -v
```

---

## 👤 **Auteur**

[Kokou AHIANYO](https://github.com/KalybosPro)

---

## 📄 **Licence**

Ce projet est sous licence [MIT](LICENSE).

---
