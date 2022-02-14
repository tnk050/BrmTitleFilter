const handleUlQuery = ".brm-page ul";
const brmForm = {
  id: "brmListHandleForm",
  filterCategoryName: "filterCategory",
  filterDetailName: "filterDetail",
  sortCategoryName: "sortCategory",
};

// 初期化処理
window.onpageshow = () => {
  document.getElementById(brmForm.id).reset();
  brmList.set(handleUlQuery);
};

// BRM一覧の更新
function changeBrmList(method) {
  new ListHandler(brmList, brmForm)[method]();
}

const brmList = {
  set(query) {
    this.parent = document.querySelector(query);
    this.all = this.parent.querySelectorAll("li");
    this.live = this.parent.children;
  },
};

function ListHandler(list, formProps) {
  const { id, filterCategoryName, filterDetailName, sortCategoryName } =
    formProps;
  this.form = document.getElementById(id);
  this.filterCategory = this.form[filterCategoryName];
  this.filterDetail = this.form[filterDetailName];
  this.sortCategory = this.form[sortCategoryName];
  // 並べ替え、今表示されているものを並べ替える。
  this.sort = () => {
    const moveX = { direction: "X", movePx: 75, setTimeMs: 500 };
    const category = this.sortCategory.value;
    update(moveX, nodeSorting, [list.live, category]);
  };
  // フィルタ処理、リスト全体をフィルタする。
  this.filter = () => {
    const moveY = { direction: "Y", movePx: 50, setTimeMs: 500 };
    const sortCategory = this.sortCategory.value;
    const category = this.filterCategory.value;
    const detail = this.filterDetail.value;
    const filteredNode =
      detail === "All"
        ? Array.from(list.all)
        : // スタート地点とチーム名の重複を回避するために正規表現で取り出した値に対して一致をかける
          Array.from(list.all).filter((item) =>
            item.innerText.match(selectBrmRegexp(category))[1].match(detail)
          );
    update(moveY, nodeSorting, [filteredNode, sortCategory]);
  };
  // 並べ替え実行部分
  function nodeSorting(nodeList, category) {
    const listArray = Array.from(nodeList);
    const sortRegex = selectBrmRegexp(category);
    if (!!sortRegex) {
      return listArray.sort((a, b) => {
        const textA = a.innerText.match(sortRegex);
        const textB = b.innerText.match(sortRegex);
        return textA[textA.length - 1].localeCompare(
          textB[textB.length - 1],
          "ja",
          { numeric: true }
        );
      });
    } else {
      return [];
    }
  }
  // DOMを入れ替えて再表示
  function update(move, method, argument) {
    const interval = move.setTimeMs + 0;
    fadeInOut(list.parent, 0, move);
    window.setTimeout(() => {
      recreateChild(list.parent, Array.from(list.live), method(...argument));
      fadeInOut(list.parent, 1, move);
    }, interval);
    // 引数のdomをフェードイン、アウトさせる。 opacity:1でフェードイン、0でフェードアウト。 direction:Xで横方向、Yで縦方向。 movePx:移動量。 setTime:動作時間(ミリ秒)。
    function fadeInOut(dom, opacity, move) {
      const { direction, movePx, setTimeMs } = move;
      const timer = setTimeMs / 1000;
      dom.style.transition = `transform ${timer}s,opacity ${timer}s`;
      dom.style.transform = `translate${direction.toUpperCase()}(${
        opacity ? 0 : movePx
      }px)`;
      dom.style.opacity = opacity;
    }
  }
}

// 項目によってセレクトボックスの中身を変化させる
function updateOption(selectNode, category) {
  const existingDetail = selectNode.querySelectorAll("option");
  const newDetail = detailListing(brmList.all, category).map((item) => {
    const op = document.createElement("option");
    ["value", "text"].forEach((property) => (op[property] = item));
    return op;
  });
  recreateChild(selectNode, existingDetail, newDetail);
}

// カテゴリの正規表現に一致したDOMの配列から重複を除去して返す
function detailListing(nodeList, category) {
  const regex = selectBrmRegexp(category);
  if (!!regex) {
    const duplicateDetails = Array.from(nodeList).map(
      (item) => item.innerText.match(regex)[1]
    );
    const details = Array.from(new Set(duplicateDetails));
    return details.sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
  } else {
    return ["All"];
  }
}

// タイトルから抜き出す文字列を決める
function selectBrmRegexp(category) {
  switch (category) {
    case "date":
      return /BRM(\d{3,})/;
    case "distance":
      return /(\d{3,})km/;
    case "team":
      return /（(\S{2,})）/;
    case "depart":
      return /km\s([\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+)/; //[日本語に一致]
    case "postponeDate":
      return /BRM(\d{3,})/g; //1行から複数日取得するのでグローバルフラグ
    default:
      return undefined;
  }
}

// DOMの子要素を入れ替える
function recreateChild(parent, oldElements, newElements) {
  oldElements.forEach((item) => parent.removeChild(item));
  return newElements.forEach((item) => parent.appendChild(item));
}
