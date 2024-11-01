const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let invincible = false; // متغیر نابودناپذیری

// گرفتن high score از local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// تولید موقعیت جدید برای غذا
const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

// مدیریت پایان بازی
const handleGameOver = () => {
    if (!invincible) { // اگر نابودناپذیری فعال نیست
        clearInterval(setIntervalId);
        alert("Game Over! Press OK to Restart :)");
        location.reload();
    }
}

// تغییر جهت مار
const changeDirection = e => {
    if (e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// تغییر جهت با کلیک بر روی آیکون‌ها
controls.forEach(control => {
    control.addEventListener("click", () => {
        const direction = control.getAttribute("data-key");
        if (direction === "ArrowUp" && velocityY != 1) {
            velocityX = 0;
            velocityY = -1;
        } else if (direction === "ArrowDown" && velocityY != -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (direction === "ArrowLeft" && velocityX != 1) {
            velocityX = -1;
            velocityY = 0;
        } else if (direction === "ArrowRight" && velocityX != -1) {
            velocityX = 1;
            velocityY = 0;
        }
    });
});

// تغییر مسیر تصادفی در برخورد نزدیک با بدن
const randomizeDirectionOnCloseCollision = () => {
    if (!invincible) return; // فقط در حالت نابودناپذیری

    for (let i = 1; i < snakeBody.length; i++) {
        const [bodyX, bodyY] = snakeBody[i];
        // اگر یک خانه مانده به برخورد باشد
        if (
            (snakeX + velocityX === bodyX && snakeY + velocityY === bodyY)
        ) {
            // انتخاب جهت تصادفی جدید
            const directions = [
                { x: 0, y: -1 }, // بالا
                { x: 0, y: 1 },  // پایین
                { x: -1, y: 0 }, // چپ
                { x: 1, y: 0 }   // راست
            ];

            // حذف جهت فعلی از آرایه جهت‌ها
            const possibleDirections = directions.filter(dir => !(dir.x === velocityX && dir.y === velocityY));

            // انتخاب جهت جدید به صورت تصادفی
            const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            velocityX = newDirection.x;
            velocityY = newDirection.y;
            break;
        }
    }
}

// آغاز بازی
const initGame = () => {
    if (gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // بررسی برخورد مار با غذا
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // اضافه کردن به بدن مار
        score++; // افزایش امتیاز
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

    // به‌روزرسانی موقعیت سر مار
    snakeX += velocityX;
    snakeY += velocityY;

    // بررسی برخورد با دیوارها
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        if (invincible) {
            // اگر نابودناپذیری فعال باشد، به سمت مخالف برمی‌گردد
            if (snakeX <= 0) snakeX = 30; // دیواره چپ
            else if (snakeX > 30) snakeX = 1; // دیواره راست
            if (snakeY <= 0) snakeY = 30; // دیواره بالا
            else if (snakeY > 30) snakeY = 1; // دیواره پایین
        } else {
            gameOver = true;
        }
    }

    // تغییر مسیر تصادفی در برخورد نزدیک
    randomizeDirectionOnCloseCollision();

    // به‌روزرسانی بدن مار
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    for (let i = 0; i < snakeBody.length; i++) {
        // اضافه کردن بخش‌های بدن به HTML
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;

        // بررسی برخورد سر مار با بدن خود
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            if (invincible) {
                // در حالت نابودناپذیری، رد شدن از بدن خود
                continue;
            } else {
                gameOver = true;
            }
        }
    }
    playBoard.innerHTML = html;
}

// دکمه مخفی برای فعال‌سازی حالت نابودناپذیری
const hiddenButton = document.getElementById("hidden-button");
hiddenButton.addEventListener("click", () => {
    invincible = true; // فعال‌سازی حالت نابودناپذیری
    alert("حالت نابودناپذیری فعال شد! شما دیگر نمی‌توانید ببازید.");
});

updateFoodPosition();
setIntervalId = setInterval(initGame, 110);
document.addEventListener("keyup", changeDirection);