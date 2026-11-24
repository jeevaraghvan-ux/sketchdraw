# 🎨 SketchDraw

> **Where every stroke comes alive with realistic paper physics.**  
> A free digital drawing app, technique masterclass library, and creative habit streak tracker.

---

## ✨ Features & Architecture

### 🌙 Dark but Colorful Theme
A sleek obsidian & slate foundation (`#07090E`, `#0B0F17`) brought to life with glowing neon accents: electric cyan, vibrant pink, violet dream, amber fire, and emerald radiance.

---

### 🚀 Exploration Destinations (Accessible via Tabs or Bottom Explore Section)

1. **Instance 1: Discover (Technique Library)**
   - Curated masterclasses across fundamentals, shading, inking, and style:
     - *Gesture & Dynamic Line Sketching*
     - *Cross-Hatching & Volumetric Contour*
     - *Stippling & Dot Gradient Density*
     - *Digital Marker Glazing & Color Blending*
     - *2-Point Perspective & Architectural Depth*
     - *Dramatic Chiaroscuro & Cinematic Lighting*
     - *Line Weight Hierarchy & Comic Inking*
     - *Organic Textures (Wood, Fur, Metal)*
   - Interactive step breakdowns, pro artist tips, and 1-click **"Try in The Pad"** preset loader.

2. **Instance 2: The Pad (Full Sketchpad with Realistic Paper Physics)**
   - **Three Drawing Surfaces**:
     - **Whiteboard**: Crisp, frictionless, smooth vector-like lines, with optional alignment grid.
     - **Paper (Signature Physics)**: Authentic woven paper grain with velocity-based pigment absorption (slower strokes deposit richer ink) and delicate micro-bleed along the stroke edges.
     - **Sketch**: Heavy tooth drafting paper with authentic charcoal powder scattering and graphite drag resistance.
   - **Artistic Tools**:
     - **Pen**: Smooth flowing fountain/gel pen with velocity tapering.
     - **Pencil**: Grainy graphite texture and tooth chatter.
     - **Marker**: Semi-translucent alcohol marker with chisel multiply overlap.
     - **Sketch**: Rough charcoal and pastel with particle scatter.
     - **Eraser**: Alpha eraser preserving background paper texture.
     - **Geometric Shapes**: Line, Rectangle, Circle, Arrow with live preview overlay.
     - **Fill Bucket**: Scanline flood fill algorithm.
   - **Color Engine**: Curated neon swatches + custom hex color picker.
   - **Controls**: Undo/Redo (`Ctrl+Z`, `Ctrl+Y`), Clear, Retina DPI scaling, Save to Streak, and multi-format Export (Transparent PNG, Textured PNG with surface background, and Copy to Clipboard).

3. **Scenario 3: The Streak (Daily Habit & Leaderboard)**
   - Unlocked once signed in (with instant guest access & Google OAuth):
     - **Daily Flame Counter**: Tracks consecutive drawing days.
     - **Streak Status**: Live indicator verifying if today's drawing has been completed.
     - **Activity Heatmap**: Visual calendar grid logging every day you sketched.
     - **Daily Creative Prompt**: Inspiring prompts (e.g. *Neon Cyberpunk Creature*) with 1-click launch into The Pad.
     - **Top Streaks Leaderboard**: Global artist rankings with top-3 podium and custom badges (*Grandmaster*, *Ink Sorcerer*, *Flame Master*).

---

## 🔐 Google Cloud Console & Supabase Authentication Setup

SketchDraw features built-in Google Authentication powered by Supabase. Here is the step-by-step setup:

### Phase 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select your project (e.g., `SketchDraw`).
3. Under **APIs & Services > OAuth consent screen**:
   - Select **External** and click **Create**.
   - Set App name to `SketchDraw`, enter your support email and developer email.
   - Save and continue through Scopes.
4. Under **APIs & Services > Credentials**:
   - Click **+ CREATE CREDENTIALS > OAuth client ID**.
   - Select **Web application**.
   - Name: `SketchDraw Web Client`.
   - In **Authorized redirect URIs**, add your Supabase callback URL:
     ```
     https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
   - Click **Create** and copy your **Client ID** and **Client Secret**.

### Phase 2: Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. In the left navigation, open **Authentication > Providers**.
3. Select **Google** and toggle **Enable Sign in with Google** to **ON**.
4. Paste the **Client ID** and **Client Secret** obtained from Google Cloud Console.
5. Click **Save**.
6. Under **Project Settings > API**, copy your **Project URL** and **anon public key**.

### Phase 3: Connect to SketchDraw
You can connect your credentials in either of two ways:
- **In-App (Instant)**: Click the **Auth Guide** button in the SketchDraw navigation bar, open the **In-App Keys** tab, paste your Supabase URL and Anon Key, and click **Save**.
- **Environment File**: Create a `.env.local` file in the project root:
  ```env
  VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
  ```

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/jeevaraghvan-ux/sketchdraw.git
cd sketchdraw

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploy to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... > Project**.
3. Import `jeevaraghvan-ux/sketchdraw` from your GitHub repositories.
4. (Optional) Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically build and publish your site!
