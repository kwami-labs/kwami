#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
root_dir="$(cd -- "${script_dir}/.." &>/dev/null && pwd)"

cd "$root_dir"

get_root_version() {
  node --input-type=module -e "import fs from 'fs'; const p=JSON.parse(fs.readFileSync('package.json','utf8')); if(!p.version) process.exit(2); console.log(p.version)"
}

get_workspace_entries() {
  # Prints workspace entries exactly as defined in root package.json, one per line.
  node --input-type=module -e "
    import fs from 'fs';
    const p = JSON.parse(fs.readFileSync('package.json','utf8'));
    const ws = p.workspaces;
    const entries = Array.isArray(ws) ? ws : (ws && Array.isArray(ws.packages) ? ws.packages : null);
    if (!entries) process.exit(0);
    for (const e of entries) if (typeof e === 'string' && e.trim()) console.log(e.trim());
  "
}

resolve_workspaces() {
  # Expands simple trailing globs like \"packages/*\" and de-dupes results.
  local -A seen=()
  local resolved=()

  while IFS= read -r entry; do
    [[ -z "${entry:-}" ]] && continue

    if [[ "$entry" == */\* ]]; then
      local base="${entry%/*}"
      local base_abs="${root_dir}/${base}"
      [[ -d "$base_abs" ]] || continue
      while IFS= read -r child; do
        [[ -z "${child:-}" ]] && continue
        local rel="${base}/${child}"
        local abs="${root_dir}/${rel}"
        [[ -d "$abs" ]] || continue
        case "$child" in
          node_modules|.git|dist|.output|.nuxt|build) continue ;;
        esac
        if [[ -z "${seen[$rel]+x}" ]]; then
          seen["$rel"]=1
          resolved+=("$rel")
        fi
      done < <(ls -1 "$base_abs" 2>/dev/null || true)
      continue
    fi

    if [[ "$entry" == *"*"* ]]; then
      echo "   ⚠️  Skipping unsupported workspace pattern: $entry"
      continue
    fi

    if [[ -z "${seen[$entry]+x}" ]]; then
      seen["$entry"]=1
      resolved+=("$entry")
    fi
  done < <(get_workspace_entries || true)

  # Fallback list if workspaces aren't defined
  if [[ "${#resolved[@]}" -eq 0 ]]; then
    for d in kwami app candy market dao web pg; do
      if [[ -z "${seen[$d]+x}" ]]; then
        seen["$d"]=1
        resolved+=("$d")
      fi
    done
  fi

  printf '%s\n' "${resolved[@]}"
}

update_package_json_version() {
  # args: path version
  local pkg_path="$1"
  local new_version="$2"

  node --input-type=module -e "
    import fs from 'fs';
    const path = process.argv[1];
    const v = process.argv[2];
    const pkg = JSON.parse(fs.readFileSync(path,'utf8'));
    const old = pkg.version ?? null;
    if (!old) {
      const finalPkg = {
        name: pkg.name,
        version: v,
        ...Object.fromEntries(Object.entries(pkg).filter(([k]) => k !== 'name'))
      };
      fs.writeFileSync(path, JSON.stringify(finalPkg, null, 2) + '\n', 'utf8');
      console.log(['added', '', v].join('\t'));
      process.exit(0);
    }
    if (old !== v) {
      pkg.version = v;
      fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log(['updated', old, v].join('\t'));
      process.exit(0);
    }
    console.log(['noop', old, v].join('\t'));
  " "$pkg_path" "$new_version"
}

