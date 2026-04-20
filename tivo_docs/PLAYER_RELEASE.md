# Player Release — TiVo Fork

How to create a release of the TiVo fork of Shaka Player.

## Prerequisites

- Git access to the `tivo` branch
- Push permission for tags
- `gh` CLI (optional, for checking workflow status)

## Creating a Release

### 1. Ensure you are on the `tivo` branch with latest changes

```bash
git checkout tivo
git pull origin tivo
```

### 2. Create and push a trigger tag

The tag must follow the format `tivo-v<VERSION>` where `<VERSION>` is the
base semantic version (e.g. `4.16.13`).

```bash
git tag tivo-v4.16.13
git push origin tivo-v4.16.13
```

### 3. Monitor the build

The push triggers the **Player Release** GitHub Actions workflow. Check status:

```bash
# Via gh CLI
gh run list --workflow=player_release.yaml

# Or visit the Actions tab in GitHub
```

### 4. Verify the release

Once the workflow completes, a new GitHub Release is created with:

| Field | Example |
|-------|---------|
| **Release tag** | `v4.16.13-alpha.tivo.1713100000` |
| **Title** | `Inception 1713100000` |
| **Assets** | `shaka-player-dist.tgz`, `shaka-player-4.16.13.tgz` |
| **Notes** | Auto-generated from commits since the previous tag |

## Artifacts

| File | Contents |
|------|----------|
| `shaka-player-dist.tgz` | Full `dist/` directory — all compiled variants (compiled, ui, dash, hls, experimental), debug + release builds, ES5 + ES2021, TypeScript definitions, Closure externs, and `controls.css` |
| `shaka-player-<version>.tgz` | npm-installable package (same as `npm install <path-to-file>`) |

## How It Works

1. You push a tag matching `tivo-v*` (e.g. `tivo-v4.16.13`)
2. GitHub Actions triggers `.github/workflows/player_release.yaml`
3. The workflow extracts the version from the tag name
4. Builds all library variants using `python3 build/all.py --force` (requires JDK 21 for Closure Compiler)
5. Packages `dist/` into `shaka-player-dist.tgz`
6. Runs `npm pack` to create the npm tarball
7. Creates a GitHub Release with tag `v<VERSION>-alpha.tivo.<TIMESTAMP>` and title `Inception <TIMESTAMP>`
8. Attaches both tarballs to the release

> **Note:** The trigger tag (`tivo-v4.16.13`) and the release tag
> (`v4.16.13-alpha.tivo.<timestamp>`) are intentionally different. The trigger
> tag is a simple marker; the release tag includes the timestamp for
> uniqueness.

## Troubleshooting

### Workflow doesn't trigger
- Verify the tag follows the exact format `tivo-v*` (e.g. `tivo-v4.16.13`)
- Verify the workflow file exists on the commit the tag points to
- Check that GitHub Actions is enabled for the repository

### Build fails
- The build requires **JDK 21** (Closure Compiler) and **Node.js 22**
- Run `python3 build/all.py --force` locally to reproduce
- Check the Actions log for the specific step that failed

### Release already exists
- If a release with the same computed tag already exists, `gh release create` will fail
- This is unlikely since the tag includes a Unix timestamp
- If it happens, delete the existing release and re-push the trigger tag

### Re-running a release for the same version
```bash
# Delete the old trigger tag
git tag -d tivo-v4.16.13
git push origin :refs/tags/tivo-v4.16.13

# Re-tag and push
git tag tivo-v4.16.13
git push origin tivo-v4.16.13
```
