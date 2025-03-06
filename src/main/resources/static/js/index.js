document.getElementById("show-register").addEventListener("click", function() {
	clearErrors("login-box");
	document.getElementById("login-box").classList.remove("active");
	document.getElementById("register-box").classList.add("active");
});

document.getElementById("show-login").addEventListener("click", function() {
	clearErrors("register-box");
	document.getElementById("register-box").classList.remove("active");
	document.getElementById("login-box").classList.add("active");
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	clearErrors("login-box");

	const identifier = document.getElementById("login-email"); // ユーザーネーム or メール
	const password = document.getElementById("login-password");
	const errorContainer = document.getElementById("login-error-message");

	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ identifier: identifier.value, password: password.value }),
		credentials: "same-origin"
	});

	const result = await response.text();

	if (!response.ok) {
		errorContainer.innerText = result;
		errorContainer.style.display = "block";

		// ログイン時のエラー処理
		identifier.classList.add("input-error");
		password.classList.add("input-error");
	} else {
		window.location.href = "/dashboard.html";
	}
});

document.getElementById("register-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	clearErrors("register-box");

	const username = document.getElementById("register-username");
	const email = document.getElementById("register-email");
	const password = document.getElementById("register-password");
	const confirmPassword = document.getElementById("register-password-confirm");

	const response = await fetch("/api/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			username: username.value,
			email: email.value,
			password: password.value,
			confirmPassword: confirmPassword.value
		}),
	});

	const responseData = await response.json();

	if (!response.ok) {
		responseData.errors.forEach(error => {
			if (error.includes("メールアドレス")) {
				showError(email, "このメールアドレスは既に登録されています", true);
			}
			if (error.includes("ユーザー名")) {
				showError(username, "このユーザー名は既に使用されています", true);
			}
			if (error.includes("8文字以上")) {
				showError(password, "パスワードは8文字以上で英数字大文字小文字をそれぞれ含む必要があります", true);
			}
			if (error.includes("一致しません")) {
				showError(confirmPassword, "パスワードが一致しません", true);
			}
		});
		return;
	}
	
	console.log(email.value, password.value);
	
	document.getElementById("login-email").value = email.value;

	showCustomAlert("登録が完了しました！ログインしてください", "success");
	document.getElementById("show-login").click();
});

document.getElementById("generate-username").addEventListener("click", async () => {
	const usernameInput = document.getElementById("register-username");

	const response = await fetch("/api/auth/generate-username", {
		method: "GET"
	});

	if (response.ok) {
		const data = await response.json();
		usernameInput.value = data.username;
	} else {
		showCustomAlert("ユーザーネームの生成に失敗しました", "error");
	}
});


// 共通のエラー表示関数（ログインと登録で処理を分ける）
function showError(inputElement, message = "", useTooltip = false) {
	inputElement.classList.add("input-error");

	if (useTooltip) {
		// ツールチップを登録フォームでのみ使用
		let errorTooltip = inputElement.parentNode.querySelector(".tooltip");
		if (!errorTooltip) {
			errorTooltip = document.createElement("div");
			errorTooltip.classList.add("tooltip");
			inputElement.parentNode.appendChild(errorTooltip);
		}
		errorTooltip.innerText = message;
		errorTooltip.style.display = "block";
	}
}

// エラーメッセージをクリアする関数（ログイン・登録共通）
function clearErrors(formId) {
	const form = document.getElementById(formId);

	// 赤枠を削除
	form.querySelectorAll(".input-error").forEach(input => input.classList.remove("input-error"));

	// ツールチップを削除（登録フォーム用）
	form.querySelectorAll(".tooltip").forEach(tooltip => tooltip.remove());

	// フォームのエラーメッセージを削除（ログイン用）
	const errorMessage = form.querySelector(".error-message");
	if (errorMessage) {
		errorMessage.innerText = "";
		errorMessage.style.display = "none";
	}
}

// 入力時にエラーメッセージを削除
document.querySelectorAll("#login-form input, #register-form input").forEach(input => {
	input.addEventListener("input", () => {
		input.classList.remove("input-error");

		// ツールチップ削除（登録フォーム用）
		const tooltip = input.parentNode.querySelector(".tooltip");
		if (tooltip) tooltip.remove();

		// ログインフォームのエラーメッセージ削除
		document.getElementById("login-error-message").innerText = "";
		document.getElementById("login-error-message").style.display = "none";
	});
});

// カスタムアラートの表示関数
function showCustomAlert(message, type = "info", duration = 3000) {
	// 既存のアラートがあれば削除
	const existingAlert = document.querySelector(".custom-alert");
	if (existingAlert) {
		existingAlert.remove();
	}

	// アラート要素を作成
	const alertBox = document.createElement("div");
	alertBox.classList.add("custom-alert", type);

	// アイコンを設定
	let iconClass = "fa-info-circle";
	if (type === "success") iconClass = "fa-check-circle";
	if (type === "error") iconClass = "fa-times-circle";
	if (type === "warning") iconClass = "fa-exclamation-circle";

	alertBox.innerHTML = `<i class="fa ${iconClass}"></i> ${message}`;

	// body に追加
	document.body.appendChild(alertBox);

	// アニメーションで表示
	setTimeout(() => {
		alertBox.classList.add("show");
	}, 10); // 少し遅延させてアニメーションをスムーズにする

	// 指定時間後にフェードアウト
	setTimeout(() => {
		alertBox.classList.add("hide");
		setTimeout(() => alertBox.remove(), 500); // アニメーション完了後に削除
	}, duration);
}