📝 Fitness Recovery Tracker – Dashboard Spec

1. Goal

---

**Create a Dashboard screen that gives the user a clear snapshot of:**

    -How ready they are today
    -How their last week looks (averages + best/worst)
    -Their current streaks (sleep + readiness)
    -A simple, readable recommendation they can act on

2. Data needed (from backend)

---

**The Dashboard will call two endpoints:**
`GET /api/metrics/latest`

-Returns the most recent MetricDay for the logged-in user.
-Fields used:

    -date
    -sleepHours
    -rhr
    -hrv
    -strain
    -readiness
    -notes (optional)

`GET /api/trends/summary?days=7`
-Returns a 7-day summary object.
-Fields used:

    -periodDays (should be 7 here)
    -hasData
    -averages (or null)

        -sleepHours
        -rhr
        -hrv
        -strain
        -readiness

    -bestDay (or null)

        -date
        -readiness
        -zone

    -worstDay (or null)

        -date
        -readiness
        -zone

    -zones (or null)

        -green
        -yellow
        -red

    -sleepStreak7hPlus
    -greenStreak
    -recommendation (string)

3. Dashboard layout (sections)

---

**Top section – “Today” card**

-Shows data from GET /api/metrics/latest
-Content:

-Big readiness score (0–100)
-Readiness zone color (green / yellow / red)

    -Either computed on frontend from readiness
    -Or later directly from backend

-Date of that metric (formatted nicely)
-Key metrics:

    -Sleep hours
    -Strain
    -HRV
    -RHR

-Notes (if present), e.g. “Felt solid today”

`If there is no latest metric:`
-Show a friendly message:
-“No recent data. Log today’s metrics to get your readiness score.”

**Middle section – “This Week” summary**

    -Uses GET /api/trends/summary?days=7
    -If hasData = true:

        -Show average metrics:
            -Avg sleep
            -Avg readiness
            -Avg strain
    -Show:
        -Best day (date + readiness + zone)
        -Worst day (date + readiness + zone)
    -Show zones distribution:

## e.g. “Green days: 3 / Yellow days: 2 / Red days: 2”

    -If hasData = false:
        -Show:
            -“No data in the last 7 days.”
            -The recommendation from backend.

**Bottom section – Streaks + Recommendation**

    -Streaks (from summary):

-sleepStreak7hPlus

## e.g. “Sleep ≥ 7h: 3 days in a row”

-greenStreak

## e.g. “Green readiness: 2 days in a row”

-Recommendation:
-Show the recommendation string from backend as a highlighted text block.

## e.g. “Your average sleep is low. Prioritize 7–8 hours to improve readiness.”

`If hasData = false:`
-Streaks are 0
-Show only the recommendation (which will be the “no data” message).

4. Behavior & states

---

`Loading state:`
-While fetching latest and summary, show loading indicators:

## e.g. skeleton cards or “Loading dashboard…”

`Error state:`
-If the API call fails (401 / 500 / network):
-Show a generic error banner:  
 -“We couldn’t load your dashboard. Please try again.”
-Optionally log errors in console for now.

`Auth requirement:`
-Dashboard should be protected:
-If user is not authenticated, redirect to /login.

5. Future enhancements (not for v1, but good to note)

---

    -Add a small inline chart in “This Week” using /api/trends/7d
    -Allow switching summary period (7 / 28 days) on the dashboard
    -Pull zone directly from a GET /api/metrics/latest response to avoid duplicating logic on frontend
    -Add tiny “Last synced: [time]” text
