const topics = [
    "C++ Basics",
    "Time Complexity",
    "Arrays",
    "Searching",
    "Sorting",
    "Strings",
    "Recursion",
    "Linked List",
    "Stack",
    "Queue",
    "Hashing",
    "Trees",
    "BST",
    "Heap"
];

let isRegister = false;
let completed = [];
let token = localStorage.getItem("token");
let currentUser = JSON.parse(localStorage.getItem("user") || "null");

const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");
const authForm = document.getElementById("authForm");
const authButton = document.getElementById("authButton");
const authMessage = document.getElementById("authMessage");
const nameInput = document.getElementById("name");
const userName = document.getElementById("userName");

function showMessage(element, message) {
    element.textContent = message;
}

function setMode(register) {
    isRegister = register;
    document.getElementById("loginTab").classList.toggle("active", !register);
    document.getElementById("registerTab").classList.toggle("active", register);
    document.querySelectorAll(".register-only").forEach(el => {
        el.classList.toggle("hidden", !register);
        el.required = register;
    });
    authButton.textContent = register ? "Register" : "Login";
    showMessage(authMessage, "");
}

document.getElementById("loginTab").onclick = () => setMode(false);
document.getElementById("registerTab").onclick = () => setMode(true);

authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
    };

    if (isRegister) {
        body.name = nameInput.value.trim();
    }

    try {
        authButton.disabled = true;
        const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        token = data.token;
        currentUser = data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(currentUser));

        authForm.reset();
        await showDashboard();

    } catch (error) {
        showMessage(authMessage, error.message);
    } finally {
        authButton.disabled = false;
    }
});

async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function showDashboard() {
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");

    userName.textContent = currentUser ? currentUser.name : "";

    try {
        const data = await api("/api/progress");
        completed = data.completedTopics || [];
        renderTopics();
        updateStats();
    } catch (error) {
        showMessage(document.getElementById("dashboardMessage"), error.message);
    }
}

function renderTopics() {
    const container = document.getElementById("topicsContainer");
    container.innerHTML = "";

    topics.forEach((topic, index) => {
        const done = completed.includes(index);

        const card = document.createElement("div");
        card.className = `topic-card ${done ? "completed" : ""}`;

        card.innerHTML = `
            <div class="topic-info">
                <div class="topic-number">${index + 1}</div>
                <div>
                    <div class="topic-name">${topic}</div>
                    <div class="topic-status">
                        ${done ? "Completed ✅" : "Not Completed"}
                    </div>
                </div>
            </div>
            <input type="checkbox" ${done ? "checked" : ""}>
        `;

        card.querySelector("input").addEventListener("change", () => {
            toggleTopic(index, !done);
        });

        container.appendChild(card);
    });
}

async function toggleTopic(topicId, completedValue) {
    try {
        const data = await api(`/api/progress/${topicId}`, {
            method: "PUT",
            body: JSON.stringify({
                completed: completedValue
            })
        });

        completed = data.completedTopics || [];
        renderTopics();
        updateStats();
    } catch (error) {
        showMessage(document.getElementById("dashboardMessage"), error.message);
    }
}

function updateStats() {
    const total = topics.length;
    const done = completed.length;
    const remaining = total - done;
    const percentage = Math.round((done / total) * 100);

    document.getElementById("progressText").textContent = `${percentage}%`;
    document.getElementById("progressFill").style.width = `${percentage}%`;
    document.getElementById("completedText").textContent =
        `${done} of ${total} topics completed`;

    document.getElementById("totalTopics").textContent = total;
    document.getElementById("completedTopics").textContent = done;
    document.getElementById("remainingTopics").textContent = remaining;
}

document.getElementById("resetBtn").addEventListener("click", async () => {
    if (!confirm("Reset all your DSA progress?")) return;

    try {
        const data = await api("/api/progress", {
            method: "DELETE"
        });

        completed = data.completedTopics || [];
        renderTopics();
        updateStats();
    } catch (error) {
        showMessage(document.getElementById("dashboardMessage"), error.message);
    }
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    token = null;
    currentUser = null;
    completed = [];

    dashboard.classList.add("hidden");
    authSection.classList.remove("hidden");
    userName.textContent = "";
}

document.getElementById("logoutBtn").onclick = logout;

if (token && currentUser) {
    showDashboard();
} else {
    authSection.classList.remove("hidden");
}
