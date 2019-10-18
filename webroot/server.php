<?php

// $file = file_get_contents("json_examples/timbuctoo_edit_metadata.json");
$file = file_get_contents("json_examples/timbuctoo_edit_metadata_dev.json");

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
echo $file;