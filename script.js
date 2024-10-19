const dataUse = document.querySelector("[data-use]"),
  imageDetail = document.querySelector(".image-detail"),
  itemPixelate = document.querySelector(".item"),
  setAction = document.querySelector(".button"),
  inpFile = document.getElementById("file-upload"),
  imagePreview = document.querySelector(".image-preview"),
  radioInputs = document.querySelectorAll(".radio__input"),
  resultGrid = document.querySelector(".result-grid"),
  tableResult = document.querySelector(".table-result");

let pixelatePerGrid = false,
  pixelW = undefined,
  pixelH = undefined;

// --------------------------- Event -------------------------------//
document.querySelector("#mycheckbox").addEventListener("click", () => {
  const modeDataUse = dataUse.getAttribute("data-use");
  dataUse.setAttribute(
    "data-use",
    modeDataUse === "pixelate" ? "count-grid" : "pixelate"
  );
  addHideClass();
  setAction.querySelector(".btn").textContent =
    modeDataUse === "pixelate" ? "محاسبه شبکه" : "اعمال تغییرات";
});

///////////////////////////////////////////
radioInputs.forEach((el) => {
  el.addEventListener("click", (e) => {
    if (e.target.matches("#myRadio1")) return (pixelatePerGrid = false);
    return (pixelatePerGrid = true);
  });
});

///////////////////////////////////////////
inpFile.addEventListener("change", (e) => {
  const file = inpFile.files[0];
  if (!file) return;

  const modeDataUse = dataUse.getAttribute("data-use");
  addHideClass();
  modeDataUse === "pixelate"
    ? removeHideClass([imageDetail, itemPixelate, setAction])
    : removeHideClass([imageDetail, setAction]);

  loadImage(file);
  inpFile.value = "";
});

////////////////////////////////////////
imagePreview.addEventListener("click", (e) => {
  const modeDataUse = dataUse.getAttribute("data-use");

  if (!e.target.matches(".img") || modeDataUse !== "count-grid") return;

  const w = e.target.width,
    h = e.target.height,
    actualH = e.target.naturalHeight,
    actualW = e.target.naturalWidth;
  pixelW = Math.floor(scale(e.offsetX, 0, w, 0, actualW));
  pixelH = Math.floor(scale(e.offsetY, 0, h, 0, actualH));
});

////////////////////////////////////////
setAction.addEventListener("click", () => {
  const modeDataUse = dataUse.getAttribute("data-use");
  if (modeDataUse === "count-grid") return countGrid();

  const canvas = document.createElement("canvas");
  const img1 = new Image();

  img1.src = document.querySelector(".image-preview .img").src;

  img1.addEventListener("load", () => {
    const w = img1.width,
      h = img1.height;
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img1, 0, 0);

    const { px, py } = pixelatePerGrid
      ? mergePerGrid(ctx, w, h)
      : mergePerPixel(ctx, w, h);

    const img2 = new Image();
    img2.src = canvas.toDataURL("image/jpg");
    img2.width = w;
    img2.className = "img";
    const result = document.createElement("div");
    const detailPices = document.createElement("div");
    result.classList.add("result");
    result.classList.add("pice-detail");

    detailPices.innerHTML = `
    <span>تعداد قطعات:</span>
    <span class="image-size" style="text-align: right">
    ${py} ✕ ${px}
    </span>`;
    result.append(img2, detailPices);
    imagePreview.append(result);
  });
});

// ---------------------------Function-------------------------------//
let a1 = undefined,
  a2 = undefined;
function countGrid() {
  if (pixelW === undefined || pixelW === undefined) {
    return alert("لطفا ابتدا بر روی عکس کلیک کنید");
  }

  a1 = new Date().getTime();
  console.log(a1);
  const gap = Math.floor(imagePreview.querySelector(".img").naturalWidth / 5);

  const canvas = document.createElement("canvas");
  const img1 = new Image();

  img1.src = document.querySelector(".image-preview .img").src;

  img1.addEventListener("load", () => {
    const w = img1.width,
      h = img1.height;
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img1, 0, 0);

    const pixelArr = ctx?.getImageData(pixelW, pixelH, gap, 1);
    let arr = [];
    for (let i = 0; i < [...pixelArr.data].length; i += 4) {
      if ([...pixelArr.data][i] !== [...pixelArr.data][i + 4]) {
        arr.push(i);
      }
    }
    const pixel = (arr[3] - arr[2]) / 4;

    const px = Math.ceil(w / pixel),
      py = Math.ceil(h / pixel);

    resultGrid.classList.remove("hide");
    resultGrid.innerHTML = `
      <span>تعداد قطعات:</span>
      <span class="image-size" style="text-align: right">
      ${py} ✕ ${px}
      </span>`;

    const imgDataArray = [];

    for (let y = 0; y < py; y++) {
      for (let x = 0; x < px; x++) {
        const pixelArr = ctx?.getImageData(x * pixel, y * pixel, 1, 1);
        imgDataArray.push([...pixelArr.data]);
      }
    }
    countPalette(imgDataArray, pixel, w, h);
    a2 = new Date().getTime();
    console.log(a1);
    console.log((a2 - a1) / 1000);
  });
}
////////////////////////////////////////
/**
 *
 * @param {Array} imgDataArray
 * @param {Number} pixel
 * @param {Number} w
 * @param {Number} h
 */
