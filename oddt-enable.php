<?php
/**
 * oddtranslator - Zero-code activator
 * Inserts the boot include at the top of host pages.
 */

$root = dirname(__DIR__);
$bootstrapInclude = "include_once 'oddt/boot.php';";
$bootstrapLine = "<?php {$bootstrapInclude} ?>";
$candidates = [
    'index.php'
];
$results = [];

foreach ($candidates as $relativePath) {
    $path = $root . DIRECTORY_SEPARATOR . $relativePath;
    if (!is_file($path)) {
        continue;
    }

    $content = file_get_contents($path);
    if ($content === false) {
        $results[$relativePath] = 'failed to read';
        continue;
    }

    if (strpos($content, $bootstrapInclude) !== false || strpos($content, $bootstrapLine) !== false) {
        $results[$relativePath] = 'already present';
        continue;
    }

    if (preg_match('/^(\s*<\?php\b)([^\n]*\n?)/i', $content, $matches)) {
        $prefix = $matches[1] . $matches[2];
        $content = $prefix . $bootstrapInclude . "\n" . substr($content, strlen($prefix));
    } else {
        $content = $bootstrapLine . "\n" . $content;
    }

    $written = file_put_contents($path, $content);
    $results[$relativePath] = $written === false ? 'write failed' : 'injected';
}

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>oddtranslator Activator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; min-height: 100vh; font-family: Inter, system-ui, sans-serif; }
        .code-block { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 1rem; padding: 1rem; overflow-x: auto; color: #0f172a; }
    </style>
</head>
<body class="bg-slate-50 text-slate-950">
    <div class="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        <div class="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div class="space-y-3 border-b border-slate-200 bg-slate-50 px-6 py-8 sm:px-10 sm:py-10">
                <span class="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">oddtranslator activator</span>
                <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Zero-Code Activation Complete</h1>
            </div>

            <div class="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
                <p class="text-base leading-7 text-slate-600">The activator found the target host files below and injected the bootstrap line. Your site will now run <code class="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800">oddt/boot.php</code> before rendering each normal page.</p>

                <ul class="space-y-3">
                    <?php foreach ($results as $file => $status): ?>
                        <li class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <span class="font-medium text-slate-900"><?= htmlspecialchars($file) ?></span>
                            <span class="<?= $status === 'injected' ? 'text-emerald-600' : 'text-slate-500' ?> font-semibold"><?= htmlspecialchars($status) ?></span>
                        </li>
                    <?php endforeach ?>
                </ul>

                <p class="text-sm leading-6 text-slate-500">If you want to enable oddtranslator manually in other templates, add this line to the very top of your file.</p>
                <div class="code-block mt-3"><?= htmlspecialchars($bootstrapLine) ?></div>

                <div class="flex flex-col gap-4 pt-2 sm:flex-row">
                    <a href="installer.php" class="inline-flex flex-1 items-center justify-center rounded-2xl bg-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:bg-violet-700">Proceed to Installer</a>
                    <a href="../index.php" class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100">Open Host Homepage</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
