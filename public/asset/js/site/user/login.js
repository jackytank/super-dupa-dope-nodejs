/* eslint-disable @typescript-eslint/no-use-before-define */
$(function () {
    /**
     * Page load
     */
    $(document).ready(function () {
        init();
        formValidation();
        events();
    });

    /**
     * Form validation
     */
    function init() {
        username = $('#username');
        password = $('#password');
        submitBtn = $('#submitBtn');
        errorMessage = $('#errorMessage');
    }

    function formValidation() {
        // Form Validation
        $('#loginFrm').validate({
            lang: 'vn',
            errorElement: 'span',
            errorClass: 'has-error',
            highlight: function (element, errorClass) {
                // $(element).parents('.inputBox').addClass(errorClass);
            },
            unhighlight: function (element, errorClass) {
                // $(element).parents('.inputBox').removeClass(errorClass);
            },
            errorPlacement: function (err, el) {
                err.addClass('help-block').appendTo(el.parent());
                $('#errorMessage').html('');
            },
            rules: {
                password: {
                    required: { name: 'Password is required!' },
                },
                name: {
                    required: { name: 'Username is required!' },
                },
            },
        });
    }

    function events() {
        username.on('keyup', function () {
            $('#errorMessage').html('');
        });
        password.on('keyup', function () {
            $('#errorMessage').html('');
        });
    }
});
