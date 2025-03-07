document.getElementById("back-to-step1").addEventListener("click", (event) => {
	event.preventDefault();
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-1").style.display = "block";
});

document.getElementById("back-to-step2").addEventListener("click", (event) => {
	event.preventDefault();
	document.getElementById("step-3").style.display = "none";
	document.getElementById("step-2").style.display = "block";
});

document.getElementById("forgot-password-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	const email = document.getElementById("reset-email").value;
	const submitButton = event.target.querySelector("button");
	sendVerificationCode(email, submitButton);
});

document.getElementById("resend-code").addEventListener("click", async () => {
	const email = document.getElementById("reset-email").value;
	const resendButton = document.getElementById("resend-code");

	if (!email) {
		showCustomAlert("メールアドレスを入力してください", "error");
		return;
	}

	sendVerificationCode(email, resendButton, true);
});

async function sendVerificationCode(email, button, isResend = false) {
	// ボタンを無効化し、送信中の表示
	button.disabled = true;
	button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中';
	button.style.backgroundColor = "#888";
	button.style.cursor = "not-allowed";

	const response = await fetch("/api/auth/forgot-password", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email })
	});

	if (response.ok) {
		showCustomAlert(isResend ? "認証コードを再送しました" : "認証コードを送信しました", "success");
		if (!isResend) {
			setTimeout(() => {
				document.getElementById("step-1").style.display = "none";
				document.getElementById("step-2").style.display = "block";
			}, 1500); // 1.5秒後に認証コード入力画面へ
		}
	} else {
		showError(document.getElementById("reset-email"), "エラーが発生しました。もう一度お試しください", true);
	}

	// ボタンを元に戻す（再送の場合は5秒待機）
	setTimeout(() => {
		button.disabled = false;
		button.innerHTML = isResend ? "認証コードを再送" : "認証コードを送信";
		button.style.backgroundColor = "";
		button.style.cursor = "pointer";
	}, isResend ? 5000 : 0);
}

document.getElementById("verify-code-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	clearErrors("verify-code-form");
	const email = document.getElementById("reset-email");
	const code = document.getElementById("verification-code");

	const response = await fetch("/api/auth/verify-code", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: email.value, code: code.value })
	});

	if (response.ok) {
		showCustomAlert("認証コードが確認されました", "success");
		setTimeout(() => {
			document.getElementById("step-2").style.display = "none";
			document.getElementById("step-3").style.display = "block";
		}, 1500); // 1.5秒後に遷移
	} else {
		showError(code, await response.text(), true);
	}
});

document.getElementById("reset-password-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	clearErrors("reset-password-form");
	const email = document.getElementById("reset-email");
	const password = document.getElementById("new-password");
	const confirmPassword = document.getElementById("confirm-password");

	const response = await fetch("/api/auth/reset-password", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: email.value, password: password.value, confirmPassword: confirmPassword.value })
	});

	const responseData = await response.json();

	if (!response.ok) {
		// サーバーからのエラーメッセージを表示
		responseData.errors.forEach(error => {
			if (error.includes("8文字以上")) {
				showError(password, error, true);
			}
			if (error.includes("一致しません")) {
				console.log(error, password.value, confirmPassword.value)
				showError(confirmPassword, error, true);
			}
		});
		return;
	}
	else {
		showError(password, await response.text(), true);
	}
});

// 共通のエラー表示関数（ログインと登録とリセット用）
function showError(inputElement, message = "", useTooltip = false) {
	inputElement.classList.add("input-error");

	if (useTooltip) {
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

// エラーメッセージをクリアする関数
function clearErrors(formId) {
	const form = document.getElementById(formId);

	form.querySelectorAll(".input-error").forEach(input => input.classList.remove("input-error"));
	form.querySelectorAll(".tooltip").forEach(tooltip => tooltip.remove());
}

// 入力時にエラーメッセージを削除
document.querySelectorAll("#forgot-password-form input, #verify-code-form input, #reset-password-form input").forEach(input => {
	input.addEventListener("input", () => {
		input.classList.remove("input-error");

		// ツールチップ削除
		const tooltip = input.parentNode.querySelector(".tooltip");
		if (tooltip) tooltip.remove();
	});
});

function showCustomAlert(message, type = "info", duration = 3000) {
	// 既存のアラートがあれば削除
	const existingAlert = document.querySelector(".custom-alert");
	if (existingAlert) {
		existingAlert.remove();
	}

	// アラート要素を作成
	const alertBox = document.createElement("div");
	alertBox.classList.add("custom-alert", type, "show");

	// アイコンを設定
	let iconClass = "fa-info-circle";
	if (type === "success") iconClass = "fa-check-circle";
	if (type === "error") iconClass = "fa-times-circle";
	if (type === "warning") iconClass = "fa-exclamation-circle";

	alertBox.innerHTML = `<i class="fa ${iconClass}"></i> ${message}`;

	// body に追加
	document.body.appendChild(alertBox);

	// 指定時間後にフェードアウト（上にふわっと消える）
	setTimeout(() => {
		alertBox.classList.add("hide"); // フェードアウトアニメーションを適用
		setTimeout(() => alertBox.remove(), 500); // 0.5秒後に要素を削除
	}, duration);
}