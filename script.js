/* =========================================
   Date.exe - تنظیمات و منطق برنامه
========================================= */

const CONFIG = {
    funnyWarnings: [
        "⚠️ این گزینه فعلاً توسط الیاس پشتیبانی نمی‌شود!",
        "🚫 خطای 404: گزینه «نه» پیدا نشد!",
        "😐 جدی؟ دوباره امتحان کن.",
        "😂 فکر کردین دکمه نه کار می‌کنه؟",
        "⚠️ الیاس به شدت با این تصمیم مخالف است!",
        "🧐 لطفاً یک گزینه منطقی انتخاب کنید.",
        "💔 قلب الیاس با این انتخاب سازگار نیست.",
        "😌 فقط یک گزینه باقی مانده..."
    ]
};

const persianMonths = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

let currentYear;
let currentMonth;
let selectedDate = null;
let selectedTime = null;
let selectedActivity = null;
let noClickCount = 0;

const el = id => document.getElementById(id);

// بخش‌ها (Screens)
const terminalScreen = el("terminalScreen");
const questionScreen = el("questionScreen");
const dateScreen = el("dateScreen");
const timeScreen = el("timeScreen");
const activityScreen = el("activityScreen");
const finalScreen = el("finalScreen");
const greetingScreen = el("greetingScreen");
const continueToQuestionBtn = el("continueToQuestionBtn");
// دکمه‌ها و المان‌ها
const yesButton = el("yesButton");
const noButton = el("noButton");
const questionArea = el("questionArea");
const warningText = el("warningText");
const calendarDays = el("calendarDays");
const monthTitle = el("monthTitle");
const selectedDateText = el("selectedDateText");

const continueToTime = el("continueToTime");
const continueToActivity = el("continueToActivity");
const continueToFinal = el("continueToFinal");

const summaryDate = el("summaryDate");
const summaryTime = el("summaryTime");
const summaryActivity = el("summaryActivity");

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(item => item.classList.remove("active"));
    screen.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toPersianNumber(value) {
    const digits = "۰۱۲۳۴۵۶۷۸۹";
    return String(value).replace(/[0-9]/g, d => digits[d]);
}

/* ---------- ۱. انتقال خودکار از ترمینال به سوال ---------- */
setTimeout(() => showScreen(greetingScreen), 3500);

/* ---------- ۲. بخش سوال و دکمه نه ---------- */
yesButton.addEventListener("click", () => {
    resetQuestionButton();
    initializeCalendar();
    showScreen(dateScreen);
});

function showWarning() {
    noClickCount += 1;
    const index = (noClickCount - 1) % CONFIG.funnyWarnings.length;
    let message = CONFIG.funnyWarnings[index];

    if (noClickCount >= 6) {
        message = "🚨 FINAL WARNING: گزینه «نه» فعلاً در این نسخه از برنامه موجود نمی‌باشد 😂❤️";
    }

    warningText.textContent = message;
}

function moveNoButton() {
    const areaRect = questionArea.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();

    const maxX = Math.max(0, areaRect.width - buttonRect.width);
    const maxY = Math.max(0, areaRect.height - buttonRect.height);

    noButton.style.position = "absolute";
    noButton.style.left = `${Math.random() * maxX}px`;
    noButton.style.top = `${Math.random() * maxY}px`;
}

noButton.addEventListener("mouseenter", () => {
    showWarning();
    moveNoButton();
});

noButton.addEventListener("click", event => {
    event.preventDefault();
    showWarning();
    moveNoButton();
});

function resetQuestionButton() {
    noButton.style.position = "relative";
    noButton.style.left = "";
    noButton.style.top = "";
    warningText.textContent = "";
    noClickCount = 0;
}

/* ---------- ۳. تقویم ---------- */
function initializeCalendar() {
    if (typeof jalaali === "undefined") {
        alert("خطا: کتابخانه تقویم بارگذاری نشده است.");
        return;
    }

    const today = new Date();
    const todayJ = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    currentYear = todayJ.jy;
    currentMonth = todayJ.jm;
    selectedDate = null;
    selectedDateText.textContent = "هنوز تاریخی انتخاب نشده";
    continueToTime.disabled = true;
    continueToTime.classList.add("disabled");
    renderCalendar();
}

