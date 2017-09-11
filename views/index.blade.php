<!-- calendar -->
<div data-schedule="simpleCalendar" data-progress-type="cover" data-progress-bgcolor="#000000"></div>
<!-- modal -->


<script type="text/javascript">
    (function() {
        SimpleScheduler.init({
            el: {
                $calendar: $('[data-schedule="simpleCalendar"]'),
            },
            props: {
                today: "{{ $today }}",
                /**
                 * TODO::
                 * */
                todayBackgroundColor: '#000000',
                todayFontColor: '#000000',
                preventDayColor: '#edd4d0',
                draggable: true,
                /**
                 * 공휴일 등의 데이터
                 * - id
                 * - writer
                 * - title
                 * - content
                 * - start
                 * - end
                 * - color
                 * */

                //휴무일
                holiday: [{
                    title: 'test1',
                    start: '2017-09-01',
                    end: '2017-09-01',
                },
                {
                    title: 'test2',
                    start: '2017-08-15',
                    end: '2017-08-15',
                },
                {
                    title: 'test3',
                    start: '2017-10-11',
                    end: '2017-10-14',
                }],

                //일정등록 불가일
                preventDays: [{
                    title: '휴일1',
                    start: '2017-09-15',
                },
                {
                    title: '휴일2',
                    start: '2017-10-05',
                    end: '2017-10-08',
                }],
                /**
                 * 0 ~ 6
                 * ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                 * */
                preventDayOfWeek: [1, 3],
                preventPreviousDays: true,
                locale: 'ko'
            },
            /**
             버튼 클릭시 이벤트 직접 구현필요.
             - 일정추가 : SimpleScheduler.addEvent(event)
             - 일정수정 : SimpleScheduler.updateEvent(id, event)
             - 일정삭제 : SimpleScheduler.deleteEvent(id)

             type - modal, modal:custom, popover, popover:custom, custom

             form selector - button, form field

             add: {
                type: 'popover',
                template: function () {
                    return '<div>custom</div>';
                },
                'show.bs.popover': function () {},
                'shown.bs.popover': function () {},
                'hide.bs.popover': function () {},
                'hidden.bs.popover': function () {}
             },
             view: {
                type: 'modal',
                template: function (event) {
                    return '<div>custom</div>';
                },
                'show.bs.modal': function () {},
                'shown.bs.modal': function () {},
                'hide.bs.modal': function () {},
                'hidden.bs.modal': function () {}
             },
             update: {
                type: 'modal',
                template: function (event) {
                    return '<div>custom</div>';
                },
                'show.bs.modal': function () {},
                'shown.bs.modal': function () {},
                'hide.bs.modal': function () {},
                'hidden.bs.modal': function () {}
             },

             TODO:: 수정 팝업
             * */
            popupMode: {
                add: {
                    type: 'modal',
                },
                view: {
                    type: 'popover',
                },
                update: {
                    type: 'popover'
                },
            },
            apiUrl: {
                view: '',   //id로 event 1개 조회
                list: '{{ route('simpleSchedule::list') }}',
                add: '{{ route('simpleSchedule::add') }}',
                update: '{{ route('simpleSchedule::update') }}',
                delete: '{{ route('simpleSchedule::delete') }}'
            }
        });
    })();
</script>