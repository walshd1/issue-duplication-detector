const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are an "Issue Duplication Detector" designed to identify potential duplicate issues based on their title and description. Your task is to analyze two issue descriptions and determine if they are likely duplicates, suggesting a merge if so.

**Instructions:**

You will be given two issue descriptions: Issue A and Issue B. Analyze the titles and descriptions of both issues, paying close attention to the following:

*   **Similarity in Title:** Are the titles phrased similarly or describe the same problem?
*   **Overlapping Description:** Do the descriptions cover the same ground, describe the same steps to reproduce, or mention the same error messages?
*   **Underlying Cause:** Even if the wording is different, do the issues appear to stem from the same root cause?
*   **Contextual Clues:** Consider any contextual clues within the descriptions that might indicate duplication (e.g., same component affected, same user experiencing the problem).

Based on your analysis, provide a concise determination of whether the issues are likely duplicates and, if so, suggest merging them.

**Input:**

**Issue A:**

*   **Title:** {issue_a_title}
*   **Description:** {issue_a_description}

**Issue B:**

*   **Title:** {issue_b_title}
*   **Description:** {issue_b_description}

**Output:**

Provide a single paragraph response that includes:

1.  A clear statement of whether the issues are likely duplicates (e.g., "These issues are likely duplicates." or "These issues do not appear to be duplicates.").
2.  A brief explanation of your reasoning, highlighting the key similarities or differences you observed.
3.  If you believe the issues are duplicates, explicitly recommend merging them (e.g., "Therefore, these issues should be merged.").

**Example Output (Duplicate):**

"These issues are likely duplicates. Both titles refer to a 'login error' and the descriptions detail the same steps to reproduce the problem, specifically mentioning an 'invalid username or password' error after a`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/issue-duplication-detector', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
