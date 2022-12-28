/* eslint-disable @typescript-eslint/no-use-before-define */
$(function () {
    /**
     * Page load
     */
    $(document).ready(function () {
        formValidation();
        events();
    });

    /**
     * Form validation
     */
    function formValidation() {
        // Form Validation
        $.validator.addMethod(
            'checkValidEmail',
            function (value, element) { return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value); },
            'Please enter a valid email address please !',
        );
        $('#addUserForm').validate({
            rules: {
                name: {
                    required: true,
                    maxlength: 20,
                },
                username: {
                    required: true,
                    maxlength: 20,
                },
                email: {
                    required: true,
                    checkValidEmail: true,
                },
                password: {
                    required: true,
                    minlength: 6,
                },
                retype: {
                    equalTo: '#password',
                    minlength: 6,
                },
            },
        });
    }

    function events() {
        $(document).on('click', '#submitBtn', function (e) {
            const formElement = $('#editUserForm');
            formElement.submit();
        });
    }
});
