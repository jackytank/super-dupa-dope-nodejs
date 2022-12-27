$(function() {
    /**
     * Page load
     */
    $(document).ready(function() {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        formValidation();
    });

    /**
     * Form validation
     */
    function formValidation() {
        // Form Validation
        $('#loginFrm').validate({
            lang: 'ja',
            errorElement: 'span',
            errorClass: 'has-error',
            highlight: function(element, errorClass) {
                // $(element).parents('.inputBox').addClass(errorClass);
            },
            unhighlight: function(element, errorClass) {
                // $(element).parents('.inputBox').removeClass(errorClass);
            },
            errorPlacement: function(err, el) {
                err.addClass('help-block').appendTo(el.parent());
                $('#errorMessage').html('');
            },
            rules: {
                password: {
                    required: { name: 'パスワード' },
                },
                name: {
                    required: { name: 'ユーザー名' },
                },
            },
        });
    }
});
