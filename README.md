# HuC-generic-editor

Javascript editor for structured data

## Demo

### With Docker

From the README.md directory:

 ```docker-compose up```

A lightweight PHP server is started for serving the json-configuration file.

Visit http://localhost:8888/  in your browser. 
You see a structured form, on-the-fly generated.

You can edit the configuration file in:
```webroot/json_examples/timbuctoo_edit_metadata.json``` 

### Without Docker

Open  ```webroot/standalone.html``` in your favourite browser.
The json configuration is embedded in a JS object literal.

