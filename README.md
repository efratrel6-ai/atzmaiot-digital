# atzmaiot-digital
קורס דיגיטלי עצמאיות באינסטגרם

## בדיקות ופריסה

- `npm test` מריץ הכול. `npm run check` בדיקה מהירה של קבצים וקישורים (בלי דפדפן).
- בכל דחיפה ל-main: בדיקות, ורק אם עברו האתר מתפרסם (`.github/workflows/deploy.yml`). נכשל? האתר החי נשאר כפי שהיה.
- בכל Pull Request: אותן בדיקות (`check.yml`).
- פעם בשבוע: בדיקה של האתר החי, ואם משהו נשבר הריצה נשארת אדומה (בלי Issue ובלי מיילים) (`live-monitor.yml`).

## בדיקה חזותית ותמונות בסיס (tests/baselines)

הבדיקה משווה צילום של העמוד (מובייל ומחשב) לתמונת בסיס שנשמרה. שינוי בלתי מכוון במראה יכשיל אותה.

**מעדכנים תמונות בסיס רק כשאפרת ביקשה שינוי עיצובי.** לעולם לא כדי "לגרום לבדיקה לעבור" אחרי תקלה לא מוסברת.
התמונות חייבות להיווצר על לינוקס (כמו ב-GitHub), לא במחשב מק, ולכן. בלי PR ובלי gh:

1. אחרי שהשינוי העיצובי מוכן, לדחוף ענף חדש ששמו מתחיל ב-`baselines/` (למשל `baselines/new-header`) עם השינוי.
2. הפעולה `Update visual baselines` תריץ ותוסיף commit עם תמונות חדשות לאותו ענף. להמתין לסיומה דרך ה-API הציבורי:
   `curl -s "https://api.github.com/repos/efratrel6-ai/atzmaiot-digital/actions/workflows/update-baselines.yml/runs?branch=baselines/new-header"` ולחכות ש-`status` יהיה `completed` ו-`conclusion` יהיה `success`.
3. `git pull` על הענף, לפתוח ולבדוק בעין את קובצי ה-PNG ב-`tests/baselines` (שנראים כמו שאפרת רצתה), ואז למזג ל-main ולדחוף.

הבדיקה החזותית רצה רק ב-CI. מקומית אפשר להפעיל עם `FORCE_VISUAL=1`, אבל במק התמונות ייראו שונה במעט.

## הפעלה ראשונה של הפריסה (חשוב, לפני המיזוג)

1. **לפני** שממזגים: ב-GitHub, Settings ← Pages ← Build and deployment ← Source: **GitHub Actions**. בלי זה שלב ה-deploy ייכשל.
2. למזג. האתר יתפרסם דרך ה-workflow.
3. אחרי שה-DNS של efrat-cohen.co.il מחובר ל-GitHub Pages: ב-Settings ← Pages לסמן **Enforce HTTPS**.
