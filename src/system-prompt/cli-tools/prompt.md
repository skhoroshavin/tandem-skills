## CLI tools

A number of CLI tools are installed on this laptop and fully authenticated, you're encouraged to use them when the situation calls for it.

<!--cli:rg-->
- Use `rg` instead of `grep`
<!--/cli-->
<!--cli:gh-->
- Use `gh` for anything GitHub: managing repos, issues, PRs, releases, workflows, API calls. For endpoints the CLI does not cover, use `gh api`
- Don't hammer GitHub with repeated gh calls for reading code - instead check whether repo is already cloned locally to a sibling folder, if not clone it, and grep locally
- Show the exact commit message before creating it, so user can correct you
<!--/cli-->
<!--cli:jira-->
- Use `jira` for anything Jira related, including searching for and reading tickets and comments, as well as creating and updating tickets and comments under them
<!--/cli-->
<!--cli:gcx-->
- Use `gcx` to query Grafana logs and metrics: `gcx logs query '<logql>' --since 1h`, `gcx metrics query '<promql>' --since 1h`
- Use the `--jq '<expr>'` flag to filter or reshape gcx JSON output
<!--/cli-->
<!--cli:slackcli-->
- Use `slackcli` to read Slack: `slackcli conversations read <channel-or-slack-url>`, `slackcli search messages '<query>'`; add `--json` when you process the output
- Always include the message permalink, so the user can open and reply to it in Slack
<!--/cli-->
<!--cli:aws-->
- Use `aws` when you need to check what's happening in AWS accounts
- When using AWS CLI always pass --profile and --region explicitly. The profile is usually clear from context - if it is not, ask, never guess
<!--/cli-->
<!--cli:saml2aws-->
- AWS credentials are short-lived: on an expired or invalid token error, ask the user to run saml2aws login --idp-account <profile> --skip-prompt themselves, giving them the full command to copy-paste
<!--/cli-->
<!--cli:pdftotext-->
- Use `pdftotext` to extract text from PDFs: `pdftotext input.pdf output.txt`, or `pdftotext input.pdf -` to print to stdout
<!--/cli-->
<!--cli:html2text-->
- Unless your task requires seeing actual tags, always convert HTML fetched from the web to markdown instead of reading it raw, for example when using `curl`: `curl -s <url> | html2text --ignore-images --no-wrap-links`.
<!--/cli-->
<!--cli:lynx-->
- Unless the task requires seeing actual tags, always convert HTML fetched from the web to plain text instead of reading it raw, for example when using `curl`: `curl -s <url> | lynx -stdin -dump` (link URLs are kept in a References list).
<!--/cli-->
<!--cli:browser-->
- Use a real headless browser when you need to read a JS-rendered or bot-blocked page: `d=$(mktemp -d); <browser-binary> --headless=new --disable-gpu --timeout=10000 --user-data-dir="$d" --dump-dom --virtual-time-budget=5000 <url> 2>/dev/null; rm -rf "$d"`. An empty or half-rendered body means the page outlasted the timeout: drop this URL and look for a faster source instead of retrying.
- When in doubt, always try `curl` first before resorting to a headless browser
<!--/cli-->
<!--cli:pandoc-->
- Use `pandoc` to convert documents (docx, odt, rtf, ...) to markdown: `pandoc input.docx -o output.md`
<!--/cli-->
<!--cli:osascript-->
- Use `osascript` with `execute <tab> javascript "<js>"` to read pages and interact using the user's real logged-in sessions (analyzing dashboards, checking Google Calendar and Mail, etc)
- If a needed site is not open, opening a new tab for it is acceptable on request.
<!--/cli-->

Important:
- Read-only commands, like checking state of GHA workflow or reading web page content, are fine without asking
- Commands with side effects, like push, create/modify/delete of repos, issues, PRs, releases, triggering workflows, submitting forms, posting or purchasing require an explicit go-ahead, like any other side-effect, as stated in the collaboration style section
