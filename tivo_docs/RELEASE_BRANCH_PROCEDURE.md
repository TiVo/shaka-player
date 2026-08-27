# TiVo Release Branch Procedure

How to create a new `tivo/release/vX.Y.x` branch when upstream shaka-project
publishes a new release line, and how to keep an existing one current. See
`PLAYER_RELEASE.md` for how to actually cut a release once the branch exists.

## Topology

```
upstream/vX.Y.x (latest tag on that line)
      │
      ├── tivo/custom-fixes/vX.Y.x/ci-release-workflow
      ├── tivo/custom-fixes/vX.Y.x/multiple-player-fixes-from-v4.9
      ├── tivo/custom-fixes/vX.Y.x/captions-subtitles-fixes-for-hls
      └── tivo/custom-fixes/vX.Y.x/i-frame-seek-based-vtp
                      │  (each independently buildable + testable)
                      ▼
      tivo/integration/vX.Y.x   ← throwaway; merge all four, prove they compose
                      ▼
      tivo/release/vX.Y.x       ← the four merged in fixed order; long-lived
```

- `main` is a pure mirror of `upstream/main`. Never commit to it; only
  fast-forward.
- `tivo/ci` is the single source of truth for
  `.github/workflows/tivo_player_release.yaml` and everything under
  `tivo_docs/`.
- `tivo/custom-fixes/vX.Y.x/<fix-slug>` branches are **independent** — each is
  based directly on the upstream line's tip, never stacked on another fix
  branch. This lets every fix build and test in isolation against a pristine
  upstream tree.
- `tivo/integration/vX.Y.x` is a scratch branch used only to prove the four
  fix branches compose without conflict. Delete it once
  `tivo/release/vX.Y.x` is built the same way.
- `tivo/release/vX.Y.x` is the long-lived branch that ships. Future upstream
  patch releases on the same line (e.g. 5.2.8, 5.2.9) are merged directly into
  it — see "Ongoing maintenance" below.

## Stable fix slugs

| Slug | Files (typical) |
|---|---|
| `ci-release-workflow` | `.github/workflows/tivo_player_release.yaml`, `tivo_docs/*` |
| `multiple-player-fixes-from-v4.9` | `lib/media/playhead.js`, `lib/player.js` |
| `captions-subtitles-fixes-for-hls` | `lib/text/mp4_ttml_parser.js`, `lib/text/ttml_text_parser.js` |
| `i-frame-seek-based-vtp` | `lib/media/seek_based_trick_play_controller.js` (new), `lib/player.js`, `lib/media/streaming_engine.js`, `lib/media/media_source_engine.js`, `externs/shaka/player.js`, `ui/seek_bar.js`, `lib/util/player_configuration.js`, `lib/util/fake_event.js`, `lib/device/{tizen,webos}.js`, `demo/config.js`, `build/types/core`, `project-words.txt`, `shaka-player.uncompiled.js`, plus its unit test |

Port every slug that exists on the previous line. If a future fix is added,
give it a new stable slug here and in the AI prompt below.

## Cutting a new release line (vX.Y.x)

The full step-by-step procedure — and a fill-in-the-blanks prompt for an AI
model to execute it — is maintained as the canonical reference. Ask whoever
last ran this (or check the shaka-player fork's plan history) for the current
version of that prompt, and keep it in sync with this document whenever the
procedure changes. In outline:

0. Sync: `git fetch upstream --tags --prune`, fast-forward `main`, resolve the
   target line's tip tag and SHA.
1. Inventory what must be ported by diffing each `tivo/custom-fixes/<PREV>/*`
   branch against the previous line's base commit. Watch for older lines
   where fix branches were stacked — attribute every commit to exactly one
   slug before porting.
2. Port the low-risk fixes first (`ci-release-workflow`,
   `multiple-player-fixes-from-v4.9`, `captions-subtitles-fixes-for-hls`) as
   independent branches cut from the new line's tip. Cherry-pick with `-x`.
3. Port `i-frame-seek-based-vtp` last, in its own branch, since it touches the
   files upstream churns most. Verify with its unit test and a manual
   trickplay smoke test.
4. Verify each port is faithful: diff the new port against its base and
   compare to the old port's diff against its base — differences should be
   explainable only by upstream drift.
5. Build a throwaway `tivo/integration/vX.Y.x`, merging all fix branches
   `--no-ff` in slug order, and run the full build + test suite.
6. Build `tivo/release/vX.Y.x` the same way, from the same base, same order.
   Push, delete the integration branch.
7. Sanity check: `git log --oneline tivo/release/vX.Y.x --not upstream/vX.Y.x`
   should show only the four merges and the fix commits.
8. Do not tag or trigger a release automatically — hand off the branch SHAs
   and any conflict-resolution notes for a human to review before tagging
   (`tivo-v<version>` per `PLAYER_RELEASE.md`).

## Ongoing maintenance (patch releases on an existing line)

When upstream cuts a new patch on a line you already ship:

```bash
git fetch upstream --tags
git checkout tivo/release/vX.Y.x
git merge --no-ff -m "Merge upstream shaka-player <tag> into tivo/release/vX.Y.x" upstream/vX.Y.x
git push origin tivo/release/vX.Y.x
```

Rebuild and re-verify before releasing.

## Verification checklist

- `npm ci && python3 build/all.py --force` succeeds on every fix branch,
  the integration branch, and the release branch.
- `npx eslint <changed files>` is clean per fix branch.
- The release branch's tree matches the integration branch's tree exactly
  (`git diff tivo/integration/vX.Y.x tivo/release/vX.Y.x` is empty) before
  deleting the integration branch.
- Full test suite (Karma) passes — requires a real browser; not runnable in a
  headless/sandboxed environment. Run locally or in CI before shipping.
- Manual trickplay smoke test (fast-forward/rewind, seek bar thumbnails) on a
  DASH and an HLS asset, since `i-frame-seek-based-vtp` cannot be fully
  verified by the build/type-check alone.