function renderCalendar() {
    monthTitle.textContent = `${persianMonths[currentMonth - 1]} ${toPersianNumber(currentYear)}`;
    calendarDays.innerHTML = "";

    const firstGregorian = jalaali.toGregorian(currentYear, currentMonth, 1);
    const firstDate = new Date(firstGregorian.gy, firstGregorian.gm - 1, firstGregorian.gd);
    const startDay = (firstDate.getDay() + 1) % 7;
    const daysInMonth = jalaali.jalaaliMonthLength(currentYear, currentMonth);

    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement("div");
        empty.className = "empty-day";
        calendarDays.appendChild(empty);
    }

    const today = new Date();
    const todayJ = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.textContent = toPersianNumber(day);

        if (currentYear === todayJ.jy && currentMonth === todayJ.jm && day === todayJ.jd) {
            button.classList.add("today");
        }

        if (selectedDate && selectedDate.y === currentYear && selectedDate.m === currentMonth && selectedDate.d === day) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => selectDate(currentYear, currentMonth, day));
        calendarDays.appendChild(button);
    }
}

function selectDate(year, month, day) {
    selectedDate = { y: year, m: month, d: day };
    selectedDateText.textContent = `تاریخ انتخابی شما: ${toPersianNumber(day)} ${persianMonths[month - 1]} ${toPersianNumber(year)}`;
    continueToTime.disabled = false;
    continueToTime.classList.remove("disabled");
    renderCalendar();
}

el("prevMonth").addEventListener("click", () => {
    currentMonth -= 1;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear -= 1;
    }
    renderCalendar();
});

el("nextMonth").addEventListener("click", () => {
    currentMonth += 1;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
    }
    renderCalendar();
});

continueToTime.addEventListener("click", () => {
    if (!selectedDate) return;
    showScreen(timeScreen);
});

/* ---------- ۴. انتخاب ساعت ---------- */
document.querySelectorAll(".time-slot").forEach(slot => {
    slot.addEventListener("click", () => {
        document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
        slot.classList.add("selected");
        selectedTime = slot.getAttribute("data-time");
        continueToActivity.disabled = false;
        continueToActivity.classList.remove("disabled");
    });
});

continueToActivity.addEventListener("click", () => {
    if (!selectedTime) return;
    showScreen(activityScreen);
});

/* ---------- ۵. انتخاب فعالیت ---------- */
document.querySelectorAll(".option-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedActivity = card.getAttribute("data-activity");
        continueToFinal.disabled = false;
        continueToFinal.classList.remove("disabled");
    });
});

continueToFinal.addEventListener("click", () => {
    if (!selectedActivity) return;

    const displayDate = `${toPersianNumber(selectedDate.d)} ${persianMonths[selectedDate.m - 1]} ${toPersianNumber(selectedDate.y)}`;
    const displayTime = toPersianNumber(selectedTime);

    summaryDate.textContent = displayDate;
    summaryTime.textContent = displayTime;
    summaryActivity.textContent = selectedActivity;

    showScreen(finalScreen);
});

/* ---------- ۶. ارسال به تلگرام ---------- */
el("sendToTelegram").addEventListener("click", () => {
    const displayDate = summaryDate.textContent;
    const displayTime = summaryTime.textContent;
    const displayActivity = summaryActivity.textContent;
    const extraNotes = el("extraNotes").value.trim();

    let notesText = "";
    if (extraNotes !== "") {
        notesText = `\n💬 **توضیحات:** ${extraNotes}\n`;
    }

    const message = `سلام... برنامه‌ای که الهام برای این عصرِ پاییزی انتخاب کرد ☕🍁\n\n` +
                    `🗓 **تاریخ:** ${displayDate}\n` +
                    `⏰ **ساعت:** ${displayTime}\n` +
                    `🥂 **برنامه:** ${displayActivity}\n` +
                    `${notesText}\n` +
                    `همه‌چیز برای یه گپ‌وگفتِ خوب و یه خاطره‌ی قشنگ ردیف شد. بقیه‌ی سناریو با تو ✨`;

    // آیدی تلگرام خودتان را جایگزین کنید
    const telegramUsername = "elyas_saif"; 
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`;

    window.open(telegramUrl, '_blank');
});
continueToQuestionBtn.addEventListener("click", () => {
    showScreen(questionScreen);
});