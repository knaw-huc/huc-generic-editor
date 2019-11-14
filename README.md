# HuC-generic-editor

Typescript editor for structured data

## Demo

### With Docker

From the README.md directory:

 ```docker-compose up```

A lightweight PHP server is started for serving the json-configuration files. 

Visit http://localhost:8888/  in your browser. 
You see a structured form, on-the-fly generated. Typescript.

You can edit the configuration file in:
```webroot/json_examples/timbuctoo_edit_metadata.json``` 

For experimental features change the link in server.php to :
```webroot/json_examples/timbuctoo_edit_metadata_dev.json``` 

(or uncomment the line to the link)

### Added React(alpha)

Navigate to: ```webroot/reacteditor/```

Start the reactversion ```npm start```

Visit: ```http://localhost:3000/```


### Without Docker

Open  ```webroot/standalone.html``` in your favourite browser.
The json configuration is embedded in a JS object literal.


