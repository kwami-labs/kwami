# 🔧 Maintainers Quick Reference

Quick reference for common maintenance tasks.

## 🚀 Release a New Version

### Standard Release (Automated)

```bash
# 1. Switch to dev and pull latest
git checkout dev
git pull origin dev

# 2. Bump version (choose one)
npm version patch  # 1.3.4 → 1.3.5 (bug fixes)
npm version minor  # 1.3.4 → 1.4.0 (new features)
npm version major  # 1.3.4 → 2.0.0 (breaking changes)

# 3. Update CHANGELOG.md
# Add release notes for the new version

# 4. Commit changes
git add CHANGELOG.md
git commit -m "📝 Update CHANGELOG for v1.3.5"

# 5. Push to dev
git push origin dev

# 6. Create release PR
# Title: "🚀 Release v1.3.5"
# Base: main ← Compare: dev
# Get it reviewed and approved

# 7. Merge PR to main
# GitHub Actions will automatically:
# ✅ Run tests
# 📦 Build package
# 🚀 Publish to npm
# 🏷️ Create git tag
```

### Monitor Release

```bash
# Check GitHub Actions
https://github.com/alexcolls/kwami/actions

# Verify on npm (wait ~2-3 minutes)
npm view kwami version
https://www.npmjs.com/package/kwami

# Check git tags
git fetch --tags
git tag -l
```

### Sync main back to dev

```bash
git checkout main
git pull origin main
git checkout dev
git merge main
git push origin dev
```

## 📦 npm Token Setup

If you need to set up or rotate the npm token:

1. Generate token at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Choose **"Automation"** token type
3. Add to GitHub secrets as `NPM_TOKEN`
4. Full guide: [NPM_SETUP.md](./NPM_SETUP.md)

## 🐛 Hotfix Release

For urgent fixes that can't wait for normal release cycle:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Make the fix and test
# ... make changes ...
npm test
npm run build

# 3. Bump version (patch only for hotfixes)
npm version patch

# 4. Update CHANGELOG.md
# Add hotfix notes

# 5. Commit and push
git add .
git commit -m "🚑 Fix critical bug"
git push origin hotfix/critical-bug

# 6. Create PR to main (skip dev for hotfixes)
# Get emergency approval

# 7. Merge to main → auto-publishes

# 8. Merge hotfix back to dev
git checkout dev
git merge hotfix/critical-bug
git push origin dev

# 9. Delete hotfix branch
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

## 🔍 Common Tasks

### Check Package Build Locally

```bash
npm run build
npm pack
tar -xvzf kwami-*.tgz
ls -la package/
rm -rf package kwami-*.tgz
```

### Test Package Locally Before Publishing

```bash
# In kwami repo
npm pack

# In test project
npm install /path/to/kwami-1.3.4.tgz
```

### View npm Package Info

```bash
npm view kwami
npm view kwami versions
npm view kwami dist-tags
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Or update specific package
npm install three@latest

# Test after updates
npm test
npm run build
npm run playground
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 🚨 Emergency Procedures

### Unpublish a Bad Release (24hr window only)

```bash
# ⚠️ Use with extreme caution!
npm unpublish kwami@1.5.8

# Then publish fixed version
npm version patch
npm publish --access public
```

### Deprecate a Version

```bash
# Better than unpublishing
npm deprecate kwami@1.5.8 "Critical bug, please upgrade to 1.3.6"
```

### Revert a Release

```bash
# 1. Revert the merge commit on main
git checkout main
git revert -m 1 <merge-commit-hash>
git push origin main

# 2. Delete the tag
git tag -d v1.3.5
git push origin --delete v1.3.5

# 3. Deprecate on npm
npm deprecate kwami@1.5.8 "Version reverted, please use 1.3.4"
```

## 📊 Package Health Checks

### Check Package Size

- Bundlephobia: https://bundlephobia.com/package/kwami
- Should be < 500KB ideally

### Monitor Downloads

- npm stat: https://npm-stat.com/charts.html?package=kwami
- Track growth over time

### Check Dependencies

```bash
# List all dependencies
npm ls

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

## 🔗 Useful Links

- **GitHub Actions:** https://github.com/alexcolls/kwami/actions
- **npm Package:** https://www.npmjs.com/package/kwami
- **Package Stats:** https://npm-stat.com/charts.html?package=kwami
- **Bundlephobia:** https://bundlephobia.com/package/kwami
- **npm Status:** https://status.npmjs.org

## 📞 Contact

For questions or issues:
- GitHub Issues: https://github.com/alexcolls/kwami/issues
- Direct: Alex Colls (@alexcolls)

---

**Last Updated:** November 19, 2025

