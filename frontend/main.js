let currentMax = 0;
let pressure;

const showPage = hash => {
    const currentPage = document.querySelector(".page.active");
    const newPage = document.querySelector(hash);
    if (currentPage == newPage) {
        return;
    }

    gsap.killTweensOf([currentPage, newPage]);
    
    gsap.set(newPage, {
        display: "block",
        zIndex: 2
    })
    gsap.set(currentPage, {
        zIndex: 1
    })
    gsap.set([currentPage, newPage], {clearProps: "transform"});
    const tl = gsap.timeline({
        onComplete: () => {
            currentPage.classList.remove("active");
            newPage.classList.add("active");
            gsap.set(currentPage, {
                display: "none",
                x: 0
            });
            gsap.set(newPage, {
                clearProps: "zIndex"
            })
        }
    });
    tl.to(currentPage, {
        x: "-100%",
        duration: 0.5
    }).fromTo(newPage, {
        x: "100%"
    }, {
        x: "0%",
        duration:0.5
    }, "<");
}

window.addEventListener("hashchange", hash => showPage(location.hash || "#home"));

const pageNames = ["home", "user", "analytics", "info", "help"];
const pages = [];
pageNames.forEach(name => {
    pages.push(document.getElementById(name));
});
for (let i = 0; i < 5; i++) {
    if (i != 0) {
        document.getElementById(pageNames[i] + "Preview").addEventListener("click", () => {
            location.hash = "#" + pageNames[i];
            showPage("#" + pageNames[i]);
            switch (i) {
                case 1:
                    console.log("now on user");
                    break;
                case 2:
                    console.log("now on analytics");
                    initAnalyticsPage();
                    break;
                case 3:
                    console.log("now on info");
                    break;
                case 4:
                    console.log("now on help");
            }
        });
    }
    document.getElementById(pageNames[i] + "Quicklink").addEventListener("click", () => {
        location.hash = "#" + pageNames[i];
        showPage("#" + pageNames[i]);
        
            switch (i) {
                case 1:
                    console.log("now on user");
                    break;
                case 2:
                    console.log("now on analytics");
                    initAnalyticsPage();
                    break;
                case 3:
                    console.log("now on info");
                    break;
                case 4:
                    console.log("now on help");
            }
    });
}

//actual stuff

