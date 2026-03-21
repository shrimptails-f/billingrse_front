#!/bin/bash
input=$(cat)

# Simple JSON value extractor (no jq needed)
json_val() {
  echo "$input" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*[0-9.]*" | head -1 | grep -o '[0-9.]*$'
}

cwd=$(echo "$input" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:.*"\(.*\)"/\1/')
branch=$(git --git-dir="$cwd/.git" --work-tree="$cwd" branch --no-optional-locks 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/')

# Context window usage
used_pct=$(json_val "used_percentage")
ctx_part=""
if [ -n "$used_pct" ]; then
  ctx_part=$(printf " \033[33mctx:%.0f%%\033[00m" "$used_pct")
fi

# Token counts from last API call
in_tok=$(json_val "input_tokens")
out_tok=$(json_val "output_tokens")
tok_part=""
if [ -n "$in_tok" ] && [ -n "$out_tok" ]; then
  tok_part=$(printf " \033[36min:%s out:%s\033[00m" "$in_tok" "$out_tok")
fi

# Claude.ai subscription rate limits - extract from nested objects
# Parse five_hour and seven_day used_percentage separately
five_pct=$(echo "$input" | grep -o '"five_hour"[^}]*}' | grep -o '"used_percentage"[[:space:]]*:[[:space:]]*[0-9.]*' | grep -o '[0-9.]*$')
week_pct=$(echo "$input" | grep -o '"seven_day"[^}]*}' | grep -o '"used_percentage"[[:space:]]*:[[:space:]]*[0-9.]*' | grep -o '[0-9.]*$')
rate_part=""
if [ -n "$five_pct" ] || [ -n "$week_pct" ]; then
  rate_str=""
  [ -n "$five_pct" ] && rate_str=$(printf "5h:%.0f%%" "$five_pct")
  [ -n "$week_pct" ] && rate_str="$rate_str $(printf "7d:%.0f%%" "$week_pct")"
  rate_part=$(printf " \033[35m%s\033[00m" "$(echo "$rate_str" | xargs)")
fi

printf "%s@%s:%s\033[34m%s\033[00m%s%s%s" "$(whoami)" "$(hostname -s)" "$cwd" "$branch" "$ctx_part" "$tok_part" "$rate_part"
