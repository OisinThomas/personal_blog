---
title: "Setting Up Expo Client on MacOS Catalina"
description: "A guide to setting up the Expo Client on MacOS Catalina."
updatedAt: "2020-04-20"
publishedAt: "2020-04-20"
author: "Oisín Thomas"
image: "/profile.png"
majorTag: "Tinkering"
subTag: "Tech"
language: "en"
tags: 
- Expo
- MacOS
- Catalina
- Node.js
- Tech
---

Things are done differently on Apple, especially with the latest MacOS, Catalina. When I was navigating these steps, I found them scattered across the internet. This guide aims to provide a centralized tutorial for getting the Expo Client up and running on MacOS Catalina.

## 1. Download a Code Editor

First, you'll want to download your preferred code editor. I personally recommend **Visual Studio Code**, which is:
- Free to use
- Intuitive
- Offers a wide range of add-ons to enhance development

[Download Visual Studio Code here](https://code.visualstudio.com/).

## 2. Install Node.js

There are primarily two ways to install Node.js on MacOS:

- [Download Node.js from its official website](https://nodejs.org/).
- Install it using Homebrew from the command line. [Here's a helpful article](URL_OF_THE_ARTICLE) on how to do that.

**Note**: Due to the security settings of Catalina, you might encounter issues when trying to install applications globally. If you downloaded Node.js from its website, follow these steps to avoid such issues:

- Create an `npm-global` directory if it doesn't exist:
  ```bash
  mkdir ~/npm-global
  ```

- Set the npm directory to the one you just created:
  ```bash
  npm config set prefix '~/npm-global'
  ```

- Create a `.zshrc` file and open it:
  ```bash
  touch .zshrc
  open -e .zshrc
  ```

- Add the following to the `.zshrc` file:
  ```bash
  npm config set prefix '~/npm-global'
  export PATH=~/npm-global/bin:$PATH
  ```

- Close the file and restart your terminal.

For further insights, [check out this thread](URL_OF_THE_THREAD).

## 3. Install the Expo Client

Catalina's security settings can be a challenge for global installations. Instead of the standard installation process, use the following command:

```bash
sudo npm i -g --unsafe-perm expo-cli
```

**Important**: Using `sudo` will prompt you for a password. The `--unsafe-perm` flag bypasses Catalina's security settings, allowing you to install the Expo Client globally.

And voila! You've successfully installed the Expo client on your Mac.

---

Please note that placeholders like "URL_OF_THE_ARTICLE" and "URL_OF_THE_THREAD" are used where URLs should be placed. Make sure to replace them with the actual links.