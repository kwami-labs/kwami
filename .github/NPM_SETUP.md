# 📦 NPM Publishing Setup Guide

This guide is for maintainers who need to set up or troubleshoot automated npm publishing.

## 🔐 Setting up NPM_TOKEN

The GitHub Actions workflow requires an `NPM_TOKEN` secret to publish packages to npm.

### Step 1: Generate an npm Access Token

1. **Log in to npm:**
   ```bash
   npm login
   ```
   Or visit: https://www.npmjs.com/login

2. **Navigate to Access Tokens:**
   - Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Or: Click your profile → Access Tokens

3. **Generate New Token:**
   - Click "Generate New Token"
   - Select **"Automation"** token type (recommended for CI/CD)
   - Give it a descriptive name: "GitHub Actions - kwami"
   - Click "Generate Token"

4. **Copy the token immediately:**
   - ⚠️ You won't be able to see it again!
   - It will look like: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to GitHub Secrets

1. **Navigate to Repository Settings:**
   - Go to: https://github.com/alexcolls/kwami/settings/secrets/actions
   - Or: Settings → Secrets and variables → Actions

2. **Create New Repository Secret:**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste the token from Step 1
   - Click "Add secret"

### Step 3: Verify Setup

1. **Test the workflow:**
   ```bash
   # On dev branch, bump the version
   npm version patch  # or minor/major
   
   # Push to dev
   git push && git push --tags
   
   # Create PR from dev → main
   # Once merged, the workflow will trigger
   ```

2. **Monitor the workflow:**
   - Go to: https://github.com/alexcolls/kwami/actions
   - Watch the "📦 Publish to npm" workflow
   - Check for any errors

3. **Verify on npm:**
   - Check: https://www.npmjs.com/package/kwami
   - New version should appear within minutes

## 🔧 Troubleshooting

### Workflow Fails: "401 Unauthorized"

**Problem:** Invalid or expired npm token

**Solution:**
1. Generate a new npm token (see Step 1 above)
2. Update the `NPM_TOKEN` secret in GitHub
3. Re-run the failed workflow

### Workflow Skips Publishing

**Problem:** Version number didn't change

**Solution:**
- The workflow only publishes when `package.json` version changes
- Bump the version: `npm version patch|minor|major`
- Commit and push the change

### Build Fails

**Problem:** TypeScript compilation errors or test failures

**Solution:**
1. Run tests locally: `npm test`
2. Run build locally: `npm run build`
3. Fix any errors before merging to `main`

### Tag Already Exists

**Problem:** Git tag for version already exists

**Solution:**
```bash
# Delete local tag
git tag -d v1.2.3

# Delete remote tag
git push --delete origin v1.2.3

# Re-run workflow or create tag manually
git tag -a v1.2.3 -m "🚀 Release v1.2.3"
git push --tags
```

## 📋 Pre-Release Checklist

Before merging a release PR to `main`:

- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated with release notes
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] PR reviewed and approved
- [ ] No breaking changes (or properly documented)
- [ ] Dependencies updated if needed

## 🔒 Security Best Practices

1. **Use Automation tokens:** Never use Classic tokens for CI/CD
2. **Limit scope:** Only give necessary permissions
3. **Rotate regularly:** Generate new tokens every 6-12 months
4. **Monitor usage:** Check npm token activity regularly
5. **Revoke if compromised:** Immediately revoke and generate new token

## 📊 Monitoring Published Packages

### Check npm package stats:
- Downloads: https://npm-stat.com/charts.html?package=kwami
- Version history: https://www.npmjs.com/package/kwami?activeTab=versions
- Package size: https://bundlephobia.com/package/kwami

### Verify package contents:
```bash
# Download and inspect published package
npm pack kwami
tar -xvzf kwami-*.tgz
ls -la package/
```

## 🚀 Manual Publishing (Emergency Only)

If automation fails and you need to publish immediately:

```bash
# 1. Ensure you're on main with latest changes
git checkout main
git pull origin main

# 2. Verify everything builds
npm ci
npm test
npm run build

# 3. Login to npm (if not already)
npm login

# 4. Publish
npm publish --access public

# 5. Create tag manually
git tag -a v1.2.3 -m "🚀 Release v1.2.3"
git push --tags
```

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs: https://github.com/alexcolls/kwami/actions
2. Review this guide
3. Check npm status: https://status.npmjs.org
4. Contact repository owner: Alex Colls

---

**Last Updated:** November 19, 2025
**Workflow Version:** 1.0

