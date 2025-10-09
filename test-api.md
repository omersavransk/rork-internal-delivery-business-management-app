# בדיקת API

## לאחר שעלית ל-Vercel, בדוק:

1. **בדוק שה-API עובד:**
   ```
   https://your-project.vercel.app/api
   ```
   אמור להחזיר: `{"status":"ok","message":"API is running"}`

2. **בדוק את tRPC:**
   ```
   https://your-project.vercel.app/api/trpc/example.hi
   ```

## שלבים לפתרון:

### 1. עלה ל-Vercel
```bash
vercel
```

### 2. עדכן את `.env` עם ה-URL שקיבלת
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-actual-url.vercel.app
```

### 3. הוסף Environment Variables ב-Vercel Dashboard
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY

### 4. הפעל מחדש את האפליקציה
```bash
bun start
```

### 5. בדוק את הלוגים
תראה בקונסול:
```
[TRPC] Using RORK API URL: https://your-url.vercel.app
[TRPC] Request to: https://your-url.vercel.app/api/trpc
```

## אם עדיין לא עובד:

1. בדוק שה-URL ב-`.env` נכון (ללא `/` בסוף)
2. בדוק שהוספת את כל המשתנים ב-Vercel
3. עשה Redeploy ב-Vercel אחרי הוספת המשתנים
4. נקה את ה-cache של Expo: `bun start --clear`
