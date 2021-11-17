// 捜査対象の定義と初期化
const handleUlQuery ='.brm-page ul'
const filterFormId = 'filter';
const filterCategoryId = 'select-category'
const filterDetailId = 'select-detail'
const sortFormId = 'sort';
document.addEventListener('DOMContentLoaded', () => {
  [filterFormId,sortFormId].forEach(id=>document.getElementById(id).reset());
});

function changeBrmList(method, formName) {
  // BRM一覧の更新
  const property = [this[formName].category, this[formName].detail];
  new ListHandler(onloadBrmList.brmUl, sortFormId, filterFormId)[method](
    ...property
  );
}

function recreateChild(parent, oldElements, newElements) {
  // DOMの子要素を入れ替える
  oldElements.forEach((item) => parent.removeChild(item));
  return newElements.forEach((item) => parent.appendChild(item));
}

class PreserveList {
  constructor(ulQuery) {
    document.addEventListener('DOMContentLoaded', () => {
      this.brmUl = document.querySelector(ulQuery);
      this.fullList = this.brmUl.querySelectorAll('li');
    });
    this.filtering = (category, detail) => {
      //thisに入れとかないと動かない
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

  selectBrmRegexp(category) {
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
  }

  detailListing(category) {
    // カテゴリの正規表現に一致したDOMの配列から重複を除去して返す
    const regex = this.selectBrmRegexp(category);
    if (!regex) {
      return ['All'];
    }
    const duplicateDetails = Array.from(this.fullList).map(
      (item) => item.innerText.match(regex)[1]
    );
    const details = Array.from(new Set(duplicateDetails));
    return details.sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
  }
}

class OptionHandler {
  constructor(formId, parentQuery, childQuery) {
    document.addEventListener('DOMContentLoaded', () => {
      this.form = document.getElementById(formId);
      this.category = this.form.querySelector(parentQuery);
      this.detail = this.form.querySelector(childQuery);
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
}
class ActionInCss {
  constructor() {}
  fadeInOut(dom, direction, movePx, setTime) {
    // domで対象を指定。direction:Xで横方向、Yで縦方向。movePxの値フェードアウトする、0を指定するとフェードイン。動作時間をsetTime(ミリ秒)で指定。
    const opacity = movePx ? 0 : 1;
    const timer = setTime / 1000;
    dom.style.transition = `transform ${timer}s,opacity ${timer}s`;
    dom.style.transform = `translate${direction.toUpperCase()}(${movePx}px)`;
    dom.style.opacity = opacity;
  }

  peekABoo(target, moves) {
    // DOMを入れ替えて再表示
    const interval = moves.setTime + 0;
    return (oldElements, newElements) => {
      this.fadeInOut(target, moves.direction, moves.movePx, moves.setTime);
      window.setTimeout(() => {
        recreateChild(target, oldElements, newElements);
        this.fadeInOut(target, moves.direction, 0, moves.setTime);
      }, interval);
    };
  }
}

class ListHandler extends ActionInCss {
  // liタグを操作するクラス
  constructor(parent, sortFormId, filterFormId) {
    super();
    this.parent = parent;
    this.pageList = parent.querySelectorAll('li');
    this.sortForm = document.getElementById(sortFormId);
    this.filterForm = document.getElementById(filterFormId);
    this.update = (moves) => (method) => (argument) =>
      this.peekABoo(this.parent, moves)(this.pageList, method(...argument));
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

  sort() {
    // 並べ替えと再表示
    const moveX = { direction: 'X', movePx: 75, setTime: 500 };
    const category = this.sortForm.category.value;
    const args = [this.pageList, category];
    this.update(moveX)(this.sorting)(args);
  }

  filter() {
    // フィルタ処理と再表示
    const moveY = { direction: 'Y', movePx: 50, setTime: 500 };
    const sortCategory = this.sortForm.category.value;
    const category = this.filterForm.category.value;
    const detail = this.filterForm.detail.value;
    const args = [onloadBrmList.filtering(category, detail), sortCategory];
    this.update(moveY)(this.sorting)(args);
  }
}

// BRM一覧の初期値とその操作クラス
const onloadBrmList = new PreserveList(handleUlQuery);
// フィルター詳細ボックス操作クラス
const detailHandler = new OptionHandler(
  filterFormId,
  '#'+filterCategoryId,
  '#'+filterDetailId
);
