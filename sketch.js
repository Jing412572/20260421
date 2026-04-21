let video;
let bubbles = []; // 宣告用來儲存泡泡資料的陣列
let saveBtn; // 宣告按鈕變數

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 取得攝影機影像並隱藏網頁預設的 video 元素
  video = createCapture(VIDEO);
  video.hide(); 
  video.size(320, 240); // 設定攝影機擷取畫面的解析度大小
  
  // 設定繪製圖片的基準點為中心點，方便後續置中對齊
  imageMode(CENTER);
  rectMode(CENTER); // 設定繪製矩形的基準點為中心點，用於繪製邊框
  
  // 初始化 50 個泡泡的資料
  for (let i = 0; i < 50; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      r: random(10, 30),     // 泡泡半徑大小
      speed: random(1, 3)    // 泡泡上升速度
    });
  }
  
  // 在畫面上產生一個按鈕
  saveBtn = createButton('儲存圖片');
  saveBtn.position(20, 20); // 設定按鈕在畫面上的絕對座標
  saveBtn.mousePressed(takeSnapshot); // 綁定點擊按鈕時的函式
}

function draw() {
  // 3. 設定畫布的背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 繪製背景半透明的泡泡
  noStroke();
  fill(255, 255, 255, 120); // 設定為半透明白色
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    circle(b.x, b.y, b.r * 2);
    b.y -= b.speed; // 讓泡泡不斷往上飄
    
    // 如果泡泡飄出畫面頂端，讓它從畫面底部重新出現
    if (b.y < -b.r) {
      b.y = height + b.r;
      b.x = random(width);
    }
  }

  push(); // 儲存當前的繪圖狀態
  
  // 將座標原點移至滑鼠位置，讓影像跟隨滑鼠
  translate(mouseX, mouseY);
  
  // 建立圓角矩形的剪裁範圍 (Clip)，確保底下的攝影機影像不會超出圓角
  drawingContext.beginPath();
  drawingContext.roundRect(-160, -120, 320, 240, 20); // 寬 320，高 240，以 (0,0) 為中心
  drawingContext.clip();
  
  scale(-1, 1); // 翻轉 X 軸，達到左右鏡像的效果
  
  // 4. 將攝影機影像轉換為黑白馬賽克效果
  video.loadPixels(); // 讀取攝影機當前影格的所有像素資料
  if (video.pixels.length > 0) { // 確保攝影機已啟動且有畫面
    let stepSize = 20; // 設定馬賽克單位的寬高
    noStroke(); // 馬賽克方塊不需要外框
    rectMode(CORNER); // 將矩形繪製模式改為左上角，方便排列計算
    
    for (let y = 0; y < video.height; y += stepSize) {
      for (let x = 0; x < video.width; x += stepSize) {
        let i = (y * video.width + x) * 4; // 計算在 1D pixels 陣列中的起始索引值
        let r = video.pixels[i];
        let g = video.pixels[i + 1];
        let b = video.pixels[i + 2];
        let gray = (r + g + b) / 3; // (R+G+B)/3 取得灰階顏色值
        
        fill(gray); // 設定填滿顏色為算出來的灰階值
        // 繪製馬賽克單位方塊，因為原點在中心(0,0)，需扣除寬高的一半將繪圖起始點移到左上角
        rect(x - video.width / 2, y - video.height / 2, stepSize, stepSize);
      }
    }
  }
  
  pop(); // 恢復原本的繪圖狀態
  
  // 5. 繪製跟隨滑鼠的邊框
  push(); // 再次儲存狀態，用來繪製邊框
  translate(mouseX, mouseY);
  noFill(); // 設定不填滿顏色，只繪製外框
  stroke('#ffffff'); // 設定邊框顏色 (此處設為白色，您可自由更改)
  strokeWeight(10); // 設定邊框的粗細為 10 像素
  rect(0, 0, 320, 240, 20); // 畫出圓角矩形
  pop(); // 恢復狀態
}

// 按下按鈕時執行的截圖函式
function takeSnapshot() {
  // 攝影機寬高為 320x240，加上 10 像素邊框，擷取總範圍為 330x250
  // 計算出以滑鼠位置為中心的左上角座標 (mouseX - 165, mouseY - 125)
  let img = get(mouseX - 165, mouseY - 125, 330, 250);
  
  // 儲存擷取下來的影像成 snapshot.jpg
  img.save('snapshot', 'jpg');
}

// 補充：加入此函式可確保使用者縮放瀏覽器視窗時，畫布能保持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
