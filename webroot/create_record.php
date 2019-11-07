<?php

// EXAMPLE create record

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
$data = $_REQUEST['ccData'];
$ccProfileID = $_REQUEST['ccProfileID'];

echo $data;

