<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Rule;
use Illuminate\Http\Request;

use App\Models\Charge;
use App\Models\Plan;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;

class SettingController extends Controller
{

    public function index(Request $request){
        $shop = getShop($request->get('shopifySession'));
        try {
            if ($shop) {
                $rules=Rule::where('shop_id',$shop->id)->count();
                $rule_found=true;
                if($rules==0){
                    $rule_found=false;
                }
                $rules_active=Rule::where('shop_id',$shop->id)->where('status',0)->count();
                $all_rules_active=true;
                if($rules > 0 && $rules_active > 0){
                    $all_rules_active=false;
                }

                $url='https://' . $shop->shop;
                $customizer_link = 'https://' . $shop->shop . '/admin/themes/current/editor?context=apps';
                $app_status=false;
                $ch = curl_init();
                $timeout = 5;
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
                curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
                $data_file = curl_exec($ch);
                curl_close($ch);
                $password_protected=false;
                $password_link=null;
                if (str_contains($data_file, 'Cart_Quant')) {
                    $app_status=true;

                }
                elseif (str_contains($data_file, '/password')){
                    $app_status=false;
                    $password_protected=true;
//                    $link = 'https://' . $shop->shop . '/admin/themes/current/editor?context=apps';
                    $password_link='https://'.$shop->shop.'/admin/online_store/preferences';
                }
                $data = [
                    'success' => true,
                    'rule_found' => $rule_found,
                    'all_rules_active' => $all_rules_active,
                    'app_status'=>$app_status,
                    'password_protected'=>$password_protected,
                    'password_link'=>$password_link,
                    'customizer_link'=>$customizer_link,

                ];
            }


        }catch (\Exception $exception){
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);

        }

        public function Email(Request $request){
            $shop = getShop($request->get('shopifySession'));
            try {
                if ($shop) {
                    $data = [
                        'success' => true,
                        'email' => $shop->email,
                    ];
                }
            }catch (\Exception $exception){
                $data = [
                    'error' => $exception->getMessage(),
                    'success' => false
                ];
            }
            return response()->json($data);
        }

    public function SendMessage(Request $request){
        $shop = getShop($request->get('shopifySession'));

        try {
            if ($shop) {

                $sender_email=env('MAIL_FROM_ADDRESS');
                $sender_name=env('MAIL_FROM_NAME');
                $email_to="zain.irfan4442@gmail.com";
                $message=$request->message;
                $email=$request->email;

                Mail::send('email_template', ['email' => $email, 'mail_content' => $message], function ($m) use ($sender_name, $sender_email,$email_to) {
                    $m->from($sender_email, $sender_name);
                    $m->to($email_to)->subject('CartQuant Support');
                });
                $data = [
                    'success' => true,
                    'email' => $shop->email,
                ];
            }
        }catch (\Exception $exception){
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }



}
