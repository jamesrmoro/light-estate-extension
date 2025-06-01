# 🏙️ Light Estate

**Smart Real Estate Dashboard – Instantly track apartment sales, notify your team, and manage all projects in the cloud.**

![Light Estate UI](./assets/images/demo-light-estate.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Supabase](https://img.shields.io/badge/backed%20by-Supabase-3ecf8e.svg)](https://supabase.com/)
[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/)

---

## ✨ Features

- **Real-time Sales Tracking** – Visual building model, click apartments to register sales.
- **Instant Notifications** – Email and Push notifications for your team using Postmark and webhooks.
- **Chrome Extension Integration** – Register new sales directly from your browser.
- **Team Management** – Add and manage team emails per project.
- **Project Configs** – Support for multiple real estate projects, with custom floors and apartments.
- **Cloud-first** – Built on Supabase, deployable anywhere (Vercel, Netlify, your server).
- **Mobile Friendly** – Works on all devices.

---

## 🚀 Demo

![Demo gif](./assets/images/light-estate-demo.gif)

---

## 🛠️ Setup

```bash
1. **Clone the repository**
git clone https://github.com/jamesrmoro/light-estate.git
cd light-estate

2. **Configure your Supabase credentials**  
   Open the file `popup-login.js` (or wherever indicated in the code) and insert your Supabase **URL** and **Anon Key**.

3. **Load the Extension in Chrome:**

   1. Go to [`chrome://extensions/`](chrome://extensions/)
   2. Enable **Developer mode** (top right corner)
   3. Click **Load unpacked**
   4. Select the project folder (`light-estate`)

4. **Done!**  
   The extension is now ready to use.
