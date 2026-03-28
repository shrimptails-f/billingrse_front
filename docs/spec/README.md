# 画面仕様一覧

`docs/spec` 配下にある画面仕様の一覧です。画面名をクリックすると、各画面の要件定義へ移動できます。

| 画面名                                                                            | URL                                         | 概要                                                                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [ログイン画面](./login/requirements-definition.md)                                | `/login`                                    | 登録済みユーザーがメールアドレスとパスワードで認証し、業務画面へ遷移するための入口画面。                 |
| [会員登録画面](./signup/requirements-definition.md)                               | `/signup`                                   | 未登録ユーザーが氏名、メールアドレス、パスワードを入力して仮登録を行い、確認メール送信フローへ進む画面。 |
| [メール認証画面](./verify-email/requirements-definition.md)                       | `/signup/verify?token=<verification-token>` | 確認メールのトークンでメールアドレス認証を実行し、成功・失敗に応じた次の導線を案内する画面。             |
| [メールアカウント連携画面](./mail-account-connections/requirements-definition.md) | `/mail-account-connections/gmail`           | Gmail アカウントの連携追加、連携済み一覧の確認、不要な連携の解除を行う管理画面。                         |
| [手動メール取得画面](./manual-mail-workflows/requirements-definition.md)          | `/manual-mail-workflows`                    | 条件を指定して手動メール取得ワークフローを開始し、実行履歴やステージ詳細を確認する画面。                 |
| [請求集計画面](./billing-summary/requirements-definition.md)                      | `/billing-summary`                          | 直近 12 ヶ月の請求推移と、選択月の支払先別請求内訳を集計ビューで確認する画面。                           |
