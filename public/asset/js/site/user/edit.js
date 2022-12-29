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
        formIdStr = '#editUserForm';
        formElement = $(formIdStr);
        submitBtn = $('#submitBtn');
    }

    function formValidation() {
        // Form Validation
        $.validator.addMethod('checkValidEmail',
            function (value, element) { return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value); },
            'Please enter a valid email address please !',
        );
        // $(formIdStr).validate({
        //     rules: {
        //         name: {
        //             required: true,
        //             maxlength: 20,
        //         },
        //         username: {
        //             required: true,
        //             maxlength: 20,
        //         },
        //         email: {
        //             required: true,
        //             checkValidEmail: true,
        //         },
        //         password: {
        //             required: true,
        //             minlength: 6,
        //         },
        //         retype: {
        //             equalTo: '#password',
        //             minlength: 6,
        //         },
        //     },
        // });
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