perl_update_versions_in_file() {
  # args: file currentVersion
  local file_path="$1"
  local current_version="$2"

  perl -0777 -e '
    use strict; use warnings;

    my ($path, $current) = @ARGV;
    open my $fh, "<:raw", $path or die "open: $!";
    local $/;
    my $orig = <$fh>;
    close $fh;

    sub is_older {
      my ($v1, $v2) = @_;
      my @a = map { int($_) } split(/\./, $v1);
      my @b = map { int($_) } split(/\./, $v2);
      return 0 if @a < 3 || @b < 3;
      return 1 if $a[0] != $b[0] && $a[0] < $b[0];
      return 1 if $a[1] != $b[1] && $a[1] < $b[1];
      return 1 if $a[2] < $b[2];
      return 0;
    }

    sub is_historical {
      my ($content, $idx) = @_;
      my $start = $idx - 500;
      $start = 0 if $start < 0;
      my $before = substr($content, $start, $idx - $start);

      my $history_re = qr/(##\s*(Version History|Changelog|Release Notes|Updates)|```changelog)/i;
      return 0 if $before !~ $history_re;

      # Find last marker position
      my $last_pos = -1;
      while ($before =~ /$history_re/g) {
        $last_pos = $-[0];
      }
      return 0 if $last_pos < 0;

      my $after_marker = substr($before, $last_pos);
      my $headers_after = () = ($after_marker =~ /\n##\s+/g);
      return $headers_after == 0 ? 1 : 0;
    }

    # Extract versions in file
    my %versions = ();
    while ($orig =~ /(?<!\d)(\d+\.\d+\.\d+)(?!\d)/g) {
      $versions{$1} = 1;
    }

    my @old_versions = grep { is_older($_, $current) } keys %versions;
    if (!@old_versions) {
      print $orig;
      exit 0;
    }

    my $content = $orig;
    my @pattern_templates = (
      q{(\*\*Version:\*\*|\*\*Version\*\*:?|Version:)\s*OLD_VERSION},
      q{kwami\@OLD_VERSION},
      q{"version":\s*"OLD_VERSION"},
      q{KWAMI v\.OLD_VERSION},
      q{Kwami v\.?\s?OLD_VERSION},
      q{(>\s*\*\*Version\s+)OLD_VERSION(\*\*)},
      q{'OLD_VERSION'},
      q{"OLD_VERSION"},
    );

    for my $old (@old_versions) {
      my $old_quoted = quotemeta($old);
      for my $tmpl (@pattern_templates) {
        (my $pat = $tmpl) =~ s/OLD_VERSION/$old_quoted/g;
        my $re = qr/$pat/;
        $content =~ s/$re/do {
          my $m = $&;
          my $idx = $-[0];
          if (is_historical($orig, $idx)) {
            $m
          } else {
            (my $r = $m) =~ s|\Q$old\E|$current|g;
            $r
          }
        }/ge;
      }
    }

    print $content;
  ' "$file_path" "$current_version"
}

version="$(get_root_version)"

if [[ -z "${version:-}" ]]; then
  echo "❌ Error: Version not found in root package.json" >&2
  exit 1
fi

echo ""
echo "📦 Syncing version: ${version}"
echo "   Source: package.json"
echo "   Mode: Automatic (will replace any version < ${version})"
echo ""

updated_count=0
skipped_count=0
updated_files=()

echo "📦 Updating workspace package.json files..."
echo ""

while IFS= read -r workspace; do
  [[ -z "${workspace:-}" ]] && continue
  pkg_path="${root_dir}/${workspace}/package.json"
  if [[ -f "$pkg_path" ]]; then
    if out="$(update_package_json_version "$pkg_path" "$version")"; then
      IFS=$'\t' read -r action old new <<<"$out"
      case "$action" in
        added)
          echo "   ✓ ${workspace}/package.json (added version ${new})"
          updated_files+=("${workspace}/package.json")
          ((++updated_count))
          ;;
        updated)
          echo "   ✓ ${workspace}/package.json (${old} → ${new})"
          updated_files+=("${workspace}/package.json")
          ((++updated_count))
          ;;
        noop)
          echo "   ✓ ${workspace}/package.json (already ${new})"
          ((++skipped_count))
          ;;
        *)
          echo "   ⚠️  Could not update ${workspace}/package.json (unknown action)"
          ((++skipped_count))
          ;;
      esac
    else
      echo "   ⚠️  Could not update ${workspace}/package.json"
      ((++skipped_count))
    fi
  else
    echo "   ⏭️  ${workspace}/package.json (not found)"
    ((++skipped_count))
  fi
done < <(resolve_workspaces)

echo ""
echo "📄 Scanning documentation and source files..."
echo ""

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

while IFS= read -r file; do
  [[ -z "${file:-}" ]] && continue
  [[ "$file" == *"/package-lock.json" ]] && continue

  rel="${file#${root_dir}/}"
  tmp="${tmp_dir}/out"

  perl_update_versions_in_file "$file" "$version" >"$tmp"

  if ! cmp -s "$file" "$tmp"; then
    mv "$tmp" "$file"
    updated_files+=("$rel")
    ((++updated_count))
  else
    ((++skipped_count))
  fi
done < <(
  find "$root_dir" \
    \( -type d \( -name node_modules -o -name .git -o -name dist -o -name .output -o -name .nuxt -o -name build \) -prune \) -o \
    \( -type f \( -name "*.md" -o -name "*.ts" -o -name "*.js" \) -print \)
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Version sync complete!"
echo "   Version: ${version}"
echo "   Updated: ${updated_count} files"
echo "   Skipped: ${skipped_count} files (already up-to-date)"

if [[ "${#updated_files[@]}" -gt 0 ]]; then
  echo ""
  echo "📝 Updated files:"
  for f in "${updated_files[@]}"; do
    echo "   ✓ ${f}"
  done
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""


