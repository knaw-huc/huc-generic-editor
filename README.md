# HuC-generic-editor

Typescript editor for structured data

### Demo with Docker & React 

Use:
```./launch.sh```
for starting the php-container for php and the react app.

* On http://localhost:8888/ the TypeScript version
* On http://localhost:8888/server.php the json-response of the PHP server
* On http://localhost:3000/ the React version (alpha)

A lightweight PHP server is started for serving the json-configuration files. 
You can edit the configuration file in:
```webroot/json_examples/timbuctoo_edit_metadata_dev.json```


####  Docker by hand

From the README.md directory:

 ```docker-compose up```

A lightweight PHP server is started for serving the json-configuration files. 

Visit http://localhost:8888/  in your browser. 
You see a structured form, on-the-fly generated. 

 
#### Start React by hand (alpha)

Navigate to: ```webroot/reacteditor/```

Start the reactversion ```npm start```

Visit: ```http://localhost:3000/```


### Without Docker

Open  ```webroot/standalone_original/index.html``` in your favourite browser.
The json configuration is embedded in a JS object literal.


