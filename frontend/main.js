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

const pageNames = ["home", "user", "analytics", "info"];
const pages = [];
pageNames.forEach(name => {
    pages.push(document.getElementById(name));
});
for (let i = 0; i < 4; i++) {
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
            }
        });
    }
    document.getElementById(pageNames[i] + "Quicklink").addEventListener("click", () => {
        location.hash = "#" + pageNames[i];
        showPage("#" + pageNames[i]);
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
                borderColor: "blue",
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
        gripData.datasets[0].data.push(mouseY);

        // keep last 50 points
        if (gripData.labels.length > 50) {
            gripData.labels.shift();
            gripData.datasets[0].data.shift();
        }
        gripChart.options.scales.x.min = Math.max(time - 50, 0);
        gripChart.options.scales.x.max = time;
        gripChart.update();
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
            p.x -= dx;
            p.y -= dy;
            motionCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            motionCtx.fillStyle = `rgba(0, 100, 255, ${p.alpha})`;
            motionCtx.fill();
            p.alpha -= 0.02;

            if (p.alpha <= 0) trails.splice(i, 1);
        }

        // draw central dot
        motionCtx.beginPath();
        motionCtx.arc(motionCanvas.width/2, motionCanvas.height/2, 6, 0, Math.PI * 2);
        motionCtx.fillStyle = "blue";
        motionCtx.fill();

        function drawArrow(x, y, angle, length = 30) {
            const headLength = 10;
            const x2 = x + Math.cos(angle) * length;
            const y2 = y + Math.sin(angle) * length;

            motionCtx.strokeStyle = "blue";
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
            motionCtx.fillStyle = "blue";
            motionCtx.fill();
        }

        //looks cooler but hella busy
        //if (dx !== 0 && dy !== 0) drawArrow(motionCanvas.width/2, motionCanvas.height/2, Math.atan2(dy, dx), Math.hypot(dx, dy));
        if (dx !== 0 && dy !== 0) drawArrow(motionCanvas.width/2, motionCanvas.height/2, Math.atan2(dy, dx));
    }

    animate();
}

showPage("#home");