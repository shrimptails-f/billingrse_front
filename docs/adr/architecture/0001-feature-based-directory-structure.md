# ADR 0001: Feature ベースのディレクトリ構成への移行

Status: Accepted  
Date: 2026-03-27

## Context

現行の `src/pages/*` 配下には、画面コンポーネントだけでなく、その画面専用の `hooks`、`api`、`schema`、`types`、テストが同居している。
この状態自体は co-location としては悪くないが、ディレクトリ名が `pages` のため、責務が「route の受け口」なのか「業務機能の実装」なのかが曖昧になっている。

このプロジェクトはポートフォリオであるが、題材は業務アプリ寄りであり、少なくとも次のような関心が存在する。

- 認証
- Gmail 連携
- メール認証
- 請求集計
- 手動メール処理

これらは UI 種別ではなく、明確な業務機能である。
そのため、`components/`, `hooks/`, `pages/`, `lib/` のような type-based な分割より、業務機能を基準にした feature-based な構成のほうが責務と変更理由が一致しやすい。

一方で、route と feature は別の軸である。
`features` ごとに route table まで持たせると、URL 設計と業務機能の責務が混ざる。
そのため、route 定義は `app/router` に集約しつつ、各 feature はその feature に属する screen、UI、hooks、API を持つ形が望ましい。

また、`pages/` と `features/` をトップレベルで並立させる構成は採用しない。
その構成は、route 用ディレクトリと業務機能用ディレクトリを往復する必要があり、コードの局所性を下げやすいためである。

## Decision

ディレクトリ構成は `app / features / shared` を基本とする。

- `app`
  URL、router、guard、providers、layout などアプリ全体の骨格を置く
- `features`
  業務機能単位でコードを配置する
- `shared`
  複数 feature から再利用され、かつ業務知識を持たない UI や基盤コードを置く

想定する構成は次のとおりとする。

```txt
src/
  app/
    router/
      index.tsx
      guards/
    providers/
    layouts/
    styles/

  features/
    auth/
      screens/
      components/
      hooks/
      api/
      schema/
      lib/

    gmail-integration/
      screens/
      components/
      hooks/
      api/
      types/

    billing/
      screens/
      components/
      hooks/
      api/
      types/

    manual-mail-workflows/
      screens/
      components/
      hooks/
      api/
      schema/
      types/

    dashboard/
      screens/
      components/

  shared/
    ui/
    api/
    hooks/
    lib/
```

feature 名は画面名ではなく業務機能名で付ける。
例えば `login` や `billing-summary` をトップレベル feature 名にするのではなく、`auth`、`billing`、`gmail-integration` のように命名する。

各 feature 配下に `screens/` を置くことは許容する。
ここでの `screens/` は route 定義そのものではなく、その feature に属する画面入口を表す。
route table は `app/router` が持ち、`app/router` から feature の screen を参照する。

現在の主な配置は、次のように移行する。

| 現在 | 移行先 |
| --- | --- |
| `src/pages/login/*` | `src/features/auth/*` |
| `src/pages/signup/*` | `src/features/auth/*` |
| `src/pages/signup/email-sent/*` | `src/features/auth/*` |
| `src/pages/signup/verify/*` | `src/features/auth/*` |
| `src/pages/mail-account-connections/gmail/*` | `src/features/gmail-integration/*` |
| `src/pages/mail-account-connections/gmail/callback/*` | `src/features/gmail-integration/*` |
| `src/pages/billing-summary/*` | `src/features/billing/*` |
| `src/pages/manual-mail-workflows/*` | `src/features/manual-mail-workflows/*` |
| `src/pages/home/*` | `src/features/dashboard/*` |
| `src/providers/*` | `src/app/providers/*` |
| `src/layouts/*` | `src/app/layouts/*` |
| `src/styles/*` | `src/app/styles/*` |
| `src/lib/api/client.ts` | `src/shared/api/client.ts` |
| `src/lib/api/errors.ts` | `src/shared/api/errors.ts` |

運用ルールは次のとおりとする。

- 1 つの feature でしか使わない code は `shared` に出さない
- `shared` には業務知識を持たない code だけを置く
- feature 間の直接依存は最小限に抑える
- `page.tsx` のような汎用名より、`LoginPage.tsx` のような明示的な名前を優先する
- route の変更は `app/router` で完結させる

## Consequences

この決定により、認証、Gmail 連携、請求集計のような変更は、対応する feature ディレクトリの中で完結しやすくなる。
UI、hooks、API、schema、テストが同じ業務機能の近くに集まるため、変更理由とコード配置の整合性が高まる。

また、`app/router` に route の責務を残すことで、URL 設計、認可、layout 合成の変更箇所が明確になる。
feature 側は業務機能に集中できるため、route 軸と業務機能軸の混線を避けられる。

一方で、初期のリファクタコストは発生する。
import path の修正、router の切り出し、shared 化の見直しが必要になる。
また、`shared` へ早く出しすぎると再び責務が曖昧になるため、共通化の判断には抑制が必要である。

段階的に進める場合は、次の順序を基本とする。

1. `app/router` を切り出す
2. `src/pages/*` を対応する feature へ移す
3. 複数 feature で本当に共通なものだけを `shared` へ移す

この ADR により、このプロジェクトでは「画面名ベースの `pages` 中心構成」ではなく、「業務機能名ベースの `features` 中心構成」を採用する。
