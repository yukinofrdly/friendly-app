(() => {
    function focusOnFieldsBorderBottom() {
        const inputs = document.querySelectorAll('.contact-input, .contact-textarea');

        inputs.forEach(el => {
        el.addEventListener('focus', (e) => {
            const formGroup = e.target.closest('.contact-form-group');
            formGroup.classList.add('contact-form-group-focus');
        });

        el.addEventListener('blur', (e) => {
            const formGroup = e.target.closest('.contact-form-group');
            formGroup.classList.remove('contact-form-group-focus');
        });
        });

    }

    document.addEventListener('DOMContentLoaded', function() {
        focusOnFieldsBorderBottom();
    });
})();