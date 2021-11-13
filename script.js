// グローバル変数なのであえてvar
var brmUl = '.brm-page ul';
var fullList = null;
// リストの初期値を取得する
document.addEventListener('DOMContentLoaded', () => {
  fullList = document.querySelector(brmUl).querySelectorAll('.brm-page li');
  createItem(document.getElementById('filter').filterBy.value); //更新時の再表示
});

function createItem(category) {
  // 項目によってセレクトボックスの中身を変化させる
  const selector = document.getElementById('select-detail');
  const existingDetail = selector.querySelectorAll('option');
  if (existingDetail) {
    existingDetail.forEach((item) => selector.removeChild(item));
  }
  const addList = detailListing(category);
  addList.forEach((item) => {
    const op = document.createElement('option');
    op.value = item;
    op.text = item;
    selector.appendChild(op);
  });
}

function detailListing(category) {
  // カテゴリの正規表現に一致したDOMの配列を返す
  const regex = selectSorting(category);
  if (!regex) {
    return ['All'];
  }
  const duplicateDetails = Array.from(fullList).map(
    (item) => item.innerText.match(regex)[1]
  );
  const details = Array.from(new Set(duplicateDetails));
  return details.sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
}

function selectSorting(category) {
  // タイトルから抜き出す文字列を決める
  const dist = /(\d{3,})km/;
  const date = /BRM(\d{3,})/;
  const postponeDate = /BRM(\d{3,})/g;
  const team = /（(\S{2,})）/;
  const depart =
    /km\s([\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+)/; //[日本語に一致]
  switch (category) {
    case 'date':
      return date;
    case 'distance':
      return dist;
    case 'team':
      return team;
    case 'depart':
      return depart;
    case 'postponeDate':
      return postponeDate;
    default:
      return undefined;
  }
}

function sortBrm(category) {
  // 並べ替え処理
  const target = document.querySelector(brmUl);
  const existingList = target.querySelectorAll('li');
  const moves = { direction: 'X', movePx: 75, setTime: 500 };
  const argument = [target, category];
  peekABoo(target, moves, recreateList, [
    target,
    existingList,
    sorting(...argument),
  ]);
}

function sorting(dom, category) {
  // 並べ替え実行部分
  const pageList = dom.querySelectorAll('li');
  const listArray = Array.from(pageList);
  const sortRegex = selectSorting(category);
  if (!sortRegex) return;
  return listArray.sort((a, b) => {
    const textA = a.innerText.match(sortRegex);
    const textB = b.innerText.match(sortRegex);
    return textA[textA.length - 1].localeCompare(
      textB[textB.length - 1],
      'ja',
      { numeric: true }
    );
  });
}

function filterBrm(form) {
  // フィルタ処理
  const target = document.querySelector(brmUl);
  const existingList = target.querySelectorAll('li');
  const moves = { direction: 'Y', movePx: 50, setTime: 500 };
  const argument = [target, form.filterBy.value, form.detail.value];
  peekABoo(target, moves, recreateList, [
    target,
    existingList,
    filtering(...argument),
  ]);
}

function filtering(dom, category, detail) {
  // フィルタ実行部分
  return detail === 'All'
    ? Array.from(fullList)
    : // スタート地点とチーム名の重複を回避するために正規表現で取り出した値に対して一致をかける
      Array.from(fullList).filter((item) =>
        item.innerText.match(selectSorting(category))[1].match(detail)
      );
}

function recreateList(target, oldList, newList) {
  // DOMの子要素を入れ替える
  oldList.forEach((item) => target.removeChild(item));
  return newList.forEach((item) => target.appendChild(item));
}

function peekABoo(target, moves, func, arg) {
  // DOMを入れ替えて再表示
  const interval = moves.setTime + 0;
  fadeInOut(target, moves.direction, moves.movePx, moves.setTime);
  window.setTimeout(() => {
    func(...arg);
    fadeInOut(target, moves.direction, 0, moves.setTime);
  }, interval);
}

function fadeInOut(dom, direction, movePx, setTime) {
  // domで対象を指定。direction:Xで横方向、Yで縦方向。movePxの値フェードアウトする、0を指定するとフェードイン。動作時間をsetTime(ミリ秒)で指定。
  const opacity = movePx ? 0 : 1;
  const timer = setTime / 1000;
  dom.style.transition = `transform ${timer}s,opacity ${timer}s`;
  dom.style.transform = `translate${direction.toUpperCase()}(${movePx}px)`;
  dom.style.opacity = opacity;
}
