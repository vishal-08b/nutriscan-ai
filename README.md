# NutriScan AI - Smart Food Recognition & Calorie Estimator

An intelligent, multimodal AI-powered nutrition application that visually identifies meals, calculates caloric density, estimates portion sizes, breaks down macronutrients and micronutrients, and tracks your daily nutrition targets.

Built with **React**, **Vite**, **Tailwind CSS**, and powered by **Google Gemini 2.5 Flash Vision Multimodal AI**.

---

## ✨ Key Features

1. **AI Multimodal Vision Scanner**:
   - **Live Camera Capture**: Real-time camera viewfinder with front/back camera toggling (`facingMode: environment / user`).
   - **Photo Upload & Drag-and-Drop**: Supports JPEG, PNG, and WEBP formats with auto-compression and canvas optimization.
   - **1-Click Test Meals Gallery**: Dedicated authentic Indian food library (Masala Dosa, Idli Sambar, Kanda Poha, Aloo Paratha, Rajma Chawal, Palak Paneer, Hyderabadi Biryani, Chole Bhature, Tandoori Chicken Tikka, Dal Makhani, Khichdi, Pav Bhaji, Pani Puri, Samosa, Dhokla).
   - **Google Gemini 2.5 Flash Integration**: Real-time recognition tailored to Indian preparations (tadka/tempering, ghee, spices, gravies, rotis, rice dishes) as well as global foods.
   - **Smart Offline Demo Mode**: Instant nutritional analysis matching across 16 authentic Indian regional dishes even without an internet connection or API key.

2. **Comprehensive Nutritional Breakdown**:
   - **Total Estimated Calories & Gram Weight**.
   - **Dynamic Portion Multiplier**: Real-time recalculation of calories and macros across 0.5x, 0.75x, 1.0x, 1.5x, 2.0x, or custom portions.
   - **Macronutrient Gauges**: Protein, Carbohydrates, Healthy Fats with percentage of calories breakdown.
   - **Secondary & Micronutrients**: Dietary Fiber, Sugars, Sodium, Vitamins, Minerals, and Caloric Density (kcal/g).
   - **Nutri-Grade (A/B/C/D) & Health Score**: Evidence-based wellness scoring out of 10.
   - **Itemized Detected Ingredients Table**: Gram amounts and individual calories per detected food component.
   - **Dietary & Allergen Badges**: Highlights dietary flags (High Protein, Low Carb, Gluten-Free, Keto) and allergen warnings (Dairy, Nuts, Gluten).
   - **AI Dietitian Insights & Smart Swaps**: Practical recommendations to optimize nutrition and balance meals.

3. **Interactive Daily Food Diary & Macro Tracker**:
   - **Calorie Target Ring**: Visual SVG progress ring showing consumed, remaining, and goal calories.
   - **Target Progress Bars**: Live visual progress for Protein, Carbs, and Fats.
   - **Water Hydration Tracker**: Daily fluid intake monitoring with interactive `+250ml Glass` logger.
   - **Meal Category Timeline**: Grouped into Breakfast, Lunch, Dinner, and Snacks with meal thumbnails and timestamps.
   - **Manual Quick-Add Modal**: Fast entry for foods logged without a photo.
   - **Daily Date Navigation & Export**: Inspect previous days and export or copy daily summary to clipboard.
   - **Local Persistence**: All entries, goals, and settings are saved automatically in `localStorage`.

4. **Goal Customization & Settings**:
   - **Custom Calorie & Macro Targeter**: Sliders for daily calories, protein, carbs, fat, and water.
   - **1-Click Nutrition Presets**:
     - *Fat Loss & Cutting* (1,700 kcal)
     - *Balanced & Wellness* (2,000 kcal)
     - *Muscle Gain & Bulking* (2,600 kcal)
     - *Low Carb / Ketogenic* (1,900 kcal)
   - **Gemini API Key Manager**: Safely store your Google AI Studio API key with live connection testing.

---

## 🚀 Getting Started

### 1. Launch the App
The development server is already running! You can open it in your browser:
```
http://127.0.0.1:5173/
```

### 2. (Optional) Configure Google Gemini API Key
To scan your own live custom food photos with Google Gemini 2.5 Flash:
1. Click the **Settings (gear icon)** in the top right corner.
2. Enter your Gemini API key (obtain a free key from [Google AI Studio](https://aistudio.google.com/app/apikey)).
3. Click **Test Key** to verify connection, then click **Save Settings**.
*(Note: If you don't have an API key right now, the app automatically runs in Demo Mode with instant test meals).*
