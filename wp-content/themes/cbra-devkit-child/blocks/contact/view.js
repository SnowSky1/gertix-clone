/**
 * Contact form handler with Google reCAPTCHA v3 + WordPress REST API submission.
 */

document.addEventListener('DOMContentLoaded', function () {

    (function () {
        const form = document.querySelector('.contact__form');
        if(!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

        const status   = form.querySelector('.contact__form-status');
        const submit   = form.querySelector('[type="submit"]');
        const siteKey  = CBRA.siteKey ?? '';

            submit.disabled = true;
            status.textContent = '';
            status.className = 'contact__form-status';

            try {
                const recaptchaToken = (siteKey && typeof grecaptcha !== 'undefined')
                    ? await grecaptcha.execute(siteKey, { action: 'contact_form' })
                    : '';
                
                form.querySelector('[name="recaptcha_token"]').value = recaptchaToken;

                const formData = new FormData(form);

                const res = await fetch('/wp-json/cbra/v1/contact', {
                method:  'POST',
                    headers: {
                        'X-WP-Nonce': CBRA.nonce,
                    },
                    body: formData,
                });

                const data = await res.json();

                status.textContent = data.message ?? '';
                status.classList.add(res.ok ? 'is-success' : 'is-error');

            if (res.ok) form.reset();

            } catch {
                status.textContent = CBRA.i18n?.unexpectedError;
                status.classList.add('is-error');
            } finally {
                submit.disabled = false;
            }
        });
    })();
});