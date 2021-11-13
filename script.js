// BRM一覧の初期値とその操作クラス
const onloadBrmList = new (class {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.brmUl = document.querySelector('.brm-page ul');
      this.fullList = this.brmUl.querySelectorAll('li');
      this.sortForm = document.getElementById('sort');
    });
    this.selectBrmRegexp = (category) => {
      // タイトルから抜き出す文字列を決める
      switch (category) {
        case 'date':
          return /BRM(\d{3,})/;
        case 'distance':
          return /(\d{3,})km/;
        case 'team':
          return /（(\S{2,})）/;
        case 'depart':
          return /km\s([\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+)/; //[日本語に一致]
        case 'postponeDate':
          return /BRM(\d{3,})/g; //1行から複数日取得するのでグローバルフラグ
        default:
          return undefined;
      }
    };

    this.detailListing = (category) => {
      // カテゴリの正規表現に一致したDOMの配列から重複を除去して返す
      const regex = this.selectBrmRegexp(category);
      if (!regex) {
        return ['All'];
      }
      const duplicateDetails = Array.from(this.fullList).map(
        (item) => item.innerText.match(regex)[1]
      );
      const details = Array.from(new Set(duplicateDetails));
      return details.sort((a, b) =>
        a.localeCompare(b, 'ja', { numeric: true })
      );
    };

    this.filtering = (category, detail) => {
      // 詳細に一致したDOMを返す
      return detail === 'All'
        ? Array.from(this.fullList)
        : // スタート地点とチーム名の重複を回避するために正規表現で取り出した値に対して一致をかける
          Array.from(this.fullList).filter((item) =>
            item.innerText
              .match(this.selectBrmRegexp(category))[1]
              .match(detail)
          );
    };
  }
})();

// フィルター詳細ボックス操作クラス
const detailHandler = (() =>
  new (class {
    constructor() {
      document.addEventListener('DOMContentLoaded', () => {
        this.form = document.getElementById('filter');
        this.category = this.form.querySelector('#select-category');
        this.detail = this.form.querySelector('#select-detail');
        //初回、更新時のセレクトボックス再表示
        this.updateOption(this.category.value);
      });
    }

    updateOption(category) {
      // 項目によってセレクトボックスの中身を変化させる
      const existingDetail = this.detail.querySelectorAll('option');
      const newDetail = onloadBrmList.detailListing(category).map((item) => {
        const op = document.createElement('option');
        ['value', 'text'].forEach((property) => (op[property] = item));
        return op;
      });
      recreateChild(this.detail, existingDetail, newDetail);
    }
  })())();

class ListHandler {
  // liタグを操作するクラス
  constructor(target) {
    this.target = target;
    this.pageList = target.querySelectorAll('li');
    this.update = (moves) => (method) => (argument) =>
      peekABoo(this.target, moves)([this.pageList, method(...argument)]);
    this.sorting = (list, category) => {
      // 並べ替え実行部分
      const listArray = Array.from(list);
      const sortRegex = onloadBrmList.selectBrmRegexp(category);
      if (!sortRegex) return [];
      return listArray.sort((a, b) => {
        const textA = a.innerText.match(sortRegex);
        const textB = b.innerText.match(sortRegex);
        return textA[textA.length - 1].localeCompare(
          textB[textB.length - 1],
          'ja',
          { numeric: true }
        );
      });
    };
  }

  sort(category) {
    // 並べ替えと再表示
    const moveX = { direction: 'X', movePx: 75, setTime: 500 };
    const args = [this.pageList, category];
    this.update(moveX)(this.sorting)(args);
  }

  filter(category, detail) {
    // フィルタ処理と再表示
    const moveY = { direction: 'Y', movePx: 50, setTime: 500 };
    const args = [category, detail];
    this.update(moveY)(onloadBrmList.filtering)(args);
    onloadBrmList.sortForm.date.checked=true;
  }
}

function changeBrmList(method, category, detail) {
  // BRM一覧の更新
  new ListHandler(onloadBrmList.brmUl)[method](category, detail);
}

function peekABoo(target, moves) {
  // DOMを入れ替えて再表示
  const interval = moves.setTime + 0;
  return (lists) => {
    fadeInOut(target, moves.direction, moves.movePx, moves.setTime);
    window.setTimeout(() => {
      recreateChild(target, ...lists);
      fadeInOut(target, moves.direction, 0, moves.setTime);
    }, interval);
  };
}

function fadeInOut(dom, direction, movePx, setTime) {
  // domで対象を指定。direction:Xで横方向、Yで縦方向。movePxの値フェードアウトする、0を指定するとフェードイン。動作時間をsetTime(ミリ秒)で指定。
  const opacity = movePx ? 0 : 1;
  const timer = setTime / 1000;
  dom.style.transition = `transform ${timer}s,opacity ${timer}s`;
  dom.style.transform = `translate${direction.toUpperCase()}(${movePx}px)`;
  dom.style.opacity = opacity;
}

function recreateChild(target, oldElements, newElements) {
  // DOMの子要素を入れ替える
  oldElements.forEach((item) => target.removeChild(item));
  return newElements.forEach((item) => target.appendChild(item));
}
