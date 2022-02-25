# BrmTitleFilter

オダ近 HP 内 BRM 一覧でフィルタとソート機能を実装するための javascript<br>

## 使い方

`form.html`内のフォームをホームページに設置。<br>
`script.js`を html に組み込む。<br>
操作したいリストのクエリを`handleUlQuery`に入力。<br>

## その他説明

`<li>`タグのテキストを正規表現で取り出していじってるだけなので元のページを壊したりはしないはず。<br>
なのでバグったらリロード。<br>
余所のホームページで使うときは適宜クラス名と正規表現を見直してください。<br>
`formStyle.css`を適用すると横並びになります。
