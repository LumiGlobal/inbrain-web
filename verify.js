const baseUrl = "https://inbrain-97862438951.asia-southeast1.run.app";
// const baseUrl = "http://127.0.0.1:3000";
const saveKeyBtn = document.getElementById("save-key");
const message = document.getElementById("message");
saveKeyBtn.addEventListener("click", saveKey);

async function saveKey(e) {
    e.preventDefault();
    const api_key = document.getElementById("api-key").value;

    const response = await fetch(`${baseUrl}/keys/verify`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${api_key}`,
        },
        credentials: "include"
    });

    if (response.status === 204) {
        sessionStorage.setItem("api_key", api_key);
        message.hidden = true
        location.href = "main.html"
    } else {
        message.hidden = false;
    }
}
