# 📦 NPM Publishing Setup Guide

This guide is for maintainers who need to set up or troubleshoot automated npm publishing.

## 🔐 Trusted Publisher Setup (✅ CONFIGURED)

**Good news!** This repository is configured to use **npm Trusted Publishers** (Provenance), which is the most secure publishing method. No tokens needed!

### What is a Trusted Publisher?

- Uses OpenID Connect (OIDC) to verify GitHub Actions can publish
- No secrets stored in GitHub (more secure than tokens)
- Provides cryptographic proof of package origin
- Recommended by npm for all new projects

### Current Configuration

The kwami package is configured as a Trusted Publisher:
- **npm Package:** https://www.npmjs.com/package/kwami
- **GitHub Repo:** https://github.com/alexcolls/kwami
- **Workflow:** `.github/workflows/publish.yml`
- **Method:** Publishes with `--provenance` flag

### How It Works

1. Merge to `main` with version bump
2. GitHub Actions workflow runs
3. GitHub issues OIDC token to the workflow
4. npm verifies the token matches trusted publisher config
5. Package publishes successfully with provenance attestation

### Verify Setup

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

### Workflow Fails: "401 Unauthorized" or "403 Forbidden"

**Problem:** Trusted publisher configuration mismatch

**Solution:**
1. Go to: https://www.npmjs.com/package/kwami/access
2. Click "Publishing access" → "Trusted publishers"
3. Verify the configuration:
   - Repository: `alexcolls/kwami`
   - Workflow: `publish.yml` (or `.github/workflows/publish.yml`)
   - Environment: (leave blank)
4. If incorrect, delete and re-add the trusted publisher
5. Re-run the failed workflow

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

1. **Trusted Publishers (Current):** Most secure - no secrets to manage
2. **Monitor Publishes:** Check npm package activity regularly
3. **Branch Protection:** Keep `main` branch protected (requires PR reviews)
4. **Review Workflows:** Audit workflow changes carefully
5. **Provenance:** Always publish with `--provenance` flag (already configured)

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

# 4. Publish (with provenance if possible)
npm publish --access public --provenance

# Note: Manual publishes won't have full provenance attestation
# Automation is strongly preferred for security

# 5. Create tag manually
git tag -a v1.2.3 -m "🚀 Release v1.2.3"
git push --tags
```

## 🔄 Alternative: Token-Based Publishing (Not Recommended)

If you need to switch to token-based publishing:

1. Remove trusted publisher from npm package settings
2. Generate Granular Access Token from npm
3. Add as `NPM_TOKEN` secret in GitHub
4. Update workflow to use <code v-pre>NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}</code>
5. Remove `--provenance` flag from publish command

**Note:** This is less secure than Trusted Publishers and not recommended.

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs: https://github.com/alexcolls/kwami/actions
2. Review this guide
3. Check npm status: https://status.npmjs.org
4. Contact repository owner: Alex Colls

---

**Last Updated:** November 19, 2025
**Workflow Version:** 1.0

