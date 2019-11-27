import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localisation: {},
      formdescription: {},
      record: {}
      
    }
  }

  componentDidMount() {
    // get JSON FormDescription 
    let formurl = "http://localhost:8888/server.php?data=formdescription";
    fetch(formurl)
      .then(res => res.json())
      .then((data) => {
        this.setState({ formdescription: data });// metadata state, once
        // this.setState({record: data.record}) // content state
      });
    let localisationurl = "http://localhost:8888/localisation.php?lang=en";
    fetch(localisationurl)
      .then(res => res.json())
      .then((data) => {
        this.setState({ localisation: data });
        this.setState({ record: data.record })
      });
  }

  onHandleDuplicateField = (e) => {
    // e.preventDefault();
    // console.log(e.target);
    if(e.target.value === '+') {
      console.log('plus');
    } else if(e.target.value === '-') {
      console.log('minus');
    }
    // let clone = <input id="fake" class="input_element" type="text" size="50" value="TODO" />;
    // console.log({ clone});
    console.log('now change the form_description state, set counter');
  }

  onSubmittie = (e) => { // no binding required now
    // console.log('submittie', e.target.value);
    // console.log('submittie', e);
    // collect all data, with the help from the formdescription? Look in the TyepScript version
  }
  render() {
      return (
        <div>
          <Title title="HuC Editor React" />
          <Form description={this.state.formdescription} localisation={this.state.localisation}
            send={this.onSubmittie} duplicate={this.onHandleDuplicateField} />
        </div>
      )
  }
}

function Form(props) {

  if(props.description.hasOwnProperty('id') && 
    props.localisation.hasOwnProperty('uploadButton')) {
  return (
    <div id="ccform">
      <Content content={props.description.content}  duplicate={props.duplicate} />
      <ButtonFrame localisation={props.localisation} send={props.send} />
    </div>
  )
  } else {
    return <div>LOADING...</div>
  }
}

function Content(props) {
  // console.log(props);


  let content = props.content.map((thing, index) => {
    if (thing.type === 'Element') {
      // console.log({record});
      // let elementvalue ='';
      return (
        <div key={index} className="element" data-name={thing.attributes.name} data-order="undefined">
          <div className="label">{thing.attributes.label}{thing.attributes.CardinalityMin > 0 && ' *'}</div>
          <div className="control">
            <Textelement thing={thing}  />
            <LanguageList element={thing} selected="nl" />
            <DuplicateButton attributes={thing.attributes} id={thing.ID} duplicate={props.duplicate} />
            <Attributes thing={thing} />
            <ErrorMessage id={thing.ID} />
          </div>
        </div>
      )
    } else if (thing.type === 'Component') {
      return (
        <div key={index} id={thing.ID} className="component" data-name={thing.attributes.name} data-order="undefined" >
          <div className="componentHeader">{thing.attributes.label}<UploadForm attr={thing} />
            <ToggleComponent thing={thing} />
          </div>
          <Content content={thing.content} duplicate={props.duplicate} />
        </div>
      )
    } else {
      return <div>'NOTHING'</div>
    }
  });
  return <React.Fragment>{content}</React.Fragment>
  // Fragments do not render anything, like an empty div, avoids useless divs new syntax: <> </> works also?
}

function ToggleComponent(props) {
  let thing = props.thing;
  if (thing.attributes.CardinalityMin === "0") {
    return <input className="optionalCompBtn" type="button" value="x" />;
  } else {
    return null;
  }
}

function ErrorMessage(props) {
  let errorID = "errorMsg_" + props.id;
  return <div id={errorID} className="errorMsg"></div>

}

function Textelement(props) {
  let thing = props.thing;
  let textelement = <input id={thing.ID}  className="input_element" type="text" size={thing.attributes.width | 60} data-reset-value="line" data-validation-profile={thing.ID} />;
  if (thing.attributes.inputField === 'multiple') {
    textelement = <textarea id={thing.ID} className="input_element" rows={thing.attributes.height | 8} cols={thing.attributes.width || 50} data-reset-value="line" data-validation-profile={thing.ID}></textarea>;
  }
  return textelement;
}


function Attributes(props) {
  let thing = props.thing;
  let attributelist = '';
  if (thing.attributes.attributeList) {
    attributelist = thing.attributes.attributeList.map((element, index) => {
      let attributeID = "attr_" + element.name + "_" + thing.ID;
      if (element.ValueScheme === 'string') {
        return <input key={index} id={attributeID} className="element_attribute" type="text" data-attribute_name={element.name} placeholder={element.name} />
      } else if (element.ValueScheme === 'dropDown') {
        let l = element.values;
        // let selected = element.default; // TODO? Ask Rob if there a default 
        let selected = 'frikandel';
        const lijst = l.map((item, i) => {
          return <option key={i} value={item}>{item}</option>
        });
        return (
          <select defaultValue={selected} key={index} id={attributeID} className="element_attribute" data-attribute_name={element.name}>
            {lijst}
          </select>
        )
      } else return null;
    });
    return attributelist;
  } else {
    return null
  }
}

function DuplicateButton(props) {
  if (props.attributes.duplicate === "True") {
    return <input type="button" className="btn" value="+" data-source={props.id} onClick={props.duplicate} />;
  } else {
    return null;
  }
}

function UploadForm(props) {
  if (props.attr.attributes.resource === "True") {
    let fileid = 'files' + props.attr.ID;
    const dontshow = {
      display: 'none'
    };
    return (
      <form className="fileForm" method="post">
        <input type="file" id={fileid} className="uploader" accept="True" />
        <input type="reset" target={props.attr.ID} value="x" className="resetUploadBtn" style={dontshow} />
      </form>
    )
  } else {
    return null;
  }
}

function LanguageList(props) {
  // MULTILINGUAL 
  if (props.element.attributes.Multilingual !== "true") {
    return null;
  } else {
    let langID = "lang_" + props.element.ID;
    let selected = props.selected;// no selected attribute
    let languages = ['aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az', 'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv', 'dz', 'ee', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy', 'ga', 'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv', 'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu'];
    const list = languages.map((language, index) => <option key={index} value={language}>{language}</option>);
    return (
      <select id={langID} defaultValue={selected} className="language_dd" >
        <option value="none">--</option>
        {list}
      </select>
    )
  }
}


// FAKE HANDLERS SEPERATE COMPONENT?
function Validate() {
  // console.log('validate');
  return true;
}

// function Submit(event) {
//   if (Validate()) {
//     console.log('submit', event);

//     // event.preventDefault();
//     // const data = new FormData(event.target);
//     // console.log(data);
//     // fetch('/api/form-submit-url', {
//     //   method: 'POST',
//     //   body: data,
//     // });
//   }
// }




function Save() {
  if (Validate()) {
    console.log('save');
  }
}

function Reset() {
  if (Validate()) {
    console.log('reset');
  }
}

function ButtonFrame(props) {
  return (
    <div id="btnFrame">
      <input type="button" value={props.localisation.submitButton.label} id="OKbtn" onClick={props.send} />
      <input type="button" value={props.localisation.saveButton.label} id="saveBtn" onClick={Save} />
      <input type="button" value={props.localisation.resetButton.label} id="resetBtn" onClick={Reset} />
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