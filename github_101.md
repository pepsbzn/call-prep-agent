# GitHub 101 — Reference Guide

---

## Core concepts (covered in Day 1)

| Concept | What it is |
|---|---|
| Repository | A project folder Git tracks |
| Commit | An immutable snapshot of your project |
| Branch | An isolated working copy |
| Push | Send local commits to GitHub |
| Pull | Bring GitHub commits to your local machine |
| Pull Request | A proposal to merge a branch into another |

---

## Commands you'll use constantly

### Checking state
```
git status              # what's changed and what's staged
git log --oneline       # history of commits on current branch
git diff                # see exactly what changed line by line (unstaged)
git diff --staged       # see what's staged but not yet committed
git branch              # list all local branches (* = current)
git branch -a           # list local AND remote branches
git remote -v           # confirm what GitHub repo you're connected to
```

### Undoing things
```
git restore filename        # discard unstaged changes to a file (permanent)
git restore --staged filename  # unstage a file (keeps your changes, just removes from staging)
git reset --soft HEAD~1    # undo the last commit but keep the changes staged
git reset --hard HEAD~1    # undo the last commit AND discard the changes (destructive)
```

Rule: `--soft` is safe. `--hard` is destructive. When in doubt use `--soft`.

### Stashing work in progress
```
git stash               # save your uncommitted changes temporarily and clean the branch
git stash pop           # bring those changes back
```

Use case: you're mid-change on a branch and need to quickly switch to fix something else. Stash saves your work without committing it.

### Working with remotes
```
git clone [url]         # copy an existing GitHub repo to your local machine
git fetch               # check what's changed on GitHub without pulling it down
git pull                # fetch + merge: brings remote changes into your current branch
```

---

## Merge conflicts — what they are and how to fix them

A merge conflict happens when two branches changed the same line of the same file. Git can't decide which version to keep, so it stops and asks you.

You'll see this in the file:
```
<<<<<<< HEAD
your version of the line
=======
their version of the line
>>>>>>> branch-name
```

**How to resolve:**
1. Open the file in a text editor
2. Decide which version to keep (or combine them)
3. Delete the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Save the file
5. `git add filename`
6. `git commit`

This will happen on every real Sierra project. It's not an error — it's Git asking for a human decision.

---

## .gitignore — what to always exclude

Your `.gitignore` should always include:
```
.env                    # API keys and secrets
__pycache__/            # Python cache files
*.pyc                   # compiled Python files
.DS_Store               # Mac OS metadata (ignore if on Windows)
node_modules/           # JavaScript dependencies (if ever relevant)
```

Rule: if it contains secrets or can be regenerated automatically, it shouldn't be in the repo.

---

## Cloning an existing repo

When you join a Sierra project that already exists on GitHub:
```
git clone https://github.com/org/repo-name.git
cd repo-name
```

This creates a local copy with the full history and remote already connected. You don't need `git init` or `git remote add` — clone handles all of it.

---

## Reading a PR on GitHub

When someone sends you a PR to review:
- **Files changed** tab — see every line added (green) and removed (red)
- **Commits** tab — see each individual commit that makes up the PR
- **Conversation** tab — leave comments on specific lines or overall

At Sierra you'll review agent configuration changes, prompt updates, and Journey logic this way. Even if you're not writing the code, you need to read what changed.

---

## Branch naming conventions

Pick a pattern and stick to it. Common ones:
```
feature/add-upsell-journey
fix/returns-guardrail-threshold
day-1-setup                    # what you used today — fine for solo projects
```

On a team, consistent naming makes it obvious what every branch is for without opening it.

---

## When things go wrong — quick diagnosis

| Symptom | Likely cause | Fix |
|---|---|---|
| `push` rejected | Remote has commits you don't have locally | `git pull` first, then push |
| `nothing to commit` when you expect changes | Files not staged | `git add` the files first |
| Merge conflict markers in a file | Two branches edited the same line | Resolve manually, then add and commit |
| `.env` shows up in `git status` | `.gitignore` not saved or not working | Check `.gitignore` has `.env` on its own line |
| Wrong branch | Forgot to create/switch before working | `git stash` → `git checkout correct-branch` → `git stash pop` |
| Committed something you shouldn't have | Need to undo last commit | `git reset --soft HEAD~1` |

---

## The daily workflow at Sierra

```
git checkout main           # start from the stable version
git pull                    # make sure it's up to date
git checkout -b feature/x   # create your branch
# do your work
git status                  # confirm what changed
git add specific-files      # stage deliberately
git commit -m "clear message"
git push -u origin feature/x
# open PR on GitHub
# get reviewed and merged
git checkout main
git pull
```
Practice PR — learning the workflow