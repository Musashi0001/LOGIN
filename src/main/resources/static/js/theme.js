// カラーテーマを適用する関数
function applyTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);

	// ボタンのアイコンとタイトルを変更
	const button = document.getElementById("theme-toggle");
	if (button) {
		button.innerHTML = theme === "light" ? "🌙" : "☀️";
		button.title = theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え";
	}
}

// ローカルストレージからテーマを取得する関数
function loadTheme() {
	const savedTheme = localStorage.getItem("theme") || "light"; // デフォルトはライトモード
	applyTheme(savedTheme);
}

// テーマを切り替える関数
function toggleTheme() {
	const currentTheme = document.documentElement.getAttribute("data-theme");
	const newTheme = currentTheme === "light" ? "dark" : "light";

	applyTheme(newTheme);
	localStorage.setItem("theme", newTheme);
}

// テーマ切り替えボタンを動的に生成する関数
function createThemeToggleButton() {
	const button = document.createElement("button");
	button.id = "theme-toggle";
	const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
	button.innerHTML = currentTheme === "light" ? "🌙" : "☀️";
	button.title = currentTheme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え";
	button.addEventListener("click", toggleTheme);

	// スタイルを適用（CSSを直接追加）
	const style = document.createElement("style");
	style.textContent = `
        #theme-toggle {
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.7);
            color: white;
            border: none;
            font-size: 20px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
            width: 40px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background 0.3s, transform 0.1s;
        }
        #theme-toggle:hover {
            background: rgba(0, 0, 0, 0.9);
        }
        #theme-toggle:active {
            transform: scale(0.9);
        }
        [data-theme="light"] #theme-toggle {
            background: rgba(0, 0, 0, 0.7);
            color: black;
        }
        [data-theme="light"] #theme-toggle:hover {
            background: rgba(255, 255, 255, 0.9);
        }
    `;

	// ページに追加
	document.head.appendChild(style);
	document.body.appendChild(button);
}

// ページが読み込まれたら実行
document.addEventListener("DOMContentLoaded", () => {
	loadTheme();
	createThemeToggleButton();
});
