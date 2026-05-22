/**
 * oddtranslator Installer - Frontend Engine
 */

let currentStep = 1;
const totalSteps = 5;
let isDbValidated = false;

const eyeSVG = `<svg xmlns="w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-eye text-purple-600"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>`;
const eyeOffSVG = `<svg xmlns="w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-eye-off text-purple-600"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>`;

const getElement = (id) => document.getElementById(id);
const getValue = (id) => {
    const element = getElement(id);
    return element ? element.value.trim() : '';
};

const setPrimaryButtonState = (button, enabled) => {
    if (!button) return;
    button.disabled = !enabled;
    button.className = enabled
        ? 'flex-1 bg-[#1E1E1E] text-white py-4 rounded-2xl text-lg font-semibold hover:bg-slate-800 transition'
        : 'flex-1 bg-slate-200 text-slate-400 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed transition';
};

function showToast(message, type = 'error') {
    const container = getElement('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast px-6 py-4 rounded-2xl shadow-xl text-white font-medium flex items-center gap-3 ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = eyeOffSVG;
    } else {
        input.type = 'password';
        btn.innerHTML = eyeSVG;
    }
}

// Ensure password fields are masked when navigating between installer steps.
function resetPasswordVisibility() {
    ['admin_pass', 'admin_pass_confirm'].forEach(id => {
        const input = getElement(id);
        if (input) input.type = 'password';
    });
    const buttons = document.querySelectorAll('#step-3 button[type="button"]');
    buttons.forEach(btn => btn.innerHTML = eyeSVG);
}

function updateProgress() {
    const progressBar = getElement('progress');
    if (!progressBar) return;
    const percent = ((currentStep / totalSteps) * 100) + '%';
    progressBar.style.width = percent;
}

function nextStep() {
    if (currentStep === 2 && !isDbValidated) {
        showToast('Please test and validate database configurations to continue.');
        return;
    }
    resetPasswordVisibility();
    const currentStepElement = getElement(`step-${currentStep}`);
    if (currentStepElement) currentStepElement.classList.remove('active');
    currentStep++;
    const nextStepElement = getElement(`step-${currentStep}`);
    if (nextStepElement) nextStepElement.classList.add('active');
    updateProgress();
}

function prevStep() {
    if (currentStep <= 1) return;
    resetPasswordVisibility();
    const currentStepElement = getElement(`step-${currentStep}`);
    if (currentStepElement) currentStepElement.classList.remove('active');
    currentStep--;
    const previousStepElement = getElement(`step-${currentStep}`);
    if (previousStepElement) previousStepElement.classList.add('active');
    updateProgress();
}

function checkPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, text: 'Enter a password', color: 'bg-slate-200' };
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
        case 1: return { score, text: 'Weak', color: 'bg-rose-500' };
        case 2: return { score, text: 'Fair', color: 'bg-amber-500' };
        case 3: return { score, text: 'Good', color: 'bg-indigo-500' };
        case 4: return { score, text: 'Strong', color: 'bg-emerald-500' };
        default: return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    }
}

function validateAdminStep() {
    // Normalize user input before validation.
    const email = getValue('admin_email');
    const pass = getValue('admin_pass');
    const confirmPass = getValue('admin_pass_confirm');
    const nextBtn = getElement('admin-next-btn');
    const matchText = getElement('match-text');

    const strength = checkPasswordStrength(pass);
    const strengthText = getElement('strength-text');
    if (strengthText) strengthText.innerText = `Strength: ${strength.text}`;

    for (let i = 1; i <= 4; i++) {
        const bar = getElement(`strength-bar-${i}`);
        if (!bar) continue;
        bar.className = i <= strength.score && pass.length > 0
            ? `h-full w-1/4 ${strength.color} transition-colors duration-300`
            : 'h-full w-1/4 bg-slate-100 transition-colors duration-300';
    }

    if (matchText) {
        matchText.classList.toggle('hidden', confirmPass.length === 0 || pass === confirmPass);
    }

    const isFormValid = email.includes('@') && strength.score >= 2 && pass === confirmPass;
    setPrimaryButtonState(nextBtn, isFormValid);
}

function preparePreviewAndNext() {
    const previewHost = getElement('preview_db_host');
    const previewName = getElement('preview_db_name');
    const previewUser = getElement('preview_db_user');
    const previewEmail = getElement('preview_admin_email');

    if (previewHost) previewHost.innerText = getValue('db_host');
    if (previewName) previewName.innerText = getValue('db_name');
    if (previewUser) previewUser.innerText = getValue('db_user');
    if (previewEmail) previewEmail.innerText = getValue('admin_email');

    nextStep();
}

function testDatabase() {
    const formData = new FormData();
    formData.append('action', 'test_db');
    formData.append('install_token', getValue('install_token'));
    formData.append('db_host', getValue('db_host'));
    formData.append('db_name', getValue('db_name'));
    formData.append('db_user', getValue('db_user'));
    formData.append('db_pass', getElement('db_pass') ? getElement('db_pass').value : '');

    const nextBtn = getElement('db-next-btn');

    fetch('installer.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message, 'success');
                isDbValidated = true;
                setPrimaryButtonState(nextBtn, true);
            } else {
                showToast(data.message, 'error');
                isDbValidated = false;
                setPrimaryButtonState(nextBtn, false);
            }
        })
        .catch(() => {
            showToast('Network error verifying connection settings.');
        });
}

function startInstallation() {
    const formData = new FormData();
    formData.append('action', 'install');
    formData.append('install_token', getValue('install_token'));
    formData.append('db_host', getValue('db_host'));
    formData.append('db_name', getValue('db_name'));
    formData.append('db_user', getValue('db_user'));
    formData.append('db_pass', getElement('db_pass') ? getElement('db_pass').value : '');
    formData.append('admin_email', getValue('admin_email'));
    formData.append('admin_pass', getValue('admin_pass'));

    const installBtn = getElement('install-btn');
    if (installBtn) {
        installBtn.disabled = true;
        installBtn.innerText = 'Installing Engine...';
    }

    fetch('installer.php', { method: 'POST', body: formData })
        .then(res => {
            if (!res.ok) throw new Error('HTTP Server Issue');
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const currentStepElement = getElement(`step-${currentStep}`);
                if (currentStepElement) currentStepElement.classList.remove('active');
                currentStep = 5;
                const nextStepElement = getElement(`step-${currentStep}`);
                if (nextStepElement) nextStepElement.classList.add('active');
                updateProgress();
            } else {
                showToast(data.message || 'Installation routine failed.');
                if (installBtn) {
                    installBtn.disabled = false;
                    installBtn.innerText = 'Install Now';
                }
            }
        })
        .catch(() => {
            showToast('Network processing error. Ensure server execution configuration limits match application scale.');
            if (installBtn) {
                installBtn.disabled = false;
                installBtn.innerText = 'Install Now';
            }
        });
}
