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

    if (this.state.formdescription.hasOwnProperty('id') && this.state.localisation.hasOwnProperty('uploadButton')) {
      return (
        <div>
          <Title title="HuC Editor React" />
          <Form description={this.state.formdescription} localisation={this.state.localisation} />
        </div>
      )
        ;
    } else {
      return <div>S..N...OR.RR..RRR...R...R.R.RR.R.R.R.R...........................</div>;
    }
  }
}

function Form(props) {
  // console.log('binnen form', props.description.content);
  // let profileid = props.description.id;
  // let ID = props.description.content[0].ID;
  return (
    <div id="ccform">
      <Content content={props.description.content} />
      <ButtonFrame localisation={props.localisation} />
      {/* </div> */}
    </div>
  )
}

function Content(props) {
  console.log('props', props);
  const content = props.content.map((thing, index) => {
    if (thing.type === 'Element') {
      const errorID = "errorMsg_" + thing.ID;
      if (thing.attributes.inputField === 'multiple') { //TEXTAREA no test necessary for eXistenZ field ?
        return (
          <div key={index} className="element" data-name={thing.attributes.name}>
            <div className="label">{thing.attributes.label}{thing.attributes.CardinalityMin > 0 && ' *'}</div>
            <div className="control">
              <textarea id={thing.ID} className="input_element" rows={thing.attributes.height} cols={thing.attributes.width} data-reset-value="line" data-validation-profile={thing.id}></textarea>
              <div id={errorID} class="errorMsg"></div>
            </div>
          </div>
        )
      }
      else {
        return (
          <div key={index} className="element" data-name={thing.attributes.name}>
            <div className="label">{thing.attributes.label}{thing.attributes.CardinalityMin > 0 && ' *'}</div>
            <div className="control">
              <input id={thing.ID} className="input_element" type="text" size={thing.attributes.width} data-reset-value="line" data-validation-profile={thing.id} />
              <div id={errorID} class="errorMsg"></div>
            </div>
          </div>
        )
      }
    } else if (thing.type === 'Component') {
      return (
        <div key={index} id={thing.id} className="component" data-name={thing.attributes.name} data-order="undefined" >
          <div className="componentHeader">{thing.attributes.label}</div>
          <Content content={thing.content} />
        </div>
      )
    }
  });
  return <div>{content}</div>
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




