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
        formIdStr = '#changePasswordForm';
        submitIdBtnStr = '#changePasswordBtn'
        formElement = $(formIdStr);
        submitBtn = $(submitIdBtnStr);
    }

    function formValidation() {
        // Form Validation
        $(formIdStr).validate({
            rules: {
                "password": {
                    required: true,
                    minlength: 6
                },
                "retype": {
                    required: true,
                    equalTo: "#password",
                    minlength: 6
                }
            }
        });
    }

    function events() {
        $(document).on('submit', formIdStr, function () {
            // prevent multiple submit
            $.LoadingOverlay("show");
            console.log('submitted');
            submitBtn.attr('disabled', true);
            submitBtn.html('Please wait...');
            $(this).submit(function () {
                return false;
            });
            return true;
        });
    }
});
