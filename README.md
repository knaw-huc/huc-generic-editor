# HuC-generic-editor

Javascript editor for structured data

## Demo

### With Docker

From the README.md directory: ```docker compose up```
A leghtweight PHP server is started for serving the json-configuration file.

Visit http://localhost:8888/  in your browser. 
You see the structured form that is on-the-fly generated.

You can edit the configuration file in:
json_examples/timbuctoo_edit_metadata.json 

### Without docker

Open file webroot/standalone.html in your favourite browser.
The json configuration is embedded in a JS object literal.

