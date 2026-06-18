#!/usr/bin/env python3
"""计算各等级套餐的 5h 配额 和 周配额"""

# 已知数据
pro_5h_tokens = 59_304_317
pro_5h_calls = 527

# Pro 周配额 = 5h 配额 × 5
pro_week_tokens = pro_5h_tokens * 5
pro_week_calls = pro_5h_calls * 5

# Lite = Pro / 5
lite_5h_tokens = pro_5h_tokens / 5
lite_5h_calls = pro_5h_calls / 5
lite_week_tokens = lite_5h_tokens * 5
lite_week_calls = lite_5h_calls * 5

# Max = Pro × 4
max_5h_tokens = pro_5h_tokens * 4
max_5h_calls = pro_5h_calls * 4
max_week_tokens = max_5h_tokens * 5
max_week_calls = max_5h_calls * 5

# 格式化输出（以百万 M 为单位）
def fmt_tokens(n: float) -> str:
    m = n / 1_000_000
    return f"{m:.2f}M"

def fmt_calls(n: float) -> str:
    return f"{n:,.0f}" if n == int(n) else f"{n:,.1f}"

print("=" * 62)
print(f"{'套餐':^8} {'5h Token 配额':>16} {'5h 调用次数':>12} {'周 Token 配额':>16} {'周调用次数':>12}")
print("=" * 62)

rows = [
    ("Lite", lite_5h_tokens, lite_5h_calls, lite_week_tokens, lite_week_calls),
    ("Pro", pro_5h_tokens, pro_5h_calls, pro_week_tokens, pro_week_calls),
    ("Max", max_5h_tokens, max_5h_calls, max_week_tokens, max_week_calls),
]

for name, t5, c5, tw, cw in rows:
    print(f"{name:^8} {fmt_tokens(t5):>16} {fmt_calls(c5):>12} {fmt_tokens(tw):>16} {fmt_calls(cw):>12}")

print("=" * 62)

# 倍数验证
print("\n倍数关系验证:")
print(f"  Pro / Lite = {pro_5h_tokens / lite_5h_tokens:.0f}x  (应为 5x)")
print(f"  Max / Pro  = {max_5h_tokens / pro_5h_tokens:.0f}x  (应为 4x)")
print(f"  Week / 5h  = {pro_week_tokens / pro_5h_tokens:.0f}x  (应为 5x)")