function initAnalyticsPage() {
    let time = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", e => {
        mouseY = 1080 - e.clientY;
    });

    const gripCanvas = document.getElementById("gripChart");
    const gripData = {
            labels: [],
            datasets: [{
                label: "Grip strength (KPa)",
                data: [],
                borderColor: "rgb(92, 156, 202)",
                borderWidth: 2,
                tension: 0.3
            }]
        }
    const gripChart = new Chart(gripCanvas.getContext("2d"), {
        type: "line",
        data: gripData,
        options: {
            animation: false,
            scales: {
                x: {
                    type: "linear",
                    title: {display: true, text: "Time (s)"},
                    min: time - 50,
                    max: time
                },
                y: {
                    title: {display: true, text: "Grip strength (KPa)"}
                }
            }
        }
    });

    const interval = setInterval(() => {
        time++;
        gripData.labels.push(time);
        gripData.datasets[0].data.push(0.1 * (mouseY - 400));
        console.log(pressure);

        //keep last 50 points
        if (gripData.labels.length > 50) {
            gripData.labels.shift();
            gripData.datasets[0].data.shift();
        }
        gripChart.options.scales.x.min = Math.max(time - 50, 0);
        gripChart.options.scales.x.max = time;
        gripChart.update();

        //maxtracker
        if (mouseY > currentMax) {
            currentMax = mouseY;
        }

    }, 200);

    // window.addEventListener("hashchange", () => {
    //     if (location.hash !== "#analytics") {
    //         clearInterval(interval);
    //         gripChart.destroy();
    //     }
    // });

    const motionCanvas = document.getElementById("motionChart");
    const motionCtx = motionCanvas.getContext("2d");

    const centerX = motionCanvas.width / 2;
    const centerY = motionCanvas.height / 2;

    let lastMouse = {x: motionCanvas.width/2, y: motionCanvas.height/2};
    let mouse = {x: motionCanvas.width/2, y: motionCanvas.height/2};
    const trails = [];

    window.addEventListener("mousemove", e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function animate() {
        requestAnimationFrame(animate);

        motionCtx.fillStyle = "rgba(242, 181, 128, 0.3)";
        motionCtx.fillRect(0, 0, motionCanvas.width, motionCanvas.height);

        const dx = 2 * (mouse.x - lastMouse.x);
        const dy = 2 * (mouse.y - lastMouse.y);
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;

        if (dx !== 0 || dy !== 0) {
            trails.push({
            x: centerX,
            y: centerY,
            alpha: 1.0
            });
        }

        for (let i = trails.length - 1; i >= 0; i--) {
            const p = trails[i];
            motionCtx.beginPath();
            p.x -= 0.5 * dx;
            p.y -= 0.5 * dy;
            motionCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            motionCtx.fillStyle = `rgba(0, 100, 255, ${p.alpha})`;
            motionCtx.fill();
            p.alpha -= 0.02;

            if (p.alpha <= 0) trails.splice(i, 1);
        }

        // draw central dot
        motionCtx.beginPath();
        motionCtx.arc(motionCanvas.width/2, motionCanvas.height/2, 6, 0, Math.PI * 2);
        motionCtx.fillStyle = "rgb(92, 156, 202)";
        motionCtx.fill();

        function drawArrow(x, y, angle, length = 30) {
            const headLength = 10;
            const x2 = x + Math.cos(angle) * length;
            const y2 = y + Math.sin(angle) * length;

            motionCtx.strokeStyle = "rgb(92, 156, 202)";
            motionCtx.lineWidth = 2;
            motionCtx.beginPath();
            motionCtx.moveTo(x, y);
            motionCtx.lineTo(x2, y2);
            motionCtx.stroke();

            motionCtx.beginPath();
            motionCtx.moveTo(x2, y2);
            motionCtx.lineTo(
                x2 - headLength * Math.cos(angle - Math.PI/6),
                y2 - headLength * Math.sin(angle - Math.PI/6)
            );
            motionCtx.lineTo(
                x2 - headLength * Math.cos(angle + Math.PI/6),
                y2 - headLength * Math.sin(angle + Math.PI/6)
            );
            motionCtx.closePath();
            motionCtx.fillStyle = "rgb(92, 156, 202)";
            motionCtx.fill();
        }

        //looks cooler but hella busy
        //if (dx !== 0 && dy !== 0) drawArrow(motionCanvas.width/2, motionCanvas.height/2, Math.atan2(dy, dx), Math.hypot(dx, dy));
        if (dx !== 0 && dy !== 0) drawArrow(motionCanvas.width/2, motionCanvas.height/2, Math.atan2(dy, dx));
    }

    animate();


    //strongest of today vs strongest in history ahh
    const today = new Date().toDateString();

    const postStrongestOfToday = async() => {
        localStorage.setItem("day", today);
        await fetch("http://localhost:3000/daily", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({value: currentMax})
        });
        fetchAndUpdate();
        currentMax = 0; //
    }
    if (localStorage.getItem("day") !== today) {
        postStrongestOfToday();
    }

    //day incrementer
    document.getElementById("daybreak").addEventListener("click", () => {
        console.log("posted");
        postStrongestOfToday()
    });

    document.getElementById("dayend").addEventListener("click", () => {
        console.log("wiped");
        
    });

    
    //analysis
    const analysis = document.getElementById("analysis");
    let analysisToday;
    let analysisTrend;

    //past strongest
    let date = 0;

    const pastCanvas = document.getElementById("pastChart");
    const pastData = {
            labels: [],
            datasets: [{
                label: "Grip strength (KPa)",
                data: [],
                backgroundColor: "rgb(92, 156, 202)",
                tension: 0.3
            }]
        }
    const pastChart = new Chart(pastCanvas.getContext("2d"), {
        type: "bar",
        data: pastData,
        options: {
            animation: false,
            scales: {
                x: {
                    type: "category",
                    title: {display: true, text: "Time (days)"},
                    min: date - 7,
                    max: date
                },
                y: {
                    title: {display: true, text: "Maximum grip strength (KPa)"}
                }
            }
        }
    });

    const fetchAndUpdate = () => {
        date++;
        fetch("http://localhost:3000/daily").then(r => r.json()).then(data => {
            const item = data[data.length - 1];
                //console.log(item.value);
                pastData.labels.push(date);
                pastData.datasets[0].data.push(Number(item.value));

            // okay we don't need this lmao
            // if (pastData.labels.length > 7) {
            //     pastData.labels = pastData.labels.slice(-7);
            //     pastData.datasets[0].data = pastData.datasets[0].data.slice(-7);
            // }
            pastChart.options.scales.x.min = Math.max(date - 7, 0);
            pastChart.options.scales.x.max = date;
            pastChart.update();

            if (item.value > 800) {
                analysisToday = "Your maximum grip strength is very healthy today. "
                + "Studies show that light exercise while hospitalized can reduce the recovery time by up to one day. "
                + "Keep this up!";
            } else if (item.value > 600) {
                analysisToday = "Your maximum grip strength is healthy today. "
                + "If you feel comfortable, practice strong hand movements to stay active and maintain muscle dexterity. ";
            } else if (item.value > 400) {
                analysisToday = "Your maximum grip strength is a bit weaker than the average. "
                + "If you feel comfortable, practice hand movements to stay active and maintain muscle dexterity.";
            } else {
                analysisToday = "Your maximum grip strength is weaker than the average. "
                + "Try practicing hand exercises to maintain muscle strength and dexterity. "
                + "If you feel your recovery is not going well, alert your care provider and show them this statistic.";
            }

            let average = 0;
            for (let i = 0; i < 7; i++) {
                average += data[data.length - 1 - i].value;
            }
            average /= Math.min(7, data.length);
            if (item.value > average || item.value > 800) {
                analysisTrend = "You are making excellent progress.";
            } else if (item.value > average - 50) {
                analysisTrend = "Your progress is stable. Keep this up!"
            } else {
                analysisTrend = "Your grip strength is weakening compared to before. If you need help, alert your care providor and show them this statistic.";
            }

            analysis.innerHTML = analysisToday + "<br>" + analysisTrend;
        });
    }

}

let port;
document.getElementById("connect").onclick = async () => {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

  const decoder = new TextDecoderStream();
  port.readable.pipeTo(decoder.writable);
  const reader = decoder.readable.getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
        console.log("value: " + value);
        pressure = 1024 - value;
    }
  }
};

showPage("#home");