function countPalette(array, pixel, w, h) {
  const imgDataArray = [],
    imgDataArrayRepeated = [];

  array.map((v) => {
    if (JSON.stringify(imgDataArray).includes(v)) return;
    imgDataArray.push(v);
  });

  const imgDataArrayToString = array.join("-");

  imgDataArray.map((v) => {
    const n = imgDataArrayToString.split(v.toString()).length - 1;
    imgDataArrayRepeated.push({
      RGBA: v,
      number: n,
    });
  });

  console.log(
    Math.floor(imgDataArrayRepeated.length / 3) + 1,
    Math.ceil(imgDataArrayRepeated.length / 3)
  );
  const gap = Math.floor(imgDataArrayRepeated.length / 3) + 1;
  tableResult.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const table = document.createElement("table");
    table.classList.add("table");

    table.innerHTML = `
      <thead>
        <tr>
          <th>کد رنگ</th>
          <th>رنگ</th>
          <th>تعداد</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    tableResult.append(table);
    for (let j = i * gap; j < (i + 1) * gap; j++) {
      if (!imgDataArrayRepeated[j]?.RGBA) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <tr>
        <td>(${imgDataArrayRepeated[j]?.RGBA})</td>
        <td>
          <span class="color-palette" style="background-color:rgba(${imgDataArrayRepeated[j]?.RGBA});"></span>
        </td>
        <td>${imgDataArrayRepeated[j]?.number}</td>
      </tr>
      `;
      table.querySelector("tbody").append(tr);
    }
  }
}
////////////////////////////////////////
const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};
////////////////////////////////////////
function mergePerPixel(ctx, w, h) {
  const pixel = +document.querySelector("#pixel-number").value,
    px = Math.floor(w / pixel) + 1,
    py = Math.floor(h / pixel) + 1;

  for (let y = 0; y < py; y++) {
    for (let x = 0; x < px; x++) {
      const pixelArr = ctx?.getImageData(x * pixel, y * pixel, pixel, pixel);
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      [...pixelArr.data].forEach((value, i) => {
        if (i % 4 === 0) {
          r += value;
        } else if (i % 4 === 1) {
          g += value;
        } else if (i % 4 === 2) {
          b += value;
        } else if (i % 4 === 3) {
          a += value;
        }
      });

      ctx.fillStyle = `rgba(${colorValue(r, pixel, pixel)}
      ,${colorValue(g, pixel, pixel)}
      ,${colorValue(b, pixel, pixel)}
      ,${colorValue(a, pixel, pixel)})`;

      ctx.fillRect(x * pixel, y * pixel, pixel, pixel);
    }
  }
  return { px, py };
}
////////////////////////////////////////
function mergePerGrid(ctx, w, h) {
  const px = +document.querySelector("#grid-x").value,
    py = +document.querySelector("#grid-y").value,
    stepX = Math.floor(w / px) + 1,
    stepY = Math.floor(h / py) + 1;

  for (let y = 0; y <= h; y += stepY) {
    for (let x = 0; x <= w; x += stepX) {
      const pixelArr = ctx?.getImageData(x, y, stepX, stepY);

      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      [...pixelArr.data].forEach((value, i) => {
        if (i % 4 === 0) {
          r += value;
        } else if (i % 4 === 1) {
          g += value;
        } else if (i % 4 === 2) {
          b += value;
        } else if (i % 4 === 3) {
          a += value;
        }
      });

      ctx.fillStyle = `rgba(${colorValue(r, stepX, stepY)}
      ,${colorValue(g, stepX, stepY)}
      ,${colorValue(b, stepX, stepY)}
      ,${colorValue(a, stepX, stepY)})`;

      ctx.fillRect(x, y, stepX, stepY);
    }
  }
  return { px, py };
}
////////////////////////////////////////
function colorValue(color, pixelX, pixelY) {
  return Math.floor(color / (pixelX * pixelY));
}
////////////////////////////////////////
function loadImage(file) {
  const reader = new FileReader();

  const image = document.createElement("img");
  reader.addEventListener("load", () => {
    image.classList = "img";
    imageSource = reader.result;
    image.setAttribute("src", imageSource);
  });
  reader.readAsDataURL(file);
  imagePreview.append(image);
  setTimeout(() => {
    imageDetail.querySelector(
      ".image-size"
    ).innerHTML = `${image.naturalHeight} ✕ ${image.naturalWidth}`;
  }, 200);
}
////////////////////////////////////////
/**
 *
 * @param {Array} arr
 */
function removeHideClass(arr) {
  arr.forEach((el) => el.classList.remove("hide"));
}

////////////////////////////////////////
/**
 *
 * @param {Array} arr
 */
function addHideClass() {
  [imageDetail, itemPixelate, setAction, resultGrid].forEach((el) =>
    el.classList.add("hide")
  );
  [...imagePreview.children, ...tableResult.children].forEach((child) =>
    child.remove()
  );
}
