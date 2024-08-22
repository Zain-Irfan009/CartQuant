<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use App\Models\Plan;
use App\Models\Rule;
use Illuminate\Http\Request;
use Shopify\Clients\Rest;

class RuleController extends Controller
{

    public function index(Request $request)
    {

        $shop = getShop($request->get('shopifySession'));
        try {
            if ($shop) {
                $rules = Rule::query();
                $charge=Charge::where('status','active')->where('shop_id',$shop->id)->latest()->first();
                $subscribed=true;
                $billing_url=null;
                if($charge==null){
                    $subscribed=false;
                    $plan_controller = new PlanController();
                    $billing_url = $plan_controller->billing_redirect_url($shop);
                }

                if($shop->email==null){
                    $shop_api = new Rest($shop->shop, $shop->access_token);
                    $result = $shop_api->get('shop');
                    $result = $result->getDecodedBody();
                    $result=$result['shop'];
                    $email=$result['email'];
                    $shop->email=$email;
                    $shop->save();

                }

            $url='https://' . $shop->shop;
                $app_status=false;
                $link = 'https://' . $shop->shop . '/admin/themes/current/editor?context=apps';

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
                if (str_contains($data_file, 'Cart_Quant')) {
                    $app_status=true;
                }
                elseif (str_contains($data_file, '/password')){
                    $app_status=false;
                    $password_protected=true;
//                    $link = 'https://' . $shop->shop . '/admin/themes/current/editor?context=apps';
                           $link='https://'.$shop->shop.'/admin/online_store/preferences';
                }


                if ($request->status == 0 || $request->status == 1) {
                    $rules = $rules->where('status', $request->status);
                }
                if ($request->search) {
                    $rules = $rules->where('name', 'like', '%' . $request->search . '%');
                }

                $rules = $rules->where('shop_id', $shop->id)->orderBy('id', 'Desc')->paginate(20);

                $data = [
                    'success' => true,
                    'data' => $rules,
                    'subscribed'=>$subscribed,
                    'billing_url'=>$billing_url,
                    'app_status'=>$app_status,
                    'password_protected'=>$password_protected,
                    'link'=>$link,

                ];

            }
        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }

    public function SaveRule(Request $request)
    {

        try {
            $shop = getShop($request->get('shopifySession'));
            if ($shop) {

                $rule = new Rule();
                $rule->name = $request->name;
                $rule->type = $request->type;
                $rule->status = $request->status;
                if ($request->type == 'product') {
                    $rule->product_data = json_encode( $request->product_data);
                    $rule->type_values = implode(',', $request->product_ids);
                } else {
                    $rule->type_values = implode(',', $request->type_values);
                }
                $rule->shop_id = $shop->id;
                $rule->save();
            }
            $this->CreateUpdateMetafield($shop);
            $data = [
                'success' => true,
                'message' => 'Rule Created Successfully',
                'data' => $rule
            ];
        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }


    public function DeleteRule(Request $request, $id)
    {
        try {
            $shop = getShop($request->get('shopifySession'));
            $rule = Rule::find($id);
            if ($rule) {
                $rule->delete();
                $this->CreateUpdateMetafield($shop);
                $data = [
                    'success' => true,
                    'message' => 'Rule deleted Successfully',
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

    public function EditRule(Request $request)
    {
        try {
            // Retrieve the shop from the session
            $shop = getShop($request->get('shopifySession'));

            // Find the rule by ID
            $rule = Rule::find($request->id);

            if ($rule) {
                // Decode the product_data column if it exists
                $decodedProductData = json_decode($rule->product_data, true);
                $productIds = explode(',', $rule->type_values);

                // Convert each product ID to an integer
                $productIds = array_map('intval', $productIds);

                $data = [
                    'success' => true,
                    'data' => [
                        'rule' => $rule,
                        'product_data' => $decodedProductData,
                        'product_ids'=>$productIds
                    ]
                ];
            } else {
                // Handle case where rule is not found
                $data = [
                    'success' => false,
                    'message' => 'Rule not found',
                ];
            }

        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false,
            ];
        }

        return response()->json($data);
    }

    public function UpdateRule(Request $request)
    {

        try {
            $shop = getShop($request->get('shopifySession'));
            if ($shop) {

                $rule = Rule::find($request->id);
                if($rule) {
                    $rule->name = $request->name;
                    $rule->type = $request->type;
                    $rule->status = $request->status;
                    if ($request->type == 'product') {
                        $rule->product_data = json_encode($request->product_data);
                        $rule->type_values = implode(',', $request->product_ids);
                    } else {
                        $rule->type_values = implode(',', $request->type_values);
                    }
                    $rule->shop_id = $shop->id;
                    $rule->save();
                    $this->CreateUpdateMetafield($shop);
                    $data = [
                        'success' => true,
                        'message' => 'Rule Updated Successfully',
                        'data' => $rule
                    ];
                }else {
                    // Handle case where rule is not found
                    $data = [
                        'success' => false,
                        'message' => 'Rule not found',
                    ];
                }
            }

        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }


    public function CreateUpdateMetafield($session)
    {

        $client = new Rest($session->shop, $session->access_token);

        $rules=Rule::where('shop_id',$session->id)->where('status',1)->get();

        $data_array=[];
        foreach ($rules as $rule){
            $data['type'] = $rule->type;
            if($rule->type=='product'){
                $productData = json_decode($rule->product_data, true);

                // Initialize an array to store handles
                $handles = [];

                // Loop through each product data entry and get the handle
                foreach ($productData as $product) {
                    if (isset($product['handle'])) {
                        $handles[] = $product['handle'];
                    }
                }
                $data['value'] =$handles;
            }else {
                $data['value'] = explode(',',$rule->type_values);
            }

            array_push($data_array,$data);
        }

        if ($session->metafield_id == null) {
            $shop_metafield = $client->post('/metafields.json', [
                "metafield" => array(
                    "key" => 'data',
                    "value" => json_encode($data_array),
                    "type" => "json_string",
                    "namespace" => "CartQuant"
                )
            ]);

        } else {
            $shop_metafield = $client->put('/metafields/' . $session->metafield_id . '.json', [
                "metafield" => [
                    "value" => json_encode($data_array)
                ]
            ]);

        }

        $response = $shop_metafield->getDecodedBody();
        if (isset($response) && !isset($response['errors'])) {
            $session->metafield_id = $response['metafield']['id'];
            $session->save();
        }


    }

}
