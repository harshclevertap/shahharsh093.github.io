# CleverTap Campaigns Prototype

Local run:

```bash
cd /Users/harsh/Documents/GitHub/Ultron/prototype/clevertap-campaigns-ai
python3 -m http.server 4173
```

Open:

- http://127.0.0.1:4173

What is included:

- CleverTap-style Campaigns dashboard UI
- `Create Campaigns` button near `Subscribe to Reports`
- Modal with three panes:
  - AI chat panel
  - Global calendar output panel (day/week/month)
  - Conditional details panel (reveals on selection/clarification)
- CSV upload flow that always generates a calendar
- Clarification prompts when required CSV fields are missing
- Improvement suggestions action
- Main page list and calendar views

CSV headers expected:

`campaign_name,channel,start_date,audience,goal,frequency`

Sample CSV is provided in `sample-campaigns.csv`.
