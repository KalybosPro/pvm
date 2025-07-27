# pvm - PHP Version Manager CLI

## Introduction

pvm is a cross-platform command line tool to manage multiple PHP versions efficiently. It allows you to install, uninstall, and switch between multiple PHP versions per user or project.

## Features

- Install official PHP binaries per platform (Windows/macOS/Linux).
- Uninstall unwanted versions easily.
- Switch PHP versions globally or locally per project.
- Auto-detect local version using `.pvmrc` files.
- View list of installed and available versions.
- Validate downloaded archives via checksum.
- Update the versions manifest from official sources.
- Configuration management for mirrors and directories.
- Robust logging and error handling.

## Requirements

- Node.js >= 14.x
- npm or yarn

## Installation

### Via Windows Installer

1. **Download** the release file: [pvm-installer.zip](https://github.com/user-attachments/files/21453959/pvm-installer.zip)
2. **Unzip** the archive to a folder of your choice.
3. **Run** `pvm-installer.exe` as **Administrator**.
4. After installation, **add PVM to your system PATH**:

   ```plaintext
   C:\Program Files (x86)\PVM
   ```

### ➕ How to Add to PATH

- Press `Windows + S` → search for: `Environment Variables`
- Click on **Edit the system environment variables**
- In the **System Properties** window, click **Environment Variables**
- In **System Variables**, select the `Path` variable → click **Edit**
- Click **New** and paste:

  ```
  C:\Program Files (x86)\PVM
  ```

- Click **OK** to save, then restart your terminal (or your PC)

---

### ✅ Verify Installation

Open a new terminal and run:

```bash
pvm --version
```

You should see the current version of PVM installed.

### Usage

Tap the following command to see the possible pvm commands and how to use it.

```bash
pvm -h or pvm --help
```

---

## 💡 Need Help?

For questions or issues, feel free to [open an issue](https://github.com/KalybosPro/pvm/issues) on GitHub.

---

Thanks for using **PVM** 💚

