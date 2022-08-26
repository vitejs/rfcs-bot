# RFCs Bot

Automation of RFCs creation for [vitejs/rfcs](https://github.com/vitejs/rfcs).

This bot is provided as a GitHub App exclusively for the `vitejs/rfcs` repo. Upon a new RFC PR created, the bot will create a linked Discussion Thread with auto generated link to rendered RFC.

This is to workaround with GitHub Actions' [restriction on forked PR](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token) in a safe and elegant way.
