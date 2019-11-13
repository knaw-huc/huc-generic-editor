<?php

$lang = $_GET['lang'];

if ($lang === 'en') {
    $file = file_get_contents("language/en.json");
} elseif ($lang === 'nl') {
    $file = file_get_contents("language/nl.json");
} else {
    $file = file_get_contents("language/nl.json");

}
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
echo $file;
