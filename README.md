# ThoughtBoard

A local, offline notepad board for your desktop. Pick a username, write short "thoughts" with a title and body, and edit or delete your own. Everything is stored in a JSON file on your computer, and there's no server or account.

## Download

Get the latest installer from the [Releases page](https://github.com/4mkbs/ThoughtBoard/releases/latest):

| Platform | File |
|---|---|
| Linux | `ThoughtBoard-Linux-<version>.AppImage` (portable) or `.deb` (Debian/Ubuntu) |
| Windows | `ThoughtBoard-Windows-<version>-Setup.exe` |
| macOS | `ThoughtBoard-Mac-<version>-arm64-Installer.dmg` (Apple Silicon) or `-x64-` (Intel) |

**Linux AppImage:** make it executable first: `chmod +x ThoughtBoard-Linux-*.AppImage`, then run it.

**Unsigned builds:** the installers aren't code-signed yet. On Windows, click *More info → Run anyway* on the SmartScreen prompt. On macOS, right-click the app and choose *Open*, or run `xattr -cr /Applications/ThoughtBoard.app` if it says the app is damaged.

## Features

- Write, edit and delete thoughts (you can only change your own)
- Switch between local usernames
- Export and import JSON backups
- Open or copy the location of the database file

Your data lives in `thoughts_db.json` inside the app's user-data folder (Settings → *Database Storage* shows the exact path).

## Development

Requires Node.js 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # run the app with hot reload
pnpm typecheck  # TypeScript check
pnpm dist       # build installers for your OS into release/<version>/
```

Built with Electron, Vite and TypeScript.

## Making a release

1. Bump `version` in `package.json` and commit.
2. Tag and push: `git tag v0.1.0 && git push origin v0.1.0`
3. GitHub Actions builds the Linux, Windows and macOS installers and publishes them to a new release.

## License

[MIT](LICENSE)
