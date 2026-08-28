# Rebuild GitHub Pages when the Google Form is submitted

The calendar is a static GitHub Pages site. New form answers live in the published Google Sheet CSV and only show up after the site rebuilds.

The deploy workflow already rebuilds on a 6-hour cron (`0 */6 * * *`). That is a safety net. To show a new event immediately, send a `repository_dispatch` of type `rebuild-site` from Google Apps Script on form submit.

The first rebuild still takes about a minute. Keep the 6-hour cron so the calendar still updates if the script or token breaks.

## 1. Create a GitHub token

Never commit this token. Store it only in Apps Script properties (step 3).

**Fine-grained PAT (preferred)**

1. [Create a fine-grained personal access token](https://github.com/settings/personal-access-tokens/new).
2. Resource owner: your account.
3. Repository access: **Only select repositories** → `EmaSuriano/astro-collaborative-calendar-theme`.
4. Permissions → Repository → **Contents**: **Read and write**.
5. Generate and copy the token.

**Classic PAT**

1. [Create a classic token](https://github.com/settings/tokens/new) with the `repo` scope.
2. Generate and copy the token.

Contents: Read and write (or classic `repo`) is what GitHub requires to POST `/repos/{owner}/{repo}/dispatches`.

## 2. Open Apps Script from the Form or Sheet

1. Open the Google Form (or the response Sheet).
2. **Extensions → Apps Script**.
3. Replace any stub with the script below. Save.

## 3. Store the token as a script property

In the Apps Script editor: **Project Settings** (gear) → **Script properties** → **Add script property**.

| Property | Value |
| --- | --- |
| `GITHUB_TOKEN` | the PAT from step 1 |
| `GITHUB_REPO` | optional; defaults to `EmaSuriano/astro-collaborative-calendar-theme` |

## 4. Install an on-form-submit trigger

1. In the Apps Script editor, open **Triggers** (clock icon).
2. **Add Trigger**.
3. Function: `onFormSubmit`.
4. Event source: **From form** (or **From spreadsheet** if you opened the Sheet).
5. Event type: **On form submit**.
6. Save and authorize when prompted.

## 5. Copy-paste script

```javascript
function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('GITHUB_TOKEN');
  const repo =
    props.getProperty('GITHUB_REPO') ||
    'EmaSuriano/astro-collaborative-calendar-theme';

  if (!token) {
    console.error('GITHUB_TOKEN is missing from Script Properties');
    return;
  }

  // Published CSV can lag a few seconds after submit.
  Utilities.sleep(5000);

  const url = 'https://api.github.com/repos/' + repo + '/dispatches';
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ event_type: 'rebuild-site' }),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  // GitHub returns 204 No Content on success.
  if (code < 200 || code >= 300) {
    console.error(
      'GitHub dispatch failed: ' + code + ' ' + response.getContentText()
    );
  } else {
    console.log('Triggered GitHub Pages rebuild (' + code + ')');
  }
}
```

That POST hits `https://api.github.com/repos/EmaSuriano/astro-collaborative-calendar-theme/dispatches` with JSON `{ "event_type": "rebuild-site" }`. The workflow in `.github/workflows/deploy.yml` listens for `repository_dispatch` type `rebuild-site`.

## Check that it worked

1. Submit a test form response.
2. In Apps Script, **Executions** should show `onFormSubmit` succeeding.
3. In the GitHub repo, **Actions** should show a **Deploy to GitHub Pages** run with event `repository_dispatch`.

If the Action never starts, the token is missing Contents write (or `repo`), or `GITHUB_TOKEN` / `GITHUB_REPO` is wrong. The 6-hour cron still rebuilds the site either way.
