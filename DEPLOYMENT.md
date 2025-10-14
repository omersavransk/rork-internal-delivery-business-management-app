# מדריך העלאה ל-Vercel

## שלב 1: הכנת הפרויקט

הפרויקט שלך כבר מוכן להעלאה! כל הקבצים הנדרשים קיימים:
- ✅ `vercel.json` - קובץ הגדרות Vercel
- ✅ `api/index.ts` - Backend API endpoint
- ✅ `.vercelignore` - קבצים שלא יועלו

## שלב 2: התקנת Vercel CLI (אופציונלי)

אם אתה רוצה לפרוס מהטרמינל:

```bash
npm install -g vercel
```

## שלב 3: העלאה דרך Vercel Dashboard (מומלץ)

### 3.1 יצירת חשבון והתחברות
1. היכנס ל-[vercel.com](https://vercel.com)
2. התחבר עם GitHub/GitLab/Bitbucket או Email

### 3.2 חיבור הפרויקט
1. לחץ על **"Add New Project"**
2. בחר את הריפוזיטורי שלך (או העלה ידנית)
3. Vercel יזהה אוטומטית שזה פרויקט Expo

### 3.3 הגדרת Environment Variables
**חשוב מאוד!** הוסף את המשתנים הבאים ב-Vercel Dashboard:

לחץ על **"Environment Variables"** והוסף:

```
EXPO_PUBLIC_SUPABASE_URL = https://olqckcbirxbundecqxig.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scWNrY2JpcnhidW5kZWNxeGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjA0MDQsImV4cCI6MjA3NTQzNjQwNH0.Hvqh7S4WgPJhobaISF6bLJBF_AZuP1l-EpI2790o2FM
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scWNrY2JpcnhidW5kZWNxeGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg2MDQwNCwiZXhwIjoyMDc1NDM2NDA0fQ.nKfR_qM9BS31RtTbfmOzn6c2TvCMNVjr2vNbAut9nOg
```

**שים לב:** אל תוסיף את `EXPO_PUBLIC_TOOLKIT_URL` כאן - נעדכן אותו אחרי הפריסה!

### 3.4 הגדרות Build
Vercel אמור לזהות אוטומטית:
- **Framework Preset:** Other
- **Build Command:** (השאר ריק)
- **Output Directory:** (השאר ריק)
- **Install Command:** `bun install` או `npm install`

### 3.5 פריסה
לחץ על **"Deploy"** והמתן לסיום הבנייה (בדרך כלל 1-3 דקות)

## שלב 4: עדכון ה-URL באפליקציה

אחרי שהפריסה הצליחה, תקבל URL כמו:
```
https://your-project-name.vercel.app
```

### 4.1 עדכן את קובץ `.env` המקומי
```bash
EXPO_PUBLIC_TOOLKIT_URL=https://your-project-name.vercel.app
```

**החלף את `your-project-name` ב-URL האמיתי שקיבלת מ-Vercel!**

### 4.2 עדכן גם ב-Vercel Dashboard
1. חזור ל-Vercel Dashboard
2. לך ל-**Settings → Environment Variables**
3. הוסף משתנה חדש:
   ```
   EXPO_PUBLIC_TOOLKIT_URL = https://your-project-name.vercel.app
   ```
4. לחץ על **"Redeploy"** כדי להפעיל את השינוי

## שלב 5: בדיקת ה-API

### 5.1 בדוק שה-API עובד
פתח בדפדפן:
```
https://your-project-name.vercel.app/api
```

אמור להחזיר:
```json
{"status":"ok","message":"API is running"}
```

### 5.2 בדוק את tRPC
```
https://your-project-name.vercel.app/api/trpc/example.hi
```

## שלב 6: הרצת האפליקציה

### 6.1 במחשב המקומי
```bash
bun run start
```

### 6.2 במכשיר נייד
1. סרוק את ה-QR code עם Expo Go
2. האפליקציה תתחבר אוטומטית ל-API ב-Vercel

## פתרון בעיות נפוצות

### בעיה: "Network request failed"
**פתרון:**
1. ודא ש-`EXPO_PUBLIC_TOOLKIT_URL` מוגדר נכון ב-`.env`
2. ודא שה-URL לא מסתיים ב-`/` (slash)
3. נסה לפתוח את ה-URL בדפדפן ולראות אם ה-API עובד

### בעיה: "CORS error"
**פתרון:** הקוד כבר מטפל ב-CORS ב-`api/index.ts` עם `app.use("*", cors())`

### בעיה: "Environment variables not found"
**פתרון:**
1. ודא שהוספת את כל המשתנים ב-Vercel Dashboard
2. לחץ על **"Redeploy"** אחרי הוספת משתנים
3. המתן לסיום הבנייה מחדש

### בעיה: "Build failed"
**פתרון:**
1. בדוק את ה-logs ב-Vercel Dashboard
2. ודא שכל ה-dependencies מותקנים ב-`package.json`
3. נסה לבנות מקומית: `bun install && bun run build`

## שלב 7: עדכונים עתידיים

כל פעם שאתה עושה שינויים:
1. עשה commit ו-push ל-Git
2. Vercel יפרוס אוטומטית את הגרסה החדשה
3. אין צורך לעשות דבר נוסף!

## Custom Domain (אופציונלי)

אם יש לך דומיין משלך:
1. לך ל-Vercel Dashboard → Settings → Domains
2. הוסף את הדומיין שלך
3. עדכן את ה-DNS records לפי ההוראות
4. עדכן את `EXPO_PUBLIC_TOOLKIT_URL` לדומיין החדש

## סיכום מהיר

```bash
# 1. העלה ל-Vercel דרך Dashboard
# 2. הוסף Environment Variables
# 3. קבל את ה-URL
# 4. עדכן .env:
EXPO_PUBLIC_TOOLKIT_URL=https://your-actual-url.vercel.app

# 5. הרץ את האפליקציה
bun run start
```

זהו! האפליקציה שלך אמורה לעבוד עכשיו עם ה-backend ב-Vercel! 🚀
