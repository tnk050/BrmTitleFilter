// グローバル変数なのであえてvar
var brmUl = '.brm-page ul';
var fullList = null;
var fullListArray = null;
// リストの初期値を取得する
document.addEventListener('DOMContentLoaded', () => {
  fullList = document.querySelector(brmUl).querySelectorAll('.brm-page li');
  fullListArray = Array.from(fullList);
});

function createItem(category) {
  // 項目によってセレクトボックスの中身を変化させる
  const selector = document.getElementById('select-detail');
  const existingDetail = selector.querySelectorAll('option');
  if (existingDetail) {
    existingDetail.forEach((item) => selector.removeChild(item));
  }
  const addList = (() => {
    const regex = selectSorting(category);
    if (!regex) {
      return ['All'];
    }
    const dupliceteDetails = fullListArray.map(
      (item) => regex.exec(item.innerText)[1]
    );
    const details = Array.from(new Set(dupliceteDetails));
    return details.sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
  })();
  addList.forEach((item) => {
    const op = document.createElement('option');
    op.value = item;
    op.text = item;
    selector.appendChild(op);
  });
}

function selectSorting(category) {
  // タイトルから抜き出す文字列を決める
  const dist = /(\d{3,})km/;
  const date = /BRM(\d{3,})/;
  const team = /（(\S{2,})）/;
  const depart =
    /km\s([\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+)/; //[日本語に一致]
  switch (category) {
    case 'date':
      return date;
      break;
    case 'distance':
      return dist;
      break;
    case 'team':
      return team;
      break;
    case 'depart':
      return depart;
      break;
    default:
      return undefined;
  }
}

function sortBrm(category) {
  // 並べ替え処理
  const target = document.querySelector(brmUl);
  const fadeDirection = 'X';
  const fadePx = 75;
  const fadeTime = 500;
  fadeInOut(target, fadeDirection, fadePx, fadeTime);
  window.setTimeout(() => {
    sorting(target, category);
    fadeInOut(target, fadeDirection, 0, fadeTime);
  }, fadeTime + 100);
}

function sorting(dom, category) {
  // 並べ替え実行部分
  const pageList = dom.querySelectorAll('li');
  const listArray = Array.from(pageList);
  const sortRegex = selectSorting(category);
  if (!sortRegex) return;
  listArray.sort((a, b) =>
    sortRegex
      .exec(a.innerText)[1]
      .localeCompare(sortRegex.exec(b.innerText)[1], 'ja', { numeric: true })
  );
  listArray.forEach((item) => dom.appendChild(item));
}

function filterBrm(detail) {
  // フィルタ処理
  const target = document.querySelector(brmUl);
  const fadeDirection = 'Y';
  const fadePx = 50;
  const fadeTime = 500;
  fadeInOut(target, fadeDirection, fadePx, fadeTime);
  window.setTimeout(() => {
    filtering(target, detail);
    fadeInOut(target, fadeDirection, 0, fadeTime);
  }, fadeTime + 100);
}

function filtering(dom, detail) {
  // フィルタ実行部分
  const existingList = dom.querySelectorAll('li');
  if (existingList) {
    existingList.forEach((item) => dom.removeChild(item));
  }
  const filterList =
    detail === 'All'
      ? fullListArray
      : fullListArray.filter((item) => item.innerText.match(detail));
  filterList.forEach((item) => dom.appendChild(item));
}

function fadeInOut(dom, direction, movePx, setTime) {
  // domで対象を指定。direction:Xで横方向、Yで縦方向。movePxの値フェードアウトする、0を指定するとフェードイン。動作時間をsetTime(ミリ秒)で指定。
  const opacity = movePx ? 0 : 1;
  const timer = setTime / 1000;
  dom.style.transition = `transform ${timer}s,opacity ${timer}s`;
  dom.style.transform = `translate${direction.toUpperCase()}(${movePx}px)`;
  dom.style.opacity = opacity;
}
