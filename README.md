# 🐘✨ PVM – PHP Version Manager

Manage multiple PHP versions per project with ease – inspired by FVM for Flutter.

[![GitHub release](https://img.shields.io/github/v/release/KalybosPro/pvm)](https://github.com/KalybosPro/pvm/releases)
[![MIT License](https://img.shields.io/github/license/KalybosPro/pvm)](LICENSE)

---

## 🚀 Features

✅ Simulated PHP version installation
✅ Use different PHP versions per project via `.pvmrc`
✅ Execute PHP commands with the selected version (`pvm exec`)
✅ List installed PHP versions
✅ Works on **macOS, Linux, and Windows** (via Node.js)

---

## 📦 Installation

### 🔧 Prerequisites

* [Node.js](https://nodejs.org) (for CLI runtime)
* [Homebrew](https://brew.sh) (macOS/Linux)

---

### 💻 Install via Homebrew

```bash
brew tap KalybosPro/pvm
brew install pvm
```

---

### 📝 Alternative: install globally via npm (if published)

```bash
npm install -g @kalybospro/pvm
```

*(Replace with your actual NPM package name if you publish there.)*

---

## ⚡ Usage

### 🔍 View help

```bash
pvm help
```

---

### 🔧 Install a PHP version

```bash
pvm install 8.1.0
```

*This simulates installing PHP 8.1.0 in `~/.pvm/versions/8.1.0`. Extend this function to download and compile real binaries later.*

---

### 📌 Set PHP version for a project

```bash
pvm use 8.1.0
```

Creates a `.pvmrc` file in your project root specifying the PHP version to use.

---

### 🔧 Show current project PHP version

```bash
pvm current
```

---

### 💻 Execute a PHP command with the selected version

```bash
pvm exec php -v
```

Runs the PHP command using the version specified in `.pvmrc`.

---

### 📜 List installed PHP versions

```bash
pvm list
```

---

## 🛠️ Development

### 📥 Clone the repository

```bash
git clone https://github.com/KalybosPro/pvm.git
cd pvm
```

### ▶️ Run locally

```bash
npm install
chmod +x pvm.js
./pvm.js help
```

---

## 🚀 Publishing a new release

1. Update code and increment version in `package.json` if using NPM.
2. Commit and tag:

```bash
git add .
git commit -m "Your message"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --tags
```

3. Create a new release on GitHub attached to the tag.

4. Update `pvm.rb` in [homebrew-pvm](https://github.com/KalybosPro/homebrew-pvm) with:

   * New URL
   * Updated SHA256

5. Commit and push formula updates.

---

## 📝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Inspired by [FVM](https://fvm.app) for Flutter and existing version managers like [nvm](https://github.com/nvm-sh/nvm) and [phpenv](https://github.com/phpenv/phpenv).

---

### ✨ Author

[KalybosPro](https://github.com/KalybosPro)

---
