/* JALAALI-START (تبدیل تاریخ شمسی - بدون نیاز به اینترنت/CDN) */
const jalaali = (() => {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    const div = (a, b) => ~~(a / b);
    const mod = (a, b) => a - ~~(a / b) * b;

    function jalCal(jy) {
        const bl = breaks.length;
        const gy = jy + 621;
        let leapJ = -14, jp = breaks[0], jump = 0, n;
        if (jy < jp || jy >= breaks[bl - 1]) throw new Error("Invalid Jalaali year " + jy);
        for (let i = 1; i < bl; i++) {
            const jm = breaks[i];
            jump = jm - jp;
            if (jy < jm) break;
            leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
            jp = jm;
        }
        n = jy - jp;
        leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
        if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
        const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
        const march = 20 + leapJ - leapG;
        if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
        let leap = mod(mod(n + 1, 33) - 1, 4);
        if (leap === -1) leap = 4;
        return { leap, gy, march };
    }
    function g2d(gy, gm, gd) {
        let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
        return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    }
    function d2g(jdn) {
        let j = 4 * jdn + 139361631;
        j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
        const i = div(mod(j, 1461), 4) * 5 + 308;
        const gd = div(mod(i, 153), 5) + 1;
        const gm = mod(div(i, 153), 12) + 1;
        const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
        return { gy, gm, gd };
    }
    function j2d(jy, jm, jd) {
        const r = jalCal(jy);
        return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
    }
    function d2j(jdn) {
        const gy = d2g(jdn).gy;
        let jy = gy - 621;
        const r = jalCal(jy);
        let k = jdn - g2d(gy, 3, r.march);
        if (k >= 0) {
            if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
            k -= 186;
        } else {
            jy -= 1;
            k += 179;
            if (r.leap === 1) k += 1;
        }
        return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
    }
    return {
        toJalaali: (gy, gm, gd) => d2j(g2d(gy, gm, gd)),
        toGregorian: (jy, jm, jd) => d2g(j2d(jy, jm, jd)),
        jalaaliMonthLength: (jy, jm) => jm <= 6 ? 31 : jm <= 11 ? 30 : (jalCal(jy).leap === 0 ? 30 : 29)
    };
})();
/* JALAALI-END */

/* =========================================
   Date.exe - تنظیمات و منطق برنامه
========================================= */

const CONFIG = {
    funnyWarnings: [
        "⚠️ حیف چشایه قشنگت و دستایه زیبات نیست که میزنی نه!",
        "🚫 خطای ۴۰۴: «نه» در فرهنگ‌نامه ما تعریف نشده!",
        "🧐 مطمئن باش شانس یک تجربه خاص و مرموز را رد نمی‌کنی...",
        "🔮 فال سنجیدم و گفت این دکمه کار نمی‌کند!",
        "✨ بعضی دعوت‌ها را فقط باید با چشم بسته پذیرفت...",
        "🔒 این گزینه برای محافظت از یک خاطره قشنگ قفل شده است!",
        "💔 قلب فرستنده با این انتخاب سازگار نیست...",
        "🚨 هشدار نهایی: تلاش بی‌فایده است؛ فقط دکمه بله باقی مانده! 😉❤️"
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
const greetingScreen = el("greetingScreen");
const questionScreen = el("questionScreen");
const dateScreen = el("dateScreen");
const timeScreen = el("timeScreen");
const activityScreen = el("activityScreen");
const finalScreen = el("finalScreen");

// دکمه‌ها و المان‌ها
const continueToQuestionBtn = el("continueToQuestionBtn");
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

/* ---------- ۱. انتقال خودکار از ترمینال به صفحه تبریک روز دختر ---------- */
setTimeout(() => showScreen(greetingScreen), 3500);

/* ---------- ۲. دکمه ادامه در صفحه تبریک ---------- */
continueToQuestionBtn.addEventListener("click", () => {
    showScreen(questionScreen);
});

/* ---------- ۳. بخش سوال و دکمه نه ---------- */
yesButton.addEventListener("click", () => {
    resetQuestionButton();
    initializeCalendar();
    showScreen(dateScreen);
});

function showWarning() {
    noClickCount += 1;
    const index = Math.min(noClickCount - 1, CONFIG.funnyWarnings.length - 1);
    const message = CONFIG.funnyWarnings[index];
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

noButton.addEventListener("touchstart", event => {
    event.preventDefault();
    showWarning();
    moveNoButton();
}, { passive: false });

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

/* ---------- ۴. تقویم ---------- */
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

    const nowDate = new Date();
    const nowJ = jalaali.toJalaali(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate());
    el("prevMonth").disabled = (currentYear * 12 + currentMonth) <= (nowJ.jy * 12 + nowJ.jm);

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

        const isPast = (currentYear * 10000 + currentMonth * 100 + day) < (todayJ.jy * 10000 + todayJ.jm * 100 + todayJ.jd);
        if (isPast) {
            button.disabled = true;
            button.classList.add("disabled");
        } else {
            button.addEventListener("click", () => selectDate(currentYear, currentMonth, day));
        }
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

/* ---------- ۵. انتخاب ساعت ---------- */
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

/* ---------- ۶. انتخاب فعالیت ---------- */
document.querySelectorAll(".option-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedActivity = card.getAttribute("data-activity");
        continueToFinal.disabled, continueToFinal.disabled = false;
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

/* ---------- ۷. ارسال به تلگرام ---------- */
el("sendToTelegram").addEventListener("click", () => {
    const displayDate = summaryDate.textContent;
    const displayTime = summaryTime.textContent;
    const displayActivity = summaryActivity.textContent;
    const extraNotes = el("extraNotes").value.trim();

    let notesText = "";
    if (extraNotes !== "") {
        notesText = `\n💬 توضیحات: ${extraNotes}\n`;
    }

    const message = `سلام... برنامه‌ای که الهام برای این عصرِ پاییزی انتخاب کرد ☕🍁\n\n` +
                    `🗓 تاریخ: ${displayDate}\n` +
                    `⏰ ساعت: ${displayTime}\n` +
                    `🥂 برنامه: ${displayActivity}\n` +
                    `${notesText}\n` +
                    `همه‌چیز برای یه گپ‌وگفتِ خوب و یه خاطره‌ی قشنگ ردیف شد. بقیه‌ی سناریو با تو ✨`;

    const telegramUsername = "elyas_saif"; 
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`;

    const win = window.open(telegramUrl, "_blank");
    if (!win) window.location.href = telegramUrl;
});