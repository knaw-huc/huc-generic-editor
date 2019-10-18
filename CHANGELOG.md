
### 18-10-2019

MvdP
* more attributes
* extended parser, type list in json is now possible, in development
* added multilingual attribute and free text attributes to dev-file
* added timbuctoo_edit_metatdata_dev.json as dev-file for implementing/testing new features
* changed PHP Version Dockerfile to 7.3
* changed Maintainer Dockerfile

### 17-10-2019

* added a php/apache serve, with docker-compose for serving out the json (MvdP)
* split and adapted the clientcode in two versions index.html and standalone.html (MvdP)
* annotated the html files (MvdP)
* adapted the README (MvdP)
* removed unused directories (MvdP)
* tested the docker-compose file SUCCES (RZ)
* fixed defaultvalues bug (RZ & MvdP)
* added attributes.json development (RZ)

### 16-10-2019

* added example file index.html for demonstration and development (MvdP)
* changed directory structure for possible docker embeded webserver (MvdP)
* added docker-compose file for lightweight php/apache server. Is not necessary for testing. If you want to try it ```docker-compose up``` (MvdP)
