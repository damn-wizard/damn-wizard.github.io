/**
 *
 * @param {string} src
 * @returns {Promise<void>}
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
    })
}

/**
 *
 * @returns {Promise<void>}
 */
async function bootstrap() {
    try {
        const response = await fetch('project.json', { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`При загрузке project.json произошла ошибка ${response.status}`);
        }

        const project = await response.json();

        for (const [base, files] of Object.entries(project.src || {})) {
            for (const file of files) {
                await loadScript(base + file);
            }
        }

        if (typeof window.$INIT$ !== 'function') {
            throw new Error('$INIT$ функция отсуствует у объекта window')
        }

        window.$INIT$(project);
    } catch (error) {
        console.error(error);

        if (error instanceof Event && error.target.nodeName.toLowerCase() === 'script') {
            document.body.textContent = 'Ошибка загрузки тега script'
        }

        if (error instanceof Error) {
            document.body.textContent = `Ошибка запуска: ${error.message}`
        }
    }
}

bootstrap();