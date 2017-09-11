<?php
namespace Xpressengine\Plugins\SimpleScheduler;

use App\Http\Controllers\Controller;
use Xpressengine\Http\Request;
use XeFrontend;
use Xpressengine\Plugins\SimpleScheduler\Plugin;

class SimpleScheduleController extends Controller
{
    public function indexPage(Request $request)
    {
        \XeTheme::selectBlankTheme();
        $config = \XeConfig::getOrNew('simple_schedule');

        XeFrontend::js([
            Plugin::asset('assets/js/libs/popper.min.js'),
            Plugin::asset('assets/js/libs/bootstrap.min.js'),
            Plugin::asset('assets/js/libs/moment.min.js'),
            Plugin::asset('assets/js/libs/moment.locale.ko.js'),
            Plugin::asset('assets/js/libs/fullcalendar.min.js'),
            Plugin::asset('assets/js/libs/fullcalendar.locale-all.js'),
            Plugin::asset('assets/js/libs/datepicker.min.js'),
            Plugin::asset('assets/js/libs/i18n/datepicker.ko.js'),
            asset('assets/vendor/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js'),
            Plugin::asset('assets/js/simpleScheduler.js'),
        ])->appendTo('head')->load();

        XeFrontend::css([
            Plugin::asset('assets/css/style.css'),
            Plugin::asset('assets/css/bootstrap.css'),
            Plugin::asset('assets/css/fullcalendar.min.css'),
            Plugin::asset('assets/css/datepicker.css'),
            asset('assets/vendor/bootstrap-colorpicker/css/bootstrap-colorpicker.min.css'),
            'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/themes/black-tie/jquery-ui.css',
        ])->appendTo('head')->load();

        $today = date("Y-m-d");
        
//        XeFrontend::html('load')

        // output
        return \XePresenter::make(
            'simple_scheduler::views.index',
            [
                'config' => $config,
                'today' => $today
            ]
        );
    }

    public function getScheduleList()
    {
        $data = [];

        $data['id'] = 999;
        $data['title'] = 'Repeating Event';
        $data['content'] = 'custom content';
        $data['start'] = '2017-09-20 00:00:00';
        $data['end'] = '2017-09-21 00:00:00';
        $data['color'] = '#000000';
        $data['writer'] = 'Seungman choi';

        $json = [];
        $json[] = $data;

        return response()->json($json);
    }

    public function addSchedule()
    {

    }

    public function updateSchedule()
    {

    }

    public function deleteSchedule()
    {

    }
}