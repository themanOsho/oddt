<?php 
    /**
     * oddtranslator installer form
     */

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>oddtranslator — Setup</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .step { display: none; }
        .step.active { display: block; }
        .progress-bar { transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .toast { animation: slideUp 0.4s ease forwards; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>
</head>
<body class="bg-slate-50 min-h-screen">

<div class="max-w-2xl mx-auto pt-16 px-6 pb-16">
    <!-- Brand Header -->
    <div class="flex items-center justify-center gap-3 mb-10">
        <div class="w-11 h-11 bg-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold">O</div>
        <h1 class="text-4xl font-bold tracking-tighter text-slate-900">oddtranslator</h1>
    </div>

    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <!-- Progress Bar -->
        <div class="h-2 bg-slate-100">
            <div id="progress" class="progress-bar h-2 bg-purple-600 w-1/5"></div>
        </div>

        <div class="p-10">
            <!-- CSRF Token Carrier -->
            <input type="hidden" id="install_token" value="<?php echo htmlspecialchars($_SESSION['install_token']); ?>">

            <!-- Step 1: Welcome -->
            <div id="step-1" class="step active text-center">
                <h2 class="text-3xl font-semibold mb-3">Welcome to oddtranslator</h2>
                <p class="text-slate-600 mb-10">Translate any PHP website in minutes — zero code required.</p>
                <button onclick="nextStep()" class="w-full bg-[#1E1E1E] text-white py-4 rounded-2xl text-lg font-semibold hover:bg-slate-800 transition">
                    Start Setup →
                </button>
            </div>

            <!-- Step 2: Database Configuration -->
            <div id="step-2" class="step">
                <h2 class="text-2xl font-semibold mb-6">Database Configuration</h2>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Database Host</label>
                        <input type="text" id="db_host" value="localhost" class="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:border-purple-600 outline-none transition">
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Database Name</label>
                            <input type="text" id="db_name" placeholder="oddtranslator" class="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:border-purple-600 outline-none transition">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Username</label>
                            <input type="text" id="db_user" value="root" class="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:border-purple-600 outline-none transition">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input type="password" id="db_pass" placeholder="Database Password" class="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:border-purple-600 outline-none transition">
                    </div>
                </div>
                
                <div class="flex gap-4 mt-8">
                    <button onclick="testDatabase()" class="flex-1 bg-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition">
                        Test Connection
                    </button>
                    <button id="db-next-btn" onclick="nextStep()" disabled class="flex-1 bg-slate-200 text-slate-400 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed transition">
                        Next →
                    </button>
                </div>
            </div>

            <!-- Step 3: Admin Configuration -->
            <div id="step-3" class="step">
                <h2 class="text-2xl font-semibold mb-1">Create Admin Account</h2>
                <p class="text-sm text-slate-500 mb-6">Use these credentials to access your dashboard at <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-medium text-xs">yourdomain.com</span> to manage translations.</p>
                
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Admin Email Address</label>
                        <input type="email" id="admin_email" placeholder="admin@example.com" class="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:border-purple-600 outline-none transition" oninput="validateAdminStep()">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Admin Password</label>
                        <div class="relative">
                            <input type="password" id="admin_pass" placeholder="Enter secure password" class="w-full border border-slate-200 rounded-2xl pl-5 pr-14 py-4 focus:border-purple-600 outline-none transition" oninput="validateAdminStep()">
                            <button type="button" onclick="togglePasswordVisibility('admin_pass', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 focus:outline-none">
                                <svg xmlns="w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                            </button>
                        </div>
                        <!-- Live Strength UI Progress Bar -->
                        <div class="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                            <div id="strength-bar-1" class="h-full w-1/4 bg-slate-200 transition-colors duration-300"></div>
                            <div id="strength-bar-2" class="h-full w-1/4 bg-slate-200 transition-colors duration-300"></div>
                            <div id="strength-bar-3" class="h-full w-1/4 bg-slate-200 transition-colors duration-300"></div>
                            <div id="strength-bar-4" class="h-full w-1/4 bg-slate-200 transition-colors duration-300"></div>
                        </div>
                        <p id="strength-text" class="text-xs font-medium text-slate-400 mt-1.5">Strength: Enter a password</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                        <div class="relative">
                            <input type="password" id="admin_pass_confirm" placeholder="Repeat admin password" class="w-full border border-slate-200 rounded-2xl pl-5 pr-14 py-4 focus:border-purple-600 outline-none transition" oninput="validateAdminStep()">
                            <button type="button" onclick="togglePasswordVisibility('admin_pass_confirm', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 focus:outline-none">
                                <svg xmlns="w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                            </button>
                        </div>
                        <p id="match-text" class="text-xs font-medium text-rose-500 mt-1.5 hidden">Passwords do not match</p>
                    </div>
                </div>

                <div class="flex gap-4 mt-8">
                    <button onclick="prevStep()" class="px-6 border border-slate-200 text-slate-600 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-50 transition">
                        Back
                    </button>
                    <button id="admin-next-btn" onclick="preparePreviewAndNext()" disabled class="flex-1 bg-slate-200 text-slate-400 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed transition">
                        Review Details →
                    </button>
                </div>
            </div>

            <!-- Step 4: Preview Parameter Screen -->
            <div id="step-4" class="step">
                <h2 class="text-2xl font-semibold mb-2">Review Configurations</h2>
                <p class="text-sm text-slate-500 mb-6">Verify parameters before triggering installation routines.</p>
                
                <div class="space-y-4 bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-8">
                    <div class="grid grid-cols-3 border-b border-slate-200/60 pb-3">
                        <span class="text-sm font-medium text-slate-500">Database Host</span>
                        <span id="preview_db_host" class="text-sm text-slate-800 font-mono col-span-2"></span>
                    </div>
                    <div class="grid grid-cols-3 border-b border-slate-200/60 pb-3">
                        <span class="text-sm font-medium text-slate-500">Database Name</span>
                        <span id="preview_db_name" class="text-sm text-slate-800 font-mono col-span-2"></span>
                    </div>
                    <div class="grid grid-cols-3 border-b border-slate-200/60 pb-3">
                        <span class="text-sm font-medium text-slate-500">DB Username</span>
                        <span id="preview_db_user" class="text-sm text-slate-800 font-mono col-span-2"></span>
                    </div>
                    <div class="grid grid-cols-3">
                        <span class="text-sm font-medium text-slate-500">Admin Email</span>
                        <span id="preview_admin_email" class="text-sm text-slate-800 font-mono col-span-2"></span>
                    </div>
                </div>

                <div class="flex gap-4">
                    <button onclick="prevStep()" class="px-6 border border-slate-200 text-slate-600 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-50 transition">
                        Change Details
                    </button>
                    <button id="install-btn" onclick="startInstallation()" class="flex-1 bg-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition">
                        Install Now
                    </button>
                </div>
            </div>

            <!-- Step 5: Finished -->
            <div id="step-5" class="step text-center">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                <h2 class="text-3xl font-semibold mb-3">Installation Successful!</h2>
                <p class="text-slate-600 mb-8">oddtranslator has been set up successfully on your local architecture.</p>
                <a href="index.php" class="block w-full bg-[#1E1E1E] text-white py-4 rounded-2xl text-lg font-semibold text-center hover:bg-slate-800 transition">
                    Go to Dashboard
                </a>
            </div>
        </div>
    </div>
</div>

<div id="toast-container" class="fixed bottom-6 right-6 z-50 space-y-3"></div>

<script src="assets/js/installer.js"></script>
</body>
</html>
