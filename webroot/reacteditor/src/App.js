import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localisation: {},
      formdescription: {}
    }
  }

  componentDidMount() {
    // get JSON FormDescription 
    let serverurl = "http://localhost:8888/server.php?data=formdescription";

    fetch(serverurl)
      .then(res => res.json())
      .then((data) => {
        // console.log('data:', data);
        this.setState({ formdescription: data })
      });
    serverurl = "http://localhost:8888/localisation.php?lang=en";
    fetch(serverurl)
      .then(res => res.json())
      .then((data) => {
        // console.log('data:', data);
        this.setState({ localisation: data })
      });
  }

  render() {
    if (this.state.formdescription.hasOwnProperty('id') && this.state.localisation.hasOwnProperty('uploadButton')) { // OR fetch in constructor?
      return (
        <div>
          <Title title="HuC Editor React" />
          <Form description={this.state.formdescription} localisation={this.state.localisation} />
        </div>
      )
        ;
    } else {
      return <div>..........SS..........N...OR.RR..RRR...R...R.R.RR.R.R.R.R...........................</div>;
    }
  }
}

function Form(props) {
  return (
    <div id="ccform">
      <Content content={props.description.content} />
      <ButtonFrame localisation={props.localisation} />
    </div>
  )
}

function Content(props) {
  // console.log('props', props);

  let content = props.content.map((thing, index) => {
    if (thing.type === 'Element') {
      let errorID = "errorMsg_" + thing.ID;
      let langID = "lang_" + thing.ID;
      // SEPERATE COMPONENTS AND  logic in the components itself instead of React JSX Elements??

      // MULTILINGUAL 

      let multilingual = '';
      if (thing.attributes.Multilingual === "true") {
        multilingual = <LanguageList langId={langID} selected="nl" />
      }
      // DUPLICATE KNOP
      let duplicatebutton = '';
      if (thing.attributes.duplicate === "True") {
        duplicatebutton = <input type="button" className="btn" value="+" data-source={thing.ID} />;
      }
      // ATTRIBUTES 
      let attributelist = '';
      if (thing.attributes.attributeList) {
        attributelist = thing.attributes.attributeList.map((element, index) => {
          // console.log(element.ValueScheme);
          let attributeID = "attr_" + element.name + "_" + thing.ID;
          if (element.ValueScheme === 'string') {
            return <input key={index} id={attributeID} className="element_attribute" type="text" data-attribute_name={element.name} placeholder={element.name} />
          } else if(element.ValueScheme === 'dropDown') {
            let l = element.values;
            // let selected = element.default; // TODO? Ask Rob is there a default 
            let selected = 'frikandel';
            const lijst = l.map((item, i) => {
              return <option key={i} value={item}>{item}</option>
            });
            
            // console.log(lijst)s
            return (
              <select defaultValue={selected} key={index} id={attributeID} className="element_attribute" data-attribute_name={element.name}>
                {lijst}
              </select>
            )
          }
        });
      }

      if (thing.attributes.inputField === 'multiple') { //TEXTAREA no test necessary for eXistenZ field ?
        return (
          <div key={index} className="element" data-name={thing.attributes.name}>
            <div className="label">{thing.attributes.label}{thing.attributes.CardinalityMin > 0 && ' *'}</div>
            <div className="control">
              <textarea id={thing.ID} className="input_element" rows={thing.attributes.height | 8} cols={thing.attributes.width || 50} data-reset-value="line" data-validation-profile={thing.id}></textarea>
              {multilingual}
              {duplicatebutton}
              {attributelist}

              <div id={errorID} className="errorMsg"></div>
            </div>
          </div>
        )
      } else { // INPUT TYPE TEXT
        return (
          <div key={index} className="element" data-name={thing.attributes.name}>
            <div className="label">{thing.attributes.label}{thing.attributes.CardinalityMin > 0 && ' *'}</div>
            <div className="control">
              <input id={thing.ID} className="input_element" type="text" size={thing.attributes.width | 60} data-reset-value="line" data-validation-profile={thing.id} />
              {multilingual}
              {duplicatebutton}
              {attributelist}

              <div id={errorID} className="errorMsg"></div>
            </div>
          </div>
        )
      }
    } else if (thing.type === 'Component') { // COMPONENT
      let showcomponent = '';
      if (thing.attributes.CardinalityMin === "0") {
        showcomponent = <input className="optionalCompBtn" type="button" value="x" />;
      }

      return (
        <div key={index} id={thing.id} className="component" data-name={thing.attributes.name} data-order="undefined" >

          <div className="componentHeader">{thing.attributes.label}<UploadForm attr={thing} /></div>
          {showcomponent}
          <Content content={thing.content} />
        </div>
      )
    }
  });
  return <div>{content}</div>
}

function UploadForm(props) {
  let fileid = 'files' + props.attr.ID;
  const dontshow = {
    display: 'none'
  };
  if (props.attr.attributes.resource === "True") {
    return (
      <form method="post">
        <input type="file" id={fileid} className="uploader" accept="True" />
        <input type="reset" target={props.attr.ID} value="x" className="resetUploadBtn" style={dontshow} />
      </form>
    )
  } else {
    return null;
  }
}



function LanguageList(props) {
  let selected = props.selected;// no selected attribute
  let languages = ['aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az', 'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv', 'dz', 'ee', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy', 'ga', 'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv', 'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu'];
  const list = languages.map((language, index) => <option key={index} value={language}>{language}</option>);
  return (
    <select id={props.langID} defaultValue={selected} className="language_dd" >
      <option value="none">--</option>
      {list}
    </select>
  )
  // controlled form component vs controlled form component, it's now uncontrolled

  // value={selected} (controlled needs onChange Handler)
  // defaultValue (uncontrolled)
}



function ButtonFrame(props) { // TODO Eventlisteners
  // console.log('props  localisation', props.localisation);
  return (
    <div id="btnFrame">
      <input type="button" value={props.localisation.submitButton.label} id="OKbtn" />
      <input type="button" value={props.localisation.saveButton.label} id="saveBtn" />
      <input type="button" value={props.localisation.resetButton.label} id="resetBtn" />
      <ErrorSpace />
    </div>
  )
}

function ErrorSpace(props) {
  return <div id="errorSpace"></div>
}
function Title(props) {
  return <h1>{props.title}</h1>
}
export default App;