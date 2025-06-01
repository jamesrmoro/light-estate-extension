# 🏙️ Light Estate

**Smart Real Estate Dashboard – Instantly track apartment sales, notify your team, and manage all projects in the cloud.**

![Light Estate UI](https://raw.githubusercontent.com/jamesrmoro/light-estate-extension/main/assets/images/cover.png)


[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Supabase](https://img.shields.io/badge/backed%20by-Supabase-3ecf8e.svg)](https://supabase.com/)

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

[![Watch the demo on YouTube](https://img.youtube.com/vi/Cc812fVl26I/maxresdefault.jpg)](https://youtu.be/Cc812fVl26I "Watch the full demo on YouTube")

> ▶️ **Click the image above to watch the full video demo on YouTube!**
>
> _See the extension in action, real-time sales, notifications, and project management in under 5 minutes._


---

## 🛠️ Setup

1. **Clone the repository**

```bash
git clone https://github.com/jamesrmoro/light-estate-extension.git
cd light-estate
```

2. **Configure your Supabase credentials**  
   Open the file `popup-login.js` (or wherever indicated in the code) and insert your Supabase **URL** and **Anon Key**.

3. **Load the Extension in Chrome:**

   1. Go to [`chrome://extensions/`](chrome://extensions/)
   2. Enable **Developer mode** (top right corner)
   3. Click **Load unpacked**
   4. Select the project folder (`light-estate`)

4. **Done!**  
   The extension is now ready to use.
