# הסבר מפורט על העלאה ל-Vercel

## מה זה Vercel?

Vercel היא פלטפורמה לאירוח אפליקציות ווב ו-APIs. היא מאפשרת לך להעלות את ה-backend שלך (הקוד שרץ בשרת) ולגשת אליו מכל מקום באינטרנט.

## למה אנחנו צריכים את זה?

האפליקציה שלך מורכבת משני חלקים:
1. **Frontend (React Native)** - האפליקציה שרצה על הטלפון
2. **Backend (API)** - השרת שמנהל את המידע (משתמשים, הזמנות, שליחים וכו')

כרגע ה-backend שלך רץ רק על המחשב שלך (`localhost`). כדי שהאפליקציה תעבוד על טלפונים אמיתיים, אנחנו צריכים להעלות את ה-backend לשרת באינטרנט.

## מבנה הפרויקט

```
project/
├── app/                    # קוד האפליקציה (React Native)
├── backend/                # קוד השרת (tRPC + Hono)
│   ├── trpc/
│   │   ├── routes/        # כל ה-endpoints של ה-API
│   │   └── app-router.ts  # הראוטר הראשי
│   └── hono.ts            # הגדרות השרת
├── api/
│   └── index.ts           # נקודת הכניסה ל-Vercel
├── vercel.json            # הגדרות Vercel
└── .env                   # משתני סביבה (סודות)
```

## איך זה עובד?

### 1. הקוד שלך
- `backend/` - כל הלוגיקה של השרת
- `api/index.ts` - הקובץ שמחבר את ה-backend ל-Vercel

### 2. Vercel
כשאתה מעלה ל-Vercel:
1. Vercel קורא את `vercel.json` ומבין איך לבנות את הפרויקט
2. הוא מריץ את `api/index.ts` כ-serverless function
3. הוא נותן לך URL כמו `https://your-project.vercel.app`

### 3. האפליקציה
האפליקציה שלך (React Native) מתחברת ל-URL הזה דרך:
- `lib/trpc.ts` - מגדיר את החיבור ל-API
- `EXPO_PUBLIC_TOOLKIT_URL` - המשתנה שמכיל את ה-URL

## תהליך ההעלאה - צעד אחר צעד

### שלב 1: הכנה
```bash
# ודא שהכל עובד מקומית
bun install
bun run start
```

### שלב 2: העלאה ל-Vercel

#### דרך 1: Vercel Dashboard (מומלץ למתחילים)
1. היכנס ל-[vercel.com](https://vercel.com)
2. לחץ "Add New Project"
3. חבר את ה-GitHub repository שלך
4. Vercel יזהה אוטומטית את הפרויקט

#### דרך 2: Vercel CLI (למתקדמים)
```bash
# התקן את Vercel CLI
npm install -g vercel

# התחבר לחשבון
vercel login

# העלה את הפרויקט
vercel

# העלה לפרודקשן
vercel --prod
```

### שלב 3: הגדרת Environment Variables

**חשוב מאוד!** אתה חייב להוסיף את המשתנים האלה ב-Vercel:

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**איך להוסיף:**
1. Vercel Dashboard → הפרויקט שלך → Settings → Environment Variables
2. הוסף כל משתנה בנפרד
3. העתק את הערכים מקובץ `.env` המקומי שלך

**למה זה חשוב?**
- המשתנים האלה מכילים את הסודות לחיבור ל-Supabase
- בלי זה, ה-API לא יוכל לגשת למסד הנתונים

### שלב 4: קבלת ה-URL

אחרי שהפריסה הצליחה, תקבל URL כמו:
```
https://your-project-name.vercel.app
```

**בדוק שזה עובד:**
```bash
# פתח בדפדפן:
https://your-project-name.vercel.app/api

# אמור להחזיר:
{"status":"ok","message":"API is running"}
```

### שלב 5: עדכון האפליקציה

עכשיו אתה צריך לעדכן את האפליקציה להשתמש ב-URL החדש:

**עדכן את `.env`:**
```bash
EXPO_PUBLIC_TOOLKIT_URL=https://your-project-name.vercel.app
```

**עדכן גם ב-Vercel:**
1. Vercel Dashboard → Settings → Environment Variables
2. הוסף: `EXPO_PUBLIC_TOOLKIT_URL = https://your-project-name.vercel.app`
3. לחץ "Redeploy"

### שלב 6: בדיקה

```bash
# הרץ את האפליקציה
bun run start

# סרוק את ה-QR code עם Expo Go
# האפליקציה אמורה להתחבר ל-API ב-Vercel
```

## פתרון בעיות

### בעיה: "Network request failed"

**סיבה:** האפליקציה לא מצליחה להתחבר ל-API

**פתרון:**
1. בדוק ש-`EXPO_PUBLIC_TOOLKIT_URL` מוגדר נכון ב-`.env`
2. בדוק שה-URL לא מסתיים ב-`/`
3. פתח את ה-URL בדפדפן ובדוק שה-API עובד
4. בדוק את ה-logs ב-Vercel Dashboard

**איך לבדוק logs:**
```
Vercel Dashboard → הפרויקט שלך → Deployments → לחץ על הפריסה האחרונה → Logs
```

### בעיה: "CORS error"

**סיבה:** הדפדפן חוסם בקשות מדומיינים שונים

**פתרון:** הקוד כבר מטפל בזה! ב-`api/index.ts` יש:
```typescript
app.use("*", cors());
```

אם זה עדיין לא עובד:
1. ודא שהקוד הזה קיים
2. עשה Redeploy ב-Vercel
3. נקה את ה-cache של הדפדפן

### בעיה: "Environment variables not found"

**סיבה:** המשתנים לא הוגדרו נכון ב-Vercel

**פתרון:**
1. Vercel Dashboard → Settings → Environment Variables
2. ודא שכל המשתנים קיימים
3. ודא שאין רווחים מיותרים
4. לחץ "Redeploy"

### בעיה: "Build failed"

**סיבה:** Vercel לא הצליח לבנות את הפרויקט

**פתרון:**
1. בדוק את ה-logs ב-Vercel
2. ודא שכל ה-dependencies ב-`package.json`
3. נסה לבנות מקומית:
   ```bash
   bun install
   bun run build
   ```

## עדכונים עתידיים

כל פעם שאתה עושה שינויים בקוד:

```bash
# 1. עשה commit
git add .
git commit -m "תיאור השינוי"

# 2. עשה push
git push

# 3. Vercel יפרוס אוטומטית!
```

**Vercel מזהה אוטומטית:**
- כל push ל-main branch = פריסה לפרודקשן
- כל push ל-branch אחר = פריסת preview

## טיפים מתקדמים

### Custom Domain
אם יש לך דומיין משלך (כמו `myapp.com`):

1. Vercel Dashboard → Settings → Domains
2. הוסף את הדומיין
3. עדכן את ה-DNS records (Vercel יראה לך איך)
4. עדכן את `EXPO_PUBLIC_TOOLKIT_URL` לדומיין החדש

### Preview Deployments
כל branch מקבל URL משלו:
```
https://your-project-git-feature-branch.vercel.app
```

זה מאפשר לך לבדוק שינויים לפני שאתה מעלה לפרודקשן!

### Logs ו-Monitoring
- Vercel Dashboard → הפרויקט → Logs
- תוכל לראות כל בקשה ל-API
- שימושי לדיבאג בעיות

## סיכום

```
1. העלה את הקוד ל-Vercel (Dashboard או CLI)
2. הוסף Environment Variables
3. קבל את ה-URL
4. עדכן את EXPO_PUBLIC_TOOLKIT_URL
5. הרץ את האפליקציה
6. זהו! 🚀
```

## שאלות נפוצות

**ש: כמה זה עולה?**
ת: Vercel חינמי לפרויקטים אישיים! יש מגבלות סבירות שמספיקות לרוב הפרויקטים.

**ש: האם אני צריך לעשות deploy כל פעם שאני משנה משהו?**
ת: לא! אם חיברת את GitHub, Vercel יעשה deploy אוטומטית בכל push.

**ש: מה ההבדל בין development ל-production?**
ת: 
- Development: רץ על המחשב שלך (`localhost`)
- Production: רץ על שרתי Vercel (נגיש מכל מקום)

**ש: האם אני יכול לחזור לגרסה קודמת?**
ת: כן! Vercel שומר את כל הפריסות. אפשר לחזור לכל גרסה ב-Dashboard.

**ש: איך אני יודע שה-API עובד?**
ת: פתח את `https://your-project.vercel.app/api` בדפדפן. אמור להחזיר JSON עם status: "ok".
