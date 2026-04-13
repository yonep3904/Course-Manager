# Course Manager

ある大学の工学部情報電気工学科の科目管理ツールです。
履修状況を管理し、単位数を集計できます。

## できること

- 科目一覧を表形式で確認する
- 履修済み / 履修登録予定をチェックボックスで管理する
- 必修・選択必修などの区分ごとに単位数を集計する
- 科目名や開講時期で検索する
- 表示フィルタを切り替える
- 状態をブラウザの Local Storage に保存する

※ローカルストレージなので、同じブラウザであればページを閉じても状態は保持されますが、別のブラウザやデバイスでは共有されません。また、ブラウザの設定でローカルストレージがクリアされると状態も消える可能性があります。

## 動作環境

- Node.js
- npm
- Python 3

Python は CSV を TypeScript に変換するスクリプトで使用します。
Python 以外の方法で CSV を TypeScript に変換しても構いませんが、スクリプトを使う場合は Python 3 が必要です。

## セットアップ

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開くと使えます。

公開前のビルド確認は次のコマンドで行います。

```bash
npm run build
```

## ページ構成

- `electrical-engineering`: 電気工学教育プログラムのページ
- `/programs/electronic-engineering`: 電子工学教育プログラム
- `/programs/information-engineering`: 情報工学教育プログラム

トップページ `/` は情報工学教育プログラムへリダイレクトします。

## 科目データの配置

CSV ファイルはリポジトリに含めず、生成された TypeScript ファイルを含めます。

- `app/data/programs/electrical-engineering/courses.ts`
- `app/data/programs/electronic-engineering/courses.ts`
- `app/data/programs/information-engineering/courses.ts`

新しいプログラムを追加する場合は `app/data/programs/*/courses.ts` を追加し、`app/data/programs.ts` にプログラム定義を追加します。

## `courses.csv` の形式

CSV は UTF-8 で保存し、1 行目は次のヘッダーにしてください。

```csv
授業科目,単位数,開講時期,必修選択
```

各列の意味は次のとおりです。

- `授業科目`: 科目名
- `単位数`: 整数
- `開講時期`: 表示用の文字列
- `必修選択`: 区分記号

`必修選択` は現在の実装では主に次の値を想定しています。

- `◯`: 必修
- `◎`: プログラム指定科目
- `*`: 選択必修
- 空欄: 自由選択
- `-`: プログラム外科目・履修不可

CSV の例:

```csv
授業科目,単位数,開講時期,必修選択
線形代数,2,1-前,◯
プログラミング基礎,2,1-後,◎
電子回路,2,2-前,*
インターンシップ,2,3-通,
```

## `courses.csv` の用意方法

公開用リポジトリには `courses.csv` を含めない想定です。用意のしかたは例えば次のどちらかです。

1. 大学のシラバスや履修要項を見ながら、手作業で CSV を作る
2. 手元で管理している表計算ファイルを CSV として書き出す

列名が一致していれば、`npm run generate:courses` で `courses.ts` を生成できます。

## 補足

- 大学固有のルールや区分に依存するコードを含みます
- 公開用に使う場合は、自分の所属先に合わせて区分や表示文言を調整してください
