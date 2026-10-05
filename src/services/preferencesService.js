// NutriScan AI - User Preferences & System Configuration Service

const PREFERENCES_STORAGE_KEY = 'nutriscan_user_preferences_v2';

export const DEFAULT_USER_PREFERENCES = {
  userName: '',
  userTitle: 'Member',
  userGoal: 'Fat Loss & Lean Muscle',
  dietType: 'All Indian Foods',
  units: 'metric', // 'metric' (g/ml/kcal) or 'imperial' (oz/lbs/cal)
  waterGlassSize: 250, // 200, 250, 300, 500 ml
  hapticFeedback: true,
  celebrationConfetti: true,
  cameraQuality: '1080p', // '1080p' (Crisp AI) or '720p' (Fast Battery Saver)
  autoAnalyzeOnCapture: false,
  sciFiHudEnabled: true,
  themeColor: 'emerald', // 'emerald' | 'cyan' | 'violet' | 'amber'
  hydrationReminders: true,
  mealReminders: false,
  privacyLocalOnly: true,
};

export function getUserPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to parse user preferences, using defaults:', e);
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function setUserPreferences(newPrefs) {
  try {
    const merged = { ...getUserPreferences(), ...newPrefs };
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to save user preferences:', e);
    return getUserPreferences();
  }
}

// Export diary history to a downloadable JSON file
export function exportDiaryAsJSON(meals, goals) {
  const exportPayload = {
    appName: 'NutriScan AI',
    exportedBy: getUserPreferences().userName || 'NutriScan User',
    exportTimestamp: new Date().toISOString(),
    version: '2.5.0-pro',
    dailyGoals: goals,
    mealsHistory: meals,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `nutriscan_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Export diary history to CSV format for Excel/Google Sheets
export function exportDiaryAsCSV(meals) {
  if (!meals || meals.length === 0) {
    alert('No meals found to export.');
    return;
  }

  const headers = ['Date', 'Time', 'Meal Type', 'Food Name', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Weight (g)', 'NutriGrade'];
  const rows = meals.map((m) => [
    `"${m.date || ''}"`,
    `"${m.time || ''}"`,
    `"${m.mealType || ''}"`,
    `"${(m.foodName || '').replace(/"/g, '""')}"`,
    m.calories || 0,
    m.macros?.protein || 0,
    m.macros?.carbs || 0,
    m.macros?.fat || 0,
    m.weightGrams || 0,
    `"${m.nutriGrade || 'A'}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `nutriscan_nutrition_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Calculate approximate local device storage consumed by NutriScan AI
export function getStorageStats() {
  try {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2; // 2 bytes per UTF-16 character
      }
    }
    const kb = (totalBytes / 1024).toFixed(1);
    return {
      totalBytes,
      formatted: `${kb} KB`,
      itemsCount: Object.keys(localStorage).length,
    };
  } catch (e) {
    return { totalBytes: 0, formatted: '0 KB', itemsCount: 0 };
  }
}
