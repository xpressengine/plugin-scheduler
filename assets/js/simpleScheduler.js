var SimpleScheduler = (function() {

    var _this;
    var _props = {};
    var _el = {};
    var _apiUrl = {};
    var _data = {
        title: '',
        start: '',
        end: ''
    };
    var _currentDate = {
        year: '',
        montlh: ''
    };

    var _$target = $();

    var _eventsData = [];

    var _calendar;
    var _popupMode;
    var _eventsMap = {};

    var weekDayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    var _holidays = [];
    var _preventDays = [];
    var _preventDayOfWeek = [];
    var _preventPreviousDays = false
    var _preventDaysMap = {};    //막아야하는 날짜 map

    var _setProps = function (props) {
        for(prop in props) {
            _props[prop] = props[prop];
        }
    };

    var _bindEvents = function () {
        //$('#btnSaveSchedule').on('click', _this.addSchedule);
        $(document).on('click', '[data-schedule=btnSave]', function () {
            var $wrapper;

            switch(_popupMode.add.type) {
                case 'popover':
                    $wrapper = $(this).closest('.popover');
                    break;

                case 'modal':
                    $wrapper = $('[data-schedule=addModal]');
                    break;
            }

            var event = {
                title: $wrapper.find('[data-schedule=title]').val(),
                content: $wrapper.find('[data-schedule=content]').val(),
                start: $wrapper.find('[name=start_date]').val(),
                end: $wrapper.find('[name=end_date]').val(),
                color: $wrapper.find('[name=color]').val()
            };

            var dates = _this.getEnumeratedDays(event);
            var validation = _this.isValidDate(dates, _preventDaysMap, _preventDayOfWeek, _preventPreviousDays);

            if(validation.isValid) {
                _this.addEvent(event);

            } else {
                alert(validation.message);

            }
        });

        $(document).on('click', '[data-schedule=btnDelete]', function () {
            var $wrapper;

            switch(_popupMode.view.type) {
                case 'popover':
                    $wrapper = $(this).closest('.popover');
                    break;

                case 'modal':
                    $wrapper = $('[data-schedule=viewModal]');
                    break;
            }

            var id = $wrapper.find('[data-schedule=id]').val();

            if(confirm("일정을 삭제하시겠습니까?")) {
                _this.deleteEvent(id);
            }
        });

        $(document).on('click', '[data-schedule="btnOpenUpdate"]', function () {

            $('.popover').hide();

            switch(_popupMode.update.type) {
                case 'popover':
                    var id = $(this).closest('.popover').find('[name=id]').val();

                    setTimeout(function () {
                        _$target.popover({
                            html: true,
                            container: 'body',
                            title: '새로운 일정',
                            content: function() {
                                var template = '';

                                if(_popupMode.update.hasOwnProperty('template')) {
                                    if(typeof _popupMode.update.template == 'string') {
                                        template = _popupMode.update.template;

                                    } else if(_popupMode.update.tempalte instanceof Function){
                                        template = _popupMode.update.template();

                                    }

                                } else {
                                    template = [
                                        '<div class="form-group">',
                                            '<label for="exampleTextarea">제목</label>',
                                            '<input type="text" class="form-control" data-schedule="title">',
                                        '</div>',
                                        '<div class="form-group">',
                                            '<label for="exampleTextarea">내용</label>',
                                            '<textarea data-schedule="content" class="form-control" placeholder="일정을 입력하세요." ></textarea>',
                                        '</div>',
                                        '<div class="form-group">',
                                            '<div class="row">',
                                                '<div class="col-sm-6">',
                                                    '<input type="text" class="start_date" name="start_date" style="width:100px" readonly="true" />',
                                                '</div>',
                                                '<div class="col-sm-6">',
                                                    '<input type="text" class="end_date" name="end_date" style="width:100px" readonly="true" />',
                                                '</div>',
                                            '</div>',
                                        '</div>',
                                        '<div class="form-group">',
                                            '<label class="">색상</label>',
                                            '<div data-selector="colorpicker" data-format="alias" class="input-group colorpicker-component">',
                                                '<span class="input-group-addon"><i></i></span>',
                                                '<input type="text" class="form-control" name="color" />',
                                            '</div>',
                                        '</div>',
                                        '<input type="hidden" name="id" value="' + id + '" />',
                                    ].join('\n');
                                }

                                template += [
                                    '<div class="clearfix">',
                                        '<button type="button" class="btn btn-sm btn-primary pull-right" data-schedule="btnUpdate">저장</button>',
                                        '<button type="button" class="btn btn-sm btn-default pull-right btnClosePopover">닫기</button>',
                                    '</div>',
                                ].join('\n');

                                return template;
                            }
                        }).popover('show')
                          .on('show.bs.popover', _popupMode.update['show.bs.popover'] || function () {})
                          .on('shown.bs.popover', _popupMode.update['shown.bs.popover'] || function() {
                                var $this = $(this);
                                // var date = moment($target.data('date'));

                                $('.popover').find('.start_date, .end_date').datepicker({
                                    language: _this.getProps('locale'),
                                    timepicker: true
                                });

                                //$('.popover').find('.start_date').data('datepicker').selectDate(new Date(date));

                                $('.btnClosePopover').on('click', function () {
                                    $this.popover('hide');
                                });

                                $('.popover').find('[data-selector=colorpicker]').colorpicker({
                                    color: '#000000',
                                    customClass: 'colorpicker-2x',
                                    align: 'left',
                                    colorSelectors: {
                                        '#000000': '#000000',     //black
                                        '#ffffff': '#ffffff',     //white
                                        '#FF0000': '#FF0000',       //red
                                        '#777777': '#777777',   //default
                                        '#337ab7': '#337ab7',   //primary
                                        '#5cb85c': '#5cb85c',   //success
                                        '#5bc0de': '#5bc0de',      //info
                                        '#f0ad4e': '#f0ad4e',   //warning
                                        '#d9534f': '#d9534f'     //danger
                                    },
                                    sliders: {
                                        saturation: {
                                            maxLeft: 200,
                                            maxTop: 200
                                        },
                                        hue: {
                                            maxTop: 200
                                        },
                                        alpha: {
                                            maxTop: 200
                                        }
                                    }
                                });

                        }).on('hide.bs.popover', _popupMode.update['hide.bs.popover'] || function () {
                              $('.popover').find('.start_date, .end_date').datepicker("destroy");

                        }).on('hidden.bs.popover', _popupMode.update['hidden.bs.popover'] || function () {
                              var $this = $(this);

                              $this.popover('dispose');
                              $('.colorpicker-2x').remove();
                        });
                    }, 500);


                    break;

                case 'modal':
                    var template = '';

                    if(_popupMode.add.hasOwnProperty('template')) {
                        if(typeof _popupMode.add.template == 'string') {
                            template = _popupMode.add.template;
                        } else {
                            template = _popupMode.add.template();
                        }

                    } else {
                        template = [
                            '<div class="form-group">',
                                '<label for="exampleTextarea">제목</label>',
                                '<input type="text" class="form-control" name="title" data-schedule="title">',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="exampleTextarea">내용</label>',
                                '<textarea data-schedule="content" name="content" class="form-control" placeholder="일정을 입력하세요." ></textarea>',
                            '</div>',
                            '<div class="form-group">',
                                '<div class="row">',
                                    '<div class="col-sm-6">',
                                        '<input type="text" class="form-control start_date" name="start_date" readonly="true" />',
                                    '</div>',
                                    '<div class="col-sm-6">',
                                        '<input type="text" class="form-control end_date" name="end_date" readonly="true" />',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="form-group">',
                                '<label class="">색상</label>',
                                '<div data-selector="colorpicker" data-format="alias" class="input-group colorpicker-component">',
                                    '<span class="input-group-addon"><i></i></span>',
                                    '<input type="text" class="form-control" name="color" />',
                                '</div>',
                            '</div>',
                            '<input type="hidden" name="id" value="' + id + '" />',
                        ].join('\n');
                    }

                    $('[data-schedule="updateModal"]').find('.modal-body').html(template);

                    $('[data-schedule="updateModal"]').find('[name=start_date], [name=end_date]').datepicker({
                        language: _this.getProps('locale'),
                        timepicker: true
                    });

                    $('[data-selector=colorpicker]').colorpicker({
                        color: '#000000',
                        customClass: 'colorpicker-2x',
                        align: 'left',
                        colorSelectors: {
                            '#000000': '#000000',     //black
                            '#ffffff': '#ffffff',     //white
                            '#FF0000': '#FF0000',       //red
                            '#777777': '#777777',   //default
                            '#337ab7': '#337ab7',   //primary
                            '#5cb85c': '#5cb85c',   //success
                            '#5bc0de': '#5bc0de',      //info
                            '#f0ad4e': '#f0ad4e',   //warning
                            '#d9534f': '#d9534f'     //danger
                        },
                        sliders: {
                            saturation: {
                                maxLeft: 200,
                                maxTop: 200
                            },
                            hue: {
                                maxTop: 200
                            },
                            alpha: {
                                maxTop: 200
                            }
                        }
                    });

                    $('[data-schedule="updateModal"]').modal({
                          show: true
                      })
                      .on('show.bs.modal', _popupMode.update['show.bs.modal'] || function(e) {})
                      .on('shown.bs.modal', _popupMode.update['shown.bs.modal'] || function(e) {
                            var $this = $(this);
                            // var date = moment($target.data('date'));

                            // $this.find('[name=start_date]').data('datepicker').selectDate(new Date(date));

                        }).on('hide.bs.modal', _popupMode.update['hide.bs.modal'] || function(e) {})
                      .on('hidden.bs.modal', _popupMode.update['hidden.bs.modal'] || function(e) {
                            var $this = $(this);

                            $this.find('[name=title]').val('');
                            $this.find('[name=content]').val('');
                            $this.find('[name=start_date]').val('');
                            $this.find('[name=end_date]').val('');
                            $this.find('[data-selector=colorpicker]').colorpicker('setValue', '#000000');

                            $('.colorpicker-2x').remove();
                        });
                    break;

                case 'custom':
                    _popupMode.update.template();
            }
            
        });

        $(document).on('click', '[data-schedule="btnUpdate"]', function () {

        });

        //$('[data-schedule=content]').on('keyup', _this.setContent);

        // $('[data-schedule=addModal]').find('.start_date, .end_date').datepicker({
        //     language: _this.getProps('locale'),
        //     timepicker: true
        // });
				//
        // $('[data-schedule=addModal]').find('[data-selector=colorpicker]').colorpicker({
        //     color: '#000000',
        //     customClass: 'colorpicker-2x',
        //     align: 'left',
        //     colorSelectors: {
        //         '#000000': '#000000',     //black
        //         '#ffffff': '#ffffff',     //white
        //         '#FF0000': '#FF0000',       //red
        //         '#777777': '#777777',   //default
        //         '#337ab7': '#337ab7',   //primary
        //         '#5cb85c': '#5cb85c',   //success
        //         '#5bc0de': '#5bc0de',      //info
        //         '#f0ad4e': '#f0ad4e',   //warning
        //         '#d9534f': '#d9534f'     //danger
        //     },
        //     sliders: {
        //         saturation: {
        //             maxLeft: 200,
        //             maxTop: 200
        //         },
        //         hue: {
        //             maxTop: 200
        //         },
        //         alpha: {
        //             maxTop: 200
        //         }
        //     }
        // });
    };

    var _appendModal = function () {
        var modal = [
            '<!-- add modal -->',
            '<div data-schedule="addModal" class="modal fade" tabindex="-1" role="dialog">',
                '<div class="modal-dialog" role="document">',
                    '<div class="modal-content">',
                        '<div class="modal-header">',
                            '<h4 class="modal-title">새로운 일정</h4>',
                        '</div>',
                        '<div class="modal-body">',

                        '</div>',
                        '<div class="modal-footer">',
                            '<button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>',
                            '<button type="button" id="btnSaveSchedule" class="btn btn-primary" data-schedule="btnSave">등록</button>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',

            '<!-- view modal -->',
            '<div data-schedule="viewModal" class="modal fade" tabindex="-1" role="dialog">',
                '<div class="modal-dialog" role="document">',
                    '<div class="modal-content">',
                        '<div class="modal-header">',
                            '<h4 class="modal-title"></h4>',
                        '</div>',
                        '<div class="modal-body">',

                        '</div>',
                        '<div class="modal-footer">',
                            '<button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>',
                            '<button type="button" data-schedule="btnDelete" class="btn btn-primary">삭제</button>',
                            '<button type="button" data-schedule="btnOpenUpdate" class="btn btn-primary">수정</button>',
                            '<input type="hidden" name="id" data-schedule="id">',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',

            '<!-- view modal -->',
            '<div data-schedule="updateModal" class="modal fade" tabindex="-1" role="dialog">',
                '<div class="modal-dialog" role="document">',
                    '<div class="modal-content">',
                        '<div class="modal-header">',
                            '<h4 class="modal-title">일정 수정</h4>',
                        '</div>',
                        '<div class="modal-body">',

                        '</div>',
                        '<div class="modal-footer">',
                            '<button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>',
                            '<button type="button" data-schedule="btnOpenUpdate" class="btn btn-primary">저장</button>',
                            '<input type="hidden" name="id" data-schedule="id">',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        ].join('\n');
        
        _el.$calendar.after(modal);
    };

    var _settings = function () {
        _holidays = _this.getProps('holiday') || [];
        _preventDays = _this.getProps('preventDays') || [];
        _preventDayOfWeek =  _this.getProps('preventDayOfWeek') || [];
        _preventPreviousDays = _this.getProps('preventPreviousDays') || false;
        _preventDaysMap = {};    //막아야하는 날짜 map

        _preventDays.forEach(function (preventDay) {
            var dates = _this.getEnumeratedDays(preventDay);

            _preventDaysMap = $.extend({}, _preventDaysMap, dates.reduce(function(acc, cur, i) {
                acc[cur] = i;
                return acc;
            }, {}));
        });
    }

    return {
        /**
         * -el
         * -props
         * -apiUrl
         * -popupMode 'popover' | 'modal' default 'popover'
         * -events {array<object>}
         * */
        init: function(opt) {
            _this = this;

            _el = opt.el || {};
            _apiUrl = opt.apiUrl;
            _popupMode = opt.popupMode;

            _appendModal();

            _setProps(opt.props || {});
            _settings();
            _bindEvents();

            this.render(opt);

            return this;
        },
        getProps: function(prop) {
            return _props[prop];
        },
        setContent: function(e) {
            _data.title = $(e.target).val();
        },
        render: function(opt) {

            _calendar = _el.$calendar.fullCalendar({
                header: {
                    left: 'title',
                    right: 'prev,today,next'
                },
                allDaySlot: false,
                slotEventOverlap: false,
                defaultDate: _this.getProps('today'),
                displayEventTime: false,
                editable: _this.getProps('draggable')? true : false,
                eventLimit: true, // 더보기
                selectHelper: true,
                draggable: true,
                droppable: true,
                displayEventEnd: true,
                timezone: 'local',
                ignoreTimezone: false,
                eventOrder: 'type',
                locale: _this.getProps('locale'),
                dayClick: function(date, jsEvent, view) {
                    if(!$(view.el[0]).find('.fc-widget-content[data-date=' + date.format() + ']').hasClass('prevent_day')) {
                        slotDate = date;
                        _el.$calendar.on("mousemove", forgetSlot);
                    }
                },
                events: function (start, end, timezone, callback) {
                    var year = end.year();
                    var month = end.month();

                    _currentDate.year = year;
                    _currentDate.month = month;

                    _this.getEventsList(year, month, callback);

                },
                viewRender: function (view, element) {
                    $('.popover').hide();

                    if(_this.getProps('todayBackgroundColor')) {
                        _el.$calendar.find('.fc-today').css('background', _this.getProps('todayBackgroundColor'));
                    }

                    if(_this.getProps('todayFontColor')) {
                        _el.$calendar.find('.fc-today').css('color', _this.getProps('todayFontColor'));
                    }

                    _holidays.forEach(function(holiday) {
                        var dates = _this.getEnumeratedDays(holiday);

                        for(var i = 0, max = dates.length; i < max; i += 1) {
                            $(view.el[0]).find('.fc-day-top[data-date=' + dates[i] + ']').addClass('public_holiday').prepend('<span>' + holiday.title + '</span>');
                        }
                    });

                    _preventDays.forEach(function (preventDay) {
                        var dates = _this.getEnumeratedDays(preventDay);
                        var preventDayColor = _this.getProps('preventDayColor');

                        for(var i = 0, max = dates.length; i < max; i += 1) {
                            var $targetDate = $(view.el[0]).find('.fc-widget-content[data-date=' + dates[i] + ']');

                            $targetDate.addClass('prevent_day');

                            if(preventDayColor) {
                                $targetDate.css('background', preventDayColor);
                            }

                            if(preventDay.hasOwnProperty('title')) {
                                $(view.el[0]).find('.fc-day-top[data-date=' + dates[i] + ']').prepend('<span>' + preventDay.title + '</span>');
                            }
                        }
                        //
                    });

                    _preventDayOfWeek.forEach(function (day) {
                        var $targetDate = $('.fc-' + weekDayMap[day]).not('.fc-day-header');
                        var preventDayColor = _this.getProps('preventDayColor');

                        $targetDate.addClass('prevent_day');

                        if(preventDayColor) {
                            $targetDate.css('background', preventDayColor);
                        }
                    });

                },
                eventRender: function (event, element, view) {

                    var content = (event.content)? event.content : '';
                    var period = _eventsMap[event.id].startStr;

                    if(event.end && event.start.format("YYYY-MM-DD") !== event.end.format('YYYY-MM-DD')) {
                        period += ' ~ ' + _eventsMap[event.id].endStr;
                    }

                    _$target = element;

                    element.on("dblclick",function(e){
                        switch(opt.popupMode.view.type) {
                            case 'popover':
                                $('.popover').hide();

                                element.popover({
                                    html: true,
                                    title: event.title,
                                    container: 'body',
                                    content: function() {
                                        var template = '';

                                        if(opt.popupMode.view.hasOwnProperty('template')) {
                                            if(typeof opt.popupMode.view.template == 'string') {
                                                template = opt.popupMode.view.template;

                                            } else if (opt.popupMode.view.template instanceof Function) {
                                                template = opt.popupMode.view.template();
                                            }

                                        } else {
                                            template = [
                                                '<div>',
                                                    '<p>' + period + '</p>',
                                                    '<div>' + content + '</div>',
                                                    '<div>',
                                                        '<button type="button" data-schedule="btnDelete" class="btn btn-primary">삭제</button>',
                                                        '<button type="button" data-schedule="btnOpenUpdate" class="btn btn-primary">수정</button>',
                                                        '<input type="hidden" data-schedule="id" value="' + event.id + '">',
                                                    '</div>',
                                                '</div>'
                                            ].join('\n');
                                        }

                                        return template;
                                    },
                                }).popover('show')
                                  .on('show.bs.popover', opt.popupMode.view['show.bs.popover'] || function () {})
                                  .on('shown.bs.popover', opt.popupMode.view['shown.bs.popover'] || function() {
                                    var $this = $(this);

                                    $(document).one('click', function () {
                                        $this.popover('hide');
                                    });

                                    $('.popover').find('[data-schedule=id]').val(event.id);

                                }).on('hide.bs.popover', opt.popupMode.view['hide.bs.popover'] || function () {})
                                  .on('hidden.bs.popover', opt.popupMode.view['hidden.bs.popover'] || function () {
                                    var $this = $(this);

                                    $this.popover('dispose');
                                });
                            break;

                            case 'modal':
                              //modal-title
                                var $viewModal = $('[data-schedule="viewModal"]');
                                var template = '';

                                if(opt.popupMode.view.hasOwnProperty('template')) {
                                    if(typeof opt.popupMode.view.template == 'string') {
                                        template = opt.popupMode.view.template

                                    } else if(opt.popupMode.view.template instanceof Function) {
                                        template = opt.popupMode.view.template();
                                    }

                                } else {
                                    template = [
                                        '<p>' + period + '</p>',
                                        '<div>' + content + '</div>',
                                        '<input type="hidden" value="' + event.id + '" name="id" />'
                                    ].join('\n');
                                }

                                $viewModal.find('.modal-title').html(event.title);
                                $viewModal.find('.modal-body').html(template);

                                $viewModal.modal({
                                    show: true
                                }).on('show.bs.modal', opt.popupMode.view['show.bs.modal'] || function(e) {})
                                  .on('shown.bs.modal', opt.popupMode.view['shown.bs.modal'] || function(e) {
                                    $viewModal.find('[data-schedule=id]').val(event.id);

                                }).on('hide.bs.modal', opt.popupMode.view['hide.bs.modal'] || function(e) {})
                                  .on('hidden.bs.modal', opt.popupMode.view['hidden.bs.modal'] || function(e) {});
                            break;

                            case 'custom':
                                opt.popupMode.view.template();
                        }

                    });
                },
                eventDrop: function(event, delta, revertFunc) {
                    var dates = _this.getEnumeratedDays(event);
                    var validation = _this.isValidDate(dates, _preventDaysMap, _preventDayOfWeek, _preventPreviousDays);

                    if(!validation.isValid) {
                        alert(validation.message);
                        revertFunc();

                    } else {
                        if(confirm('일정을 변경하시겠습니까?')) {
                            _this.updateEvent(event.id, event, true, revertFunc);
                        } else {
                            revertFunc();
                        }
                    }
                },
            });


            var slotDate;

            function forgetSlot(){
                slotDate = null;
                _el.$calendar.off("mousemove", forgetSlot);
            }

            function dblClickDay($target){
                _this.openAddEventLayer($target);
            }

            _el.$calendar.dblclick(function(e) {
                if(slotDate){
                    var $target = $(e.target);

                    dblClickDay($target, slotDate); //do something with the date
                }
            });

        },
        /**
         * dayinfo에 있는 start, end값으로 날짜를 열거하여 리턴한다.
         *
         * @param {object} info
         * <pre>
         * - start
         * - end
         * </pre>
         * */
        getEnumeratedDays: function (dayInfo) {
            var dates = [];

            if(dayInfo.end && moment(dayInfo.start).format('YYYY-MM-DD') !== moment(dayInfo.end).format('YYYY-MM-DD')) {
                var startDate = moment(dayInfo.start).format('YYYY-MM-DD');
                var endDate = moment(dayInfo.end).format('YYYY-MM-DD');

                var a = moment(startDate, 'YYYY-MM-DD');
                var b = moment(endDate, 'YYYY-MM-DD');

                while (a.isBefore(b) || a.isSame(b)) {
                    dates.push(a.format('YYYY-MM-DD'));
                    a.add(1, 'days');
                }

            } else {
                dates.push(moment(dayInfo.start).format('YYYY-MM-DD'));
            }

            return dates;
        },
        /**
         * 등록될 수 있는 날짜인지 유효성을 체크한다.
         *
         * @param {string|array<string>} date
         * @param {object} preventDaysMap
         * @param {array<string>} preventDayOfWeek
         * @param {boolean} preventPreviousDays
         * @return {boolean}
         * */
        isValidDate: function (date, preventDaysMap, preventDayOfWeek, preventPreviousDays) {
            /**
             * preventDays - 특정일
             * preventDayOfWeek - 특정 요일
             * preventPreviousDays - 이전일
             * */
            var isValid = true;
            var message = '';

            if(typeof date === 'string') {

                if(preventDaysMap.hasOwnProperty(date)) {
                    isValid = false;
                    message = '일정 등록이 불가능한 날짜입니다.';
                    
                } else {
                    if(preventPreviousDays) {
                        var currentDate = _el.$calendar.fullCalendar('getDate').format('YYYY-MM-DD');

                        if(moment(date).unix() < moment(currentDate).unix()) {
                            isValid = false;
                            message = '오늘 이전의 날짜는 일정 등록이 불가 합니다.';
                        }
                    }

                    if (preventDayOfWeek.length > 0) {
                        preventDayOfWeek.forEach(function (day) {
                            var dayNum = moment(date).day();

                            if(dayNum === day) {
                                isValid = false;
                                message = '일정 등록이 불가능한 요일입니다.';
                                return;
                            }
                        });

                    }
                }

            } else if(date instanceof Array) {

                date.forEach(function (dateStr) {
                    if(preventDaysMap.hasOwnProperty(dateStr)) {
                        isValid = false;
                        message = '일정 등록이 불가능한 날짜가 포함되어 있습니다.';
                        return;

                    } else {
                        if(preventPreviousDays) {
                            var currentDate = _el.$calendar.fullCalendar('getDate').format('YYYY-MM-DD');

                            if(moment(dateStr).unix() < moment(currentDate).unix()) {
                                isValid = false;
                                message = '오늘 이전의 날짜는 일정 등록이 불가 합니다.';
                                return;
                            }

                        }

                        if (preventDayOfWeek.length > 0) {
                            preventDayOfWeek.forEach(function (day) {
                                var dayNum = moment(dateStr).day();

                                if(dayNum === day) {
                                    isValid = false;
                                    message = '일정 등록이 불가능한 요일이 포함되어 있습니다.';
                                    return;
                                }
                            });

                            //break foreach
                            if(!isValid) {
                                return;
                            }
                        }
                    }
                });

            } else {
                isValid = false;

            }

            return {
                isValid: isValid,
                message: message
            };
        },
        openAddEventLayer: function ($target) {
            switch(_popupMode.add.type) {
                case 'popover':
                    $('.popover').hide();

                    $target.popover({
                        html: true,
                        container: 'body',
                        title: '새로운 일정',
                        content: function() {
                            var template = '';

                            if(_popupMode.add.hasOwnProperty('template')) {
                                if(typeof _popupMode.add.template == 'string') {
                                    template = _popupMode.add.template;

                                } else if(_popupMode.add.tempalte instanceof Function){
                                    template = _popupMode.add.template();

                                }

                            } else {
                                template = [
                                    '<div class="form-group">',
                                        '<label for="exampleTextarea">제목</label>',
                                        '<input type="text" class="form-control" data-schedule="title">',
                                    '</div>',
                                    '<div class="form-group">',
                                        '<label for="exampleTextarea">내용</label>',
                                        '<textarea data-schedule="content" class="form-control" placeholder="일정을 입력하세요." ></textarea>',
                                    '</div>',
                                    '<div class="form-group">',
                                        '<div class="row">',
                                            '<div class="col-sm-6">',
                                                '<input type="text" class="start_date" name="start_date" style="width:100px" readonly="true" />',
                                            '</div>',
                                            '<div class="col-sm-6">',
                                                '<input type="text" class="end_date" name="end_date" style="width:100px" readonly="true" />',
                                            '</div>',
                                        '</div>',
                                    '</div>',
                                    '<div class="form-group">',
                                        '<label class="">색상</label>',
                                        '<div data-selector="colorpicker" data-format="alias" class="input-group colorpicker-component">',
                                            '<span class="input-group-addon"><i></i></span>',
                                            '<input type="text" class="form-control" name="color" />',
                                        '</div>',
                                    '</div>',
                                ].join('\n');
                            }

                            template += [
                                '<div class="clearfix">',
                                    '<button type="button" class="btn btn-sm btn-primary pull-right" data-schedule="btnSave">등록</button>',
                                    '<button type="button" class="btn btn-sm btn-default pull-right btnClosePopover">닫기</button>',
                                '</div>',
                            ].join('\n');

                            return template;
                        }
                    }).popover('show')
                      .on('show.bs.popover', _popupMode.add['show.bs.popover'] || function () {})
                      .on('shown.bs.popover', _popupMode.add['shown.bs.popover'] || function() {
                        var $this = $(this);
                        var date = moment($target.data('date'));

                        $('.popover').find('.start_date, .end_date').datepicker({
                            language: _this.getProps('locale'),
                            timepicker: true
                        });

                        $('.popover').find('.start_date').data('datepicker').selectDate(new Date(date));

                        $('.btnClosePopover').on('click', function () {
                            $this.popover('hide');
                        });

                        $('.popover').find('[data-selector=colorpicker]').colorpicker({
                            color: '#000000',
                            customClass: 'colorpicker-2x',
                            align: 'left',
                            colorSelectors: {
                                '#000000': '#000000',     //black
                                '#ffffff': '#ffffff',     //white
                                '#FF0000': '#FF0000',       //red
                                '#777777': '#777777',   //default
                                '#337ab7': '#337ab7',   //primary
                                '#5cb85c': '#5cb85c',   //success
                                '#5bc0de': '#5bc0de',      //info
                                '#f0ad4e': '#f0ad4e',   //warning
                                '#d9534f': '#d9534f'     //danger
                            },
                            sliders: {
                                saturation: {
                                    maxLeft: 200,
                                    maxTop: 200
                                },
                                hue: {
                                    maxTop: 200
                                },
                                alpha: {
                                    maxTop: 200
                                }
                            }
                        });

                    }).on('hide.bs.popover', _popupMode.add['hide.bs.popover'] || function () {
                        $('.popover').find('.start_date, .end_date').datepicker("destroy");

                    }).on('hidden.bs.popover', _popupMode.add['hidden.bs.popover'] || function () {
                        var $this = $(this);

                        $this.popover('dispose');
                        $('.colorpicker-2x').remove();
                    });

                break;
                case 'modal':
                    var template = '';

                    if(_popupMode.add.hasOwnProperty('template')) {
                        if(typeof _popupMode.add.template == 'string') {
                            template = _popupMode.add.template;
                        } else {
                            template = _popupMode.add.template();
                        }

                    } else {
                        template = [
                            '<div class="form-group">',
                                '<label for="exampleTextarea">제목</label>',
                                '<input type="text" class="form-control" name="title" data-schedule="title">',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="exampleTextarea">내용</label>',
                                '<textarea data-schedule="content" name="content" class="form-control" placeholder="일정을 입력하세요." ></textarea>',
                            '</div>',
                            '<div class="form-group">',
                                '<div class="row">',
                                    '<div class="col-sm-6">',
                                        '<input type="text" class="form-control start_date" name="start_date" readonly="true" />',
                                    '</div>',
                                    '<div class="col-sm-6">',
                                        '<input type="text" class="form-control end_date" name="end_date" readonly="true" />',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="form-group">',
                                '<label class="">색상</label>',
                                '<div data-selector="colorpicker" data-format="alias" class="input-group colorpicker-component">',
                                    '<span class="input-group-addon"><i></i></span>',
                                    '<input type="text" class="form-control" name="color" />',
                                '</div>',
                            '</div>',
                        ].join('\n');
                    }

                    $('[data-schedule="addModal"]').find('.modal-body').html(template);

                    $('[data-schedule="addModal"]').find('[name=start_date], [name=end_date]').datepicker({
                        language: _this.getProps('locale'),
                        timepicker: true
                    });

                    $('[data-selector=colorpicker]').colorpicker({
                        color: '#000000',
                        customClass: 'colorpicker-2x',
                        align: 'left',
                        colorSelectors: {
                            '#000000': '#000000',     //black
                            '#ffffff': '#ffffff',     //white
                            '#FF0000': '#FF0000',       //red
                            '#777777': '#777777',   //default
                            '#337ab7': '#337ab7',   //primary
                            '#5cb85c': '#5cb85c',   //success
                            '#5bc0de': '#5bc0de',      //info
                            '#f0ad4e': '#f0ad4e',   //warning
                            '#d9534f': '#d9534f'     //danger
                        },
                        sliders: {
                            saturation: {
                                maxLeft: 200,
                                maxTop: 200
                            },
                            hue: {
                                maxTop: 200
                            },
                            alpha: {
                                maxTop: 200
                            }
                        }
                    });

                    $('[data-schedule="addModal"]').modal({
                        show: true
                    })
                      .on('show.bs.modal', _popupMode.add['show.bs.modal'] || function(e) {})
                      .on('shown.bs.modal', _popupMode.add['shown.bs.modal'] || function(e) {
                        var $this = $(this);
                        var date = moment($target.data('date'));

                        $this.find('[name=start_date]').data('datepicker').selectDate(new Date(date));

                    }).on('hide.bs.modal', _popupMode.add['hide.bs.modal'] || function(e) {})
                      .on('hidden.bs.modal', _popupMode.add['hidden.bs.modal'] || function(e) {
                        var $this = $(this);

                        $this.find('[name=title]').val('');
                        $this.find('[name=content]').val('');
                        $this.find('[name=start_date]').val('');
                        $this.find('[name=end_date]').val('');
                        $this.find('[data-selector=colorpicker]').colorpicker('setValue', '#000000');

                        $('.colorpicker-2x').remove();
                    });

                break;
                case 'custom':
                    _popupMode.add.template();

                    break;
            }
        },

        addEventView: function (event) {
            //TODO:: _eventMap데이터 생성
            _eventsData.push(event);

            _el.$calendar.fullCalendar('addEventSource', event);

            //$('[data-schedule="simpleCalendar"]').fullCalendar('addEventSource', [{id:1 , title: 'New event', start:  new Date()}]);

            //_el.$calendar.fullCalendar('rerenderEvents');
        },
        /**
         * 1) update ajax
         * 2) updateEventView -> next or prev
         * 3) list ajax
         * 4) error시 revertFunc 호출
         * */
        updateEvent: function (id, event, isDrop, revertFunc) {

            _this.updateEventView(event, isDrop);

            // XE.ajax({
            //     url: _apiUrl.update,
            //     type: 'POST',
            //     dataType: 'json',
            //     data: {},
            //     success: function(events) {
            //         _this.updateEventView();
            //     },
            //     error: function(jqXHR, textStatus, errorThrown) {
            //         console.log(jqXHR, textStatus, errorThrown);
            //     }
            // });
        },
        updateEventView: function (event, isDrop) {
            var date = _el.$calendar.fullCalendar('getDate');
            var month = date.month();// + 1;
            var startMonth = (isDrop)? event.start.month() : parseInt(event.start.split('-')[1])
            var endMonth = (isDrop)? event.end.month() : parseInt(event.end.split('-')[1]);

            // //event 날짜 변경
            // _eventsData.forEach(function (ev) {
            //     if(ev.id === event.id) {
            //         var data = ev;
            //         data.start = (isDrop)? event.start.format() : event.start;
            //         data.end = (isDrop)? event.end.format() : event.end;
						//
            //         return data;
            //     }
            // });
						//
            // _el.$calendar.fullCalendar('rerenderEvents');

            if(startMonth === endMonth && month !== startMonth) {
                /**
                 * TODO:: ajax
                 * 1) event update
                 * 2) request event list
                 * 3) $('[data-schedule="simpleCalendar"]').fullCalendar('addEventSource', [{id:1 , title: 'New event', start:  new Date()}]);
                 * */
                if(month - 1 === startMonth) {
                    _el.$calendar.fullCalendar('prev');
                } else {
                    _el.$calendar.fullCalendar('next');
                }
            }

            XE.toast('success', '일정이 변경되었습니다.');
        },
        getEventsList: function (year, month, callback) {
            var list = _apiUrl.list;

            XE.ajax({
                url: list,
                type: 'GET',
                context: _el.$calendar,
                dataType: 'json',
                data: {},
                success: function(events) {
                    var eventsMap = {};

                    if(events.length > 0) {
                        for(var i = 0, max = events.length; i < max; i += 1) {
                            var event = events[i];

                            var startDate = moment(event.start);
                            var startStr = event.start;
                            var endDate = (event.end)? moment(event.end) : '';
                            var endStr = (event.end)? event.end : '';
                            var endDateForView = (event.end)? moment(event.end).add(9, 'hours') : '';

                            eventsMap[events[i].id] = {
                                startDate: startDate,
                                startStr: startStr,
                                endDate: endDate,
                                endStr: endStr,
                                endDateForView: endDateForView,
                                event: event
                            };
                        }
                    }

                    _eventsMap = eventsMap;
                    _eventsData = events;

                    var eventsData = _this.getEventListFromEventsMap();

                    callback(eventsData);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR, textStatus, errorThrown);
                }
            });
        },
        getEventListFromEventsMap: function () {
            var defaultEventsMap = _eventsMap;
            var events = [];

            for(var prop in defaultEventsMap) {
                var event = defaultEventsMap[prop].event;

                if(event.end) {
                    event.end = moment(event.end).add(9, 'hours');
                }

                events.push(event);
            }

            return events;
        },
        /**
         * @param {object} event
         * <pre>
         *   - start : (format yyyy-mm-dd hh:ii:ss)
         *   - end : (format yyyy-mm-dd hh:ii:ss)
         *   - title : 일정 제목
         *   - content : 일정 내용
         * </pre>
         * */
        addEvent: function(event) {
            XE.ajax({
                url: _apiUrl.add,
                type: 'GET',
                dataType: 'json',
                data: event,
                success: function(data) {
                    //TODO if(data,added) {
                    _this.addEventView(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR, textStatus, errorThrown);
                }
            });
        },
        deleteEvent: function (id) {
            XE.ajax({
                url: _apiUrl.delete,
                type: 'GET',
                dataType: 'json',
                data: {
                    id: id
                },
                success: function(data) {
                    // TODO:: if(data.deleted) {
                    _el.$calendar.fullCalendar('removeEvents', id);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR, textStatus, errorThrown);
                }
            });
        }
    }
})();