let mediaRecorder = null;
let audioChunks = [];
let audioBlob = null;

let timerInterval = null;
let seconds = 0;

const recordButton =
    document.getElementById("recordButton");

const stopButton =
    document.getElementById("stopButton");

const sendButton =
    document.getElementById("sendButton");

const audioPreview =
    document.getElementById("audioPreview");

const recordStatus =
    document.getElementById("recordStatus");

const announcementStatus =
    document.getElementById("announcementStatus");

const timer =
    document.getElementById("timer");

const point1 =
    document.getElementById("point1");

const point2 =
    document.getElementById("point2");


/* =========================
   เริ่มบันทึก
========================= */

recordButton.addEventListener(
    "click",
    async () => {

        try {

            const stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: true
                    });


            audioChunks = [];

            audioBlob = null;


            mediaRecorder =
                new MediaRecorder(stream);


            mediaRecorder.ondataavailable =
                (event) => {

                    if (event.data.size > 0) {

                        audioChunks.push(
                            event.data
                        );

                    }

                };


            mediaRecorder.onstop =
                () => {

                    audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type:
                                    mediaRecorder.mimeType
                            }
                        );


                    const audioURL =
                        URL.createObjectURL(
                            audioBlob
                        );


                    audioPreview.src =
                        audioURL;


                    sendButton.disabled =
                        false;


                    recordStatus.textContent =
                        "🟢 บันทึกเสียงเสร็จแล้ว";

                    announcementStatus.textContent =
                        "🎧 สามารถฟังเสียงตัวอย่างได้";

                };


            mediaRecorder.start();


            recordButton.disabled =
                true;

            stopButton.disabled =
                false;

            sendButton.disabled =
                true;


            recordStatus.textContent =
                "🔴 กำลังบันทึกเสียง...";


            announcementStatus.textContent =
                "🎙️ กำลังบันทึกเสียง";


            startTimer();

        } catch (error) {

            console.error(error);

            alert(
                "ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตการใช้ไมโครโฟน"
            );

        }

    }
);


/* =========================
   หยุดบันทึก
========================= */

stopButton.addEventListener(
    "click",
    () => {

        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {

            mediaRecorder.stop();


            mediaRecorder.stream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

        }


        recordButton.disabled =
            false;

        stopButton.disabled =
            true;


        stopTimer();

    }
);


/* =========================
   Timer
========================= */

function startTimer() {

    seconds = 0;

    timer.textContent =
        "00:00";


    timerInterval =
        setInterval(
            () => {

                seconds++;


                const minutes =
                    Math.floor(
                        seconds / 60
                    );

                const secs =
                    seconds % 60;


                timer.textContent =
                    `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

            },
            1000
        );

}


function stopTimer() {

    clearInterval(
        timerInterval
    );

}


/* =========================
   เลือกจุด
========================= */

point1.addEventListener(
    "change",
    () => {

        point1
            .closest(".point-card")
            .classList.toggle(
                "selected",
                point1.checked
            );

    }
);


point2.addEventListener(
    "change",
    () => {

        point2
            .closest(".point-card")
            .classList.toggle(
                "selected",
                point2.checked
            );

    }
);


/* =========================
   ส่งเสียง
========================= */

sendButton.addEventListener(
    "click",
    async () => {

        if (!audioBlob) {

            alert(
                "กรุณาบันทึกเสียงก่อน"
            );

            return;

        }


        if (
            !point1.checked &&
            !point2.checked
        ) {

            alert(
                "กรุณาเลือกจุดกระจายเสียง"
            );

            return;

        }


        const targets = [];


        if (point1.checked) {

            targets.push("point1");

        }


        if (point2.checked) {

            targets.push("point2");

        }


        announcementStatus.textContent =
            "📤 กำลังส่งเสียง...";


        sendButton.disabled =
            true;


        try {

            const formData =
                new FormData();


            formData.append(
                "audio",
                audioBlob,
                "announcement.webm"
            );


            formData.append(
                "targets",
                JSON.stringify(targets)
            );


            const response =
                await fetch(
                    "http://localhost:3000/api/announcement",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "ส่งเสียงไม่สำเร็จ"
                );

            }


            announcementStatus.textContent =
                "✅ ส่งประกาศสำเร็จ";


            console.log(
                "Server:",
                result
            );


        } catch (error) {

            console.error(error);


            announcementStatus.textContent =
                "❌ ส่งประกาศไม่สำเร็จ";


            alert(
                error.message
            );

        }


        sendButton.disabled =
            false;

    }
);
/* =================================
   SIDEBAR NAVIGATION
================================= */

const navItems =
    document.querySelectorAll(".nav-item");

const broadcastPage =
    document.getElementById("broadcastPage");

const devicesPage =
    document.getElementById("devicesPage");

const historyPage =
    document.getElementById("historyPage");

const pageTitle =
    document.getElementById("pageTitle");

const pageDescription =
    document.getElementById("pageDescription");


navItems.forEach((item) => {

    item.addEventListener("click", () => {

        const page =
            item.dataset.page;


        /* =========================
           ACTIVE MENU
        ========================= */

        navItems.forEach((nav) => {

            nav.classList.remove("active");

        });

        item.classList.add("active");


        /* =========================
           HIDE ALL PAGE
        ========================= */

        broadcastPage.classList.add("page-hidden");

        devicesPage.classList.add("page-hidden");

        historyPage.classList.add("page-hidden");


        /* =========================
           BROADCAST
        ========================= */

        if (page === "broadcast") {

            broadcastPage.classList.remove(
                "page-hidden"
            );

            pageTitle.textContent =
                "ระบบกระจายเสียง";

            pageDescription.textContent =
                "บันทึกเสียงและส่งไปยังจุดที่กำหนด";

        }


        /* =========================
           DEVICES
        ========================= */

        if (page === "devices") {

            devicesPage.classList.remove(
                "page-hidden"
            );

            pageTitle.textContent =
                "จุดกระจายเสียง";

            pageDescription.textContent =
                "ตรวจสอบสถานะอุปกรณ์กระจายเสียง";

        }


        /* =========================
           HISTORY
        ========================= */

        if (page === "history") {

            historyPage.classList.remove(
                "page-hidden"
            );

            pageTitle.textContent =
                "ประวัติการประกาศ";

            pageDescription.textContent =
                "ตรวจสอบประวัติการส่งประกาศ";

        }

    });

});