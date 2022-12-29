/* eslint-disable @typescript-eslint/no-use-before-define */
$(function () {
    /**
     * Page load
     */
    $(document).ready(function () {
        init();
        validation();
        events();
    });

    /**
     * Init datatable, validation, events
     */

    // init - START
    function init() {
        usersTableElement = $('#usersTable');
        searchBtn = $('#searchBtn');
        getUserRole = parseInt(document.querySelector('#user-role')?.dataset?.userRole); // get user role attribute in defaultHeader.ejs (data-user-role="")
        getUserId = parseInt(document.querySelector('#user-id')?.dataset?.userId); // get user id attribute in defaultHeader.ejs (data-user-id="")
        // for import, export csv
        importCsvFormEl = $('#importCsvForm');
        importCsvInputEl = $('#importCsvInput');
        importCsvBtnEl = $('#importCsvBtn');
        importCsvFileSizeEl = $('#fileSize');

        const table = usersTableElement.DataTable({
            ordering: false,
            searching: false,
            responsive: true,
            processing: true,
            serverSide: true,
            ajax: {
                url: '/api/admin/users/search',
                data: function (d) {
                    const name = $('form#searchForm input[type=text][name=name]').val();
                    const username = $('form#searchForm input[type=text][name=username]').val();
                    const email = $('form#searchForm input[type=text][name=email]').val();
                    const companyId = $('form#searchForm input[type=number][name=companyId]').val();
                    const companyName = $('form#searchForm input[type=text][name=companyName]').val();
                    const role = $('form#searchForm input[type=checkbox][name=role]:checked')
                        .map(function (index, el) {
                            // get multiple checked checkbox as array
                            return $(el).val();
                        })
                        .get();
                    const createdDateFrom = $('form#searchForm input[type=date][name=createdDateFrom]').val();
                    const createdDateTo = $('form#searchForm input[type=date][name=createdDateTo]').val();
                    d.name = name;
                    d.username = username;
                    d.email = email;
                    d.role = role;
                    d.createdDateFrom = createdDateFrom;
                    d.createdDateTo = createdDateTo;
                    d.companyId = companyId;
                    d.companyName = companyName;
                },
                error: function (xhr, error, code) {
                    alert('error datatable boi!');
                }
            },
            columnDefs: [
                {
                    searchable: false,
                    orderable: false,
                    width: 200,
                    targets: 0,
                },
            ],
            columns: [
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        const start = table.page.info().start + 1;
                        return start + meta.row;
                    },
                },
                {
                    data: 'id',
                },
                {
                    data: 'name',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    },
                },
                {
                    data: 'username',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    },
                },
                {
                    data: 'password',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    },
                },
                {
                    data: 'email',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    },
                },
                {
                    data: 'role',
                },
                {
                    data: 'role',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data == 1 ? 'User' : data == 2 ? 'Admin' : 'Manager';
                    },
                },
                {
                    data: 'company_name',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    }
                },
                {
                    data: 'created_at',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('DD/MM/YYYY HH:mm:ss') : '';
                    },
                },
                {
                    data: 'created_by',
                    className: 'limit-char',
                },
                {
                    data: 'updated_at',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('DD/MM/YYYY HH:mm:ss') : '';
                    },
                },
                {
                    data: 'updated_by',
                    className: 'limit-char',
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        const userId = data.id;
                        // console.log('typeof userID', typeof getUserId);
                        console.log(getUserId);
                        const isEditDisabled = getUserRole === 1 ? (Number(getUserId) === data.id ? '' : 'disabled') : '';
                        // if authority is 1 (User) then disable edit button except for himself (id matches)
                        const isDelDisabled = getUserRole === 1 ? 'disabled' : '';
                        return `
                  <div class="btn-group" role="group" aria-label="Basic example">
                      <a href="/admin/users/edit/${userId}" class="btn btn-secondary ${isEditDisabled}">Edit</a>
                      <button class="btn btn-danger"${isDelDisabled} id="delUserBtn" data-user-id="${userId}">Del</button>
                  </div>
                  `;
                    },
                },
            ],
        });
    }
    // validation - START
    function validation() {
        $.validator.addMethod(
            'isValidCsvFile',
            function (value, el) {
                // const fileSize = element.size / 1024 / 1024 // in megabytes - mb
                // iSize = (Math.round(iSize * 100) / 100)
                const file = el.files[0];
                const fileSize = file.size; // in bytes
                const fileExt = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name; // ex: csv | txt | docx | doc
                console.log('file ext', fileExt);
                console.log('file size: ', fileSize);
                // check if file size is bigger than 2mb
                if (fileSize > 2097152) {
                    return false;
                }
                if (fileExt !== 'csv') {
                    return false;
                }
                return true;
            },
            '',
        );

        importCsvFormEl.validate({
            rules: {
                file: {
                    required: true,
                    isValidCsvFile: true,
                },
            },
            messages: {
                file: '',
            },
        });
    }
    // validation - END

    // events - START
    function events() {
        // if click del button then call ajax delete request
        $(document).on('click', '#delUserBtn', function () {
            const userId = $(this).attr('data-user-id');
            if (getUserRole !== 1) {
                const check = confirm('Are you sure you want to delete this users?');
                if (check) {
                    $.ajax({
                        type: 'DELETE',
                        url: `/api/admin/users/${userId}`,
                        success: function (res) {
                            alert(res.message);
                            location.reload();
                        },
                        error: function (response, status, error) {
                            console.log(response, status, error);
                        },
                    });
                }
            }
        });

        $(document).on('click', '#clearBtn', function () {
            // location.replace('/users/list');
            $(':input', '#searchForm')
                .not(':button, :submit, :reset, :hidden')
                .prop('checked', false)
                .prop('selected', false)
                .not(':checkbox, :radio, select')
                .val('');
            searchBtn.attr("disabled", false);
        });

        // when search form is submit then send ajax GET then repopulate returned data to dataTable
        $('#searchForm').on('submit', function (e) {
            e.preventDefault();
            // const url1 = `/api/admin/users/search?name=${name}&username=${username}&email=${email}&role=${role}}`
            searchBtn.attr("disabled", true);
            usersTableElement.DataTable().ajax.reload();

            // wait for 1.2s then enable search button
            setTimeout(function () {
                searchBtn.attr("disabled", false);
            }, 1200);
        });

        const openErrorModalWithMsg = (modalId, modalMsgId, modalOkBtnId, status, message, messages, wantReload) => {
            const errorModalEl = document.querySelector(`#${modalId}`);
            const errorModalBodyEl = document.querySelector(`#${modalMsgId}`);
            const errorModalOkBtn = document.querySelector(`#${modalOkBtnId}`);
            let _msg = ``;
            if (message != null && message !== '') {
                _msg = `
                        <h3>${status || ''}</h3>
                        <p>${message}</p>
                     `;
            }
            if (messages != null && messages.length >= 0) {
                _msg = `
                        <h3>${status || ''}</h3>
                        <ul class="text-center">
                            ${messages.map(msg => `<li class="row">${msg}</li>`)}
                        </ul>
                    `;
            }
            errorModalBodyEl.innerHTML = _msg;
            const modal = new mdb.Modal(errorModalEl);
            modal.show();
            if (wantReload) {
                errorModalOkBtn.addEventListener('click', () => {
                    location.reload();
                });
            }
        };

        $(document).on('click', '#importCsvBtn', function () {
            if (importCsvFormEl.valid()) {
                const files = importCsvInputEl.prop('files');
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    method: 'POST',
                    enctype: 'multipart/form-data',
                    url: '/api/admin/users/csv/import',
                    data: formData,
                    contentType: false,
                    processData: false,
                    cache: false,
                    success: function (data) {
                        // location.reload();
                        openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', data.status, data.message, data.messages, true);
                        console.log('Return data: ', JSON.stringify(data, null, 4));
                    },
                    error: function (req, stat, err) {
                        console.log(req);
                        openErrorModalWithMsg(
                            'errorModal',
                            'errorModalMessage',
                            'errorModalOkBtn',
                            req.statusText || req.responseJSON.status,
                            req.responseJSON.message,
                            req.responseJSON.messages,
                            false
                        );
                    },
                });
            } else {
                alert('Please select a valid .csv file and no bigger than 2mb!');
            }
        });

        $(document).on('click', '#exportCsvBtn', function () {
            $.ajax({
                method: 'POST',
                url: '/api/admin/users/csv/export',
                cache: false,
                success: function (res) {
                    const blob = new Blob([res.data], {
                        type: 'text/csv;',
                    });
                    const url = window.URL || window.webkitURL;
                    const link = url.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.download = res.filename;
                    a.href = link;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    console.log(res.message);
                    openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', res.status || 200, res.message, null, false);
                },
                error: function (req, stat, err) {
                    console.log(stat, err);
                    openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', req.responseJSON.status, req.responseJSON.message, null, false);
                },
            });
        });
    }
    // events - END
});
